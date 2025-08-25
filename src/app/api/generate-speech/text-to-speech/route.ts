import { NextResponse } from "next/server";
import { generateTextToSpeech } from "~/actions/generate-speech";

export async function POST(request: Request) {
  try {
    const { text, voice, userId } = await request.json();
    if (!text || !voice) {
      return NextResponse.json({ error: "text and voice are required" }, { status: 400 });
    }
    const result = await generateTextToSpeech(text, voice, userId ?? "anonymous");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


