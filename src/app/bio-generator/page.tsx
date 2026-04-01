"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";
import {
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
      const bioContent = `${draft.paragraphs[0]} ${draft.callToAction}`;
      await navigator.clipboard.writeText(bioContent);
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
        <section className="relative overflow-hidden py-14 md:py-20 bg-dot-grid">
          <div className="absolute top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/20 blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="relative inline-flex items-center gap-3 px-6 py-3 bg-[#eef4ff] border border-[#dce6f2] rounded-[22px] shadow-sm">
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
                Professional Bio Generator
              </h1>
            </div>
            
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mt-4 mb-10 text-center">
              Generate a high-impact, recruiter-ready bio in seconds. Stand
              out with a polished About section shaped around your role,
              expertise, and voice.
            </p>

            <div className="grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
                            className={`cursor-pointer rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all active:scale-[0.99] ${
                              isSelected
                                ? "border-[#0A66C2] bg-slate-50/70 text-[#0A66C2] hover:border-[#005bb8] hover:text-[#005bb8]"
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
                    className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-900/10 transition-all hover:bg-[#005bb8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
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

              <div className="flex flex-col h-full">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/30 overflow-hidden flex flex-col h-full">
                  {/* Header Bar */}
                  <div className="bg-[#2c3e50] px-6 py-4 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-widest text-slate-300">
                      LIVE PREVIEW
                    </span>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                  </div>

                  {/* Inner Container - LinkedIn Profile Style */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-white mx-6 my-4 rounded-xl border border-slate-100">
                    {/* Header Graphics */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-20 relative">
                      <div className="absolute -bottom-8 left-6">
                        <div className="h-20 w-20 rounded-full border-4 border-white bg-slate-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                          {previewInitials || "U"}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-y-auto">
                      <div className="px-6 pt-12 pb-6 space-y-4">
                        {/* Profile Info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-[#213856]">
                              Your Name
                            </h3>
                            <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 1L3 5V11C3 17 12 23 12 23S21 17 21 11V5L12 1Z" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round"/>
                              <path d="M8 12L11 15L16 9" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <p className="text-sm text-slate-700 mt-1">
                            {draft?.headline ?? "Your headline will appear here"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Harare, Zimbabwe • 500+ connections
                          </p>
                        </div>

                        {/* About Section */}
                        <div>
                          <h4 className="text-sm font-bold text-[#213856] mb-2">
                            About
                          </h4>
                          {isLoading ? (
                            <div className="space-y-2 animate-pulse">
                              <div className="h-3 rounded bg-slate-200" />
                              <div className="h-3 rounded bg-slate-200" />
                              <div className="h-3 rounded bg-slate-200 w-5/6" />
                            </div>
                          ) : draft ? (
                            <p className="text-sm leading-relaxed text-slate-700">
                              {draft.paragraphs[0]} {draft.callToAction}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400">
                              Your bio will appear here
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 grid gap-3 grid-cols-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <button
                      type="button"
                      onClick={handleCopy}
                      disabled={!draft || isLoading}
                      className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-[#2c3e50] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#34495e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="hidden sm:inline">Copy Bio</span>
                          <span className="sm:hidden">Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={isLoading || !jobTitles.trim() || !expertise.trim()}
                      className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-blue-100 px-5 py-2.5 text-sm font-semibold text-[#4a5f7f] transition-all hover:border-slate-400 hover:bg-blue-150 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCcw className="h-4 w-4" />
                          <span className="hidden sm:inline">Regenerate</span>
                          <span className="sm:hidden">Regenerate</span>
                        </>
                      )}
                    </button>
                  </div>
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
