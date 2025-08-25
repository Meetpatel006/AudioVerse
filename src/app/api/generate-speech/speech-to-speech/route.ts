import { NextResponse } from "next/server";
import { generateSpeechToSpeech } from "~/actions/generate-speech";

export async function POST(request: Request) {
  try {
    const { sourceAudioKey, targetVoice, userId, fileName } = await request.json();
    if (!sourceAudioKey || !targetVoice || !userId) {
      return NextResponse.json({ error: "sourceAudioKey, targetVoice and userId are required" }, { status: 400 });
    }
    const result = await generateSpeechToSpeech(sourceAudioKey, targetVoice, userId, fileName);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


