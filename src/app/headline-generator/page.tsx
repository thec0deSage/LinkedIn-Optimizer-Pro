"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Copy, Menu, Sparkles, X } from "lucide-react";

type HeadlineTone = "Professional" | "Creative" | "Bold";

type HeadlineOption = {
  tone: HeadlineTone;
  headline: string;
  isBest?: boolean;
};

type GenerateResponse = {
  headlines: HeadlineOption[];
  sourceUrl?: string;
  message?: string;
};

const TONES: HeadlineTone[] = ["Professional", "Creative", "Bold"];

const BADGE_CLASSES: Record<HeadlineTone, string> = {
  Professional:
    "border border-blue-100 bg-blue-50 text-blue-700 shadow-[0_1px_0_rgba(37,99,235,0.06)]",
  Creative:
    "border border-slate-200 bg-slate-100 text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)]",
  Bold: "border border-amber-100 bg-amber-50 text-amber-700 shadow-[0_1px_0_rgba(217,119,6,0.06)]",
};

export default function HeadlineGeneratorPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Reading your profile...");
  const [headlines, setHeadlines] = useState<HeadlineOption[]>([]);
  const [copiedTone, setCopiedTone] = useState<HeadlineTone | null>(null);

  const hasResults = headlines.length > 0;

  useEffect(() => {
    if (!isLoading) return;

    setStatusLabel("Reading your profile...");
    const timer = setTimeout(() => {
      setStatusLabel("Crafting headlines...");
    }, 1200);

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!copiedTone) return;

    const timer = setTimeout(() => {
      setCopiedTone((current) => (current === copiedTone ? null : current));
    }, 2000);

    return () => clearTimeout(timer);
  }, [copiedTone]);

  const helperText = useMemo(() => {
    return "Use your public profile link, for example: https://www.linkedin.com/in/your-name";
  }, []);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldError("");
    setApiError("");

    const trimmedUrl = profileUrl.trim();
    if (!isValidLinkedInUrl(trimmedUrl)) {
      setFieldError("Please enter a valid LinkedIn profile URL.");
      return;
    }

    setIsLoading(true);
    setHeadlines([]);
    setCopiedTone(null);

    try {
      const response = await fetch("/api/headline-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileUrl: trimmedUrl }),
      });

      const payload = (await response.json().catch(() => null)) as
        | GenerateResponse
        | null;

      if (!response.ok) {
        const message =
          payload?.message ??
          "We could not generate headlines right now. Please try again.";
        setApiError(message);
        return;
      }

      if (!payload?.headlines?.length) {
        setApiError(
          "No headline options were returned. Please try a different public profile URL."
        );
        return;
      }

      setHeadlines(payload.headlines);
    } catch {
      setApiError(
        "Network error while generating headlines. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(option: HeadlineOption) {
    try {
      await navigator.clipboard.writeText(option.headline);
      setCopiedTone(option.tone);
    } catch {
      setApiError("Unable to copy right now. Please copy the headline manually.");
    }
  }

  function resetGenerator() {
    setHeadlines([]);
    setApiError("");
    setFieldError("");
    setCopiedTone(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2.5 z-10">
            <Image
              src="/images/logo-01.svg"
              alt="LinkedIn Optimizer Pro Logo"
              width={176}
              height={44}
              sizes="176px"
              className="h-11 w-auto object-contain"
              priority
            />
            <div className="flex items-center">
              <span className="font-bold text-xl text-[#0d2137] tracking-tighter">
                LinkedIn
              </span>
              <span className="font-medium text-xl text-[#4a5568] tracking-tighter ml-1">
                Optimizer Pro
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/#features"
              className="text-sm font-semibold text-slate-600 hover:text-[#213856] transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-semibold text-slate-600 hover:text-[#213856] transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/headline-generator"
              className="text-sm font-semibold text-[#213856]"
            >
              Headline Generator
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-semibold text-slate-600 hover:text-[#213856] transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3 z-10">
            <Link
              href="/login"
              className="cursor-pointer bg-transparent text-slate-700 hover:text-[#213856] hover:bg-slate-100 px-5 py-2.5 rounded-md font-semibold text-sm transition-all border border-transparent"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="cursor-pointer bg-[#0d2137] hover:bg-[#153456] text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95"
            >
              Sign Up
            </Link>
          </div>

          <div className="lg:hidden flex items-center z-10">
            <button
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="text-slate-600 hover:text-[#213856] p-2 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 inset-x-0 bg-white border-b border-slate-200 px-6 py-6 flex flex-col gap-6 shadow-xl w-full">
            <div className="flex flex-col gap-4">
              <Link
                href="/#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-600"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-600"
              >
                How it Works
              </Link>
              <Link
                href="/headline-generator"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-[#213856]"
              >
                Headline Generator
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-600"
              >
                Pricing
              </Link>
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block cursor-pointer bg-transparent text-slate-600 hover:bg-slate-100 px-5 py-3 rounded-md font-semibold text-base transition-all border border-slate-200 w-full text-center"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block cursor-pointer bg-[#0d2137] hover:bg-[#153456] text-white px-5 py-3 rounded-md font-semibold text-base transition-all shadow-sm active:scale-95 w-full text-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-20 pb-20">
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10 md:mb-12">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50/80 border border-slate-200 text-sm font-semibold text-slate-600 shadow-sm">
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  LinkedIn Headline Generator
                </span>
                <h1 className="text-3xl md:text-5xl font-bold text-[#213856] mt-5 mb-4 tracking-tight leading-tight">
                  Generate your next standout LinkedIn headline
                </h1>
                <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                  Paste your public profile URL and get three personalized options:
                  Professional, Creative, and Bold.
                </p>
              </div>

              <div className="bg-white rounded-[28px] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 sm:p-8 md:p-10">
                <form onSubmit={handleGenerate} className="space-y-3">
                  <label
                    htmlFor="linkedin-profile-url"
                    className="text-sm font-semibold text-slate-700 block"
                  >
                    LinkedIn Profile URL
                  </label>
                  <input
                    id="linkedin-profile-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://www.linkedin.com/in/your-name"
                    value={profileUrl}
                    onChange={(event) => {
                      setProfileUrl(event.target.value);
                      if (fieldError) setFieldError("");
                    }}
                    className={`w-full border-b py-2.5 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400 ${
                      fieldError
                        ? "border-red-300 focus:border-red-500"
                        : "border-slate-200 focus:border-[#006edc]"
                    }`}
                    aria-invalid={fieldError ? "true" : "false"}
                    aria-describedby="profile-url-helper"
                  />
                  {fieldError ? (
                    <p className="text-sm font-medium text-red-600">{fieldError}</p>
                  ) : null}
                  <p id="profile-url-helper" className="text-sm text-slate-500">
                    {helperText}
                  </p>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="cursor-pointer w-full sm:w-auto bg-[#0d2137] hover:bg-[#153456] text-white px-8 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Generating..." : "Generate Headlines"}
                    </button>
                  </div>
                </form>

                {isLoading ? (
                  <div className="mt-8">
                    <p className="text-sm font-medium text-slate-500 mb-4">
                      {statusLabel}
                    </p>
                    <div className="space-y-4">
                      {TONES.map((tone) => (
                        <div
                          key={tone}
                          className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse"
                        >
                          <div className="h-7 w-28 rounded-full bg-slate-200 mb-4" />
                          <div className="h-6 w-full rounded-md bg-slate-200 mb-2" />
                          <div className="h-6 w-4/5 rounded-md bg-slate-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!isLoading && apiError ? (
                  <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">Unable to read profile</p>
                    <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                      {apiError}
                    </p>
                  </div>
                ) : null}

                {!isLoading && hasResults ? (
                  <div className="mt-8 space-y-6">
                    {/* Primary Hero Choice */}
                    {(() => {
                      const best = headlines.find((h) => h.isBest) || headlines[0];
                      const alternates = headlines.filter((h) => h.tone !== best.tone);
                      const isCopied = copiedTone === best.tone;

                      return (
                        <div className="space-y-6">
                          <article className="relative rounded-[32px] border-2 border-[#3b82f6]/30 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-xl shadow-blue-900/5 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/20 blur-3xl -z-0"></div>
                            <div className="flex items-center justify-between gap-3 mb-6 relative z-10">
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase ${BADGE_CLASSES[best.tone]}`}>
                                  {best.tone}
                                </span>
                                <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  EXPERT BEST CHOICE
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(best)}
                                className="cursor-pointer inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#3b82f6] hover:border-[#3b82f6]/40 transition-all active:scale-95 shadow-sm"
                                aria-label={`Copy ${best.tone} headline`}
                              >
                                {isCopied ? (
                                  <Check className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-[#0d2137] leading-[1.2] tracking-tight relative z-10">
                              {best.headline}
                            </p>
                          </article>

                          {/* Secondary Variations */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            {alternates.map((option) => {
                              const isAltCopied = copiedTone === option.tone;
                              return (
                                <article
                                  key={option.tone}
                                  className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all group"
                                >
                                  <div className="flex items-center justify-between gap-3 mb-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${BADGE_CLASSES[option.tone]}`}>
                                      {option.tone}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopy(option)}
                                      className="cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-400 hover:text-[#0d2137] hover:border-slate-200 transition-all active:scale-95"
                                      aria-label={`Copy ${option.tone} headline`}
                                    >
                                      {isAltCopied ? (
                                        <Check className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-lg font-semibold text-[#213856] leading-snug tracking-tight">
                                    {option.headline}
                                  </p>
                                </article>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="pt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={resetGenerator}
                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-[#0d2137] px-8 py-3 rounded-xl font-bold text-sm transition-all"
                      >
                        Try Another Profile
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0d2137] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Main Footer Container */}
          <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/[0.08] p-10 md:p-14 relative overflow-hidden">
            {/* Subtle light leak for glass effect */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative z-10">
              {/* Left Column — Brand */}
              <div className="lg:max-w-sm space-y-5">
                <div className="flex items-center whitespace-nowrap min-w-0">
                  <Image
                    src="/images/logo-white.svg"
                    alt="logo-white"
                    width={176}
                    height={44}
                    className="h-11 w-auto object-contain"
                  />
                  <span className="font-bold text-base sm:text-lg md:text-xl text-white tracking-tight">
                    LinkedIn
                  </span>
                  <span className="font-normal text-base sm:text-lg md:text-xl text-white/70 tracking-tight ml-1">
                    Optimizer Pro
                  </span>
                </div>
                <p className="text-slate-400 text-[15px] leading-relaxed">
                  Create high-performing LinkedIn content—without overthinking it.
                  Show up consistently with clarity and confidence.
                </p>
              </div>

              {/* Right Columns — Links */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12 lg:justify-items-end">
                <div>
                  <h4 className="font-semibold text-white mb-5 text-[15px]">Product</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/login"
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        Post Generator
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/headline-generator"
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        Headline Generator
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#qrgenerator"
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        QR Generator
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-5 text-[15px]">Explore</h4>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/#pricing"
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        Pricing
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/#blog"
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        Blog
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/login"
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        Get Started
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col items-start sm:items-end col-span-2 sm:col-span-1 mt-6 sm:mt-0">
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                    {/* LinkedIn */}
                    <a
                      href="#"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                      aria-label="LinkedIn"
                    >
                      <span className="font-bold text-[19px] tracking-tighter pb-1 pr-0.5">
                        in
                      </span>
                    </a>
                    {/* X (Twitter) */}
                    <a
                      href="#"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                      aria-label="X"
                    >
                      <svg
                        className="w-[17px] h-[17px]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    {/* Email */}
                    <a
                      href="mailto:contact@optimizerpro.com"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                      aria-label="Email"
                    >
                      <svg
                        className="w-[18px] h-[18px]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-6 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-white/40 text-sm font-normal font-sans">
              © 2026 LinkedIn Optimizer Pro. All rights reserved.
            </span>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-white/40 hover:text-white transition-colors text-sm font-normal font-sans"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-white transition-colors text-sm font-normal font-sans"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function isValidLinkedInUrl(value: string): boolean {
  if (!value) return false;

  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return hostname.endsWith("linkedin.com") && pathname.startsWith("/in/");
  } catch {
    return false;
  }
}
