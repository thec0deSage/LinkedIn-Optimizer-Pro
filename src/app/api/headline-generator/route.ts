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
  currentTitle: string;
  currentCompany: string;
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

const REQUEST_TIMEOUT_MS = 12000;
const LINKEDIN_HOST = "linkedin.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

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
]);

const BANNED_HEADLINE_TERMS = [
  /\bpassionate\b/i,
  /\bdynamic\b/i,
  /\bresults[-\s]?driven\b/i,
  /\bstrategic thinker\b/i,
  /\bhardworking\b/i,
  /\bguru\b/i,
  /\bninja\b/i,
  /\brockstar\b/i,
  /\bsynergy\b/i,
  /\bleverage\b/i,
];

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
      return NextResponse.json(
        {
          message:
            "We could not read this public profile. Please ensure your LinkedIn profile visibility is set to public and try again.",
        },
        { status: 422 }
      );
    }

    const profile = extractProfileData(discovered.content, normalizedUrl);
    const enrichedProfile = inferMissingFromAvailable(profile, normalizedUrl);
    const groundingFacts = collectGroundingFacts(enrichedProfile);

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
      ? mapHeadlineJsonToOptions(aiHeadlines, groundingFacts)
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
  const candidates = await searchLinkedInCandidates(profileUrl);
  const urls = unique([profileUrl, ...candidates]).slice(0, 5);

  let best: { content: string; sourceUrl: string; score: number } | null = null;

  for (const url of urls) {
    const content = await fetchReadableProfileText(url);
    if (!content) continue;

    const score = scoreProfileContent(content);
    if (!best || score > best.score) {
      best = { content, sourceUrl: url, score };
    }

    if (score >= 7) break;
  }

  if (!best || best.score < 3) return null;
  return { sourceUrl: best.sourceUrl, content: best.content };
}

async function searchLinkedInCandidates(profileUrl: string): Promise<string[]> {
  const slug = profileUrl.split("/").filter(Boolean).pop() ?? "";
  const searchQuery = `site:linkedin.com/in "${slug.replace(/-/g, " ")}"`;
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(
    searchQuery
  )}`;
  const html = await fetchText(searchUrl);
  if (!html) return [];

  const extracted = extractSearchResultUrls(html);
  return extracted.filter((url) => url !== profileUrl);
}

function extractSearchResultUrls(html: string): string[] {
  const urls = new Set<string>();
  const hrefRegex = /href="([^"]+)"/gi;

  for (let match = hrefRegex.exec(html); match; match = hrefRegex.exec(html)) {
    const rawHref = decodeHtmlEntities(match[1] ?? "");
    const resolved = resolveDuckDuckGoRedirect(rawHref);
    if (!resolved) continue;
    const normalized = normalizeLinkedInUrl(resolved);
    if (normalized) urls.add(normalized);
  }

  return [...urls];
}

function resolveDuckDuckGoRedirect(rawHref: string): string | null {
  if (!rawHref) return null;

  let href = rawHref;
  if (href.startsWith("//")) href = `https:${href}`;
  if (href.startsWith("/l/?")) href = `https://duckduckgo.com${href}`;

  try {
    const parsed = new URL(href);
    if (!parsed.hostname.includes("duckduckgo.com")) return parsed.href;
    const redirected = parsed.searchParams.get("uddg");
    return redirected ? decodeURIComponent(redirected) : null;
  } catch {
    return null;
  }
}

async function fetchReadableProfileText(profileUrl: string): Promise<string | null> {
  const noProtocol = profileUrl.replace(/^https?:\/\//i, "");
  const readerUrls = [
    `https://r.jina.ai/http://${noProtocol}`,
    `https://r.jina.ai/https://${noProtocol}`,
  ];

  for (const readerUrl of readerUrls) {
    const text = await fetchText(readerUrl);
    if (text && scoreProfileContent(text) >= 3) {
      return text;
    }
  }

  const html = await fetchText(profileUrl);
  if (!html) return null;
  const stripped = stripHtml(html);
  return stripped.length > 200 ? stripped : null;
}

async function fetchText(url: string): Promise<string | null> {
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html, text/plain;q=0.9, */*;q=0.8",
    },
    cache: "no-store",
  });

  if (!response || !response.ok) return null;
  const text = await response.text();
  return text?.trim() ? text : null;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function scoreProfileContent(text: string): number {
  const lowered = text.toLowerCase();
  let score = 0;

  if (lowered.includes("linkedin")) score += 1;
  if (lowered.includes("experience")) score += 2;
  if (lowered.includes("skills")) score += 2;
  if (lowered.includes("about")) score += 1;
  if (lowered.includes("education")) score += 1;
  if (/\bat\b/i.test(text)) score += 1;
  if (text.length > 700) score += 1;

  return score;
}

function extractProfileData(text: string, profileUrl: string): ProfileData {
  const lines = toReadableLines(text);
  const sections = buildSectionIndex(lines);

  const fullName = extractFullName(lines, profileUrl);
  const topRole = extractTopRole(lines);
  const experienceEntries = extractExperienceEntries(lines, sections.experience);

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
    currentTitle,
    currentCompany,
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
    .map((line) => normalizeSentence(line))
    .filter((line) => line.length > 1 && line.length < 240)
    .filter((line) => !/^#+\s*$/.test(line));

  return unique(expanded);
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

  for (const line of lines.slice(0, 40)) {
    const candidate = cleanName(line.split("|")[0] ?? "");
    if (isLikelyName(candidate)) return candidate;
  }

  return titleCaseFromSlug(profileUrl);
}

function cleanName(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/\bLinkedIn\b/gi, "")
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

function extractTopRole(lines: string[]): ExperienceEntry {
  for (const line of lines.slice(0, 60)) {
    const parsed = parseRoleCompany(line);
    if (parsed) return parsed;
  }

  return { role: "", company: "" };
}

function extractExperienceEntries(
  lines: string[],
  experienceSection: string[]
): ExperienceEntry[] {
  const source = experienceSection.length > 0 ? experienceSection : lines;
  const entries: ExperienceEntry[] = [];

  for (let i = 0; i < source.length; i += 1) {
    const line = source[i];
    const parsed = parseRoleCompany(line);
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

function parseRoleCompany(line: string): ExperienceEntry | null {
  const cleaned = line.replace(/^[-*•]\s*/, "").trim();
  if (!cleaned || cleaned.length > 160) return null;
  if (ALL_SECTION_ALIASES.has(normalizeKey(cleaned))) return null;

  const atMatch = cleaned.match(/^(.+?)\s+at\s+(.+)$/i);
  if (atMatch) {
    const role = cleanRole(atMatch[1] ?? "");
    const company = cleanCompany(atMatch[2] ?? "");
    if (role && company) return { role, company };
  }

  const pipeMatch = cleaned.match(/^(.+?)\s+[|]\s+(.+)$/);
  if (pipeMatch) {
    const left = cleanRole(pipeMatch[1] ?? "");
    const right = cleanCompany(pipeMatch[2] ?? "");
    if (isLikelyRoleLine(left) && right) return { role: left, company: right };
  }

  const dotMatch = cleaned.match(/^(.+?)\s+[·•]\s+(.+)$/);
  if (dotMatch) {
    const left = cleanRole(dotMatch[1] ?? "");
    const right = cleanCompany(dotMatch[2] ?? "");
    if (isLikelyRoleLine(left) && right) return { role: left, company: right };
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

  if (!inferred.fullName) {
    inferred.fullName = titleCaseFromSlug(profileUrl);
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

function collectGroundingFacts(profile: ProfileData): string[] {
  const facts: string[] = [];

  if (profile.fullName) facts.push(profile.fullName);
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
  if (!profile.currentTitle && !profile.currentCompany) return false;

  const proofCount =
    profile.previousRoles.length +
    profile.skills.length +
    profile.endorsements.length +
    profile.certifications.length +
    profile.education.length +
    profile.achievements.length;

  return facts.length >= 4 && proofCount >= 2;
}

type HeadlineJson = {
  professional: string;
  creative: string;
  bold: string;
};

type HeadlineValidation = {
  invalidTones: HeadlineTone[];
};

async function generateHeadlinesWithValidation(
  profile: ProfileData
): Promise<HeadlineJson | null> {
  const userPrompt = buildProfilePrompt(profile);
  const firstAttemptText = await requestHeadlineGeneration(
    HEADLINE_SYSTEM_PROMPT,
    `${userPrompt}

Generate 3 LinkedIn headlines using the frameworks above.
Return only a JSON object in this format:
{
  "professional": "...",
  "creative": "...",
  "bold": "..."
}`
  );

  if (!firstAttemptText) return null;

  let parsed = parseHeadlinePayload(firstAttemptText);
  if (!parsed) return null;
  parsed = sanitizeHeadlineJson(parsed);

  let validation = validateHeadlineJson(parsed, profile);
  if (validation.invalidTones.length === 0) {
    return parsed;
  }

  const retryPrompt = `${userPrompt}

Previous output:
${JSON.stringify(parsed, null, 2)}

Failed variants: ${validation.invalidTones.join(", ")}
The previous headline was too generic. Rewrite it using a specific detail from the profile and a concrete outcome or number.

Return only a JSON object in this format:
{
  "professional": "...",
  "creative": "...",
  "bold": "..."
}`;

  const retryText = await requestHeadlineGeneration(HEADLINE_SYSTEM_PROMPT, retryPrompt);
  if (!retryText) return parsed;

  const retryParsed = parseHeadlinePayload(retryText);
  if (!retryParsed) return parsed;

  parsed = sanitizeHeadlineJson({
    professional: retryParsed.professional || parsed.professional,
    creative: retryParsed.creative || parsed.creative,
    bold: retryParsed.bold || parsed.bold,
  });

  validation = validateHeadlineJson(parsed, profile);
  if (validation.invalidTones.length > 0) {
    return null;
  }

  return parsed;
}

function buildProfilePrompt(profile: ProfileData): string {
  const currentRole = [profile.currentTitle, profile.currentCompany]
    .filter(Boolean)
    .join(" at ");
  const previousRoles = profile.previousRoles
    .slice(0, 3)
    .map((entry) => `${entry.role} at ${entry.company}`.trim())
    .filter(Boolean)
    .join(", ");
  const skills = profile.skills.slice(0, 8).join(", ");
  const achievements = unique([
    ...profile.certifications,
    ...profile.achievements,
    ...extractMetricTokens([profile.about, ...profile.achievements]),
  ]).join(", ");

  return `Here is the user's LinkedIn profile data:

Name: ${profile.fullName || "N/A"}
Current Role: ${currentRole || "N/A"}
Previous Roles: ${previousRoles || "N/A"}
Skills: ${skills || "N/A"}
Summary: ${profile.about || "N/A"}
Achievements: ${achievements || "N/A"}`;
}

async function requestHeadlineGeneration(
  systemPrompt: string,
  userPrompt: string
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const responsesPayload = {
    model,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: userPrompt }],
      },
    ],
    temperature: 0.5,
    max_output_tokens: 500,
  };

  const responsesRequest = await fetchWithTimeout(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responsesPayload),
      cache: "no-store",
    },
    30000
  );

  if (responsesRequest?.ok) {
    const data = await responsesRequest.json().catch(() => null);
    const text = extractResponsesText(data);
    if (text) return text;
  }

  const chatPayload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 500,
  };

  const chatRequest = await fetchWithTimeout(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chatPayload),
      cache: "no-store",
    },
    30000
  );

  if (!chatRequest?.ok) return null;

  const chatData = (await chatRequest.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }> }
    | null;

  return chatData?.choices?.[0]?.message?.content?.trim() || null;
}

function extractResponsesText(data: unknown): string {
  if (!data || typeof data !== "object") return "";

  const maybeOutputText = (data as { output_text?: unknown }).output_text;
  if (typeof maybeOutputText === "string" && maybeOutputText.trim()) {
    return maybeOutputText.trim();
  }

  const output = (data as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  const chunks: string[] = [];

  for (const item of output) {
    const content = (item as { content?: unknown })?.content;
    if (!Array.isArray(content)) continue;
    for (const entry of content) {
      const text = (entry as { text?: unknown })?.text;
      if (typeof text === "string" && text.trim()) chunks.push(text.trim());
    }
  }

  return chunks.join("\n").trim();
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
    if (!parsed || typeof parsed !== "object") return null;
    const professional = normalizeSentence(parsed.professional ?? "");
    const creative = normalizeSentence(parsed.creative ?? "");
    const bold = normalizeSentence(parsed.bold ?? "");

    if (!professional || !creative || !bold) return null;
    return { professional, creative, bold };
  } catch {
    return null;
  }
}

function extractHeadlinesFromRawLines(raw: string): HeadlineJson | null {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const byLabel: Partial<HeadlineJson> = {};
  for (const line of lines) {
    const professionalMatch = line.match(
      /(?:^|\b)professional\s*[:\-]\s*(.+)$/i
    );
    if (professionalMatch?.[1]) byLabel.professional = professionalMatch[1].trim();

    const creativeMatch = line.match(/(?:^|\b)creative\s*[:\-]\s*(.+)$/i);
    if (creativeMatch?.[1]) byLabel.creative = creativeMatch[1].trim();

    const boldMatch = line.match(/(?:^|\b)bold\s*[:\-]\s*(.+)$/i);
    if (boldMatch?.[1]) byLabel.bold = boldMatch[1].trim();
  }

  if (byLabel.professional && byLabel.creative && byLabel.bold) {
    return {
      professional: normalizeSentence(byLabel.professional),
      creative: normalizeSentence(byLabel.creative),
      bold: normalizeSentence(byLabel.bold),
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
    professional: normalizeSentence(candidateLines[0]),
    creative: normalizeSentence(candidateLines[1]),
    bold: normalizeSentence(candidateLines[2]),
  };
}

function sanitizeHeadlineJson(headlines: HeadlineJson): HeadlineJson {
  return {
    professional: sanitizeHeadline(limitHeadline(headlines.professional)),
    creative: sanitizeHeadline(limitHeadline(headlines.creative)),
    bold: sanitizeHeadline(limitHeadline(headlines.bold)),
  };
}

function validateHeadlineJson(
  headlines: HeadlineJson,
  profile: ProfileData
): HeadlineValidation {
  const anchors = buildProfileSpecificAnchors(profile);
  const invalidTones: HeadlineTone[] = [];

  const checks: Array<[HeadlineTone, string]> = [
    ["Professional", headlines.professional],
    ["Creative", headlines.creative],
    ["Bold", headlines.bold],
  ];

  for (const [tone, headline] of checks) {
    const lower = headline.toLowerCase();
    const hasBannedWord = BANNED_HEADLINE_TERMS.some((pattern) => pattern.test(lower));
    const tooLong = headline.length >= 220;
    const noSpecificDetail = !anchors.some((anchor) =>
      lower.includes(anchor.toLowerCase())
    );
    if (hasBannedWord || tooLong || noSpecificDetail) {
      invalidTones.push(tone);
    }
  }

  return { invalidTones };
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
  headlines: HeadlineJson,
  facts: string[]
): HeadlineOption[] {
  return ensureDistinctHeadlines(
    [
      { tone: "Professional", headline: headlines.professional },
      { tone: "Creative", headline: headlines.creative },
      { tone: "Bold", headline: headlines.bold },
    ].map((option) => ({
      ...option,
      headline: ensureGroundedHeadline(option.headline, facts),
    })),
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
    headline: ensureGroundedHeadline(
      sanitizeHeadline(limitHeadline(candidate.headline)),
      facts
    ),
  }));

  return ensureDistinctHeadlines(grounded, facts);
}

function ensureGroundedHeadline(headline: string, facts: string[]): string {
  const compact = normalizeSentence(headline);
  const hasGroundedToken = facts.some((fact) => {
    const pivot = fact.split(" ").slice(0, 3).join(" ").toLowerCase();
    return pivot && compact.toLowerCase().includes(pivot);
  });

  if (hasGroundedToken) return compact;

  const fallbackFact = facts[0] ?? "";
  if (!fallbackFact) return compact;

  return limitHeadline(`${compact} | ${fallbackFact}`);
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
  const identity = buildIdentity(profile) || facts[0] || profile.fullName;
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
  return profile.currentTitle || profile.currentCompany || profile.fullName;
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
    .replace(/\s+\|\s+\|/g, " | ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([|,.])/g, "$1")
    .replace(/([|,.]){2,}/g, "$1")
    .trim();

  return cleaned;
}

function ensureDistinctHeadlines(
  headlines: HeadlineOption[],
  facts: string[]
): HeadlineOption[] {
  const seen = new Set<string>();

  return headlines.map((headline, index) => {
    let updated = headline.headline;
    let key = updated.toLowerCase();

    if (seen.has(key)) {
      const extraFact = facts[index + 1] || facts[0] || "";
      if (extraFact) {
        updated = limitHeadline(`${updated} | ${extraFact}`);
        updated = sanitizeHeadline(updated);
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

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/g, "/")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
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
