import { NextResponse } from "next/server";
import { handler } from "~/lib/auth-server";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide email and password" },
        { status: 400 },
      );
    }

    return handler.POST(
      new Request(new URL("/api/auth/sign-in/email", request.url), {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({
          email,
          password,
          callbackURL: "/creative-platform/home",
        }),
      }),
    );
  } catch (error) {
    console.error("Login error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        error: "An error occurred during login",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
