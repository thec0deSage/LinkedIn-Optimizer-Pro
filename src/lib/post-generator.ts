export type PostTone = "Professional" | "Thought Leader" | "Educational" | "Empathetic";
export type PostLength = "Short" | "Medium" | "Long";
export type CTAType = "Engagement Question" | "Call-to-Action" | "Social Proof" | "Educational Focus" | "No CTA";

export type PostDraft = {
  title: string;
  content: string;
  callToAction: string;
  engagementPrediction?: {
    likes: number;
    comments: number;
    shares: number;
  };
};

type GeneratePostInput = {
  topic: string;
  tone: PostTone;
  length: PostLength;
  ctaType: CTAType;
  variation?: number;
};

// Tone-specific characteristics
interface ToneCharacteristics {
  voice: string[];
  openings: string[];
  closings: string[];
  tactics: string[];
}

const TONE_CHARACTERISTICS: Record<PostTone, ToneCharacteristics> = {
  "Professional": {
    voice: ["authoritative", "credible", "polished"],
    openings: ["Here's what I've learned...", "In my experience...", "Key takeaway:"],
    closings: ["Let's connect and discuss", "Thoughts?", "What's your take?"],
    tactics: ["data-driven", "case studies", "industry insights"],
  },
  "Thought Leader": {
    voice: ["visionary", "insightful", "provocative"],
    openings: ["The future of [industry]...", "Everyone's talking about X, but...", "Unpopular opinion:"],
    closings: ["This is the future.", "The time is now.", "Let me know your thoughts."],
    tactics: ["contrarian views", "trend forecasting", "bold predictions"],
  },
  "Educational": {
    voice: ["clear", "helpful", "accessible"],
    openings: ["Quick lesson:", "TIL (Today I Learned):", "Here's a framework:"],
    closings: ["Hope this helps!", "Tag someone who needs this.", "Questions? Let's discuss"],
    tactics: ["step-by-step", "frameworks", "concrete examples"],
  },
  "Empathetic": {
    voice: ["warm", "relatable", "authentic"],
    openings: ["I used to struggle with...", "Can we be honest for a second?", "Here's something I learned the hard way:"],
    closings: ["You've got this.", "We're in this together.", "What's been your experience?"],
    tactics: ["personal stories", "vulnerability", "common struggles"],
  },
};

// Length guidelines
const LENGTH_GUIDELINES: Record<PostLength, { minWords: number; maxWords: number; sections: number }> = {
  "Short": { minWords: 50, maxWords: 150, sections: 1 },
  "Medium": { minWords: 150, maxWords: 300, sections: 2 },
  "Long": { minWords: 300, maxWords: 500, sections: 3 },
};

// CTA strategies
interface CTAStrategy {
  template: string;
  examples: string[];
}

const CTA_STRATEGIES: Record<CTAType, CTAStrategy> = {
  "Engagement Question": {
    template: "End with a direct question to spark discussion",
    examples: ["What's your biggest challenge with this?", "How do you approach this?", "Tell me: what would you do?"],
  },
  "Call-to-Action": {
    template: "Direct readers to take specific action",
    examples: ["Comment below how you'd solve this", "Share your experience in the comments", "Drop a 🚀 if you agree"],
  },
  "Social Proof": {
    template: "Reference others' success or credibility",
    examples: ["Tag someone who needs to read this", "If you've experienced this too, tag a friend", "Share this with your team"],
  },
  "Educational Focus": {
    template: "Offer to teach or provide resources",
    examples: ["I've created a framework for this—DM me if interested", "Here's what I learned...", "Reply if you want the full breakdown"],
  },
  "No CTA": {
    template: "Let the content speak for itself",
    examples: ["", ""],
  },
};

/**
 * Generates a LinkedIn post based on the provided parameters
 * This is a stub that would be replaced with actual AI generation
 */
export async function generatePost(
  input: GeneratePostInput
): Promise<PostDraft> {
  const { topic, tone, length, ctaType, variation = 1 } = input;

  // Validation
  if (!topic.trim()) {
    throw new Error("Topic is required");
  }

  const toneChars = TONE_CHARACTERISTICS[tone];
  const lengthGuide = LENGTH_GUIDELINES[length];
  const ctaStrategy = CTA_STRATEGIES[ctaType];

  // This would be replaced with actual AI generation
  // For now, returning a structured template

  const postContent = generatePostTemplate(
    topic,
    toneChars,
    lengthGuide,
    ctaStrategy,
    variation
  );

  // Estimate engagement (simplified)
  const engagement = estimateEngagement(length);

  return {
    title: generateTitle(topic, toneChars),
    content: postContent,
    callToAction: generateCTA(ctaStrategy),
    engagementPrediction: engagement,
  };
}

function generateTitle(topic: string, tone: ToneCharacteristics): string {
  // Generate a compelling title based on tone
  const templates = [
    `Here's what I learned about ${topic}`,
    `The truth about ${topic}`,
    `Why ${topic} matters`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generatePostTemplate(
  topic: string,
  tone: ToneCharacteristics,
  length: { minWords: number; maxWords: number; sections: number },
  cta: CTAStrategy,
  variation: number
): string {
  // Start with an opening
  const opening = tone.openings[variation % tone.openings.length];

  // Middle content (would be AI-generated in production)
  const sections: string[] = [];
  for (let i = 0; i < length.sections; i++) {
    sections.push(generateSection(topic, tone, i));
  }

  // Combine with closing
  const closing = tone.closings[variation % tone.closings.length];

  return `${opening}\n\n${sections.join("\n\n")}\n\n${closing}`;
}

function generateSection(topic: string, tone: ToneCharacteristics, index: number): string {
  const tactics = tone.tactics[index % tone.tactics.length];
  return `• This section explores ${topic} through ${tactics}`;
}

function generateCTA(strategy: CTAStrategy): string {
  if (strategy.examples.length === 0) return "";
  return strategy.examples[0];
}

function estimateEngagement(length: PostLength): {
  likes: number;
  comments: number;
  shares: number;
} {
  // Simplified estimation
  const baseEngagement = {
    "Short": { likes: 45, comments: 8, shares: 3 },
    "Medium": { likes: 85, comments: 15, shares: 6 },
    "Long": { likes: 120, comments: 22, shares: 10 },
  };

  return baseEngagement[length];
}

export function getInitials(name: string): string {
  if (!name) return "LOP";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
