"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-300/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-300/20 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between z-10 relative">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded bg-[#006edc] flex items-center justify-center text-white font-bold pb-0.5">
            in
          </div>
          <span className="font-bold text-xl text-[#006edc] tracking-tight">LinkedIn Optimizer Pro</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden md:block">Help Center</a>
          <Link href="/signup" className="bg-[#006edc] hover:bg-[#0060DF] text-white px-5 py-2.5 rounded-md font-semibold text-sm transition-all shadow-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 w-full mb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Welcome Back</h1>
          <p className="text-slate-600 text-[17px]">Elevate your professional thought leadership.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-[440px] p-8 md:p-10">
          <button className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg py-3.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors mb-6 shadow-sm cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Sign in with LinkedIn
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">Email or Phone Number</label>
              <input 
                type="text" 
                placeholder="executive@company.com" 
                className="w-full border-b border-slate-200 focus:border-[#006edc] py-2.5 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5 relative">
              <div className="flex justify-between items-center pb-1">
                <label className="text-sm font-semibold text-slate-700 block">Password</label>
                <a href="#" className="font-semibold text-sm text-[#0A66C2] hover:underline">Forgot Password?</a>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="w-full border-b border-slate-200 focus:border-[#006edc] py-2.5 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400 pr-10 tracking-widest"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-[28px] text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold py-3.5 rounded-lg transition-colors mt-2 text-sm cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account? <Link href="/signup" className="font-bold text-[#006edc] hover:text-[#005bb8] hover:underline">Sign up</Link>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-slate-400 font-bold text-xs tracking-wider">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>ENTERPRISE SECURE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>AI DRIVEN</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-transparent py-6 px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm mt-auto">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-bold text-slate-900 text-lg">LinkedIn Optimizer Pro</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-slate-500 font-medium">
          <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-900 transition-colors">Help Center</a>
          <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn Guide</a>
        </div>
        <div className="text-slate-400 text-xs md:text-sm md:text-right italic">
          © 2026 LinkedIn Optimizer Pro. Professional Thought Leadership Engineered.
        </div>
      </footer>
    </div>
  );
}
