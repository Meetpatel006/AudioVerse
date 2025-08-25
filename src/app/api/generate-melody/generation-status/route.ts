import { NextResponse } from "next/server";
import { generationStatus } from "~/actions/generate-melody";

export async function POST(request: Request) {
  try {
    const { audioId } = await request.json();
    if (!audioId) {
      return NextResponse.json({ error: "audioId is required" }, { status: 400 });
    }
    const result = await generationStatus(audioId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
