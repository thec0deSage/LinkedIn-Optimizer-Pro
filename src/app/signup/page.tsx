"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-400/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#006edc]/10 blur-[100px] rounded-full translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Header */}
      <div className="pt-12 pb-8 flex flex-col items-center z-10 w-full">
        <Link href="/" className="flex items-center gap-2 mb-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded bg-[#006edc] flex items-center justify-center text-white font-bold pb-0.5">
            in
          </div>
          <span className="font-bold text-3xl text-[#006edc] tracking-tight">LinkedIn Optimizer Pro</span>
        </Link>
        <p className="text-slate-500 text-sm font-medium">Professional Thought Leadership Engineered.</p>
      </div>

      {/* Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 w-full mb-12">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-[440px] p-8 md:p-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-500 text-sm mb-8">Join the elite circle of digital thought leaders.</p>

          <button className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Create Account with LinkedIn
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full border-b border-slate-200 focus:border-[#006edc] py-2 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">Email or Phone</label>
              <input 
                type="text" 
                placeholder="name@company.com" 
                className="w-full border-b border-slate-200 focus:border-[#006edc] py-2 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700 block">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full border-b border-slate-200 focus:border-[#006edc] py-2 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400 pr-10 tracking-widest"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-7 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input 
                  id="terms" 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-[#006edc] focus:ring-[#006edc] bg-white cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed max-w-[90%] select-none">
                By creating an account, I agree to the <a href="#" className="font-semibold text-[#006edc] hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-[#006edc] hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold py-3.5 rounded-lg transition-colors mt-4 text-sm cursor-pointer"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Already have an account? <Link href="/login" className="font-bold text-[#006edc] hover:text-[#005bb8] hover:underline">Log in</Link>
          </p>
        </div>

        <div className="flex items-center gap-2 mt-8 text-indigo-600/80 font-bold text-xs tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>AI-OPTIMIZED ONBOARDING</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-transparent py-6 px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">LinkedIn Optimizer Pro</span>
          </div>
          <p className="text-slate-500 text-xs">© 2026 LinkedIn Optimizer Pro. Professional Thought Leadership Engineered.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-slate-500 font-medium">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Help Center</a>
          <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn Guide</a>
        </div>
      </footer>
    </div>
  );
}
