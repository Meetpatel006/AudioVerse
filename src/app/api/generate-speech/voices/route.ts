import { NextResponse } from "next/server";
import { getAvailableVoices } from "~/actions/generate-speech";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service") ?? "styletts2";
    const voices = await getAvailableVoices(service);
    return NextResponse.json(voices);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { service = "styletts2" } = await request.json();
    const voices = await getAvailableVoices(service);
    return NextResponse.json(voices);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


