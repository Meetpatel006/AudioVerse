import { NextResponse } from "next/server";
import { fetchAuthQuery } from "~/lib/auth-server";

async function getApi() {
  const mod =
    (await import("@convex/_generated/api")) as typeof import("@convex/_generated/api");
  return mod.api;
}

export async function GET(request: Request) {
  try {
    void request;
    const api = await getApi();
    const user = await fetchAuthQuery(api.auth.getCurrentUser);

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
