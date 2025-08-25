import { NextResponse } from "next/server";
import { generateSoundEffect } from "~/actions/generate-speech";

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }
    const result = await generateSoundEffect(prompt, userId ?? "anonymous");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


