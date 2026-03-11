import { NextResponse } from "next/server";
import { handler } from "~/lib/auth-server";

export async function POST(request: Request) {
  try {
    return handler.POST(
      new Request(new URL("/api/auth/sign-out", request.url), {
        method: "POST",
        headers: request.headers,
      }),
    );
  } catch (error) {
    console.error("Logout error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        error: "An error occurred during logout",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
