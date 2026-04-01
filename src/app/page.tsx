"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MarketingNav } from "@/components/marketing-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  Bot,
  Sparkles,
  BarChart3,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  PenTool,
  Check,
  ChevronDown,
  ArrowUpRight,
  Plus,
  Mail
} from "lucide-react";

const HOME_DESKTOP_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "FAQs", href: "#faqs" },
  { label: "Pricing", href: "#pricing" },
];

const HOME_MOBILE_LINKS = [
  { label: "Features", href: "#features" },
  { label: "FAQs", href: "#faqs" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "#blog" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <MarketingNav
        desktopLinks={HOME_DESKTOP_LINKS}
        mobileLinks={HOME_MOBILE_LINKS}
      />

      <main className="flex-1 pt-20 pb-20">
        {/* Hero Section */}
        <section className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-14 text-center sm:py-16 lg:flex-row lg:items-center lg:gap-14 lg:py-24 lg:text-left xl:gap-16 xl:py-32">

          <div className="relative z-10 w-full max-w-2xl space-y-8 lg:w-[min(48%,34rem)] lg:max-w-none">


            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-[family-name:var(--font-open-sans)] text-4xl font-[700] leading-[1.05] tracking-tight text-[#213856] sm:text-5xl lg:text-6xl"
            >
              {`Optimize your `}<span className="text-[#0d2137]">LinkedIn</span>{` reach`}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0"
            >
              Create high-performing content in your authentic voice consistently and at scale, designed to engage your audience, build trust, and drive measurable growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-stretch gap-3 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center lg:justify-start"
            >
              <Link href="/login" className="cursor-pointer w-full rounded-xl bg-[#0d2137] px-10 py-3 text-center text-lg font-semibold tracking-wide text-white shadow-lg shadow-slate-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#153456] hover:shadow-xl active:scale-[0.98] sm:w-auto sm:min-w-56">
                Start for free
              </Link>
              <a href="#how-it-works" className="cursor-pointer w-full rounded-xl bg-transparent px-8 py-3 text-center text-lg font-semibold tracking-wide text-[#0d2137] shadow-[0_0_0_1px_#0d2137] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_#0d2137] active:scale-[0.98] sm:w-auto sm:min-w-56">
                See how it works
              </a>
            </motion.div>


          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full max-w-2xl perspective-1000 lg:w-[min(52%,38rem)] lg:max-w-none"
          >
            {/* Cinematic Mockup UI */}
            <div className="relative z-10 bg-white rounded-xl shadow-2xl border border-slate-200/60 overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Mockup Topbar */}
              <div className="h-10 border-b border-slate-100 bg-slate-50/50 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                </div>
              </div>
              {/* Mockup Content */}
              <div className="bg-slate-50 border-t border-slate-200/50 p-2 sm:p-4">
                <img src="/images/analytics.png" alt="LinkedIn Analytics" className="w-full h-auto rounded-lg shadow-sm border border-slate-200" />
              </div>
            </div>

            {/* Background glowing blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/20 blur-[80px] rounded-full -z-10"></div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-400/10 blur-[60px] rounded-full -z-10"></div>
          </motion.div>
        </section>

        {/* Problems Section - Sleek Dark Mode */}
        <section id="problems" className="bg-[#0d2137] py-24 md:py-32 overflow-hidden border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-6">
            <div
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#fff] mb-4 tracking-tight">
                Common LinkedIn problems we solve
              </h2>
              <p className="text-[#fff] text-lg">Struggling on LinkedIn? You&apos;re not alone</p>

            </div>

            <div className="flex flex-col gap-5 max-w-4xl mx-auto">

              {/* Problem 1 - Left */}
              <div className="flex items-center gap-5">
                <Image
                  src="/images/image-2.jpg"
                  alt="The Founder"
                  width={56}
                  height={56}
                  sizes="(min-width: 768px) 56px, 48px"
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shrink-0 shadow-lg border border-slate-700/50"
                />
                <div className="flex flex-col w-full">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm text-white/95 p-5 px-7 md:px-8 rounded-[32px] font-medium text-[15px] leading-relaxed w-fit max-w-[85%] shadow-sm">
                    I know LinkedIn matters. I just don&apos;t have a system that works.
                  </div>
                </div>
              </div>

              {/* Problem 2 - Right */}
              <div className="flex items-center gap-5 justify-end">
                <div className="flex flex-col w-full items-end">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm text-white/95 p-5 px-7 md:px-8 rounded-[32px] font-medium text-[15px] leading-relaxed w-fit max-w-[85%] shadow-sm">
                    I struggle to come up with ideas that are relevant, consistent, and engaging.
                  </div>
                </div>
                <Image
                  src="/images/image-3.jpg"
                  alt="The Creator"
                  width={56}
                  height={56}
                  sizes="(min-width: 768px) 56px, 48px"
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shrink-0 shadow-lg border border-slate-700/50"
                />
              </div>

              {/* Problem 3 - Left */}
              <div className="flex items-center gap-5">
                <Image
                  src="/images/image-1.jpg"
                  alt="The Marketer"
                  width={56}
                  height={56}
                  sizes="(min-width: 768px) 56px, 48px"
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shrink-0 shadow-lg border border-slate-700/50"
                />
                <div className="flex flex-col w-full">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm text-white/95 p-5 px-7 md:px-8 rounded-[32px] font-medium text-[15px] leading-relaxed w-fit max-w-[85%] shadow-sm">
                    My content doesn’t reach people or spark meaningful interaction.
                  </div>
                </div>
              </div>

              {/* Problem 4 - Right */}
              <div className="flex items-center gap-5 justify-end">
                <div className="flex flex-col w-full items-end">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm text-white/95 p-5 px-7 md:px-8 rounded-[32px] font-medium text-[15px] leading-relaxed w-fit max-w-[85%] shadow-sm">
                    I want to stay consistent, but my workload gets in the way.
                  </div>
                </div>
                <Image
                  src="/images/image-4.jpeg"
                  alt="The Professional"
                  width={56}
                  height={56}
                  sizes="(min-width: 768px) 56px, 48px"
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shrink-0 shadow-lg border border-slate-700/50"
                />
              </div>

            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="bg-white py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#213856] mb-4 tracking-tight">
                Write Better. Grow Faster.
              </h2>
              <p className="text-slate-600 text-lg">Fix What’s Slowing Your LinkedIn Growth</p>

            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Feature 1: Content Creation */}
              <div
                className="group relative flex flex-col bg-[#F9FAFB] rounded-[30px] overflow-hidden border border-slate-100/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500"
              >
                <div className="p-8 pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-semibold tracking-wide text-slate-600 shadow-sm">
                      Content Creation
                    </span>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#213856] mb-4 leading-tight">
                    Authentic AI That Sounds Like You
                  </h3>
                </div>
                <div className="relative mx-0 mt-auto overflow-hidden rounded-t-[24px] bg-slate-200/50 p-4 pt-6 sm:p-5 sm:pt-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"></div>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/70 bg-white/60 shadow-2xl md:aspect-[4/3]">
                    <Image
                      src="/images/content-creation.png"
                      alt="Content Creation Mockup"
                      fill
                      sizes="(min-width: 1024px) 29vw, (min-width: 640px) 80vw, 92vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Feature 2: Analytics */}
              <div
                className="group relative flex flex-col bg-[#F9FAFB] rounded-[32px] overflow-hidden border border-slate-100/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500"
              >
                <div className="p-8 pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-semibold tracking-wide text-slate-600 shadow-sm">
                      Growth Optimization
                    </span>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#213856] mb-4 leading-tight">
                    Content That Drives Real Engagement
                  </h3>
                </div>
                <div className="relative mx-0 mt-auto overflow-hidden rounded-t-[24px] bg-slate-200/50 p-4 pt-6 sm:p-5 sm:pt-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"></div>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/70 bg-white/60 shadow-2xl md:aspect-[4/3]">
                    <Image
                      src="/images/analytics-v2.png"
                      alt="Analytics Mockup"
                      fill
                      sizes="(min-width: 1024px) 29vw, (min-width: 640px) 80vw, 92vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Feature 3: Teams */}
              <div
                className="group relative flex flex-col bg-[#F9FAFB] rounded-[32px] overflow-hidden border border-slate-100/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-500"
              >
                <div className="p-8 pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-semibold tracking-wide text-slate-600 shadow-sm">
                      Workflow Automation
                    </span>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-slate-400">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#213856] mb-4 leading-tight">
                    Zero-Friction Content Pipeline
                  </h3>
                </div>
                <div className="relative mx-0 mt-auto overflow-hidden rounded-t-[24px] bg-slate-200/50 p-4 pt-6 sm:p-5 sm:pt-8">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent"></div>
                  <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-white/70 bg-white/60 shadow-2xl md:aspect-[4/3]">
                    <Image
                      src="/images/teams-kanban.png"
                      alt="Teams Mockup"
                      fill
                      sizes="(min-width: 1024px) 29vw, (min-width: 640px) 80vw, 92vw"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative flex items-center justify-center overflow-hidden border-y border-slate-200 bg-slate-50 py-20 md:py-28 xl:py-32">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px] -z-0"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-100/40 rounded-full blur-[100px] -z-0"></div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="grid gap-10 rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8 md:gap-12 md:p-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12 xl:gap-16 xl:p-16">

              {/* Left Column */}
              <div className="relative flex w-full max-w-xl flex-col items-start space-y-6 lg:max-w-none">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50/80 border border-slate-200 text-sm font-semibold text-slate-600 backdrop-blur-sm shadow-sm">
                  <span className="text-slate-400 mr-1.5">How</span> Optimizer Pro Works
                </div>

                <h2 className="mb-1 text-4xl font-bold leading-tight tracking-tight text-[#213856] md:text-5xl">
                  How it works
                </h2>

                <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                  Your personal brand on autopilot in three simple steps.
                </p>

                <div className="flex w-full flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap lg:max-w-md">
                  <a href="/login" className="cursor-pointer flex h-11 w-full items-center justify-center rounded-xl bg-[#0d2137] text-base font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#153456] hover:shadow-md active:scale-[0.98] sm:w-auto sm:min-w-52 sm:flex-1">
                    Try Optimizer Pro
                  </a>
                  <a href="#faqs" className="cursor-pointer flex h-11 w-full items-center justify-center rounded-xl bg-transparent text-base font-semibold text-[#0d2137] shadow-[0_0_0_1px_#0d2137] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_#0d2137] active:scale-[0.98] sm:w-auto sm:min-w-52 sm:flex-1">
                    Learn more
                  </a>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex w-full flex-col gap-4">
                {/* Step 1 */}
                <div className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-[30px] -z-0"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 relative z-10">
                    <span className="px-3 py-1 rounded-[7px] bg-slate-200/50 text-[11px] font-bold tracking-wider text-slate-600  shrink-0 inline-flex items-center justify-center">
                      Step 1
                    </span>
                    <h3 className="text-xl font-bold text-[#213856]">Connect & Analyze</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed relative z-10 mt-2 sm:mt-0 text-[15px]">
                    Securely connect your profile. AI scans your past content to learn your unique voice, tone, and format.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full blur-[30px] -z-0"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 relative z-10">
                    <span className="px-3 py-1 rounded-[7px] bg-slate-200/50 text-[11px] font-bold tracking-wider text-slate-600 shrink-0 inline-flex items-center justify-center">
                      Step 2
                    </span>
                    <h3 className="text-xl font-bold text-[#213856]">Generate Content</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed relative z-10 mt-2 sm:mt-0 text-[15px]">
                    Input a topic or link. The AI drafts a flawless LinkedIn post that sounds perfectly like you, in seconds.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-32 h-32 bg-pink-50/80 rounded-full blur-[40px] -z-0"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 relative z-10">
                    <span className="px-3 py-1 rounded-[7px] bg-slate-200/50 text-[11px] font-bold tracking-wider text-slate-600 shrink-0 inline-flex items-center justify-center">
                      Step 3
                    </span>
                    <h3 className="text-xl font-bold text-[#213856]">Review & Publish</h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed relative z-10 mt-2 sm:mt-0 text-[15px]">
                    Make final tweaks in our rich editor, preview across devices, and schedule for peak engagement times.
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faqs" className="py-24 md:py-32 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#213856] mb-4 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-slate-600 text-lg">Everything you need to get started with Optimizer Pro and grow with intent.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "Will the content truly sound like me?",
                  answer: "Yes! Your writing isn’t approximated, it’s modeled. By analyzing your past LinkedIn posts, the system builds a living tone profile that captures how you think, structure ideas, and express nuance."
                },
                {
                  question: "How much time can I realistically expect to save?",
                  answer: "What once required extended focus is reduced to a streamlined flow measured in minutes. You move from idea to publish with clarity, speed, and control, without sacrificing depth or quality."
                },
                {
                  question: "Will this meaningfully improve my engagement?",
                  answer: "Every feature is engineered around one outcome: measurable engagement growth. From high-converting hooks to structurally optimized posts, the system helps you consistently produce content designed to capture attention and drive interaction."
                },
                {
                  question: "Do I still need other tools to manage my content workflow?",
                  answer: "No! This is not another tool it’s your content system. Creation, refinement, scheduling, and management exist within a single, cohesive environment, designed to replace fragmented workflows with quiet, focused execution."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-transparent rounded-xl overflow-hidden bg-[#0d2137] hover:bg-[#153456] transition-all shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  >
                    <span className="font-semibold text-white text-[17px]">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <p className="text-slate-200 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#213856] mb-4 tracking-tight">Simple, transparent pricing</h2>
              <p className="text-slate-600 text-lg">Choose a plan that scales with your content—simple, transparent, and built for consistency.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
              {/* Starter Tier */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-8 flex flex-col transition-transform hover:-translate-y-1 duration-300">
                <div className="mb-2">
                  <h3 className="text-2xl font-bold text-[#0d2137] mb-2">Starter</h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed">For individuals getting started with consistent content</p>
                </div>
                <div className="mb-8 mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-[700] text-[#0d2137] tracking-tight">$5</span>
                  <span className="text-slate-500 font-medium text-xl">/month</span>
                </div>
                <div className="flex-1 space-y-4 mb-10">
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">AI Post Generator (25 posts/month)</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Basic Tone Matching</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Hook Generator (limited)</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Access to Editor</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Manual post export</span>
                  </div>
                </div>
                <button className="cursor-pointer w-full bg-[#0d2137] hover:bg-[#153456] text-white px-6 py-3.5 rounded-full font-semibold transition-all duration-300 mt-auto">
                  Get Started
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-gradient-to-b from-[#3b82f6] to-[#153456] rounded-[32px] flex flex-col relative transform lg:-translate-y-4 shadow-2xl shadow-[#12243C]/20 transition-transform hover:-translate-y-5 duration-300">
                <div className="py-3 text-center text-white text-[13px] font-bold tracking-widest uppercase">
                  Most Popular
                </div>
                <div className="bg-[#0d2137] rounded-[30px] p-8 m-[2px] mt-0 flex flex-col flex-1">
                  <div className="mb-2">
                    <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                    <p className="text-slate-400 text-[15px] leading-relaxed">For creators serious about growth and consistency</p>
                  </div>
                  <div className="mb-8 mt-6 flex items-baseline gap-2">
                    <span className="text-5xl font-[700] text-white tracking-tight">$19</span>
                    <span className="text-slate-400 font-medium text-xl">/month</span>
                  </div>
                  <div className="flex-1 space-y-4 mb-10">
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-slate-200 text-[15px]">Increased AI generation credits</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-slate-200 text-[15px]">Advanced Tone Matching</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-slate-200 text-[15px]">Unlimited Hook Variations</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-slate-200 text-[15px]">Content Inspiration Engine</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-slate-200 text-[15px]">Post Scheduling + Calendar</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span className="text-slate-200 text-[15px]">Media Library access</span>
                    </div>
                  </div>
                  <button className="cursor-pointer w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white px-9 py-3 rounded-full font-semibold text-base transition-all active:scale-95 shadow-[0_8px_20px_-4px_rgba(59,130,246,0.3)]">
                    Upgrade to Pro
                  </button>
                </div>
              </div>

              {/* Elite Tier */}
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-8 flex flex-col transition-transform hover:-translate-y-1 duration-300">
                <div className="mb-2">
                  <h3 className="text-2xl font-bold text-[#0d2137] mb-2">Elite</h3>
                  <p className="text-slate-600 text-[15px] leading-relaxed">For professionals building a high-leverage personal brand</p>
                </div>
                <div className="mb-8 mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-[700] text-[#0d2137] tracking-tight">$30</span>
                  <span className="text-slate-500 font-medium text-xl">/month</span>
                </div>
                <div className="flex-1 space-y-4 mb-10">
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Unlimited AI content generation</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Priority AI response speed</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Full Content System</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Advanced content optimization</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Scheduled post management controls</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-slate-700 text-[15px]">Early access to new features</span>
                  </div>
                </div>
                <button className="cursor-pointer w-full bg-[#0d2137] hover:bg-[#153456] text-white px-6 py-3.5 rounded-full font-semibold transition-all duration-300 mt-auto">
                  Go Elite
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            {/* Main CTA Card */}
            <div
              className="relative rounded-[48px] overflow-hidden p-8 md:p-16 mb-10 flex flex-col lg:flex-row items-center justify-between gap-12"
              style={{
                backgroundColor: "#0d2137",
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 20% 50%, rgba(0,110,220,0.1) 0%, transparent 50%)",
                }}
              />

              <div className="relative z-10 flex-1 text-left">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight max-w-xl">
                  Turn your expertise into<br />measurable influence.
                </h2>
                <p className="text-slate-400 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed font-medium">
                  Build your LinkedIn presence, together or independently
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  <div className="flex items-center gap-2 text-white/90 font-medium">
                    <Plus className="w-4 h-4 text-[#3b82f6]" />
                    <span>AI Post Generator</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 font-medium">
                    <Plus className="w-4 h-4 text-[#3b82f6]" />
                    <span>Hook Generator</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 font-medium">
                    <Plus className="w-4 h-4 text-[#3b82f6]" />
                    <span>Scheduling</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 shrink-0">
                <Link
                  href="/login"
                  className="cursor-pointer inline-flex items-center justify-center bg-[#3b82f6] hover:bg-[#2563eb] text-white px-10 py-3 rounded-full font-semibold text-base transition-all active:scale-95 shadow-[0_8px_20px_-4px_rgba(59,130,246,0.3)]"
                >
                  Try Optimizer Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}

