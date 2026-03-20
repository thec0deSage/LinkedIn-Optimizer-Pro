"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  BarChart3,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  PenTool
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold pb-0.5">
              in
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">LinkedIn Optimizer Pro</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden md:block">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden md:block">How it Works</a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-all shadow-sm shadow-blue-600/20 active:scale-95">
              Start for free
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16 pb-20">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-32 text-center md:text-left flex flex-col md:flex-row items-center gap-12">

          <div className="md:w-1/2 space-y-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Content Engine for Professionals</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]"
            >
              Optimize your<span className="text-blue-600"> LinkedIn </span> reach.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-xl"
            >
              Create high-performing content in your authentic voice consistently and at scale.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-4 flex justify-center md:justify-start"
            >
              <button className="w-full sm:w-auto bg-[#0070F3] hover:bg-[#0060DF] text-white px-10 py-3.5 rounded-md font-medium text-lg tracking-wide transition-colors">
                Start for free
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-6 flex items-center justify-center md:justify-start gap-6 text-sm text-slate-500 font-medium"
            >
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-day free trial</div>
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

        {/* CTA Section */}
        <section className="py-24 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Ready to post with confidence?</h2>
          <p className="text-xl text-slate-600 mb-10">Join thousands of founders and creators scaling their presence on LinkedIn.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-md font-semibold text-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 inline-flex items-center gap-2">
            Start your free 14-day trial
            <ArrowRight className="w-5 h-5" />
          </button>
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
