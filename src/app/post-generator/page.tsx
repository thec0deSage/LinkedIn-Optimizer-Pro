"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Share2,
  Calendar,
  Save,
} from "lucide-react";
import {
  type PostDraft,
  type PostTone,
  type PostLength,
  type CTAType,
  getInitials,
} from "@/lib/post-generator";

const TONE_OPTIONS: PostTone[] = [
  "Professional",
  "Thought Leader",
  "Educational",
  "Empathetic",
];

const LENGTH_OPTIONS: PostLength[] = ["Short", "Medium", "Long"];

const CTA_TYPE_OPTIONS: CTAType[] = [
  "Engagement Question",
  "Call-to-Action",
  "Social Proof",
  "Educational Focus",
  "No CTA",
];

export default function PostGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<PostTone>("Professional");
  const [length, setLength] = useState<PostLength>("Medium");
  const [ctaType, setCTAType] = useState<CTAType>("Engagement Question");
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<PostDraft | null>(null);
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
      const response = await fetch("/api/post-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          tone,
          length,
          ctaType,
          variation: nextVariation,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { draft?: PostDraft; message?: string }
        | null;

      if (!response.ok || !payload?.draft) {
        setApiError(
          payload?.message ??
            "We could not generate a post right now. Please try again."
        );
        return;
      }

      setVariation(nextVariation);
      setDraft(payload.draft);
      setCopied(false);
    } catch {
      setApiError(
        "We hit a network issue while generating your post. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTopic = topic.trim();

    if (!trimmedTopic) {
      setFieldError("Add a topic to generate a post.");
      setApiError("");
      return;
    }

    setFieldError("");
    await requestDraft(variation + 1);
  }

  async function handleRegenerate() {
    if (!topic.trim()) {
      setFieldError("Add a topic to regenerate a post.");
      return;
    }

    setFieldError("");
    await requestDraft(variation + 1);
  }

  async function handleCopy() {
    if (!draft) return;

    try {
      const postContent = `${draft.title}\n\n${draft.content}${
        draft.callToAction ? `\n\n${draft.callToAction}` : ""
      }`;
      await navigator.clipboard.writeText(postContent);
      setCopied(true);
    } catch {
      setApiError("We could not copy the post right now. Please copy it manually.");
    }
  }

  const displayName = "Your Name";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
                Post Generator
              </h1>
            </div>

            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mt-4 mb-10 text-center">
              Generate high-performing LinkedIn posts in your authentic voice.
              Choose your tone, set the length, and create content that resonates
              with your audience.
            </p>

            <div className="grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              {/* Left Panel: Input Configuration */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
                <form onSubmit={handleGenerate} className="space-y-6">
                  {/* Topic Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="topic"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      What's the Topic?
                    </label>
                    <textarea
                      id="topic"
                      value={topic}
                      onChange={(event) => {
                        setTopic(event.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      placeholder="e.g. The impact of AI on creative workflows, Tips for writing compelling content..."
                      rows={4}
                      className={`w-full resize-none rounded-xl border bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                        fieldError
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-[#006edc]"
                      }`}
                    />
                  </div>

                  {/* Tone Selector */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      Tone Profile
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
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

                  {/* Length Selector */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      Length
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {LENGTH_OPTIONS.map((option) => {
                        const isSelected = option === length;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setLength(option)}
                            className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-all active:scale-[0.99] ${
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

                  {/* CTA Type Selector */}
                  <div className="space-y-3">
                    <label
                      htmlFor="cta-type"
                      className="text-sm font-semibold text-slate-700"
                    >
                      CTA Type
                    </label>
                    <select
                      id="cta-type"
                      value={ctaType}
                      onChange={(event) =>
                        setCTAType(event.target.value as CTAType)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors focus:border-[#006edc] cursor-pointer"
                    >
                      {CTA_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
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
                      Be as specific as possible. The more context you provide, the
                      better your post will resonate with your audience.
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
                        Generating Post...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Post
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

              {/* Right Panel: Preview */}
              <div className="flex flex-col h-full">
                <div className="rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
                  {/* Header Bar */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-widest text-slate-300">
                      POST PREVIEW
                    </span>
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="flex-1 overflow-auto p-6 sm:p-8 flex flex-col">
                    {draft ? (
                      <div className="space-y-6">
                        {/* LinkedIn Post Card */}
                        <div className="space-y-4 pb-6 border-b border-slate-200">
                          {/* Author Info */}
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#005bb8] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                              {getInitials(displayName)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">
                                {displayName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Just now
                              </p>
                            </div>
                          </div>

                          {/* Post Content */}
                          <div className="space-y-3">
                            <h3 className="text-base font-bold text-slate-900 leading-snug">
                              {draft.title}
                            </h3>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {draft.content}
                            </p>
                            {draft.callToAction && (
                              <p className="text-sm text-slate-600 italic leading-relaxed">
                                {draft.callToAction}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Engagement Prediction */}
                        {draft.engagementPrediction && (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                              Predicted Engagement
                            </p>
                            <div className="grid gap-3 grid-cols-3">
                              <div className="rounded-lg bg-slate-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <TrendingUp className="h-4 w-4 text-blue-600" />
                                  <span className="text-lg font-bold text-slate-900">
                                    {draft.engagementPrediction.likes}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">Likes</p>
                              </div>
                              <div className="rounded-lg bg-slate-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <MessageCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-lg font-bold text-slate-900">
                                    {draft.engagementPrediction.comments}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">Comments</p>
                              </div>
                              <div className="rounded-lg bg-slate-50 p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                  <Share2 className="h-4 w-4 text-purple-600" />
                                  <span className="text-lg font-bold text-slate-900">
                                    {draft.engagementPrediction.shares}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600">Shares</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                          <button
                            onClick={() => setDraft(null)}
                            disabled={isLoading}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99] disabled:opacity-50"
                          >
                            <RefreshCcw className="h-4 w-4" />
                            <span className="hidden sm:inline">Regenerate</span>
                            <span className="sm:hidden">New</span>
                          </button>
                          <button
                            onClick={handleCopy}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A66C2] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#005bb8] active:scale-[0.99]"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                <span className="hidden sm:inline">Copied!</span>
                                <span className="sm:hidden">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span className="hidden sm:inline">Copy Post</span>
                                <span className="sm:hidden">Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Bottom Action Row */}
                        <div className="flex gap-3">
                          <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99]">
                            <Save className="h-4 w-4" />
                            <span className="hidden sm:inline">Save Draft</span>
                            <span className="sm:hidden">Save</span>
                          </button>
                          <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.99]">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Schedule</span>
                            <span className="sm:hidden">Plan</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Your post preview will appear here
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Fill in the form and hit Generate to see your post
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
