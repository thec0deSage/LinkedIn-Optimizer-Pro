import { NextRequest, NextResponse } from "next/server";
import { generatePost, type PostDraft, type PostTone, type PostLength, type CTAType } from "@/lib/post-generator";

type RequestBody = {
  topic?: string;
  tone?: PostTone;
  length?: PostLength;
  ctaType?: CTAType;
  variation?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    // Validate required fields
    if (!body.topic) {
      return NextResponse.json(
        { message: "Topic is required" },
        { status: 400 }
      );
    }

    if (!body.tone) {
      return NextResponse.json(
        { message: "Tone is required" },
        { status: 400 }
      );
    }

    if (!body.length) {
      return NextResponse.json(
        { message: "Length is required" },
        { status: 400 }
      );
    }

    if (!body.ctaType) {
      return NextResponse.json(
        { message: "CTA Type is required" },
        { status: 400 }
      );
    }

    // Generate the post
    const draft = await generatePost({
      topic: body.topic,
      tone: body.tone,
      length: body.length,
      ctaType: body.ctaType,
      variation: body.variation ?? 1,
    });

    return NextResponse.json({ draft }, { status: 200 });
  } catch (error) {
    console.error("Post generation error:", error);
    return NextResponse.json(
      { message: "Failed to generate post. Please try again." },
      { status: 500 }
    );
  }
}
