"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  LoaderCircle,
  PenSquare,
  RefreshCcw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  formatBioForClipboard,
  type BioDraft,
  type BioTone,
} from "@/lib/bio-generator";

const TOOL_PAGE_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
];

const TONE_OPTIONS: BioTone[] = [
  "Professional",
  "Friendly",
  "Bold",
  "Thought Leader",
];

const QUICK_TIPS = [
  {
    title: "Lead with value",
    description:
      "Open with the outcomes you create so readers understand your relevance quickly.",
  },
  {
    title: "Show personality",
    description:
      "A human tone builds trust faster than generic, overly formal positioning.",
  },
  {
    title: "Include keywords",
    description:
      "Use the language your audience and recruiters already search for.",
  },
  {
    title: "Use formatting",
    description:
      "Short paragraphs make your About section easier to scan and easier to remember.",
  },
];

export default function BioGeneratorPage() {
  const [jobTitles, setJobTitles] = useState("");
  const [expertise, setExpertise] = useState("");
  const [tone, setTone] = useState<BioTone>("Professional");
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<BioDraft | null>(null);
  const [variation, setVariation] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function requestDraft(nextVariation: number) {
    setIsLoading(true);
    setApiError("");

    try {
      const response = await fetch("/api/bio-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitles,
          expertise,
          tone,
          variation: nextVariation,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { draft?: BioDraft; message?: string }
        | null;

      if (!response.ok || !payload?.draft) {
        setApiError(
          payload?.message ??
            "We could not generate a bio right now. Please try again."
        );
        return;
      }

      setVariation(nextVariation);
      setDraft(payload.draft);
      setCopied(false);
    } catch {
      setApiError(
        "We hit a network issue while generating your bio. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitles = jobTitles.trim();
    const trimmedExpertise = expertise.trim();

    if (!trimmedTitles || !trimmedExpertise) {
      setFieldError("Add both your job titles and expertise before generating.");
      setApiError("");
      return;
    }

    setFieldError("");
    await requestDraft(variation + 1);
  }

  async function handleRegenerate() {
    if (!jobTitles.trim() || !expertise.trim()) {
      setFieldError("Add both your job titles and expertise before regenerating.");
      return;
    }

    setFieldError("");
    await requestDraft(variation + 1);
  }

  async function handleCopy() {
    if (!draft) return;

    try {
      await navigator.clipboard.writeText(formatBioForClipboard(draft));
      setCopied(true);
    } catch {
      setApiError("We could not copy the bio right now. Please copy it manually.");
    }
  }

  const previewInitials = getInitials(draft?.primaryTitle ?? jobTitles);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <MarketingNav desktopLinks={TOOL_PAGE_LINKS} />

      <main className="flex-1 pt-20">
        <section
          className="relative overflow-hidden py-14 md:py-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="absolute top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/20 blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="relative inline-flex items-center gap-3 px-6 py-3 bg-[#eef4ff] border border-[#dce6f2] rounded-[22px] shadow-sm">
                {/* Peeking Mascot Container */}
                <div className="absolute -top-11 -right-8 w-20 h-20 pointer-events-none overflow-visible">
                  {/* Character placeholder - Matches QR Generator UI */}
                  <div className="relative w-full h-full">
                    <div className="absolute bottom-0 right-0 w-12 h-12 bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse" />
                    <div className="w-full h-full flex items-center justify-center transform translate-y-2 translate-x-1">
                      <span className="text-4xl filter drop-shadow-md">🤖</span>
                    </div>
                  </div>
                </div>

                {/* LinkedIn Icon */}
                <div className="bg-[#0A66C2] p-1.5 rounded-lg shadow-sm">
                  <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>

                {/* LinkedIn Brand Text */}
                <span className="text-4xl md:text-5xl font-bold text-[#0A66C2] tracking-tighter sm:mr-2">
                  LinkedIn
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-[#213856] tracking-tight leading-tight text-center">
                Bio Generator
              </h1>
            </div>
            
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mt-4 mb-10 text-center">
              Generate a high-impact, recruiter-ready bio in seconds. Stand
              out with a polished About section shaped around your role,
              expertise, and voice.
            </p>

            <div className="grid gap-6 items-start lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="job-titles"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Job Title(s)
                    </label>
                    <input
                      id="job-titles"
                      type="text"
                      value={jobTitles}
                      onChange={(event) => {
                        setJobTitles(event.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      placeholder="e.g. Product Designer, AI Engineer"
                      className={`w-full rounded-xl border bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                        fieldError
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-[#006edc]"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="expertise"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Key Areas of Expertise
                    </label>
                    <textarea
                      id="expertise"
                      value={expertise}
                      onChange={(event) => {
                        setExpertise(event.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      placeholder="e.g. UX Research, Machine Learning, Growth Strategy"
                      rows={4}
                      className={`w-full resize-none rounded-xl border bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                        fieldError
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-[#006edc]"
                      }`}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      Tone Selector
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {TONE_OPTIONS.map((option) => {
                        const isSelected = option === tone;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setTone(option)}
                            className={`cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                              isSelected
                                ? "border-[#0d2137] bg-[#0d2137] text-white shadow-sm"
                                : "border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {fieldError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-700">
                        Missing information
                      </p>
                      <p className="text-sm text-red-600 mt-1">{fieldError}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Separate multiple roles or expertise areas with commas to
                      give the generator more context.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d2137] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#153456] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Generating Bio...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Bio
                      </>
                    )}
                  </button>

                  {apiError ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-800">
                        Something needs attention
                      </p>
                      <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                        {apiError}
                      </p>
                    </div>
                  ) : null}
                </form>
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/30 overflow-hidden">
                  <div className="h-18 bg-slate-600 sm:h-20" />

                  <div className="px-6 pb-6 pt-0 sm:px-8">
                    <div className="-mt-7 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#0d2137] text-lg font-bold text-white shadow-lg shadow-slate-900/10 sm:h-18 sm:w-18 sm:text-xl">
                      {previewInitials || <UserRound className="h-7 w-7" />}
                    </div>

                    <div className="mt-4 border-b border-slate-100 pb-5">
                      <h2 className="text-2xl font-bold text-[#213856] tracking-tight">
                        {draft?.primaryTitle ?? "Your LinkedIn Bio Preview"}
                      </h2>
                      <p className="mt-2 text-sm font-medium text-slate-600">
                        {draft?.headline ??
                          "Your strongest positioning, expertise, and voice will appear here."}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {draft?.metaLine ?? "Recruiter-ready about section"}
                      </p>
                    </div>

                    <div className="py-5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">
                          About
                        </p>
                        <PenSquare className="h-4 w-4 text-slate-400" />
                      </div>

                      {isLoading ? (
                        <div className="mt-4 space-y-3 animate-pulse">
                          <div className="h-4 rounded bg-slate-200" />
                          <div className="h-4 rounded bg-slate-200" />
                          <div className="h-4 w-5/6 rounded bg-slate-200" />
                          <div className="h-4 rounded bg-slate-200" />
                          <div className="h-4 w-2/3 rounded bg-slate-200" />
                        </div>
                      ) : draft ? (
                        <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-600">
                          {draft.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                          <p className="font-medium text-slate-700">
                            {draft.callToAction}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5">
                          <p className="text-[15px] leading-7 text-slate-500">
                            Add your roles, expertise, and preferred tone to
                            generate a polished About section you can paste into
                            LinkedIn right away.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!draft || isLoading}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d2137] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#153456] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy to clipboard
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerate}
                        disabled={isLoading || !jobTitles.trim() || !expertise.trim()}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-[#213856] transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isLoading ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="h-4 w-4" />
                        )}
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {QUICK_TIPS.map((tip) => (
                    <article
                      key={tip.title}
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#0A66C2]">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <h3 className="text-sm font-semibold text-[#213856]">
                          {tip.title}
                        </h3>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {tip.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter anchorPrefix="/" />
    </div>
  );
}

function getInitials(value: string) {
  return value
    .split(/[\s,/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
