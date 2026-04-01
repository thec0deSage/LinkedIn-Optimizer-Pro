export type BioTone = "Professional" | "Friendly" | "Bold" | "Thought Leader";

export type BioDraft = {
  primaryTitle: string;
  headline: string;
  metaLine: string;
  paragraphs: string[];
  callToAction: string;
};

type GenerateBioInput = {
  jobTitles: string;
  expertise: string;
  tone: BioTone;
  variation?: number;
};

const TONE_CONFIG: Record<
  BioTone,
  {
    opener: string[];
    collaboration: string[];
    close: string[];
    metaLabel: string;
  }
> = {
  Professional: {
    opener: [
      "I help teams turn ambitious ideas into clear business outcomes",
      "I build momentum where strategy, execution, and audience trust need to align",
      "I focus on translating expertise into positioning that feels credible and specific",
    ],
    collaboration: [
      "My work blends structured thinking with practical execution",
      "I bring together research, communication, and decision-making to keep growth moving",
      "I am at my best when complex work needs sharp framing and steady follow-through",
    ],
    close: [
      "I enjoy collaborating with teams that value clarity, consistency, and measurable progress.",
      "I am always interested in conversations where strong positioning can unlock the next stage of growth.",
      "I look for opportunities where thoughtful strategy and crisp execution can create real momentum.",
    ],
    metaLabel: "Professional tone",
  },
  Friendly: {
    opener: [
      "I love helping people make complex ideas easier to understand and easier to act on",
      "I enjoy building work that feels thoughtful, useful, and genuinely human",
      "I am energized by projects where clear communication can create real momentum",
    ],
    collaboration: [
      "My approach balances curiosity, structure, and a strong sense of what matters most",
      "I like creating experiences that feel approachable while still delivering serious results",
      "I bring a collaborative style that keeps ideas moving without losing quality",
    ],
    close: [
      "If you enjoy smart strategy, clear ideas, and good collaboration, we will probably get along well.",
      "I am always open to connecting with people who care about thoughtful work and steady growth.",
      "I appreciate conversations with teams who want their work to feel both strategic and human.",
    ],
    metaLabel: "Friendly tone",
  },
  Bold: {
    opener: [
      "I build work that earns attention and turns expertise into visible traction",
      "I am focused on making strong ideas impossible to overlook",
      "I help brands and leaders show up with sharper positioning and stronger momentum",
    ],
    collaboration: [
      "My edge is combining decisive execution with messaging that actually lands",
      "I move fast, frame clearly, and keep the work anchored to outcomes that matter",
      "I bring a high-conviction approach to strategy, storytelling, and growth",
    ],
    close: [
      "I am drawn to ambitious teams that want standout work and clear results.",
      "If the goal is stronger positioning and faster traction, that is the kind of challenge I enjoy.",
      "I look for work where bold thinking and disciplined execution need to happen at the same time.",
    ],
    metaLabel: "Bold tone",
  },
  "Thought Leader": {
    opener: [
      "I believe the strongest professional brands are built on insight, consistency, and useful perspective",
      "I focus on shaping ideas that help people think differently and act with more confidence",
      "I turn hands-on experience into clear points of view that create trust over time",
    ],
    collaboration: [
      "My work sits at the intersection of strategy, communication, and long-term positioning",
      "I care about building credibility through clarity, relevance, and a strong narrative",
      "I bring an editorial lens to growth, messaging, and the way expertise is presented",
    ],
    close: [
      "I enjoy contributing to conversations where thoughtful ideas can influence how work gets done.",
      "I am especially interested in opportunities to share insight, shape perspective, and create lasting trust.",
      "I look for spaces where a clear point of view can create both credibility and momentum.",
    ],
    metaLabel: "Thought leadership tone",
  },
};

export function generateBioDraft({
  jobTitles,
  expertise,
  tone,
  variation = 0,
}: GenerateBioInput): BioDraft {
  const roles = splitList(jobTitles);
  const strengths = splitList(expertise);
  const safeTone = TONE_CONFIG[tone] ? tone : "Professional";
  const toneConfig = TONE_CONFIG[safeTone];
  const primaryTitle = roles[0] ?? "LinkedIn Professional";
  const supportingRoles = roles.slice(1, 3);
  const leadStrengths = strengths.slice(0, 3);
  const moreStrengths = strengths.slice(3, 6);

  const opener = pickVariant(toneConfig.opener, variation);
  const collaboration = pickVariant(toneConfig.collaboration, variation);
  const close = pickVariant(toneConfig.close, variation);

  const headlineParts = [primaryTitle];
  if (supportingRoles.length > 0) {
    headlineParts.push(joinWithCommas(supportingRoles));
  }
  if (leadStrengths.length > 0) {
    headlineParts.push(joinWithCommas(leadStrengths));
  }

  const headline = headlineParts.join(" | ");
  const metaLine = [
    toneConfig.metaLabel,
    leadStrengths.length > 0 ? `${leadStrengths.length}+ core strengths` : null,
    roles.length > 1 ? `${roles.length} role perspectives` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  const paragraphs = [
    `${opener}. As a ${primaryTitle.toLowerCase()}${buildRoleExtension(
      supportingRoles
    )}, I bring experience across ${joinWithCommas(
      leadStrengths.length > 0 ? leadStrengths : ["strategy", "execution", "communication"]
    )}.`,
    `${collaboration}. My background includes ${joinWithCommas(
      roles.slice(0, 3)
    )}${buildExpertiseExtension(moreStrengths)}.`,
    close,
  ];

  return {
    primaryTitle,
    headline,
    metaLine,
    paragraphs,
    callToAction:
      "Open to meaningful conversations, collaborations, and opportunities where strong positioning can create measurable impact.",
  };
}

export function formatBioForClipboard(draft: BioDraft) {
  return [
    draft.primaryTitle,
    draft.headline,
    draft.metaLine,
    "",
    ...draft.paragraphs,
    "",
    draft.callToAction,
  ].join("\n");
}

function splitList(value: string) {
  return value
    .split(/[\n,;/|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, items) => {
      return items.findIndex(
        (candidate) => candidate.toLowerCase() === item.toLowerCase()
      ) === index;
    });
}

function pickVariant(values: string[], variation: number) {
  return values[Math.abs(variation) % values.length];
}

function joinWithCommas(values: string[]) {
  if (values.length === 0) return "";
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function buildRoleExtension(roles: string[]) {
  if (roles.length === 0) return "";
  return ` with experience spanning ${joinWithCommas(
    roles.map((role) => role.toLowerCase())
  )}`;
}

function buildExpertiseExtension(strengths: string[]) {
  if (strengths.length === 0) return "";
  return `, with added depth in ${joinWithCommas(strengths)}`;
}
