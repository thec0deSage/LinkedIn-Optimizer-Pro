export type BioTone = "Professional" | "Friendly" | "Bold" | "Thought Leader";
export type ExperienceLevel = "junior" | "mid" | "senior";
export type Industry = "tech" | "marketing" | "design" | "business" | "operations" | "other";

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

// Keyword weighting for LinkedIn SEO
interface KeywordEntry {
  term: string;
  weight: number;
  phrase: string;
}

// Experience level phrases
interface ExperiencePhrasings {
  openings: string[];
  achievements: string[];
  learnings: string[];
  interests: string[];
}

// Industry-specific vocabulary
interface IndustryVocabulary {
  actionWords: string[];
  outcomeWords: string[];
  contextPhrases: string[];
}

// Enhanced industry-specific vocabulary
const INDUSTRY_VOCABULARY: Record<Industry, IndustryVocabulary> = {
  tech: {
    actionWords: ["building", "architecting", "designing", "scaling", "optimizing"],
    outcomeWords: ["solutions", "products", "systems", "platforms", "experiences"],
    contextPhrases: ["user-focused", "scalable", "innovative approaches", "emerging technologies"],
  },
  marketing: {
    actionWords: ["driving", "crafting", "accelerating", "positioning", "amplifying"],
    outcomeWords: ["growth", "engagement", "brand presence", "market impact", "customer advocacy"],
    contextPhrases: ["data-driven strategies", "brand alignment", "audience connection", "messaging that resonates"],
  },
  design: {
    actionWords: ["creating", "shaping", "crafting", "prototyping", "iterating"],
    outcomeWords: ["experiences", "interfaces", "solutions", "designs", "user journeys"],
    contextPhrases: ["human-centered", "intuitive", "thoughtful aesthetics", "user research"],
  },
  business: {
    actionWords: ["driving", "leading", "advancing", "facilitating", "optimizing"],
    outcomeWords: ["growth", "efficiency", "value", "impact", "results"],
    contextPhrases: ["strategic thinking", "operational excellence", "stakeholder alignment", "measurable outcomes"],
  },
  operations: {
    actionWords: ["streamlining", "optimizing", "improving", "coordinating", "enhancing"],
    outcomeWords: ["efficiency", "processes", "systems", "workflows", "performance"],
    contextPhrases: ["process improvement", "systems thinking", "cross-functional collaboration", "data-driven decisions"],
  },
  other: {
    actionWords: ["developing", "contributing", "supporting", "enabling"],
    outcomeWords: ["solutions", "outcomes", "value", "impact"],
    contextPhrases: ["focused approach", "collaborative mindset", "practical solutions"],
  },
};

// Experience level phrasings for authentic tone
const EXPERIENCE_PHRASINGS: Record<ExperienceLevel, ExperiencePhrasings> = {
  junior: {
    openings: [
      "passionate about building",
      "enthusiastic about learning and contributing to",
      "developing skills in",
      "eager to grow expertise in",
      "inspired by working with",
    ],
    achievements: [
      "building foundational skills",
      "delivering projects with mentorship",
      "growing capabilities in",
      "contributing meaningfully to",
      "learning from talented teams",
    ],
    learnings: [
      "What excites me most is continuous learning",
      "I'm particularly interested in mastering",
      "I'm drawn to environments where",
      "I thrive when",
    ],
    interests: [
      "connecting with experienced professionals",
      "finding mentors who invest in growth",
      "exploring emerging opportunities",
      "collaborating on challenging projects",
    ],
  },
  mid: {
    openings: [
      "helping teams achieve",
      "contributing to impactful",
      "collaborating on",
      "delivering value through",
      "driving meaningful progress in",
    ],
    achievements: [
      "delivering measurable results across",
      "leading successful initiatives in",
      "building expertise through hands-on work in",
      "scaling impact by focusing on",
      "solving complex problems in",
    ],
    learnings: [
      "What drives me is seeing",
      "I'm most fulfilled when",
      "I focus on projects where",
      "I'm particularly energized by",
    ],
    interests: [
      "collaborating with like-minded professionals",
      "exploring adjacent opportunities",
      "contributing to team growth",
      "tackling challenging problems",
    ],
  },
  senior: {
    openings: [
      "driving impact by leading",
      "scaling initiatives across",
      "strategically advancing",
      "pioneering approaches in",
      "shaping strategy within",
    ],
    achievements: [
      "leading transformational initiatives that",
      "scaling systems and teams to",
      "driving strategic growth in",
      "building high-performing groups focused on",
      "pioneering new approaches to",
    ],
    learnings: [
      "What excites me is driving",
      "I'm most energized when shaping",
      "I bring proven expertise in",
      "I've built a track record of",
    ],
    interests: [
      "partnering with visionary leaders",
      "shaping industry direction",
      "mentoring emerging talent",
      "creating lasting organizational impact",
    ],
  },
};

// Humanizer connectors and variations
const SENTENCE_CONNECTORS = {
  start: [
    "I believe that",
    "I've found that",
    "What I've learned is",
    "In my experience,",
    "I'm convinced that",
    "My core belief is",
  ],
  transition: [
    "What this has taught me is",
    "At my best,",
    "In practice,",
    "What I bring to the table is",
    "My strength lies in",
    "To this end,",
  ],
  outcome: [
    "This drives my passion for",
    "This translates to",
    "This enables me to",
    "This means I excel at",
    "This is why I focus on",
  ],
};

// Enhanced tone configuration with diverse patterns
const TONE_CONFIG: Record<
  BioTone,
  {
    opener: string[];
    collaboration: string[];
    close: string[];
    metaLabel: string;
    patterns: string[][]; // Multiple sentence structure patterns
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
      "I'm drawn to opportunities where thoughtful strategy and disciplined execution drive measurable results.",
    ],
    metaLabel: "Professional tone",
    patterns: [
      ["value_opener", "expertise_statement", "outcome_focus", "closing"],
      ["expertise_statement", "value_opener", "experience_blend", "closing"],
      ["outcome_focus", "expertise_statement", "value_opener", "closing"],
    ],
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
    patterns: [
      ["passion_opener", "human_touch", "expertise_statement", "connection_close"],
      ["expertise_statement", "passion_opener", "human_touch", "connection_close"],
    ],
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
      "I'm energized by work where bold thinking and disciplined execution happen in tandem.",
    ],
    metaLabel: "Bold tone",
    patterns: [
      ["impact_opener", "conviction_statement", "expertise_statement", "bold_close"],
      ["conviction_statement", "impact_opener", "expertise_statement", "bold_close"],
    ],
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
      "I'm drawn to spaces where a clear point of view creates credibility and drives sustained momentum.",
    ],
    metaLabel: "Thought leadership tone",
    patterns: [
      ["insight_opener", "perspective_statement", "expertise_statement", "influence_close"],
      ["perspective_statement", "insight_opener", "expertise_statement", "influence_close"],
    ],
  },
};

// ================================================================================
// Helper Functions
// ================================================================================

/**
 * Extract and weight keywords from job titles and expertise
 */
function extractKeywords(jobTitles: string, expertise: string): KeywordEntry[] {
  const roleTerms = splitList(jobTitles);
  const expertiseTerms = splitList(expertise);

  const keywords: KeywordEntry[] = [
    // Primary keywords (higher weight)
    ...roleTerms.slice(0, 2).map((term) => ({
      term,
      weight: 1,
      phrase: convertKeywordToPhrase(term),
    })),
    // Secondary keywords (medium weight)
    ...expertiseTerms.slice(0, 3).map((term) => ({
      term,
      weight: 0.8,
      phrase: convertKeywordToPhrase(term),
    })),
  ];

  return keywords;
}

/**
 * Convert keyword to natural outcome-driven phrase for LinkedIn SEO
 */
function convertKeywordToPhrase(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase().trim();

  const keywordMappings: Record<string, string> = {
    "ux design": "designing intuitive user experiences",
    "ui design": "crafting elegant user interfaces",
    research: "conducting research that drives decisions",
    engineering: "building scalable systems",
    marketing: "driving growth strategies",
    "product management": "shipping products that matter",
    writing: "crafting compelling narratives",
    strategy: "shaping strategic direction",
    leadership: "leading high-performing teams",
    sales: "closing meaningful partnerships",
    communication: "translating complex ideas clearly",
    analytics: "leveraging data for insights",
    operations: "optimizing processes",
    design: "creating thoughtful experiences",
  };

  for (const [key, value] of Object.entries(keywordMappings)) {
    if (lowerKeyword.includes(key)) {
      return value;
    }
  }

  return `working effectively in ${lowerKeyword}`;
}

/**
 * Infer experience level from job titles and keywords
 */
function inferExperienceLevel(jobTitles: string, expertise: string): ExperienceLevel {
  const combined = `${jobTitles} ${expertise}`.toLowerCase();

  const seniorKeywords = [
    "director",
    "vp",
    "chief",
    "principal",
    "lead",
    "manager",
    "senior",
    "head of",
    "driven",
    "scaled",
    "led",
  ];

  const juniorKeywords = [
    "junior",
    "associate",
    "intern",
    "entry",
    "graduate",
    "learning",
    "passionate",
    "building skills",
    "aspiring",
  ];

  const seniorScore = seniorKeywords.filter((kw) => combined.includes(kw)).length;
  const juniorScore = juniorKeywords.filter((kw) => combined.includes(kw)).length;

  if (juniorScore > 0 && seniorScore === 0) return "junior";
  if (seniorScore >= 2) return "senior";
  return "mid";
}

/**
 * Detect industry from expertise and job titles
 */
function detectIndustry(jobTitles: string, expertise: string): Industry {
  const combined = `${jobTitles} ${expertise}`.toLowerCase();

  const industryKeywords: Record<Industry, string[]> = {
    tech: [
      "software",
      "engineer",
      "developer",
      "frontend",
      "backend",
      "fullstack",
      "devops",
      "cloud",
      "api",
      "database",
      "architecture",
      "web",
      "mobile",
      "ai",
      "machine learning",
      "data science",
      "product manager",
    ],
    marketing: [
      "marketing",
      "growth",
      "brand",
      "campaign",
      "social",
      "content",
      "seo",
      "sem",
      "advertising",
      "copywriter",
      "demand gen",
    ],
    design: [
      "design",
      "ux",
      "ui",
      "visual",
      "product design",
      "interaction",
      "prototyp",
      "figma",
      "designer",
      "creative",
    ],
    business: [
      "strategy",
      "consultant",
      "analyst",
      "planning",
      "business",
      "corporate",
      "finance",
      "sales",
      "account management",
    ],
    operations: [
      "operations",
      "process",
      "supply chain",
      "logistics",
      "project management",
      "scrum",
      "agile",
      "coordinator",
    ],
    other: [],
  };

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      return industry as Industry;
    }
  }

  return "other";
}

/**
 * Generate sentence variations with different structure patterns
 */
function generateSentenceVariation(
  primaryTitle: string,
  expertise: string[],
  experience: ExperienceLevel,
  industry: Industry,
  tone: BioTone
): string[] {
  const tonePhrasings = EXPERIENCE_PHRASINGS[experience];
  const industryVocab = INDUSTRY_VOCABULARY[industry];
  const actionWord = industryVocab.actionWords[Math.floor(Math.random() * industryVocab.actionWords.length)];
  const outcomeWord = industryVocab.outcomeWords[Math.floor(Math.random() * industryVocab.outcomeWords.length)];

  const patterns: string[] = [];

  // Pattern 1: Direct value proposition
  const opening = tonePhrasings.openings[Math.floor(Math.random() * tonePhrasings.openings.length)];
  patterns.push(`${opening} as a ${primaryTitle}`);

  // Pattern 2: Achievement-focused
  const achievement = tonePhrasings.achievements[Math.floor(Math.random() * tonePhrasings.achievements.length)];
  patterns.push(`Experienced in ${achievement} across ${expertise.slice(0, 2).join(" and ")}`);

  // Pattern 3: Outcome-driven
  patterns.push(
    `I'm focused on ${actionWord} ${outcomeWord} that bridge expertise in ${expertise.slice(0, 2).join(" and ")}`
  );

  // Pattern 4: Interest-based
  const interest = tonePhrasings.interests[Math.floor(Math.random() * tonePhrasings.interests.length)];
  patterns.push(`Most excited by ${interest} within ${primaryTitle} roles`);

  return patterns;
}

/**
 * Humanizer: Create varied sentence structures to avoid template feel
 */
function humanizeContent(paragraphs: string[], tone: BioTone): string[] {
  const humanized = paragraphs.map((para) => {
    // Add sentence variety
    if (Math.random() > 0.5) {
      return varyingSentenceLength(para);
    }
    return para;
  });

  // Randomize order slightly while keeping logical flow
  if (tone === "Bold" && Math.random() > 0.6) {
    const [first, ...rest] = humanized;
    return [first, ...shuffleArray(rest)];
  }

  return humanized;
}

/**
 * Vary sentence length to create rhythm - only break at proper conjunctions with word boundaries
 */
function varyingSentenceLength(text: string): string {
  // Don't break sentences - they're already grammatically correct from createUnifiedParagraph
  // Using word boundaries to avoid splitting words like "Tutoring" on "ing"
  return text;
}

/**
 * Capitalize first letter after periods for proper grammar
 */
function capitalizeAfterPeriods(text: string): string {
  return text.replace(/\.\s+([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`);
}

/**
 * Preserve original text - the paragraph is already grammatically correct from createUnifiedParagraph
 * Removing words breaks pronouns, verbs, and essential parts of speech
 */
function removeRepetitiveWords(text: string, _wordsToAvoid: string[] = []): string {
  // Return text as-is without modification
  // The paragraph is already well-constructed and doesn't need aggressive word removal
  // Removing words was breaking grammar (e.g., removing "I" from "I focus")
  return text;
}

/**
 * Get alternative action phrases to avoid repetition - these are complete verb phrases
 */
function getAlternativeActionPhrasing(_industry: Industry, _usedVerb?: string): string {
  // Comprehensive alternatives that work as complete constructions
  const alternatives: string[] = [
    "I bring deep expertise in",
    "I specialize in",
    "I deliver impact through work in",
    "I leverage extensive background across",
    "I contribute to results in",
    "I develop capabilities across",
    "I advance work through",
    "I excel when handling",
    "I thrive by working across",
  ];
  
  // Randomly select to avoid patterns
  return alternatives[Math.floor(Math.random() * alternatives.length)];
}

/**
 * Detect various forms of repetitive language patterns
 */
function detectRepetitivePatterns(text: string): Set<string> {
  const lowerText = text.toLowerCase();
  const repetitiveWords = new Set<string>();
  
  // Check for common repetitive verbs/patterns
  const wordsToCheck = [
    "focus", "bring", "building", "built", "develop", "developing", "create", "creating",
    "help", "helping", "work", "working", "drive", "driving", "shaping", "shape",
    "deliver", "delivering", "leverage", "leveraging", "contribute", "contributing"
  ];
  
  wordsToCheck.forEach((word) => {
    if (lowerText.includes(word)) {
      repetitiveWords.add(word);
    }
  });
  
  return repetitiveWords;
}

/**
 * Check how many times a word appears in text (case-insensitive)
 */
function countWordOccurrences(text: string, word: string): number {
  const regex = new RegExp(`\\b${word}\\b`, "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Create a single flowing paragraph by combining key elements - no repetitive action verbs
 */
function createUnifiedParagraph(
  opener: string,
  primaryTitle: string,
  supportingRoles: string[],
  leadStrengths: string[],
  collaboration: string,
  moreStrengths: string[],
  close: string,
  industry: Industry,
  experienceLevel: ExperienceLevel
): string {
  const industryVocab = INDUSTRY_VOCABULARY[industry];
  const primaryActionWord = industryVocab.actionWords[0];

  // Detect what words are already used in opener
  const repetitiveWords = detectRepetitivePatterns(opener);

  // Build a cohesive narrative
  let paragraph = opener;

  // Add title and expertise context
  if (supportingRoles.length > 0) {
    paragraph += ` In my role as a ${primaryTitle.toLowerCase()} with background in ${joinWithCommas(supportingRoles)},`;
  } else {
    paragraph += `. As a ${primaryTitle.toLowerCase()},`;
  }

  // Add primary strengths - avoid repeating words from opener
  if (leadStrengths.length > 0) {
    // Check if we already used common verbs in the opener
    const hasCommonVerb = repetitiveWords.size > 0;
    
    if (hasCommonVerb) {
      // Use alternative construction to avoid repetition
      const altPhrase = getAlternativeActionPhrasing(industry, primaryActionWord);
      paragraph += ` ${altPhrase} ${joinWithCommas(leadStrengths)}`;
    } else {
      // Safe to use the main action word
      paragraph += ` I ${primaryActionWord} ${industryVocab.outcomeWords[0]} across ${joinWithCommas(leadStrengths)}`;
    }
  } else {
    paragraph += ` I work across strategy, execution, and communication`;
  }

  // Add collaborative element using transition
  paragraph += `. ${collaboration.charAt(0).toUpperCase() + collaboration.slice(1)}`;

  // Add secondary expertise if available
  if (moreStrengths.length > 0) {
    paragraph += `, with particular depth in ${joinWithCommas(moreStrengths)}`;
  }

  // Close with natural ending
  paragraph += `. ${close.charAt(0).toUpperCase() + close.slice(1)}`;

  // Ensure proper capitalization after periods
  paragraph = capitalizeAfterPeriods(paragraph);

  return paragraph;
}

/**
 * Shuffle array for variety
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ================================================================================
// Main Generator
// ================================================================================

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

  // Enhanced features
  const keywords = extractKeywords(jobTitles, expertise);
  const experienceLevel = inferExperienceLevel(jobTitles, expertise);
  const industry = detectIndustry(jobTitles, expertise);

  const opener = pickVariant(toneConfig.opener, variation);
  const collaboration = pickVariant(toneConfig.collaboration, variation);
  const close = pickVariant(toneConfig.close, variation);

  // Build headline with keyword optimization
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

  // Enhanced paragraph generation with industry and experience awareness
  const industryVocab = INDUSTRY_VOCABULARY[industry];
  const actionWord =
    industryVocab.actionWords[Math.abs(variation) % industryVocab.actionWords.length];

  // Create single unified, humanized paragraph
  const unifiedParagraph = createUnifiedParagraph(
    opener,
    primaryTitle,
    supportingRoles,
    leadStrengths.length > 0 ? leadStrengths : ["strategy", "execution", "communication"],
    collaboration,
    moreStrengths,
    close,
    industry,
    experienceLevel
  );

  const paragraphs = [varyingSentenceLength(unifiedParagraph)];

  // Dynamic call to action based on experience level
  const cta =
    experienceLevel === "junior"
      ? "Open to mentorship, collaborative opportunities, and roles where I can grow while contributing meaningfully."
      : experienceLevel === "senior"
        ? "Interested in partnering on strategic initiatives, mentoring emerging talent, and creating lasting impact."
        : "Open to meaningful conversations, collaborations, and opportunities where strong positioning can create measurable impact.";

  return {
    primaryTitle,
    headline,
    metaLine,
    paragraphs,
    callToAction: cta,
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
