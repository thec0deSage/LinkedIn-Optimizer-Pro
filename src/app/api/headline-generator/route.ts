import { NextResponse } from "next/server";

export const runtime = "nodejs";

type HeadlineTone = "Professional" | "Creative" | "Bold";

type HeadlineOption = {
  tone: HeadlineTone;
  headline: string;
};

type ProfileData = {
  name: string;
  currentRole: string;
  summary: string;
  skills: string[];
  experience: string[];
};

const REQUEST_TIMEOUT_MS = 12000;
const LINKEDIN_HOST = "linkedin.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

const SECTION_HEADINGS = new Set([
  "about",
  "experience",
  "skills",
  "education",
  "activity",
  "projects",
  "licenses & certifications",
  "recommendations",
  "certifications",
  "volunteering",
  "publications",
]);

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
    if (!discovered?.content || scoreProfileText(discovered.content) < 3) {
      return NextResponse.json(
        {
          message:
            "We could not read enough public profile information. Please make sure your LinkedIn profile visibility is set to public and try again.",
        },
        { status: 422 }
      );
    }

    const profile = extractProfileData(discovered.content, normalizedUrl);
    const headlines = generateHeadlines(profile);

    return NextResponse.json({
      headlines,
      profile: {
        name: profile.name,
        currentRole: profile.currentRole,
        skills: profile.skills,
      },
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

async function discoverProfileText(
  profileUrl: string
): Promise<{ content: string; sourceUrl: string } | null> {
  const searchCandidates = await searchLinkedInCandidates(profileUrl);
  const urls = unique([profileUrl, ...searchCandidates]).slice(0, 5);

  let best: { content: string; sourceUrl: string; score: number } | null = null;

  for (const url of urls) {
    const content = await fetchReadableProfileText(url);
    if (!content) continue;

    const score = scoreProfileText(content);
    if (!best || score > best.score) {
      best = { content, sourceUrl: url, score };
    }

    if (score >= 6) break;
  }

  if (!best) return null;

  return { content: best.content, sourceUrl: best.sourceUrl };
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
  return extracted.filter((candidate) => candidate !== profileUrl);
}

function extractSearchResultUrls(html: string): string[] {
  const urls = new Set<string>();
  const hrefRegex = /href="([^"]+)"/gi;

  for (let match = hrefRegex.exec(html); match; match = hrefRegex.exec(html)) {
    const rawHref = decodeHtmlEntities(match[1]);
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
    if (parsed.hostname.includes("duckduckgo.com")) {
      const uddg = parsed.searchParams.get("uddg");
      return uddg ? decodeURIComponent(uddg) : null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

async function fetchReadableProfileText(profileUrl: string): Promise<string | null> {
  const cleanUrl = profileUrl.replace(/^https?:\/\//i, "");
  const readerUrls = [
    `https://r.jina.ai/http://${cleanUrl}`,
    `https://r.jina.ai/https://${cleanUrl}`,
  ];

  for (const readerUrl of readerUrls) {
    const readableText = await fetchText(readerUrl);
    if (readableText && scoreProfileText(readableText) >= 3) {
      return readableText;
    }
  }

  const html = await fetchText(profileUrl);
  if (!html) return null;

  const stripped = stripHtml(html);
  return stripped.length > 200 ? stripped : null;
}

function scoreProfileText(text: string): number {
  const lowered = text.toLowerCase();
  let score = 0;

  if (lowered.includes("linkedin")) score += 1;
  if (lowered.includes("experience")) score += 2;
  if (lowered.includes("skills")) score += 2;
  if (lowered.includes("about")) score += 1;
  if (/\sat\s/i.test(text)) score += 1;
  if (text.length > 700) score += 1;

  return score;
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
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractProfileData(text: string, profileUrl: string): ProfileData {
  const plainText = sanitizePlainText(text);
  const lines = plainText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 1 && line.length < 200);

  const fallbackName = titleCaseFromSlug(profileUrl);
  const name = extractName(lines, fallbackName);
  const currentRole = extractCurrentRole(lines) || "LinkedIn Professional";
  const summary = extractSummary(lines);
  const skills = extractSkills(lines, summary, currentRole);
  const experience = extractExperience(lines);

  return {
    name,
    currentRole,
    summary,
    skills,
    experience,
  };
}

function sanitizePlainText(value: string): string {
  return value
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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

function titleCaseFromSlug(profileUrl: string): string {
  try {
    const pathname = new URL(profileUrl).pathname;
    const slug = pathname.split("/").filter(Boolean).pop() ?? "Professional";
    const cleaned = slug
      .replace(/-\d+/g, "")
      .replace(/\d+/g, "")
      .replace(/-/g, " ")
      .trim();

    if (!cleaned) return "LinkedIn Professional";

    return cleaned
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return "LinkedIn Professional";
  }
}

function extractName(lines: string[], fallbackName: string): string {
  const titleLine = lines.find((line) => /^title:/i.test(line));
  const titleCandidate = titleLine
    ? cleanNameCandidate(titleLine.replace(/^title:\s*/i, "").split(/[|,-]/)[0] ?? "")
    : "";
  if (isValidName(titleCandidate)) return titleCandidate;

  for (const line of lines.slice(0, 40)) {
    const candidate = cleanNameCandidate(line.split(/[|,-]/)[0] ?? "");
    if (isValidName(candidate)) return candidate;
  }

  return fallbackName;
}

function cleanNameCandidate(value: string): string {
  return value
    .replace(/^#+\s*/, "")
    .replace(/\bLinkedIn\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidName(value: string): boolean {
  if (!value) return false;
  if (value.length < 4 || value.length > 60) return false;
  if (/\d/.test(value)) return false;
  const words = value.split(" ").filter(Boolean);
  if (words.length < 2 || words.length > 4) return false;
  return words.every((word) => /^[A-Za-z'.-]+$/.test(word));
}

function extractCurrentRole(lines: string[]): string {
  for (const line of lines.slice(0, 80)) {
    const cleaned = line.replace(/^title:\s*/i, "").trim();
    if (cleaned.length < 8 || cleaned.length > 120) continue;
    if (cleaned.toLowerCase().includes("linkedin")) continue;

    const parts = cleaned.split(/\s+[|,-]\s+/);
    if (parts.length > 1) {
      const role = parts.slice(1).join(" | ").trim();
      if (isRoleLike(role)) return role;
    }

    if (isRoleLike(cleaned)) return cleaned;
  }

  return "";
}

function isRoleLike(value: string): boolean {
  const lowered = value.toLowerCase();
  return (
    lowered.includes(" at ") ||
    lowered.includes("manager") ||
    lowered.includes("engineer") ||
    lowered.includes("founder") ||
    lowered.includes("consultant") ||
    lowered.includes("specialist") ||
    lowered.includes("director") ||
    lowered.includes("lead") ||
    lowered.includes("strategist")
  );
}

function extractSummary(lines: string[]): string {
  const aboutLines = extractSection(lines, "about");
  if (aboutLines.length > 0) {
    return normalizeSentence(aboutLines.join(" ").slice(0, 220));
  }

  const longLine = lines.find(
    (line) =>
      line.length > 80 &&
      !SECTION_HEADINGS.has(line.toLowerCase()) &&
      !/^title:/i.test(line)
  );

  return longLine
    ? normalizeSentence(longLine.slice(0, 220))
    : "Helping teams and clients create more visible, meaningful professional impact.";
}

function extractSkills(lines: string[], summary: string, role: string): string[] {
  const skillLines = extractSection(lines, "skills");
  const skillTokens = tokenizeKeywords(skillLines.join(" | "));

  if (skillTokens.length >= 2) return skillTokens.slice(0, 5);

  const inferred = tokenizeKeywords(`${summary} | ${role}`);
  if (inferred.length >= 2) return inferred.slice(0, 5);

  return ["Personal Branding", "Content Strategy", "LinkedIn Growth"];
}

function extractExperience(lines: string[]): string[] {
  const experienceLines = extractSection(lines, "experience")
    .filter((line) => line.length > 8)
    .filter((line) => !SECTION_HEADINGS.has(line.toLowerCase()));

  return experienceLines.slice(0, 4);
}

function extractSection(lines: string[], heading: string): string[] {
  const startIndex = lines.findIndex(
    (line) => line.toLowerCase() === heading.toLowerCase()
  );
  if (startIndex === -1) return [];

  const section: string[] = [];
  for (let i = startIndex + 1; i < lines.length && section.length < 16; i += 1) {
    const line = lines[i];
    if (!line) continue;
    if (SECTION_HEADINGS.has(line.toLowerCase())) break;
    section.push(line);
  }

  return section;
}

function tokenizeKeywords(input: string): string[] {
  const blacklist = new Set([
    "linkedin",
    "profile",
    "experience",
    "skills",
    "about",
    "more",
    "less",
    "see more",
    "view profile",
  ]);

  const tokens = input
    .split(/[\n,|/\\•·]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 3 && part.length <= 40)
    .map((part) => normalizeSentence(part))
    .filter((part) => !blacklist.has(part.toLowerCase()))
    .filter((part) => /^[A-Za-z0-9 '&+.-]+$/.test(part));

  return unique(tokens);
}

function normalizeSentence(value: string): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function generateHeadlines(profile: ProfileData): HeadlineOption[] {
  const role = profile.currentRole;
  const primarySkill = profile.skills[0] ?? "Content Strategy";
  const secondarySkill = profile.skills[1] ?? "Personal Branding";
  const supportSkill = profile.skills[2] ?? "Thought Leadership";
  const impact = firstSentence(profile.summary, 85);
  const roleWithoutAt = role.replace(/\s+at\s+.+$/i, "").trim();
  const confidentRole = roleWithoutAt || role;

  const professional = limitHeadline(
    `${role} | ${primarySkill} | ${secondarySkill}`
  );

  const creative = limitHeadline(
    `${confidentRole} turning ${primarySkill.toLowerCase()} into memorable stories and meaningful professional visibility`
  );

  const bold = limitHeadline(
    `${primarySkill}. ${supportSkill}. ${confidentRole} focused on measurable outcomes${impact ? ` - ${impact}` : ""}`
  );

  return [
    { tone: "Professional", headline: professional },
    { tone: "Creative", headline: creative },
    { tone: "Bold", headline: bold },
  ];
}

function firstSentence(text: string, maxLength: number): string {
  if (!text) return "";
  const sentence = text.split(/[.!?]/)[0]?.trim() ?? "";
  if (!sentence) return "";
  return sentence.length > maxLength
    ? `${sentence.slice(0, maxLength - 1).trim()}...`
    : sentence;
}

function limitHeadline(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= 220) return compact;
  return `${compact.slice(0, 217).trim()}...`;
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
