import { NextResponse } from "next/server";
import { type BioTone, generateBioDraft } from "@/lib/bio-generator";

export const runtime = "nodejs";

type GenerateBioRequest = {
  jobTitles?: string;
  expertise?: string;
  tone?: BioTone;
  variation?: number;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | GenerateBioRequest
    | null;

  const jobTitles = body?.jobTitles?.trim() ?? "";
  const expertise = body?.expertise?.trim() ?? "";
  const tone = body?.tone ?? "Professional";
  const variation = body?.variation ?? 0;

  if (!jobTitles || !expertise) {
    return NextResponse.json(
      { message: "Job titles and key areas of expertise are both required." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    draft: generateBioDraft({
      jobTitles,
      expertise,
      tone,
      variation,
    }),
  });
}
