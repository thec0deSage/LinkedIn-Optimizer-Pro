"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  BarChart3,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  PenTool,
  Menu,
  X,
  Check,
  ChevronDown
} from "lucide-react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-2 z-10">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold pb-0.5">
              in
            </div>
            <span className="font-bold text-xl text-[#00366b] tracking-tight">LinkedIn Optimizer Pro</span>
          </div>

          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#faqs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">FAQs</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
          </div>

          <div className="hidden lg:flex items-center gap-3 z-10">
            <Link href="/login" className="cursor-pointer bg-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-md font-semibold text-sm transition-all border border-transparent">
              Login
            </Link>
            <Link href="/signup" className="cursor-pointer bg-[#006edc] hover:bg-[#0060DF] text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-all shadow-sm active:scale-95">
              Sign Up
            </Link>
          </div>

          <div className="lg:hidden flex items-center z-10">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 inset-x-0 bg-white border-b border-slate-200 px-6 py-6 flex flex-col gap-6 shadow-xl w-full">
            <div className="flex flex-col gap-4">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600">Features</a>
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600">How it Works</a>
              <a href="#faqs" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600">FAQs</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-semibold text-slate-600">Pricing</a>
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block cursor-pointer bg-transparent text-slate-600 hover:bg-slate-100 px-5 py-3 rounded-md font-semibold text-base transition-all border border-slate-200 w-full text-center">
                Login
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block cursor-pointer bg-[#006edc] hover:bg-[#0060DF] text-white px-5 py-3 rounded-md font-semibold text-base transition-all shadow-sm active:scale-95 w-full text-center">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 pt-20 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-32 text-center md:text-left flex flex-col md:flex-row items-center gap-12">

          <div className="md:w-1/2 space-y-8 relative z-10">


            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`font-[family-name:var(--font-open-sans)] text-5xl md:text-6xl font-[700] text-slate-900 tracking-tight leading-[1.1]`}
            >
              Optimize your<span className="text-[#00366b]"> LinkedIn </span> reach.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-600 max-w-xl"
            >
              Create high-performing content in your authentic voice consistently and at scale, designed to engage your audience, build trust, and drive measurable growth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-4 flex justify-center md:justify-start"
            >
              <Link href="/signup" className="cursor-pointer w-full sm:w-auto bg-[#006edc] hover:bg-[#0060DF] text-white px-14 py-2.5 rounded-md font-semibold text-[18px] tracking-wide transition-colors text-center">
                Start for free
              </Link>
            </motion.div>


          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:w-1/2 relative perspective-1000"
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

        {/* Feature Section */}
        <section id="features" className="bg-white border-y border-slate-200 py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything you need to grow your influence</h2>
              <p className="text-slate-600 text-lg">Stop staring at a blank page. Scale your personal brand with powerful AI that genuinely understands how you write.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-slate-50/50 border border-slate-200 p-8 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Authentic AI That Sounds Like You</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our Tone Matching Engine analyzes your past posts to replicate your unique writing style, vocabulary, and sentence patterns. Keep your brand authentic.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-slate-50/50 border border-slate-200 p-8 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Content That Drives Real Engagement</h3>
                <p className="text-slate-600 leading-relaxed">
                  Generate dynamic hooks designed for LinkedIn's algorithm. With curiosity-driven to contrary angles, ensure your content gets the attention it deserves.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-slate-50/50 border border-slate-200 p-8 rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">End-to-End Content Workflow</h3>
                <p className="text-slate-600 leading-relaxed">
                  From discovering trending ideas to rich-text editing and scheduled publishing, manage your entire content lifecycle in one centralized CMS workspace.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">How it works</h2>
              <p className="text-slate-600 text-lg">Your personal brand on autopilot in three simple steps.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-[44px] left-[16.66%] right-[16.66%] h-0.5 bg-slate-200 -z-0"></div>

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-md shadow-slate-200/50 mb-6 font-bold text-2xl text-blue-600">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Connect & Analyze</h3>
                <p className="text-slate-600 leading-relaxed">Securely connect your profile. AI scans your past content to learn your unique voice, tone, and format.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-md shadow-slate-200/50 mb-6 font-bold text-2xl text-blue-600">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Generate Content</h3>
                <p className="text-slate-600 leading-relaxed">Input a topic or link. The AI drafts a flawless LinkedIn post that sounds perfectly like you, in seconds.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#006edc] rounded-full border border-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 font-bold text-2xl text-white">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Review & Publish</h3>
                <p className="text-slate-600 leading-relaxed">Make final tweaks in our rich editor, preview across devices, and schedule for peak engagement times.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faqs" className="py-24 bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-slate-600 text-lg">Everything you need to know about the product and billing.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "Is this safe to use with my LinkedIn account?",
                  answer: "Yes. We use the official LinkedIn API and comply strictly with their Terms of Service. We do not use automation or bots to post on your behalf in a way that risks your account."
                },
                {
                  question: "How does the AI match my writing style?",
                  answer: "Our advanced models analyze your past posts to map your vocabulary, sentence length, and structural formatting (like whether you use bullet points or short paragraphs). The more you write, the better it gets."
                },
                {
                  question: "Can I cancel my subscription at any time?",
                  answer: "Absolutely. You can cancel your subscription from your billing dashboard with just two clicks. You'll maintain access to Pro features until the end of your billing cycle."
                },
                {
                  question: "Does it work for company pages?",
                  answer: "Yes! You can connect both personal profiles and company pages, and maintain separate AI tone models for each."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 transition-all hover:border-slate-300">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  >
                    <span className="font-semibold text-slate-900 text-[17px]">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Simple, transparent pricing</h2>
              <p className="text-slate-600 text-lg">Start for free. Upgrade when you're ready to scale your personal brand.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Tier */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-sm flex flex-col">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Starter</h3>
                  <p className="text-slate-500">Perfect for trying out the platform.</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-[800] text-slate-900 tracking-tight">$0</span>
                  <span className="text-slate-500 font-medium">/month</span>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#006edc] shrink-0 mt-0.5" />
                    <span className="text-slate-600">5 AI-generated posts per month</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#006edc] shrink-0 mt-0.5" />
                    <span className="text-slate-600">Basic tone matching</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#006edc] shrink-0 mt-0.5" />
                    <span className="text-slate-600">1 connected LinkedIn profile</span>
                  </div>
                </div>
                <button className="cursor-pointer w-full bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-4 rounded-xl font-bold transition-colors">
                  Get Started
                </button>
              </div>

              {/* Pro Tier */}
              <div className="bg-[#002B54] border border-[#00366b] rounded-3xl p-8 md:p-10 shadow-2xl shadow-blue-900/20 flex flex-col relative transform md:-translate-y-4">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-[#006edc] rounded-t-3xl"></div>
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-[#006edc] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
                <div className="mb-6 mt-2">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-blue-200/80">Everything you need to scale your reach.</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-5xl font-[800] text-white tracking-tight">$29</span>
                  <span className="text-blue-200/80 font-medium">/month</span>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#0A66C2] shrink-0 mt-0.5" />
                    <span className="text-blue-50">Unlimited AI-generated posts</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#0A66C2] shrink-0 mt-0.5" />
                    <span className="text-blue-50">Advanced multi-tone engine mapping</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#0A66C2] shrink-0 mt-0.5" />
                    <span className="text-blue-50">Post scheduling & analytics</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Check className="w-5 h-5 text-[#0A66C2] shrink-0 mt-0.5" />
                    <span className="text-blue-50">Priority email support</span>
                  </div>
                </div>
                <button className="cursor-pointer w-full bg-[#006edc] hover:bg-[#0060DF] text-white px-6 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/25">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div
            className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden text-center px-8 py-20"
            style={{
              backgroundColor: "#0d2137",
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          >
            {/* Subtle radial fade to darken edges */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, transparent 40%, rgba(5,18,35,0.65) 100%)",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
                Turn your expertise into<br />measurable influence.
              </h2>
              <p className="text-slate-400 text-lg md:text-xl mb-4 max-w-md mx-auto leading-relaxed font-medium">
                Build your LinkedIn presence, together or independently
              </p>
              <Link
                href="/signup"
                className="cursor-pointer inline-flex items-center gap-2 bg-[#006edc] hover:bg-[#0060DF] text-white px-8 py-3.5 rounded-lg font-semibold text-base transition-all active:scale-95 shadow-lg shadow-blue-500/25"
              >
                Sign-up for free
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                in
              </div>
              <span className="font-bold text-lg text-white">LinkedIn Optimizer Pro</span>
            </div>
            <p className="text-sm max-w-sm">The AI-powered suite for ambitious professionals who want to grow their brand authentically and efficiently.</p>
            <p className="mt-6 text-xs text-slate-500">© 2026 LinkedIn Optimizer Pro. All rights reserved.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
