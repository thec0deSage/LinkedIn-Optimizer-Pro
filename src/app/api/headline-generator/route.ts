import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type HeadlineTone = "Professional" | "Creative" | "Bold";

type HeadlineOption = {
  tone: HeadlineTone;
  headline: string;
};

type ExperienceEntry = {
  role: string;
  company: string;
};

type ProfileData = {
  fullName: string;
  currentHeadline: string;
  currentTitle: string;
  currentCompany: string;
  industry: string;
  previousRoles: ExperienceEntry[];
  skills: string[];
  endorsements: string[];
  about: string;
  certifications: string[];
  education: string[];
  achievements: string[];
};

type SearchDiscovery = {
  sourceUrl: string;
  content: string;
};

type SectionKey =
  | "about"
  | "experience"
  | "skills"
  | "education"
  | "certifications"
  | "achievements";

const LINKEDIN_HOST = "linkedin.com";

const PROFILE_EXTRACTION_PROMPT = `You are a high-fidelity data extraction engine.
Your goal is to parse raw text and snippets from search results to extract a LinkedIn profile.

JSON STRUCTURE:
{
  "fullName": "...",
  "currentHeadline": "The profile's existing headline",
  "currentTitle": "...",
  "currentCompany": "...",
  "industry": "e.g. Software Development, Financial Services",
  "previousRoles": [{ "role": "...", "company": "..." }],
  "skills": ["..."],
  "endorsements": ["..."],
  "about": "A concise summary of the profile narrative",
  "certifications": ["..."],
  "education": ["..."],
  "achievements": ["..."]
}

RULES:
1. If data is missing for a field, return an empty string or empty array.
2. If multiple titles are present, pick the one that appears most recent/current.
3. Ignore noise like "See more", "1 month ago", "view profile", etc.
4. IDENTITY GROUNDING (CRITICAL): Only extract data specifically for the person identified in the URL slug or the main professional profile.
5. HALLUCINATION PREVENTION: If you see common namesakes or different people with the same name (e.g. "Lennox Agency", "Lennox Consulting", or "Lennox Real Estate"), YOU MUST DISCARD them unless they are explicitly listed as the target individual's own current or past employment in their own personal profile text.
6. If a company name sounds like a name namesake (e.g. "The Lennox Agency" for a person named "Lennox"), treat it as a hallucination result and ignore it unless confirmed by multiple sources or the target's own self-description.
7. Provide the most descriptive and professional versions of everything.

Return ONLY the JSON. No preamble. No markdown fences.`;

const ROLE_KEYWORDS = [
  "engineer",
  "manager",
  "director",
  "head",
  "lead",
  "founder",
  "consultant",
  "specialist",
  "analyst",
  "designer",
  "architect",
  "strategist",
  "developer",
  "officer",
  "president",
  "marketer",
];

const SECTION_ALIASES: Record<SectionKey, string[]> = {
  about: ["about"],
  experience: ["experience"],
  skills: ["skills", "top skills"],
  education: ["education"],
  certifications: [
    "licenses & certifications",
    "licenses and certifications",
    "certifications",
    "licenses",
  ],
  achievements: [
    "honors & awards",
    "honors and awards",
    "awards",
    "accomplishments",
    "projects",
    "publications",
    "patents",
  ],
};

const ALL_SECTION_ALIASES = new Set(
  Object.values(SECTION_ALIASES).flat().map((alias) => normalizeKey(alias))
);

const GENERIC_STOPWORDS = new Set([
  "linkedin",
  "profile",
  "experience",
  "skills",
  "about",
  "show all",
  "see more",
  "view profile",
  "connect",
  "message",
  "follow",
  "pengalaman",
  "pendidikan",
  "lokasi",
  "au linkedin com",
]);

const BANNED_HEADLINE_TERMS = [
  /\binnovative\b/i,
  /\bpassionate\b/i,
  /\bdynamic\b/i,
  /\bresults[-\s]?driven\b/i,
  /\bstrategic\b/i,
  /\bcreative professional\b/i,
  /\bproblem solver\b/i,
  /\bthought leader\b/i,
  /\bhardworking\b/i,
  /\bdedicated\b/i,
  /\bexperienced\b/i,
  /\bskilled\b/i,
  /\bexpert\b/i,
  /\bseasoned\b/i,
  /\bmotivated\b/i,
  /\benthusiastic\b/i,
  /\bdetail-oriented\b/i,
  /\bguru\b/i,
  /\bninja\b/i,
  /\brockstar\b/i,
  /\bsynergy\b/i,
  /\bleverage\b/i,
  /\bwhere art meets\b/i,
  /\bbuilding products\b/i,
  /\bdesigning solutions\b/i,
];

const TECH_NOISE_REMOVAL_PATTERNS = [
  /\b\d{1,3}\+?\s+connections\b/i,
  /\bhis\s+linkedin\s+profile\s+has\s+over\s+500\b/i,
  /\bextrac(?:ted|ting)\s+from\s+url\b/i,
  /\bsee\s+more\b/i,
  /\bshow\s+all\b/i,
  /\bview\s+profile\b/i,
  /\bconnect\s+to\s+view\b/i,
  /\bmessage\s+this\s+profile\b/i,
  /\bcontact\s+info\b/i,
  /\bau\s+linkedin\s+com\b/i,
  /\bjoined\s+linkedin\s+in\b/i,
  /\breach\s+out\s+to\b/i,
  /\b(?:is|a)\s+professional\s+at\s+funnkar\s+design\s+house\b/i
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HEADLINE_SYSTEM_PROMPT = `You are an expert LinkedIn personal branding copywriter.
You have studied thousands of high-performing LinkedIn profiles
from top creators, executives, and thought leaders.

You know that the best LinkedIn headlines follow these proven frameworks:

FRAMEWORK 1 — VALUE PROPOSITION
"I help [Target Audience] achieve [Outcome] using [Method/Skill]"
Example: "I help SaaS founders reduce churn by 40% using behavioral onboarding"

FRAMEWORK 2 — ROLE + RESULT + CREDIBILITY
"[Title] at [Company] | [Quantified Achievement] | [Social Proof]"
Example: "Product Lead at Stripe | Shipped features used by 10M+ users | Forbes 30 Under 30"

FRAMEWORK 3 — IDENTITY + NICHE + MISSION
"[Who You Are] helping [Who They Are] do [What Transformation]"
Example: "Ex-Google Engineer helping early-stage startups build scalable backend systems"

FRAMEWORK 4 — BOLD CLAIM (Creative/Bold variant)
Lead with a strong, specific, defensible claim that makes the reader stop scrolling.
Example: "The only UX designer who codes, sells, and ships — solo."

RULES FOR HIGH-CONVERTING HEADLINES:
- Be specific — never vague. "Marketing Expert" is weak. "B2B SaaS Growth Marketer who 3x'd pipeline in 6 months" is strong.
- Use numbers and outcomes wherever possible.
- Speak to the reader's perspective — what's in it for them?
- Avoid buzzwords: "passionate", "dynamic", "results-driven", "strategic thinker"
- Each headline must be under 220 characters (LinkedIn's limit)
- Each of the 3 variants must feel genuinely distinct in voice and strategy — not just reworded versions of each other.

Generate exactly 3 headlines:
1. PROFESSIONAL — Framework 1 or 2. Keyword-rich, ATS-optimized, recruiter-friendly.
2. CREATIVE — Framework 3. Personality-forward, human, memorable.
3. BOLD — Framework 4. Punchy, scroll-stopping, confident.

Use only real data from the profile provided. Never invent job titles, companies, or achievements.

Return only a JSON object in this format:
{
  "professional": "...",
  "creative": "...",
  "bold": "..."
}`;

const DISALLOWED_STYLE_PATTERNS = [
  /\bconnections?\b/i,
  /\bfollowers?\b/i,
  /\blocation\b/i,
  /\bworks at\b/i,
  /\bstudied at\b/i,
  /\binnovative products\b/i,
  /\bwhere art meets\b/i,
  /\bbuilding products\b/i,
  /\bpassionate\b/i,
  /\bdynamic\b/i,
];

const EXPERT_COPYWRITER_SYSTEM_PROMPT = `Act as a LinkedIn branding expert specifically focused on high-performing, outcome-driven headlines.

Your task is to analyze the provided <USER_PROFILE> and generate EXACTLY 3 headlines (Professional, Creative, Bold).

STRICT NEGATIVE CONSTRAINTS:
1. NO NAMES: Do not include the user's name ("Lennox Galanje", "Lennox", etc.).
2. NO PRONOUNS: Do not start with "I am", "He is", "She is", or "My goal is".
3. NO META-LABELS: Do not start with "Role:", "Skills:", or "Achievement:".
4. NO BUZZWORDS: Avoid "passionate", "guru", "ninja", "expert", "innovative", "results-driven".
5. NO REPETITION: Do not use the same role or company multiple times in one headline.

FORMAL STRUCTURE:
- Professional: [Current Role] | [Core Skills] | [Measurable Impact]
- Creative: [Unique Value Prop / Hook] | [High-Impact Metric] | [Role]
- Bold: [Punchy Industry POV] | [Top Achievement] | [Mission-Driven Title]

Input Data Format:
<USER_PROFILE>
Role: [Current Job Title]
Company: [Current Employer]
Skills: [Top 5 Skills]
Impact: [Top Business Outcomes]
Goal: [Career Objective]
</USER_PROFILE>

Output Format (JSON ONLY):
{
  "headlines": {
    "professional": "Direct and high-fidelity...",
    "creative": "Outcome-focused and unique...",
    "bold": "Punchy and authoritative..."
  },
  "best_choice": "one of: professional, creative, bold"
}`;

const SERVER_BANNED_WORDS = [
  "innovative",
  "passionate",
  "dynamic",
  "results-driven",
  "strategic",
  "creative professional",
  "problem solver",
  "thought leader",
  "guru",
  "ninja",
  "rockstar",
  "synergy",
  "leverage",
  "where art meets",
  "building products",
  "designing solutions",
  "hardworking",
  "dedicated",
  "experienced",
  "skilled",
  "expert",
  "seasoned",
  "motivated",
  "enthusiastic",
  "detail-oriented",
];

const SUMMARY_REJECTION_PHRASES = [
  "profile shows",
  "he works at",
  "she works at",
  "they work at",
  "current job title is",
  "current role is",
  "current company is",
  "previously worked as",
  "skills include",
  "achievements include",
  "studied at",
  "located in",
  "connections",
  "followers",
];

const PROFILE_NOISE_PHRASES = [
  "current job title is",
  "current role is",
  "current company is",
  "previously worked as",
  "he previously worked as",
  "she previously worked as",
  "they previously worked as",
  "skills include",
  "their skills include",
  "profile data",
  "here is the profile data",
  "see more",
  "show all",
  "1 month ago",
  "months ago",
  "years ago",
  "ago",
  "see the complete profile",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { profileUrl?: string }
      | null;
    const rawUrl = body?.profileUrl?.trim() ?? "";
    const normalizedUrl = normalizeLinkedInUrl(rawUrl);

    if (!normalizedUrl) {
      return NextResponse.json(
        { message: "Please enter a valid public LinkedIn profile URL." },
        { status: 400 }
      );
    }

    const discovered = await discoverProfileText(normalizedUrl);
    if (!discovered) {
      console.log(`[DEBUG] Discovery failed for ${normalizedUrl}`);
      return NextResponse.json(
        {
          message:
            "We could not read this public profile. Please ensure your LinkedIn profile visibility is set to public and try again.",
        },
        { status: 422 }
      );
    }

    console.log(`[DEBUG] Raw content length: ${discovered.content.length}`);
    let profile = await extractProfileWithLLM(discovered.content, normalizedUrl);

    if (!profile || (!profile.currentTitle && !profile.about)) {
      console.log(`[DEBUG] LLM extraction failed or empty, falling back to regex.`);
      profile = extractProfileData(discovered.content, normalizedUrl);
    }

    const enrichedProfile = sanitizeProfileData(inferMissingFromAvailable(profile, normalizedUrl));
    const groundingFacts = collectGroundingFacts(enrichedProfile);

    console.log(`[DEBUG] Profile extracted for ${normalizedUrl}:`, {
      fullName: enrichedProfile.fullName,
      currentTitle: enrichedProfile.currentTitle,
      currentCompany: enrichedProfile.currentCompany,
      factsCount: groundingFacts.length,
      proofCount: enrichedProfile.previousRoles.length + enrichedProfile.skills.length + enrichedProfile.education.length
    });
    console.log(`[DEBUG] Grounding facts:`, groundingFacts);

    if (!hasMinimumGrounding(enrichedProfile, groundingFacts)) {
      return NextResponse.json(
        {
          message:
            "We found too little public profile detail to generate real personalized headlines. Please make sure your About, Experience, and Skills are publicly visible.",
        },
        { status: 422 }
      );
    }

    const aiHeadlines = await generateHeadlinesWithValidation(enrichedProfile);
    const headlines = aiHeadlines
      ? mapHeadlineJsonToOptions(aiHeadlines, enrichedProfile, groundingFacts)
      : generateGroundedHeadlines(enrichedProfile, groundingFacts);

    return NextResponse.json({
      headlines,
      profile: enrichedProfile,
      sourceUrl: discovered.sourceUrl,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Something went wrong while generating headlines. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}

function normalizeLinkedInUrl(rawValue: string): string | null {
  if (!rawValue) return null;

  const value = /^https?:\/\//i.test(rawValue)
    ? rawValue
    : `https://${rawValue}`;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "");

    if (!hostname.endsWith(LINKEDIN_HOST) || !pathname.startsWith("/in/")) {
      return null;
    }

    parsed.protocol = "https:";
    parsed.hash = "";
    parsed.search = "";

    return `${parsed.origin}${pathname}`;
  } catch {
    return null;
  }
}

async function discoverProfileText(profileUrl: string): Promise<SearchDiscovery | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  const linkedinUsername = extractLinkedInUsername(profileUrl);
  if (!linkedinUsername) return null;

  try {
    const client = tavily({ apiKey });
    const searchQueries = buildLinkedInSearchQueries(profileUrl, linkedinUsername);
    const searchResponses: Array<{
      answer?: string;
      results: Array<{ url: string; content: string }>;
    }> = [];

    for (const query of searchQueries) {
      try {
        const response = await client.search(query, {
          searchDepth: "advanced",
          maxResults: 5,
          includeAnswer: true,
        });

        searchResponses.push({
          answer: response.answer || "",
          results: response.results.map((result) => ({
            url: result.url || "",
            content: result.content || "",
          })),
        });
      } catch {
        // Try the next query variation.
      }
    }

    if (searchResponses.length === 0) {
      return null;
    }

    const flattenedResults = uniqueBy(
      searchResponses.flatMap((response) => response.results),
      (result) => normalizeLinkedInUrl(result.url || "") || result.url || result.content
    );

    const slugMatchedResults = flattenedResults.filter((result) =>
      urlMatchesLinkedInUsername(result.url, linkedinUsername)
    );
    const selectedResults = slugMatchedResults.length > 0 ? slugMatchedResults : flattenedResults;
    const selectedUrls = unique(
      selectedResults
        .map((result) => normalizeLinkedInUrl(result.url || ""))
        .filter((url): url is string => Boolean(url))
    ).slice(0, 3);

    let extractedText = "";
    if (selectedUrls.length > 0) {
      try {
        const extracted = await client.extract(selectedUrls, {
          extractDepth: "advanced",
          format: "markdown",
        });
        extractedText = extracted.results
          .map((result) => normalizeSentence(result.rawContent || ""))
          .filter(Boolean)
          .join("\n");
      } catch (err) {
        console.log(`[DEBUG] Extraction error for ${selectedUrls.join(", ")}:`, err);
        extractedText = "";
      }
    }

    const surname = (linkedinUsername.split("-").pop() || "").replace(/\d+/g, "").toLowerCase();
    
    // Flexible filtering: Prefer surname matches, but don't fail if they are missing
    let filteredResults = selectedResults;
    if (surname && surname.length > 3) {
      const surnameMatches = selectedResults.filter(result => {
        const urlLower = (result.url || "").toLowerCase();
        const contentLower = (result.content || "").toLowerCase();
        return urlLower.includes(surname) || contentLower.includes(surname);
      });
      // ONLY filter if we actually found surname matches. (Avoids total failure for unique names)
      if (surnameMatches.length > 0) { filteredResults = surnameMatches; }
    }

    const searchContentText = filteredResults
      .map((result) => cleanProfileField(normalizeSentence(result.content || "")))
      .filter((line) => !isNoiseProfileLine(line))
      .filter(Boolean)
      .join("\n");

    let filteredAnswers = searchResponses.map((response) => response.answer || "").filter(Boolean);
    if (surname && surname.length > 3) {
      const surnameAnswers = filteredAnswers.filter(answer => answer.toLowerCase().includes(surname));
      if (surnameAnswers.length > 0) { filteredAnswers = surnameAnswers; }
    }

    const answersText = filteredAnswers.join("\n");

    // EXTRACTED text is prioritized, then SEARCH CONTENT (snippets), then ANSWERS (summaries)
    const combinedText = [
      extractedText || "",
      searchContentText || "",
      answersText || ""
    ]
      .filter(Boolean)
      .join("\n\n---\n\n");

    const score = scoreProfileContent(combinedText);
    console.log(`[DEBUG] Discovery combined content score: ${score} (Extracted: ${extractedText.length}, Snippets: ${searchContentText.length}, Answers: ${answersText.length})`);

    if (!combinedText || score < 2) {
      return null;
    }

    const sourceUrl = selectedUrls[0] || profileUrl;

    return { sourceUrl, content: combinedText };
  } catch (err) {
    console.error(`[DEBUG] discoverProfileText encountered a fatal error:`, err);
    return null;
  }
}

function extractLinkedInUsername(profileUrl: string): string {
  try {
    const parts = new URL(profileUrl).pathname.split("/").filter(Boolean);
    if (parts[0] !== "in" || !parts[1]) return "";
    // Clean common slug noise like trailing slashes or numbers at the very end
    return decodeURIComponent(parts[1]).replace(/\/+$/, "").trim();
  } catch {
    return "";
  }
}

function buildLinkedInSearchQueries(profileUrl: string, linkedinUsername: string): string[] {
  // Clean username for search (e.g. "firstname-lastname" -> "firstname lastname")
  const searchName = linkedinUsername
    .replace(/\d+/g, "") // Remove numbers from name search
    .replace(/[-_]+/g, " ")
    .trim();

  return unique([
    `site:linkedin.com/in "${linkedinUsername}" bio summary experience`,
    `site:linkedin.com/in "${searchName}" professional history`,
    `"${profileUrl}" about profile`,
    `"${searchName}" linkedin work achievements`,
  ]);
}

function urlMatchesLinkedInUsername(url: string, linkedinUsername: string): boolean {
  const normalized = normalizeLinkedInUrl(url || "");
  if (!normalized) return false;

  const slug = extractLinkedInUsername(normalized);
  if (!slug) return false;

  const normalizeSlug = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9-]/g, "");

  const target = normalizeSlug(linkedinUsername);
  const candidate = normalizeSlug(slug);

  if (!target || !candidate) return false;
  return candidate === target || candidate.includes(target) || target.includes(candidate);
}

function scoreProfileContent(text: string): number {
  const lowered = text.toLowerCase();
  let score = 0;

  if (lowered.includes("linkedin")) score += 1;
  if (lowered.includes("experience") || lowered.includes("employment")) score += 2;
  if (lowered.includes("skills") || lowered.includes("expertise")) score += 2;
  if (lowered.includes("about") || lowered.includes("summary")) score += 1;
  if (lowered.includes("education") || lowered.includes("university")) score += 1;
  if (/\bat\b/i.test(text)) score += 1;
  if (text.length > 500) score += 1; // Loosened from 700

  return score;
}

function extractProfileData(text: string, profileUrl: string): ProfileData {
  const lines = toReadableLines(text);
  const sections = buildSectionIndex(lines);

  const fullName = extractFullName(lines, profileUrl);
  const currentHeadline = extractCurrentHeadline(lines, fullName);
  const topRole = extractTopRole(lines, fullName);
  const experienceEntries = extractExperienceEntries(lines, sections.experience, fullName);

  const primaryExperience = experienceEntries[0];
  const currentTitle = topRole.role || primaryExperience?.role || "";
  const currentCompany = topRole.company || primaryExperience?.company || "";

  const previousRoles = experienceEntries
    .slice(primaryExperience ? 1 : 0)
    .filter((entry) => entry.role || entry.company)
    .slice(0, 3);

  const about = extractAbout(lines, sections.about);
  const skillData = extractSkills(lines, sections.skills, currentTitle, about);
  const certifications = extractCertifications(lines, sections.certifications);
  const education = extractEducation(lines, sections.education);
  const achievements = extractAchievements(lines, sections.achievements);

  return {
    fullName,
    currentHeadline,
    currentTitle,
    currentCompany,
    industry: "", // Hard to extract via regex fallback reliably
    previousRoles,
    skills: skillData.skills,
    endorsements: skillData.endorsements,
    about,
    certifications,
    education,
    achievements,
  };
}

function toReadableLines(rawText: string): string[] {
  const sanitized = rawText
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/â€¢/g, "•")
    .replace(/Â·/g, "·")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const expanded = sanitized
    .split("\n")
    .flatMap((line) => line.split(/(?<=\.)\s{2,}/))
    .map((line) => cleanProfileField(normalizeSentence(line)))
    .filter((line) => line.length > 1 && line.length < 240)
    .filter((line) => !/^#+\s*$/.test(line));

  return unique(expanded.filter((line) => !isNoiseProfileLine(line)));
}

function buildSectionIndex(lines: string[]): Record<SectionKey, string[]> {
  const index: Record<SectionKey, string[]> = {
    about: [],
    experience: [],
    skills: [],
    education: [],
    certifications: [],
    achievements: [],
  };

  for (const [sectionKey, aliases] of Object.entries(
    SECTION_ALIASES
  ) as [SectionKey, string[]][]) {
    const start = lines.findIndex((line) =>
      aliases.includes(normalizeKey(line))
    );
    if (start === -1) continue;

    for (let i = start + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line) continue;
      if (ALL_SECTION_ALIASES.has(normalizeKey(line))) break;
      if (line.length < 2) continue;
      index[sectionKey].push(line);
      if (index[sectionKey].length >= 25) break;
    }
  }

  return index;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[#*:`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFullName(lines: string[], profileUrl: string): string {
  const titleLine = lines.find((line) => /^title:/i.test(line));
  if (titleLine) {
    const fromTitle = cleanName(titleLine.replace(/^title:\s*/i, "").split("|")[0] ?? "");
    if (isLikelyName(fromTitle)) return fromTitle;
  }

  const slugName = titleCaseFromSlug(profileUrl);

  for (const line of lines.slice(0, 50)) {
    const candidate = cleanName(line.split("|")[0] ?? "");
    if (isLikelyName(candidate)) {
      if (slugName && !isNameCloseMatch(candidate, slugName)) {
        continue;
      }
      return candidate;
    }
  }

  return slugName;
}

function cleanName(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/\bLinkedIn\b/gi, "")
    .replace(/\b(?:current job title|current role|current company)\b[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyName(value: string): boolean {
  if (!value || value.length < 4 || value.length > 60) return false;
  if (/\d/.test(value)) return false;
  const words = value.split(" ").filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;
  return words.every((word) => /^[A-Za-z'.-]+$/.test(word));
}

function extractCurrentHeadline(lines: string[], fullName: string): string {
  const nameTokens = buildNameTokens(fullName);
  
  // Try to find a line after the name that looks like a headline (not a section header)
  for (const line of lines.slice(0, 10)) {
    if (ALL_SECTION_ALIASES.has(normalizeKey(line))) continue;
    if (nameTokens.some(token => line.toLowerCase().includes(token))) continue;
    if (line.length > 20 && line.length < 200) return line;
  }
  
  return "";
}

function isNameCloseMatch(candidate: string, slugName: string): boolean {
  const normalize = (val: string) => val.toLowerCase().replace(/[^a-z]/g, "");
  const c = normalize(candidate);
  const s = normalize(slugName);
  if (!c || !s) return false;
  return c.includes(s) || s.includes(c);
}

function extractTopRole(lines: string[], fullName: string): ExperienceEntry {
  for (const line of lines.slice(0, 60)) {
    const parsed = parseRoleCompany(line, fullName);
    if (parsed) return parsed;
  }

  return { role: "", company: "" };
}

function extractExperienceEntries(
  lines: string[],
  experienceSection: string[],
  fullName: string
): ExperienceEntry[] {
  const source = experienceSection.length > 0 ? experienceSection : lines;
  const entries: ExperienceEntry[] = [];

  for (let i = 0; i < source.length; i += 1) {
    const line = source[i];
    const parsed = parseRoleCompany(line, fullName);
    if (parsed) {
      entries.push(parsed);
      continue;
    }

    const next = source[i + 1] ?? "";
    if (isLikelyRoleLine(line) && isLikelyCompanyLine(next)) {
      entries.push({
        role: cleanRole(line),
        company: cleanCompany(next),
      });
    }
  }

  return uniqueBy(entries, (entry) => `${entry.role}|${entry.company}`).slice(0, 4);
}

function parseRoleCompany(line: string, fullName: string = ""): ExperienceEntry | null {
  let cleaned = line.replace(/^[-*•]\s*/, "").trim();
  if (!cleaned || cleaned.length > 200) return null;
  if (ALL_SECTION_ALIASES.has(normalizeKey(cleaned))) return null;

  // Remove full name prefix if present (e.g. "Lennox Galanje - Software Engineer")
  if (fullName) {
    const escapedName = fullName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nameRegex = new RegExp(`^${escapedName}\\s*[-·•|]+\\s*`, "i");
    cleaned = cleaned.replace(nameRegex, "").trim();
  }

  const rolePatterns = [
    /^(.+?)\s+(?:at|@|posisjon\s+hos|working\s+in)\s+(.+)$/i,
    /^(.+?)\s+[|·•]\s+(.+)$/,
    /^(.+?)\s+-\s+(.+)$/, // Added dash
  ];

  for (const pattern of rolePatterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const role = cleanRole(match[1] ?? "");
      const company = cleanCompany(match[2] ?? "");
      if (isLikelyRoleLine(role) && company) {
        return { role, company };
      }
    }
  }

  // Fallback: If it's just a role line with high confidence, use it
  if (isLikelyRoleLine(cleaned) && cleaned.length < 80) {
    return { role: cleanRole(cleaned), company: "" };
  }

  return null;
}

function cleanRole(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\b(full-time|part-time|contract|internship)\b/gi, "")
    .replace(/[|•·-]\s*$/g, "")
    .trim();
}

function cleanCompany(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\b(full-time|part-time|contract|internship)\b/gi, "")
    .replace(/[|•·-]\s*$/g, "")
    .trim();
}

function isLikelyRoleLine(value: string): boolean {
  const lowered = value.toLowerCase();
  return ROLE_KEYWORDS.some((keyword) => lowered.includes(keyword));
}

function isLikelyCompanyLine(value: string): boolean {
  if (!value || value.length < 2 || value.length > 120) return false;
  if (/\b(20\d{2}|present)\b/i.test(value)) return false;
  if (isLikelyRoleLine(value)) return false;
  return /[A-Za-z]/.test(value);
}

function extractAbout(lines: string[], aboutSection: string[]): string {
  if (aboutSection.length > 0) {
    return normalizeSentence(aboutSection.join(" ").slice(0, 320));
  }

  const fallback = lines.find(
    (line) =>
      line.length > 80 &&
      !ALL_SECTION_ALIASES.has(normalizeKey(line)) &&
      !/^title:/i.test(line)
  );

  return fallback ? normalizeSentence(fallback.slice(0, 320)) : "";
}

function extractSkills(
  lines: string[],
  skillSection: string[],
  currentTitle: string,
  about: string
): { skills: string[]; endorsements: string[] } {
  const skillInput = skillSection.length > 0 ? skillSection : lines;
  const skills = new Set<string>();
  const endorsements = new Set<string>();

  for (const line of skillInput) {
    const endorsementMatch = line.match(
      /^(.+?)\s*(?:[·•|-]\s*|\()\s*(\d+)\s+endorsements?\)?$/i
    );
    if (endorsementMatch) {
      const skill = normalizeSkill(endorsementMatch[1] ?? "");
      if (skill) {
        endorsements.add(skill);
        skills.add(skill);
      }
      continue;
    }

    for (const token of tokenizeKeywords(line)) {
      const skill = normalizeSkill(token);
      if (skill) skills.add(skill);
    }
  }

  if (skills.size === 0) {
    for (const inferred of inferKeywordsFromContext(`${currentTitle} ${about}`)) {
      skills.add(inferred);
    }
  }

  return {
    skills: [...skills].slice(0, 8),
    endorsements: [...endorsements].slice(0, 5),
  };
}

function extractCertifications(lines: string[], certSection: string[]): string[] {
  const source = certSection.length > 0 ? certSection : lines;
  const certs = source
    .filter((line) => /\b(certified|certification|certificate|license)\b/i.test(line))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 4 && line.length <= 120);

  if (certSection.length > 0) {
    for (const line of certSection) {
      if (line.length < 4 || line.length > 120) continue;
      certs.push(line);
    }
  }

  return unique(certs).slice(0, 4);
}

function extractEducation(lines: string[], educationSection: string[]): string[] {
  const source = educationSection.length > 0 ? educationSection : lines;
  const schools = source
    .filter(
      (line) =>
        /\b(university|college|school|institute|academy|bachelor|master|mba|phd)\b/i.test(
          line
        )
    )
    .map((line) => normalizeSentence(line))
    .filter((line) => line.length >= 4 && line.length <= 120);

  return unique(schools).slice(0, 4);
}

function extractAchievements(lines: string[], achievementSection: string[]): string[] {
  const source = achievementSection.length > 0 ? achievementSection : lines;
  const achievements = source
    .filter(
      (line) =>
        /\b(award|speaker|patent|published|publication|honor|fellow|winner|top voice)\b/i.test(
          line
        )
    )
    .map((line) => normalizeSentence(line))
    .filter((line) => line.length >= 4 && line.length <= 140);

  return unique(achievements).slice(0, 4);
}

function inferMissingFromAvailable(profile: ProfileData, profileUrl: string): ProfileData {
  const inferred = { ...profile };

  if (!inferred.fullName || inferred.fullName === "N/A") {
    inferred.fullName = titleCaseFromSlug(profileUrl) || "LinkedIn User";
  }

  if (!inferred.currentTitle && inferred.about) {
    inferred.currentTitle = inferTitleFromAbout(inferred.about);
  }

  if (!inferred.currentCompany && inferred.about) {
    inferred.currentCompany = inferCompanyFromText(inferred.about);
  }

  if ((!inferred.currentTitle || !inferred.currentCompany) && inferred.about) {
    const aboutRole = parseRoleCompany(inferred.about);
    if (aboutRole) {
      inferred.currentTitle = inferred.currentTitle || aboutRole.role;
      inferred.currentCompany = inferred.currentCompany || aboutRole.company;
    }
  }

  if (inferred.skills.length === 0) {
    inferred.skills = inferKeywordsFromContext(
      `${inferred.currentTitle} ${inferred.currentCompany} ${inferred.about} ${inferred.certifications.join(
        " "
      )}`
    );
  }

  if (!inferred.currentTitle && inferred.previousRoles[0]?.role) {
    inferred.currentTitle = inferred.previousRoles[0].role;
  }

  if (!inferred.currentCompany && inferred.previousRoles[0]?.company) {
    inferred.currentCompany = inferred.previousRoles[0].company;
  }

  if (inferred.achievements.length === 0) {
    inferred.achievements = [
      ...inferred.certifications,
      ...inferred.education,
      ...inferred.endorsements,
    ]
      .filter(Boolean)
      .slice(0, 3);
  }

  return inferred;
}


function inferTitleFromAbout(about: string): string {
  const sentence = cleanProfileField(firstSentence(about, 160));
  if (!sentence) return "";

  const patterns = [
    /\b(?:i am|i'm|im)\s+[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,2}\s*,\s*(?:an?|the)\s+([^.,|]{3,90})/i,
    /\b(?:i am|i'm|im)\s+(?:an?|the)\s+([^.,|]{3,90})/i,
    /\b(?:working|work)\s+as\s+(?:an?|the)\s+([^.,|]{3,90})/i,
    /\b(?:currently|now)\s+(?:an?|the)\s+([^.,|]{3,90})/i,
  ];

  for (const pattern of patterns) {
    const match = sentence.match(pattern);
    const value = normalizeSentence(match?.[1] ?? "");
    if (!value) continue;

    const cleaned = cleanProfileField(
      value
      .replace(/\bwith\b[\s\S]*$/i, "")
      .replace(/\bat\b[\s\S]*$/i, "")
      .replace(/\bwho\b[\s\S]*$/i, "")
      .replace(/[|:]+/g, " ")
      .trim()
    );

    if (!cleaned) continue;
    if (cleaned.length < 3 || cleaned.length > 80) continue;
    if (!/[A-Za-z]/.test(cleaned)) continue;
    return cleaned;
  }

  return "";
}

function inferCompanyFromText(text: string): string {
  if (!text) return "";

  const patterns = [
    /\b(?:experience|pengalaman)\s*[:\-]\s*([A-Z][^|,.\n·]{2,80})/i,
    /\bat\s+([A-Z][A-Za-z0-9&.' -]{2,80})/i,
    /\bexperience\s*[:\-]\s*([A-Z][A-Za-z0-9&.' -]{2,80})/i,
    /\bcompany\s*[:\-]\s*([A-Z][A-Za-z0-9&.' -]{2,80})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const candidate = cleanProfileField(normalizeSentence(match?.[1] ?? ""))
      .split(/[|,;.!?]/)[0]
      ?.trim();

    if (!candidate) continue;
    if (candidate.length < 2 || candidate.length > 80) continue;
    if (/^(the|an|a)\b/i.test(candidate)) continue;
    return candidate;
  }

  return "";
}

function collectGroundingFacts(profile: ProfileData): string[] {
  const facts: string[] = [];

  if (profile.currentTitle && profile.currentCompany) {
    facts.push(`${profile.currentTitle} at ${profile.currentCompany}`);
  } else if (profile.currentTitle || profile.currentCompany) {
    facts.push(profile.currentTitle || profile.currentCompany);
  }

  for (const role of profile.previousRoles.slice(0, 3)) {
    facts.push(`${role.role} at ${role.company}`);
  }

  for (const skill of profile.skills.slice(0, 4)) {
    facts.push(skill);
  }

  for (const endorsement of profile.endorsements.slice(0, 2)) {
    facts.push(endorsement);
  }

  for (const cert of profile.certifications.slice(0, 2)) {
    facts.push(cert);
  }

  for (const edu of profile.education.slice(0, 1)) {
    facts.push(edu);
  }

  for (const achievement of profile.achievements.slice(0, 2)) {
    facts.push(achievement);
  }

  if (profile.about) {
    const aboutSnippet = firstSentence(profile.about, 90);
    if (aboutSnippet) facts.push(aboutSnippet);
  }

  return unique(
    facts
      .map((fact) => fact.replace(/\s+/g, " ").trim())
      .filter((fact) => fact.length >= 3)
  );
}

function hasMinimumGrounding(profile: ProfileData, facts: string[]): boolean {
  if (!profile.fullName) return false;
  const hasRoleSignal = Boolean(profile.currentTitle || profile.currentCompany);

  const proofCount =
    profile.previousRoles.length +
    profile.skills.length +
    profile.endorsements.length +
    profile.certifications.length +
    profile.education.length +
    profile.achievements.length;

  const hasNarrative = profile.about.length >= 40;
  const hasEnoughFacts = facts.length >= 1; 
  const hasEnoughEvidence = proofCount >= 1 || hasNarrative;

  return hasEnoughFacts && (hasRoleSignal || hasEnoughEvidence);
}

type HeadlineJson = {
  headlines: {
    professional: string;
    creative: string;
    bold: string;
  };
  best_choice: "professional" | "creative" | "bold";
};

type HeadlineValidation = {
  failed: Array<{ key: HeadlineTone; headline: string; reason: string }>;
};

async function generateHeadlinesWithValidation(
  profile: ProfileData
): Promise<HeadlineJson | null> {
  const userPrompt = buildProfilePrompt(profile);
  const firstAttemptText = await requestHeadlineGeneration(EXPERT_COPYWRITER_SYSTEM_PROMPT, userPrompt);

  if (!firstAttemptText) return null;

  let parsed = parseHeadlinePayload(firstAttemptText);
  if (!parsed) return null;
  parsed = sanitizeHeadlineJson(parsed);

  let validation = validateHeadlineJson(parsed, profile);
  if (validation.failed.length === 0) {
    return parsed;
  }

  const feedback = validation.failed
    .map(
      (failure) =>
        `The ${failure.key.toLowerCase()} headline "${failure.headline}" was rejected because: ${failure.reason}.`
    )
    .join(" ");
  const correctionPrompt = `${userPrompt}

${feedback}

Rewrite ONLY the rejected headlines. Keep any that passed.
Apply all the same rules. Be more specific.
No names. No banned words. Under 220 characters each.
Return the full JSON with all 3 headlines including
any that were not rejected.`;

  const retryText = await requestHeadlineGeneration(EXPERT_COPYWRITER_SYSTEM_PROMPT, correctionPrompt);
  if (!retryText) return parsed;

  const retryParsed = parseHeadlinePayload(retryText);
  if (!retryParsed) return parsed;

  parsed = sanitizeHeadlineJson({
    headlines: {
      professional: retryParsed.headlines.professional || parsed.headlines.professional,
      creative: retryParsed.headlines.creative || parsed.headlines.creative,
      bold: retryParsed.headlines.bold || parsed.headlines.bold,
    },
    best_choice: retryParsed.best_choice || parsed.best_choice,
  });

  validation = validateHeadlineJson(parsed, profile);
  return validation.failed.length === 0 ? parsed : null;
}

function buildProfilePrompt(profile: ProfileData): string {
  return `<USER_PROFILE>
Role: ${profile.currentTitle || "N/A"}
Company: ${profile.currentCompany || "N/A"}
Skills: ${profile.skills.slice(0, 5).join(", ") || "N/A"}
Impact: ${profile.achievements.length > 0 ? profile.achievements[0] : "Driving customer success and business growth."}
Goal: General career growth and leadership
</USER_PROFILE>
`;
}

async function requestHeadlineGeneration(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt },
  ];

  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.8,
        max_tokens: 500,
      });

      const raw = readGroqMessageContent(completion.choices[0]?.message?.content);
      if (raw) return raw;
    } catch {
      // Fallback to Gemini below.
    }
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const candidateModels = [
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash",
    ];

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const raw = result.response.text();
        if (raw?.trim()) return raw.trim();
      } catch {
        // Try next model candidate.
      }
    }

    return null;
  } catch {
    return null;
  }
}

function readGroqMessageContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (!Array.isArray(content)) return "";

  const text = content
    .map((part) => {
      if (!part || typeof part !== "object") return "";
      const candidate = (part as { text?: unknown }).text;
      return typeof candidate === "string" ? candidate : "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();

  return text;
}

async function extractProfileWithLLM(text: string, profileUrl: string): Promise<ProfileData | null> {
  const result = await requestProfileExtraction(PROFILE_EXTRACTION_PROMPT, text);
  if (!result) return null;

  try {
    const raw = result
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const parsed = JSON.parse(raw);
    
    // Ensure all arrays and fields exist
    const profile: ProfileData = {
      fullName: parsed.fullName || titleCaseFromSlug(profileUrl),
      currentHeadline: parsed.currentHeadline || "",
      currentTitle: parsed.currentTitle || "",
      currentCompany: parsed.currentCompany || "",
      industry: parsed.industry || "",
      previousRoles: Array.isArray(parsed.previousRoles) ? parsed.previousRoles : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      endorsements: Array.isArray(parsed.endorsements) ? parsed.endorsements : [],
      about: parsed.about || "",
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
    };
    
    return profile;
  } catch (err) {
    console.error("[DEBUG] Failed to parse LLM extraction JSON:", err);
    return null;
  }
}

async function requestProfileExtraction(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const messages = [
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: `Extract data from this profile text:\n\n${userPrompt.slice(0, 8000)}` },
  ];

  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.1,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      return completion.choices[0]?.message?.content || null;
    } catch {
      // Fallback
    }
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt.slice(0, 8000)}`);
      return result.response.text();
    } catch {
      // Fallback
    }
  }

  return null;
}

function parseHeadlinePayload(raw: string): HeadlineJson | null {
  const normalizedRaw = raw.trim();
  const directJson = tryParseHeadlineJson(normalizedRaw);
  if (directJson) return directJson;

  const withoutFence = normalizedRaw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const fencedJson = tryParseHeadlineJson(withoutFence);
  if (fencedJson) return fencedJson;

  const blockMatch = withoutFence.match(/\{[\s\S]*\}/);
  if (blockMatch?.[0]) {
    const blockJson = tryParseHeadlineJson(blockMatch[0]);
    if (blockJson) return blockJson;
  }

  return extractHeadlinesFromRawLines(withoutFence);
}

function tryParseHeadlineJson(value: string): HeadlineJson | null {
  try {
    const parsed = JSON.parse(value) as Partial<HeadlineJson>;
    if (!parsed || typeof parsed !== "object" || !parsed.headlines) return null;
    
    const h = parsed.headlines;
    const professional = normalizeSentence(h.professional ?? "");
    const creative = normalizeSentence(h.creative ?? "");
    const bold = normalizeSentence(h.bold ?? "");
    const bestChoice = (parsed.best_choice || "professional").toLowerCase() as "professional" | "creative" | "bold";

    if (!professional || !creative || !bold) return null;
    
    return { 
      headlines: { professional, creative, bold },
      best_choice: ["professional", "creative", "bold"].includes(bestChoice) ? bestChoice : "professional"
    };
  } catch {
    return null;
  }
}

function extractHeadlinesFromRawLines(raw: string): HeadlineJson | null {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const byLabel: Record<string, string> = {};
  for (const line of lines) {
    const professionalMatch = line.match(/(?:^|\b)professional\s*[:\-]\s*(.+)$/i);
    if (professionalMatch?.[1]) byLabel.professional = professionalMatch[1].trim();

    const creativeMatch = line.match(/(?:^|\b)creative\s*[:\-]\s*(.+)$/i);
    if (creativeMatch?.[1]) byLabel.creative = creativeMatch[1].trim();

    const boldMatch = line.match(/(?:^|\b)bold\s*[:\-]\s*(.+)$/i);
    if (boldMatch?.[1]) byLabel.bold = boldMatch[1].trim();
  }

  if (byLabel.professional && byLabel.creative && byLabel.bold) {
    return {
      headlines: {
        professional: normalizeSentence(byLabel.professional),
        creative: normalizeSentence(byLabel.creative),
        bold: normalizeSentence(byLabel.bold),
      },
      best_choice: "professional",
    };
  }

  const candidateLines = lines
    .map((line) =>
      line
        .replace(/^[\-\*\d\.\)\s]+/, "")
        .replace(/^(professional|creative|bold)\s*[:\-]\s*/i, "")
        .trim()
    )
    .filter((line) => line.length > 10);

  if (candidateLines.length < 3) return null;

  return {
    headlines: {
      professional: normalizeSentence(candidateLines[0]),
      creative: normalizeSentence(candidateLines[1]),
      bold: normalizeSentence(candidateLines[2]),
    },
    best_choice: "professional",
  };
}

function sanitizeHeadlineJson(json: HeadlineJson): HeadlineJson {
  return {
    headlines: {
      professional: sanitizeHeadline(limitHeadline(json.headlines.professional)),
      creative: sanitizeHeadline(limitHeadline(json.headlines.creative)),
      bold: sanitizeHeadline(limitHeadline(json.headlines.bold)),
    },
    best_choice: json.best_choice,
  };
}

function validateHeadlineJson(
  json: HeadlineJson,
  profile: ProfileData
): HeadlineValidation {
  const anchors = buildProfileSpecificAnchors(profile);
  const nameTokens = buildNameTokens(profile.fullName);
  const failed: Array<{ key: HeadlineTone; headline: string; reason: string }> = [];

  const checks: Array<[HeadlineTone, string]> = [
    ["Professional", json.headlines.professional],
    ["Creative", json.headlines.creative],
    ["Bold", json.headlines.bold],
  ];

  for (const [key, headline] of checks) {
    const check = validateHeadline(headline, nameTokens, SERVER_BANNED_WORDS, anchors);
    if (!check.valid) {
      failed.push({
        key,
        headline,
        reason: check.reason,
      });
    }
  }

  return { failed };
}

function validateHeadline(
  headline: string,
  nameTokens: string[],
  bannedWords: string[],
  anchors: string[]
): { valid: boolean; reason: string } {
  const lower = normalizeSentence(headline).toLowerCase();

  if (nameTokens.some((token) => token && lower.includes(token))) {
    return { valid: false, reason: "Contains person's name" };
  }

  if (bannedWords.some((word) => lower.includes(word))) {
    return { valid: false, reason: "Contains banned word" };
  }

  if (headline.length > 220) {
    return { valid: false, reason: "Exceeds 220 characters" };
  }

  if (headline.length < 30) {
    return { valid: false, reason: "Too short to be meaningful" };
  }

  if (SUMMARY_REJECTION_PHRASES.some((phrase) => lower.includes(phrase))) {
    return { valid: false, reason: "Reads like a profile summary" };
  }

  if (!anchors.some((anchor) => lower.includes(anchor.toLowerCase()))) {
    return {
      valid: false,
      reason: "Does not contain a specific reference to the profile",
    };
  }

  return { valid: true, reason: "" };
}

function buildNameTokens(fullName: string): string[] {
  const compact = normalizeSentence(fullName || "").toLowerCase();
  if (!compact) return [];

  const tokens = compact
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);

  if (compact.length >= 3) tokens.push(compact.replace(/\s+/g, ""));
  return unique(tokens);
}

function buildProfileSpecificAnchors(profile: ProfileData): string[] {
  const anchors = new Set<string>();

  const phraseFields = [
    profile.currentTitle,
    profile.currentCompany,
    ...profile.skills.slice(0, 8),
    ...profile.previousRoles.flatMap((role) => [role.role, role.company]),
    ...profile.certifications,
    ...profile.achievements,
  ];

  for (const field of phraseFields) {
    const cleaned = normalizeSentence(field || "");
    if (cleaned.length >= 3) anchors.add(cleaned);
  }

  for (const metric of extractMetricTokens([
    profile.about,
    ...profile.achievements,
    ...profile.certifications,
  ])) {
    anchors.add(metric);
  }

  return [...anchors];
}

function extractMetricTokens(fields: string[]): string[] {
  const metricRegex =
    /\b\$?\d[\d,.]*(?:\+|%|x|k|m|b)?(?:\s*(?:users|teams|clients|revenue|growth|pipeline|churn|roi|arr|mrr|followers|months|years))?\b/gi;
  const metrics = new Set<string>();

  for (const field of fields) {
    if (!field) continue;
    const matches = field.match(metricRegex) || [];
    for (const match of matches) {
      const cleaned = normalizeSentence(match);
      if (cleaned.length >= 2) metrics.add(cleaned);
    }
  }

  return [...metrics];
}

function mapHeadlineJsonToOptions(
  json: HeadlineJson,
  profile: ProfileData,
  facts: string[]
): HeadlineOption[] {
  const options: Array<HeadlineOption & { isBest: boolean }> = [
    { 
      tone: "Professional", 
      headline: json.headlines.professional,
      isBest: json.best_choice === "professional"
    },
    { 
      tone: "Creative", 
      headline: json.headlines.creative,
      isBest: json.best_choice === "creative"
    },
    { 
      tone: "Bold", 
      headline: json.headlines.bold,
      isBest: json.best_choice === "bold"
    },
  ];

  return ensureDistinctHeadlines(
    options.map((option) => ({
      ...option,
      headline: enforceHeadlineStyle(
        ensureGroundedHeadline(option.headline, facts),
        option.tone,
        profile,
        facts
      ),
    })),
    profile,
    facts
  );
}

function generateGroundedHeadlines(
  profile: ProfileData,
  facts: string[]
): HeadlineOption[] {
  const signals = deriveHeadlineSignals(profile, facts);

  // Framework 1 or 2 (Professional):
  // 1) I help [Target Audience] achieve [Outcome] using [Method/Skill]
  // 2) [Title] at [Company] | [Quantified Achievement] | [Social Proof]
  const professional = buildProfessionalHeadline(signals);

  // Framework 3 (Creative):
  // [Who You Are] helping [Who They Are] do [What Transformation]
  const creative = buildCreativeHeadline(signals);

  // Framework 4 (Bold):
  // Strong, specific, defensible claim.
  const bold = buildBoldHeadline(signals);

  const candidates: HeadlineOption[] = [
    { tone: "Professional", headline: professional },
    { tone: "Creative", headline: creative },
    { tone: "Bold", headline: bold },
  ];

  const grounded = candidates.map((candidate) => ({
    ...candidate,
    headline: enforceHeadlineStyle(
      ensureGroundedHeadline(sanitizeHeadline(limitHeadline(candidate.headline)), facts),
      candidate.tone,
      profile,
      facts
    ),
  }));

  return ensureDistinctHeadlines(grounded, profile, facts);
}

function ensureGroundedHeadline(headline: string, facts: string[]): string {
  // We no longer append facts, as it causes repetition. 
  // We return the headline AS IS, after normalization.
  return normalizeSentence(headline);
}

type HeadlineSignals = {
  identity: string;
  whoYouAre: string;
  targetAudience: string;
  outcome: string;
  method: string;
  quantifiedAchievement: string;
  socialProof: string;
  defensibleClaim: string;
};

function deriveHeadlineSignals(
  profile: ProfileData,
  facts: string[]
): HeadlineSignals {
  const identity = buildIdentity(profile) || facts[0] || profile.currentTitle || "Professional";
  const whoYouAre = buildWhoYouAre(profile, identity);
  const targetAudience = extractTargetAudience(profile) || inferAudience(profile, facts);
  const quantifiedAchievement = extractQuantifiedAchievement(profile);
  const socialProof = extractSocialProof(profile);
  const method = extractMethod(profile) || facts[1] || identity;
  const outcome = extractOutcome(profile, quantifiedAchievement) || method;
  const defensibleClaim =
    quantifiedAchievement ||
    socialProof ||
    profile.achievements[0] ||
    firstSentence(profile.about, 90) ||
    identity;

  return {
    identity,
    whoYouAre,
    targetAudience,
    outcome,
    method,
    quantifiedAchievement,
    socialProof,
    defensibleClaim,
  };
}

function buildProfessionalHeadline(signals: HeadlineSignals): string {
  if (
    signals.identity.toLowerCase().includes(" at ") &&
    signals.quantifiedAchievement &&
    signals.socialProof
  ) {
    return `${signals.identity} | ${signals.quantifiedAchievement} | ${signals.socialProof}`;
  }

  const outcome = normalizeOutcomeForFramework1(signals.outcome);
  return `I help ${signals.targetAudience} ${outcome} using ${signals.method}`;
}

function buildCreativeHeadline(signals: HeadlineSignals): string {
  const transformation = normalizeTransformation(signals.outcome, signals.method);
  return `${signals.whoYouAre} helping ${signals.targetAudience} ${transformation}`;
}

function buildBoldHeadline(signals: HeadlineSignals): string {
  if (signals.quantifiedAchievement) {
    return `${signals.quantifiedAchievement} | ${signals.identity}`;
  }
  if (signals.socialProof) {
    return `${signals.identity} | ${signals.socialProof} | ${signals.method}`;
  }
  return `${signals.identity} | ${signals.defensibleClaim}`;
}

function buildIdentity(profile: ProfileData): string {
  if (profile.currentTitle && profile.currentCompany) {
    return `${profile.currentTitle} at ${profile.currentCompany}`;
  }
  if (profile.currentTitle || profile.currentCompany) {
    return profile.currentTitle || profile.currentCompany;
  }
  if (profile.previousRoles[0]?.role || profile.previousRoles[0]?.company) {
    return [profile.previousRoles[0].role, profile.previousRoles[0].company]
      .filter(Boolean)
      .join(" at ");
  }
  return profile.skills[0] || "Professional";
}

function buildWhoYouAre(profile: ProfileData, identity: string): string {
  const prev = profile.previousRoles[0];
  if (prev?.company && prev.role) {
    return `Ex-${prev.company} ${prev.role}`;
  }
  return identity;
}

function extractTargetAudience(profile: ProfileData): string {
  const about = profile.about;
  if (!about) return "";

  const helpingPattern =
    /help(?:ing)?\s+([A-Za-z0-9,&+\-/'\s]{3,80}?)(?:\s+to|\s+with|\s+by|\s+through)/i;
  const forPattern =
    /for\s+([A-Za-z0-9,&+\-/'\s]{3,80}?)(?:\s+to|\s+with|\s+by|\s+through)/i;

  const helpingMatch = about.match(helpingPattern);
  if (helpingMatch?.[1]) return cleanAudience(helpingMatch[1]);

  const forMatch = about.match(forPattern);
  if (forMatch?.[1]) return cleanAudience(forMatch[1]);

  return "";
}

function inferAudience(profile: ProfileData, facts: string[]): string {
  if (profile.currentCompany) return `${profile.currentCompany} teams`;

  const title = profile.currentTitle.toLowerCase();
  if (title.includes("founder")) return "founders";
  if (title.includes("sales")) return "sales teams";
  if (title.includes("product")) return "product teams";
  if (title.includes("engineering") || title.includes("developer")) {
    return "engineering teams";
  }
  if (title.includes("marketing")) return "marketing teams";

  return facts[1] || "teams";
}

function cleanAudience(value: string): string {
  return value
    .replace(/\b(my|our|their|the)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractOutcome(profile: ProfileData, quantifiedAchievement: string): string {
  if (quantifiedAchievement) {
    return quantifiedAchievement;
  }

  const sentences = splitSentences(profile.about);
  const outcomeSentence = sentences.find((sentence) =>
    /\b(increase|reduce|improve|grow|scale|build|launch|drive|optimi[sz]e|accelerate|transform|boost)\b/i.test(
      sentence
    )
  );
  if (outcomeSentence) return outcomeSentence;

  if (profile.achievements[0]) return profile.achievements[0];

  const skills = profile.skills.slice(0, 2).join(" and ");
  return skills || profile.currentTitle || profile.currentCompany;
}

function extractMethod(profile: ProfileData): string {
  if (profile.skills.length >= 2) {
    return `${profile.skills[0]} and ${profile.skills[1]}`;
  }
  if (profile.skills[0]) return profile.skills[0];
  if (profile.certifications[0]) return profile.certifications[0];
  return profile.currentTitle;
}

function extractQuantifiedAchievement(profile: ProfileData): string {
  const sources = [
    profile.about,
    ...profile.achievements,
    ...profile.certifications,
    ...profile.previousRoles.map((role) => `${role.role} at ${role.company}`),
  ].filter(Boolean);

  const metricPattern =
    /[^.!?\n]*\b\d[\d.,]*(?:\+|%|x|k|m|b)?(?:\s*(?:users|teams|clients|revenue|growth|pipeline|churn|roi|arr|mrr|followers|posts|products|projects|months|years))?[^.!?\n]*/i;

  for (const source of sources) {
    const match = source.match(metricPattern);
    if (match?.[0]) {
      return normalizeSentence(match[0]).slice(0, 110);
    }
  }

  return "";
}

function extractSocialProof(profile: ProfileData): string {
  if (profile.certifications[0]) return profile.certifications[0];
  if (profile.education[0]) return profile.education[0];
  if (profile.achievements[0]) return profile.achievements[0];
  if (profile.endorsements[0]) return `Endorsed for ${profile.endorsements[0]}`;
  return "";
}

function normalizeOutcomeForFramework1(outcome: string): string {
  const cleaned = normalizeSentence(outcome).replace(/\.$/, "");
  const lowered = cleaned.toLowerCase();

  if (
    /^(increase|reduce|improve|grow|scale|build|launch|drive|optimi[sz]e|accelerate|transform|boost|deliver)\b/.test(
      lowered
    )
  ) {
    return lowered;
  }
  if (lowered.startsWith("to ")) return lowered.slice(3);
  return `achieve ${lowered}`;
}

function normalizeTransformation(outcome: string, method: string): string {
  const cleaned = normalizeSentence(outcome).replace(/\.$/, "");
  const lowered = cleaned.toLowerCase();

  if (
    /^(increase|reduce|improve|grow|scale|build|launch|drive|optimi[sz]e|accelerate|transform|boost|deliver)\b/.test(
      lowered
    )
  ) {
    return lowered;
  }
  return `turn ${method.toLowerCase()} into ${lowered}`;
}

function sanitizeHeadline(value: string): string {
  let cleaned = normalizeSentence(value);

  for (const buzzwordPattern of BANNED_HEADLINE_TERMS) {
    cleaned = cleaned.replace(buzzwordPattern, "");
  }

  cleaned = cleaned
    .replace(/\s*[|│·]\s*[|│·]/g, " | ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([|│·,.])/g, "$1")
    .replace(/([|│·,.]){2,}/g, "$1")
    .trim();

  return cleaned;
}

function enforceHeadlineStyle(
  headline: string,
  tone: HeadlineTone,
  profile: ProfileData,
  facts: string[]
): string {
  let cleaned = sanitizeHeadline(limitHeadline(headline));
  const nameTokens = buildNameTokens(profile.fullName);

  // Aggressive name token removal (Full Name -> Last Name -> First Name)
  for (const token of nameTokens.sort((a, b) => b.length - a.length)) {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    cleaned = cleaned.replace(new RegExp(`\\b${escapedToken}\\b`, "gi"), "");
  }

  for (const pattern of DISALLOWED_STYLE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  // High-fidelity name prefix removal
  cleaned = cleaned
    .replace(/^[A-Z][a-z]+\s+is\s+(?:an?|the)\s+([^.,|]{3,})/gi, "$1") // "Lennox is a Developer" -> "Developer"
    .replace(/^[A-Z][a-z]+\s+(?:is|works at)\s+/gi, "") 
    .replace(/\b(?:he|she|they)\s+(?:is|has|works)\b/gi, "")
    .replace(/\b(?:i am|i'm)\b/gi, "")
    .replace(/\b(?:passionate about|at|based in|previously|role)\b$/gi, "")
    .replace(/[.!?]+/g, " ")
    .replace(/\s*[|│·]\s*[|│·]/g, " | ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[|│·,.\-:\s]+/, "")
    .replace(/[|│·,.\-:\s]+$/, "")
    .trim();

  // Handle common trailing junk post-removal
  if (cleaned.toLowerCase().startsWith("is ")) cleaned = cleaned.slice(3).trim();
  if (cleaned.toLowerCase().startsWith("a ")) cleaned = cleaned.slice(2).trim();

  if (isInvalidHeadlineStyle(cleaned, profile, facts)) {
    cleaned = buildFallbackHeadlineForTone(tone, profile, facts);
  }

  return limitHeadline(sanitizeHeadline(cleaned));
}

function isInvalidHeadlineStyle(
  headline: string,
  profile: ProfileData,
  facts: string[]
): boolean {
  const lower = normalizeSentence(headline).toLowerCase();
  if (!lower) return true;
  if (/[.!?]/.test(headline)) return true;
  if (DISALLOWED_STYLE_PATTERNS.some((pattern) => pattern.test(lower))) return true;
  if (BANNED_HEADLINE_TERMS.some((pattern) => pattern.test(lower))) return true;
  if (buildNameTokens(profile.fullName).some((token) => lower.includes(token))) return true;

  const hasSpecificDetail = buildProfileSpecificAnchors(profile).some((anchor) =>
    lower.includes(anchor.toLowerCase())
  );

  return !hasSpecificDetail || facts.length === 0;
}

function buildFallbackHeadlineForTone(
  tone: HeadlineTone,
  profile: ProfileData,
  facts: string[]
): string {
  const title = compactPhrase(profile.currentTitle) || "Creative professional";
  const company = compactPhrase(profile.currentCompany);
  const skillA = compactPhrase(profile.skills[0]);
  const skillB = compactPhrase(profile.skills[1]);
  const education = compactPhrase(profile.education[0]);
  const achievement = compactPhrase(profile.achievements[0]);

  if (tone === "Professional") {
    return [title, company ? `at ${company}` : "", skillA, skillB]
      .filter(Boolean)
      .join(" · ")
      .replace(/\s·\sat\s/i, " at ");
  }

  if (tone === "Creative") {
    if (title.toLowerCase().includes("designer") && skillA) {
      return `${skillA} designer turning ideas into polished brand work`;
    }
    if (skillA && company) {
      return `${title} focused on ${skillA} for ${company}`;
    }
    return [title, skillA || education || achievement || facts[0] || ""]
      .filter(Boolean)
      .join(" · ");
  }

  if (tone === "Bold") {
    // [Strong POV or surprising claim] │ [Proof point] │ [Role + keyword]
    const segment1 = achievement || `${title} at ${company || "Enterprise"}`;
    const segment2 = skillA || skillB || title;
    return [segment1, segment2].filter(Boolean).join(" │ ");
  }

  return [title, skillA || education || facts[0] || ""].filter(Boolean).join(" · ");
}

function compactPhrase(value: string): string {
  return cleanProfileField(normalizeSentence(value || ""))
    .replace(/\b(?:she|he)\b[\s\S]*$/i, "")
    .replace(/[.!?]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanProfileField(value: string): string {
  if (!value) return "";
  let cleaned = normalizeSentence(value)
    .replace(/\b(?:pengalaman|pendidikan|lokasi)\s*:\s*/gi, "")
    .replace(/\bau\.?linkedin\.?com\b/gi, "")
    .replace(/\blinkedin\.?com\b/gi, "")
    .replace(/\b(?:current job title|current role|current company)\s+is\b/gi, "")
    .replace(/\b(?:he|she|they)\s+previously worked as\b/gi, "")
    .replace(/\bpreviously worked as\b/gi, "")
    .replace(/\b(?:their\s+)?skills include\b/gi, "")
    .replace(/\b(?:their\s+)?achievements include\b/gi, "")
    .replace(/\bI'?m\s+[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,2}\b[,]?/g, "")
    .replace(/\s+[·|]\s+.*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  for (const pattern of TECH_NOISE_REMOVAL_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.replace(/\s{2,}/g, " ").trim();
}

function sanitizeProfileData(profile: ProfileData): ProfileData {
  return {
    ...profile,
    fullName: cleanProfileField(profile.fullName),
    currentTitle: cleanProfileField(profile.currentTitle),
    currentCompany: cleanProfileField(profile.currentCompany),
    about: cleanProfileField(profile.about),
    skills: (profile.skills || []).map(cleanProfileField).filter(Boolean),
    achievements: (profile.achievements || []).map(cleanProfileField).filter(Boolean),
    endorsements: (profile.endorsements || []).map(cleanProfileField).filter(Boolean),
    education: (profile.education || []).map(cleanProfileField).filter(Boolean),
    certifications: (profile.certifications || []).map(cleanProfileField).filter(Boolean),
    previousRoles: (profile.previousRoles || []).map((role) => ({
      ...role,
      role: cleanProfileField(role.role),
      company: cleanProfileField(role.company),
    })),
  };
}

function isNoiseProfileLine(value: string): boolean {
  const lower = normalizeSentence(value || "").toLowerCase();
  if (!lower) return false;
  return PROFILE_NOISE_PHRASES.some((phrase) => lower.includes(phrase));
}

function ensureDistinctHeadlines(
  headlines: HeadlineOption[],
  profile: ProfileData,
  facts: string[]
): HeadlineOption[] {
  const seen = new Set<string>();
  const safeFacts = facts.filter((fact) => {
    const lower = fact.toLowerCase();
    return !buildNameTokens(profile.fullName).some((token) => lower.includes(token));
  });

  return headlines.map((headline, index) => {
    let updated = headline.headline;
    let key = updated.toLowerCase();

    if (seen.has(key)) {
      const extraFact = safeFacts[index + 1] || safeFacts[0] || "";
      if (extraFact) {
        updated = limitHeadline(`${updated} | ${extraFact}`);
        updated = enforceHeadlineStyle(updated, headline.tone, profile, facts);
        key = updated.toLowerCase();
      }
    }

    seen.add(key);
    return { ...headline, headline: updated };
  });
}

function splitSentences(value: string): string[] {
  return value
    .split(/[.!?]/)
    .map((part) => normalizeSentence(part))
    .filter(Boolean);
}

function inferKeywordsFromContext(text: string): string[] {
  const fromTokens = tokenizeKeywords(text);
  return unique(fromTokens.map((token) => normalizeSkill(token)).filter(Boolean)).slice(0, 5);
}

function tokenizeKeywords(input: string): string[] {
  return input
    .split(/[\n,|/\\•·()-]/)
    .map((part) => normalizeSentence(part))
    .filter((part) => part.length >= 3 && part.length <= 42)
    .filter((part) => !GENERIC_STOPWORDS.has(part.toLowerCase()))
    .filter((part) => /^[A-Za-z0-9 '&+.-]+$/.test(part));
}

function normalizeSkill(value: string): string {
  const cleaned = value
    .replace(/\s+/g, " ")
    .replace(/\b(endorsements?|years?|yr|yrs|month|months)\b/gi, "")
    .replace(/^\d+\s*/, "")
    .trim();

  if (!cleaned) return "";
  if (GENERIC_STOPWORDS.has(cleaned.toLowerCase())) return "";
  return cleaned;
}

function firstSentence(text: string, maxLength: number): string {
  if (!text) return "";
  const sentence = text.split(/[.!?]/)[0]?.trim() ?? "";
  if (!sentence) return "";
  return sentence.length > maxLength
    ? `${sentence.slice(0, maxLength - 1).trim()}...`
    : sentence;
}

function titleCaseFromSlug(profileUrl: string): string {
  try {
    const slug = new URL(profileUrl).pathname.split("/").filter(Boolean).pop() ?? "";
    return slug
      .replace(/\d+/g, "")
      .replace(/-/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  } catch {
    return "";
  }
}

function normalizeSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function limitHeadline(value: string): string {
  const compact = normalizeSentence(value);
  if (compact.length <= 220) return compact;
  return `${compact.slice(0, 217).trim()}...`;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function uniqueBy<T>(items: T[], keySelector: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  for (const item of items) {
    const key = keySelector(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

