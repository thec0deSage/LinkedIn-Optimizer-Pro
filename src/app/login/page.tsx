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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-[440px] p-8 md:p-10 flex flex-col">
          <div className="text-center mb-6 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#006edc] flex items-center justify-center text-white font-[800] pb-0.5">
                in
              </div>
              <span className="font-bold text-xl text-[#00366b] tracking-tight">LinkedIn Optimizer Pro</span>
            </div>
            <h1 className="text-[25px] font-bold text-slate-900 tracking-tight mt-4">Hey there, welcome back</h1>
          </div>

          <button className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm py-3.5 px-4 flex items-center justify-center gap-2 rounded-lg transition-colors mb-6 shadow-sm cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
          </button>

          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">Email Address </label>
              <input
                type="text"
                placeholder="you@example.com"
                className="w-full border-b border-slate-200 focus:border-[#006edc] py-2.5 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center pb-1">
                <label className="text-sm font-semibold text-slate-700 block">Password</label>
                <a href="#" className="font-semibold text-sm text-[#0A66C2] hover:underline">Forgot Password?</a>
              </div>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full border-b border-slate-200 focus:border-[#006edc] py-2.5 outline-none transition-colors bg-transparent text-slate-900 placeholder:text-slate-400 pr-10 tracking-widest [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white font-bold py-3.5 rounded-lg transition-colors mt-2 text-sm cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Don't have an account? <Link href="/signup" className="font-bold text-[#006edc] hover:text-[#005bb8] hover:underline">Sign up</Link>
          </p>
        </div>

      </main>
    </div>
  );
}
