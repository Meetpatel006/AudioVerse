import { NextResponse } from "next/server";
import { generateMusic, retakeMusic, repaintMusic, editMusic, extendMusic } from "~/actions/generate-music";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = "generate" } = body;
    switch (action) {
      case "generate":
        return NextResponse.json(await generateMusic(body));
      case "retake":
        return NextResponse.json(await retakeMusic(body));
      case "repaint":
        return NextResponse.json(await repaintMusic(body));
      case "edit":
        return NextResponse.json(await editMusic(body));
      case "extend":
        return NextResponse.json(await extendMusic(body));
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}


