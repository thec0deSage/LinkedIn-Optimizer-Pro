"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Link2,
  LoaderCircle,
  Menu,
  QrCode,
  X,
} from "lucide-react";

type QrFormat = "png" | "svg";

type QrSizeOption = {
  id: string;
  label: string;
  pixels: number;
};

type ColorPreset = {
  id: string;
  label: string;
  foregroundColor: string;
  backgroundColor: string;
  swatchClassName: string;
};

type GeneratedQr = {
  profileUrl: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  requestId: number;
};

const SIZE_OPTIONS: QrSizeOption[] = [
  { id: "small", label: "Small (200px)", pixels: 200 },
  { id: "medium", label: "Medium (300px)", pixels: 300 },
  { id: "large", label: "Large (400px)", pixels: 400 },
  { id: "xlarge", label: "Extra Large (512px)", pixels: 512 },
];

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "classic",
    label: "Classic",
    foregroundColor: "#111827",
    backgroundColor: "#FFFFFF",
    swatchClassName: "bg-[#111827]",
  },
  {
    id: "linkedin-blue",
    label: "LinkedIn Blue",
    foregroundColor: "#0A66C2",
    backgroundColor: "#FFFFFF",
    swatchClassName: "bg-[#0A66C2]",
  },
  {
    id: "navy",
    label: "Navy",
    foregroundColor: "#0D2137",
    backgroundColor: "#FFFFFF",
    swatchClassName: "bg-[#0D2137]",
  },
  {
    id: "dark-mode",
    label: "Dark Mode",
    foregroundColor: "#E2E8F0",
    backgroundColor: "#0D2137",
    swatchClassName: "bg-[#334155]",
  },
];

const DEFAULT_PRESET = COLOR_PRESETS[1];

export default function QrGeneratorPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [sizeId, setSizeId] = useState("medium");
  const [selectedPresetId, setSelectedPresetId] = useState(DEFAULT_PRESET.id);
  const [foregroundColor, setForegroundColor] = useState(
    DEFAULT_PRESET.foregroundColor
  );
  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_PRESET.backgroundColor
  );
  const [foregroundInput, setForegroundInput] = useState(
    DEFAULT_PRESET.foregroundColor
  );
  const [backgroundInput, setBackgroundInput] = useState(
    DEFAULT_PRESET.backgroundColor
  );
  const [fieldError, setFieldError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewState, setPreviewState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [generatedQr, setGeneratedQr] = useState<GeneratedQr | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<QrFormat | null>(null);

  const currentSize =
    SIZE_OPTIONS.find((option) => option.id === sizeId) ?? SIZE_OPTIONS[1];
  const previewSrc = generatedQr ? buildQrAssetUrl(generatedQr, "png") : "";
  const hasSuccessfulPreview =
    generatedQr !== null && previewState === "success" && !isGenerating;

  function handlePresetSelect(presetId: string) {
    const preset = COLOR_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setForegroundColor(preset.foregroundColor);
    setBackgroundColor(preset.backgroundColor);
    setForegroundInput(preset.foregroundColor);
    setBackgroundInput(preset.backgroundColor);
    setFieldError("");
  }

  function handleColorPickerChange(
    field: "foreground" | "background",
    nextValue: string
  ) {
    const normalizedValue = normalizeHexColor(
      nextValue,
      field === "foreground" ? foregroundColor : backgroundColor
    );

    if (field === "foreground") {
      setForegroundColor(normalizedValue);
      setForegroundInput(normalizedValue);
      setSelectedPresetId(findMatchingPresetId(normalizedValue, backgroundColor));
    } else {
      setBackgroundColor(normalizedValue);
      setBackgroundInput(normalizedValue);
      setSelectedPresetId(findMatchingPresetId(foregroundColor, normalizedValue));
    }

    setFieldError("");
  }

  function handleHexInputChange(
    field: "foreground" | "background",
    nextValue: string
  ) {
    const sanitizedValue = sanitizeHexTextInput(nextValue);

    if (field === "foreground") {
      setForegroundInput(sanitizedValue);
      const maybeColor = maybeCompleteHexColor(sanitizedValue);
      if (maybeColor) {
        setForegroundColor(maybeColor);
        setSelectedPresetId(findMatchingPresetId(maybeColor, backgroundColor));
      }
    } else {
      setBackgroundInput(sanitizedValue);
      const maybeColor = maybeCompleteHexColor(sanitizedValue);
      if (maybeColor) {
        setBackgroundColor(maybeColor);
        setSelectedPresetId(findMatchingPresetId(foregroundColor, maybeColor));
      }
    }

    setFieldError("");
  }

  function handleHexInputBlur(field: "foreground" | "background") {
    if (field === "foreground") {
      const normalizedValue = normalizeHexColor(foregroundInput, foregroundColor);
      setForegroundColor(normalizedValue);
      setForegroundInput(normalizedValue);
      setSelectedPresetId(findMatchingPresetId(normalizedValue, backgroundColor));
    } else {
      const normalizedValue = normalizeHexColor(backgroundInput, backgroundColor);
      setBackgroundColor(normalizedValue);
      setBackgroundInput(normalizedValue);
      setSelectedPresetId(findMatchingPresetId(foregroundColor, normalizedValue));
    }
  }

  function handlePreviewLoad() {
    setPreviewState("success");
    setIsGenerating(false);
    setApiError("");
  }

  function handlePreviewError() {
    setPreviewState("error");
    setIsGenerating(false);
    setApiError(
      "We could not generate this QR code right now. Please try again in a moment."
    );
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldError("");
    setApiError("");

    const normalizedUrl = normalizeLinkedInUrl(profileUrl);
    if (!normalizedUrl) {
      setFieldError("Please enter a valid public LinkedIn profile URL.");
      return;
    }

    const nextForegroundColor = normalizeHexColor(foregroundInput, foregroundColor);
    const nextBackgroundColor = normalizeHexColor(backgroundInput, backgroundColor);

    if (nextForegroundColor.toLowerCase() === nextBackgroundColor.toLowerCase()) {
      setFieldError(
        "Choose different foreground and background colors so the QR code stays readable."
      );
      return;
    }

    setForegroundColor(nextForegroundColor);
    setBackgroundColor(nextBackgroundColor);
    setForegroundInput(nextForegroundColor);
    setBackgroundInput(nextBackgroundColor);
    setSelectedPresetId(
      findMatchingPresetId(nextForegroundColor, nextBackgroundColor)
    );
    setIsGenerating(true);
    setPreviewState("loading");
    setGeneratedQr({
      profileUrl: normalizedUrl,
      size: currentSize.pixels,
      foregroundColor: nextForegroundColor,
      backgroundColor: nextBackgroundColor,
      requestId: Date.now(),
    });
  }

  async function handleDownload(format: QrFormat) {
    if (!generatedQr) return;

    setDownloadFormat(format);
    setApiError("");

    try {
      const response = await fetch(buildQrAssetUrl(generatedQr, format, true));
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `linkedin-qr-code-${generatedQr.size}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setApiError("We could not download your QR code. Please try again.");
    } finally {
      setDownloadFormat(null);
    }
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

      <main className="flex-1 pt-20">
        <section
          className="relative overflow-hidden py-14 md:py-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        >
          <div className="absolute top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-200/20 blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
              <h1 className="text-3xl md:text-5xl font-bold text-[#213856] tracking-tight leading-tight">
                LinkedIn QR Code Generator
              </h1>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mt-4">
                Create a custom QR code for your LinkedIn profile. Perfect for
                business cards, resumes, networking events, and professional
                presentations.
              </p>
            </div>

            <div className="grid gap-6 items-stretch lg:grid-cols-2">
              <div className="h-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="qr-profile-url"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                      <Link2 className="w-4 h-4 text-slate-400" />
                      Your LinkedIn URL
                    </label>
                    <input
                      id="qr-profile-url"
                      type="url"
                      inputMode="url"
                      placeholder="https://linkedin.com/in/your-profile"
                      value={profileUrl}
                      onChange={(event) => {
                        setProfileUrl(event.target.value);
                        if (fieldError) setFieldError("");
                      }}
                      className={`w-full rounded-xl border bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 ${
                        fieldError
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-[#006edc]"
                      }`}
                      aria-invalid={fieldError ? "true" : "false"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="qr-size"
                      className="text-sm font-semibold text-slate-700 block"
                    >
                      QR Code Size
                    </label>
                    <div className="relative">
                      <select
                        id="qr-size"
                        value={sizeId}
                        onChange={(event) => setSizeId(event.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 pr-11 text-sm text-slate-700 outline-none transition-colors focus:border-[#006edc]"
                      >
                        {SIZE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      Color Presets
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {COLOR_PRESETS.map((preset) => {
                        const isSelected = selectedPresetId === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset.id)}
                            className={`cursor-pointer rounded-xl border px-4 py-3 text-left transition-all ${
                              isSelected
                                ? "border-[#3b82f6] bg-blue-50 text-[#0d2137] shadow-[0_0_0_1px_rgba(59,130,246,0.2)]"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`h-3 w-3 rounded-full border border-slate-200 ${preset.swatchClassName}`}
                              />
                              <span className="text-sm font-semibold">
                                {preset.label}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <ColorField
                      label="Foreground Color"
                      value={foregroundColor}
                      inputValue={foregroundInput}
                      onColorChange={(value) =>
                        handleColorPickerChange("foreground", value)
                      }
                      onInputChange={(value) =>
                        handleHexInputChange("foreground", value)
                      }
                      onInputBlur={() => handleHexInputBlur("foreground")}
                    />
                    <ColorField
                      label="Background Color"
                      value={backgroundColor}
                      inputValue={backgroundInput}
                      onColorChange={(value) =>
                        handleColorPickerChange("background", value)
                      }
                      onInputChange={(value) =>
                        handleHexInputChange("background", value)
                      }
                      onInputBlur={() => handleHexInputBlur("background")}
                    />
                  </div>

                  {fieldError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-700">
                        Check your details
                      </p>
                      <p className="text-sm text-red-600 mt-1">{fieldError}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      High-contrast color combinations scan best on printed and
                      digital materials.
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-900/10 transition-all hover:bg-[#005bb8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isGenerating ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Generating QR Code...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-5 w-5" />
                        Generate QR Code
                      </>
                    )}
                  </button>

                  {previewState === "success" ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Your QR code is ready
                          </p>
                          <p className="text-sm text-emerald-700 mt-1">
                            Download a crisp PNG or SVG for print, slides, and
                            event materials.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

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

              <div className="h-full">
                <div className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/30 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#0A66C2]" />
                      <span className="text-sm font-semibold text-slate-800">
                        Preview
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload("png")}
                      disabled={!hasSuccessfulPreview || downloadFormat !== null}
                      className="cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Download PNG"
                    >
                      {downloadFormat === "png" ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col px-6 py-7">
                    <div className="flex flex-1 min-h-[280px] items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/80 p-6 sm:min-h-[320px] lg:min-h-[420px]">
                      {!generatedQr ? (
                        <div className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <QrCode className="h-8 w-8 text-slate-300" />
                          </div>
                          <p className="mt-5 text-base font-semibold text-slate-500">
                            Enter your LinkedIn URL
                          </p>
                          <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-slate-400">
                            Generate a QR code preview sized for print-ready
                            downloads.
                          </p>
                        </div>
                      ) : previewState === "error" ? (
                        <div className="text-center">
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                            <Download className="h-7 w-7 text-amber-500" />
                          </div>
                          <p className="mt-5 text-base font-semibold text-slate-700">
                            Preview unavailable
                          </p>
                          <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-slate-500">
                            Please try again. We were not able to render the QR
                            image just yet.
                          </p>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <Image
                            key={generatedQr.requestId}
                            src={previewSrc}
                            alt="Generated LinkedIn QR code"
                            width={generatedQr.size}
                            height={generatedQr.size}
                            unoptimized
                            sizes="(min-width: 640px) 256px, 208px"
                            onLoad={handlePreviewLoad}
                            onError={handlePreviewError}
                            className={`h-52 w-52 rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-opacity duration-300 sm:h-64 sm:w-64 ${
                              previewState === "success" ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {previewState === "loading" ? (
                            <div className="absolute inset-0 flex items-center justify-center rounded-[24px] bg-white/85 backdrop-blur-sm">
                              <div className="flex flex-col items-center gap-3 text-center">
                                <LoaderCircle className="h-6 w-6 animate-spin text-[#0A66C2]" />
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    Building your QR code
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Applying size and color settings.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownload("png")}
                        disabled={!hasSuccessfulPreview || downloadFormat !== null}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#213856] transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {downloadFormat === "png" ? "Preparing..." : "PNG"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload("svg")}
                        disabled={!hasSuccessfulPreview || downloadFormat !== null}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-[#213856] transition-all hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {downloadFormat === "svg" ? "Preparing..." : "SVG"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0d2137] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/[0.08] p-10 md:p-14 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative z-10">
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
                  Create high-performing LinkedIn content without overthinking it.
                  Show up consistently with clarity and confidence.
                </p>
              </div>

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12 lg:justify-items-end">
                <div>
                  <h4 className="font-semibold text-white mb-5 text-[15px]">
                    Product
                  </h4>
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
                        href="/qr-generator"
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        QR Generator
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
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-5 text-[15px]">
                    Explore
                  </h4>
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
                    <a
                      href="#"
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 group"
                      aria-label="LinkedIn"
                    >
                      <span className="font-bold text-[19px] tracking-tighter pb-1 pr-0.5">
                        in
                      </span>
                    </a>
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

          <div className="py-6 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-white/40 text-sm font-normal font-sans">
              (c) 2026 LinkedIn Optimizer Pro. All rights reserved.
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

type ColorFieldProps = {
  label: string;
  value: string;
  inputValue: string;
  onColorChange: (value: string) => void;
  onInputChange: (value: string) => void;
  onInputBlur: () => void;
};

function ColorField({
  label,
  value,
  inputValue,
  onColorChange,
  onInputChange,
  onInputBlur,
}: ColorFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700 block">{label}</label>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 focus-within:border-[#006edc] transition-colors">
        <input
          type="color"
          value={value}
          onChange={(event) => onColorChange(event.target.value)}
          className="h-8 w-8 cursor-pointer rounded-md border border-slate-200 bg-transparent p-0"
          aria-label={label}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onBlur={onInputBlur}
          className="w-full bg-transparent text-sm font-semibold uppercase tracking-wide text-slate-600 outline-none placeholder:text-slate-400"
          placeholder="#FFFFFF"
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function buildQrAssetUrl(
  generatedQr: GeneratedQr,
  format: QrFormat,
  shouldDownload = false
) {
  const params = new URLSearchParams({
    data: generatedQr.profileUrl,
    size: String(generatedQr.size),
    fg: generatedQr.foregroundColor,
    bg: generatedQr.backgroundColor,
    format,
    t: String(generatedQr.requestId),
  });

  if (shouldDownload) {
    params.set("download", "1");
  }

  return `/api/qr-code?${params.toString()}`;
}

function normalizeLinkedInUrl(rawValue: string) {
  if (!rawValue.trim()) return "";

  const value = /^https?:\/\//i.test(rawValue.trim())
    ? rawValue.trim()
    : `https://${rawValue.trim()}`;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.replace(/^www\./, "").toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, "");

    if (!hostname.endsWith("linkedin.com") || !pathname.startsWith("/in/")) {
      return "";
    }

    parsed.protocol = "https:";
    parsed.hash = "";
    parsed.search = "";

    return `${parsed.origin}${pathname}`;
  } catch {
    return "";
  }
}

function sanitizeHexTextInput(value: string) {
  const nextValue = value.trim().replace(/[^#0-9a-fA-F]/g, "");
  if (!nextValue) return "";

  const normalized = nextValue.startsWith("#") ? nextValue : `#${nextValue}`;
  return normalized.slice(0, 7).toUpperCase();
}

function maybeCompleteHexColor(value: string) {
  return /^#[0-9A-F]{6}$/i.test(value) ? value.toUpperCase() : "";
}

function normalizeHexColor(value: string, fallback: string) {
  const maybeColor = maybeCompleteHexColor(sanitizeHexTextInput(value));
  return maybeColor || fallback.toUpperCase();
}

function findMatchingPresetId(foreground: string, background: string) {
  const match = COLOR_PRESETS.find(
    (preset) =>
      preset.foregroundColor.toLowerCase() === foreground.toLowerCase() &&
      preset.backgroundColor.toLowerCase() === background.toLowerCase()
  );

  return match?.id ?? "";
}
