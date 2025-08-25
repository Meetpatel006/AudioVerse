import { NextResponse } from "next/server";
import { generateUploadUrl } from "~/actions/generate-speech";

export async function POST(request: Request) {
  try {
    const { fileType } = await request.json();
    if (!fileType) {
      return NextResponse.json({ error: "fileType is required" }, { status: 400 });
    }
    const result = await generateUploadUrl(fileType);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
