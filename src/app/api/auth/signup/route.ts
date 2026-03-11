import { NextResponse } from "next/server";
import { handler } from "~/lib/auth-server";

export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Please fill in all fields" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    return handler.POST(
      new Request(new URL("/api/auth/sign-up/email", request.url), {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({
          name,
          email,
          password,
          callbackURL: "/creative-platform/home",
        }),
      }),
    );
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: "An error occurred during signup",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
