import { NextResponse } from "next/server";
import { generateMelody } from "~/actions/generate-melody";

export async function POST(request: Request) {
  try {
    const { prompt, solver, numInferenceSteps, duration, targetFlow, regularization, regularizationStrength, userId } = await request.json();
    if (!prompt || !userId) {
      return NextResponse.json({ error: "prompt and userId are required" }, { status: 400 });
    }
    const result = await generateMelody(
      prompt,
      solver ?? "midpoint",
      numInferenceSteps ?? 64,
      duration ?? 30,
      targetFlow ?? 0.0,
      regularization ?? false,
      regularizationStrength ?? 0.2,
      userId
    );
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
