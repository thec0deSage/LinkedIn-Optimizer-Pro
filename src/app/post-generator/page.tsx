"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  PenSquare,
  Calendar,
  FolderOpen,
  Settings,
  Search,
  Bell,
  Sparkles,
  Eye,
  Copy,
  RefreshCw,
  Rocket,
  GraduationCap,
  HeartHandshake,
  ChevronDown,
  User,
  Zap,
  Mic,
} from "lucide-react";

// --- Types ---
type ToneProfile = {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
};

type PostLength = "short" | "medium" | "long";

type CTAType =
  | "Engagement Question"
  | "Call to Action"
  | "Soft Sell"
  | "Story Hook";

type GeneratorState = {
  topic: string;
  selectedTone: string;
  length: PostLength;
  ctaType: CTAType;
  isGenerating: boolean;
  previewContent: string;
};

// --- Constants ---
const PRESET_POSTS: string[] = [];

const TONES: ToneProfile[] = [
  {
    id: "your-tone",
    label: "Your Tone",
    subtitle: "Authoritative & Conversational",
    icon: <User className="w-5 h-5 text-blue-600" />,
  },
  {
    id: "thought-leader",
    label: "Thought Leader",
    subtitle: "Insightful & Provocative",
    icon: <Rocket className="w-5 h-5 text-slate-500" />,
  },
  {
    id: "educational",
    label: "Educational",
    subtitle: "Step-by-step & Value-packed",
    icon: <GraduationCap className="w-5 h-5 text-slate-500" />,
  },
  {
    id: "empathetic",
    label: "Empathetic",
    subtitle: "Vulnerable & Relatable",
    icon: <HeartHandshake className="w-5 h-5 text-slate-500" />,
  },
];

const LENGTH_OPTIONS: PostLength[] = ["short", "medium", "long"];
const CTA_OPTIONS: CTAType[] = [
  "Engagement Question",
  "Call to Action",
  "Soft Sell",
  "Story Hook",
];

// --- Components ---

function Sidebar({ plan = "Free Plan" }: { plan?: string }) {
  return (
    <aside className="w-[260px] shrink-0 bg-[#0d1526] flex flex-col h-screen overflow-y-auto">
      <div className="px-4 py-6 flex items-center gap-1">
        <img src="/images/logo-white.svg" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
        <span className="text-[17px] text-white font-dm-sans tracking-tight whitespace-nowrap">
          <span className="font-bold">LinkedIn</span> <span className="text-slate-300">Optimizer Pro</span>
        </span>
      </div>

      <div className="px-4 mb-6">
        <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 transition-colors text-[#0d1526] py-2.5 rounded-lg text-sm font-bold shadow-sm">
          <PenSquare className="w-4 h-4" />
          New Post
        </button>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
          <LayoutGrid className="w-5 h-5" />
          Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-white/10 text-white border-l-2 border-white rounded-lg text-sm font-semibold shadow-sm">
          <PenSquare className="w-5 h-5" />
          Create
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
          <Calendar className="w-5 h-5" />
          Calendar
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
          <FolderOpen className="w-5 h-5" />
          Assets
        </a>
      </nav>
      <div className="p-4 border-t border-white/10 space-y-4">
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
          <Settings className="w-5 h-5" />
          Settings
        </a>
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">User</p>
            <p className="text-[10px] text-slate-400 truncate tracking-wider font-semibold">{plan}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="h-[72px] border-b border-slate-200 bg-white flex items-center justify-end px-6 shrink-0 z-10">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1 w-32">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
            <span>Credits</span>
            <span className="text-blue-600">5/5</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 relative">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default function AppShell() {
  const [state, setState] = useState<GeneratorState>({
    topic: "",
    selectedTone: "your-tone",
    length: "medium",
    ctaType: "Engagement Question",
    isGenerating: false,
    previewContent: PRESET_POSTS[0] || "",
  });

  const handleGenerate = () => {
    setState((s) => ({ ...s, isGenerating: true }));
    setTimeout(() => {
      const next =
        PRESET_POSTS.length > 0 ? PRESET_POSTS[Math.floor(Math.random() * PRESET_POSTS.length)] : "";
      setState((s) => ({ ...s, isGenerating: false, previewContent: next }));
    }, 1800);
  };

  const updateState = (patch: Partial<GeneratorState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="flex h-screen bg-white font-dm-sans overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 flex overflow-hidden">
          {/* GeneratorPanel */}
          <div className="w-[60%] flex flex-col p-8 overflow-y-auto border-r border-slate-100">
            <div className="max-w-2xl mx-auto w-full space-y-8 pb-12">


              {/* Form Areas */}
              <div className="space-y-8">
                <div className="relative bg-slate-50 rounded-2xl p-6 border border-slate-100 transition-colors focus-within:border-blue-200 focus-within:bg-white">

                  <textarea
                    value={state.topic}
                    onChange={(e) => updateState({ topic: e.target.value })}
                    placeholder="Enter your topic or idea here…"
                    className="w-full h-28 bg-transparent text-slate-800 placeholder:text-slate-400 text-base font-normal outline-none resize-none focus:ring-0 border-none p-0 bg-transparent pb-6"
                  />
                  
                  <button 
                    className="absolute bottom-4 right-4 w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition-transform active:scale-95"
                    title="Dictate idea"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Length
                    </label>
                    <div className="inline-flex bg-slate-100 p-1 rounded-full border border-slate-200/50">
                      {LENGTH_OPTIONS.map((l) => (
                        <button
                          key={l}
                          onClick={() => updateState({ length: l })}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${state.length === l
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tone
                    </label>
                    <div className="relative">
                      <select
                        value={state.selectedTone}
                        onChange={(e) => updateState({ selectedTone: e.target.value })}
                        className="w-44 appearance-none bg-slate-100 border border-slate-200/50 rounded-full py-1.5 pl-4 pr-8 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer hover:bg-slate-200/80"
                      >
                        <option value="your-tone">My tone (Default)</option>
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="witty">Witty</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={state.isGenerating}
                    className="relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait text-white py-2.5 px-6 rounded-full font-bold text-sm shadow-md shadow-blue-500/30 transition-all active:scale-[0.99]"
                  >
                    {state.isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : null}
                    {state.isGenerating ? "Writing..." : "Write My Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PreviewPanel */}
          <div className="w-[40%] bg-slate-50 p-6 overflow-hidden flex">
            <div className="flex-1 bg-[#0d1526] rounded-[24px] shadow-2xl overflow-hidden flex flex-col pt-6 pb-2 px-4 relative max-h-full">
              <div className="flex items-start justify-between px-2 mb-6">
                <div>
                  <h3 className="flex items-center gap-2 text-white font-sora font-semibold text-lg">

                    Post Preview

                  </h3>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Container - creates the scrollable area for content */}
              <div className="w-full max-w-lg mx-auto flex-1 overflow-y-auto pb-[100px] custom-scrollbar px-2 flex flex-col">

                {/* LinkedIn Card */}
                <div className="bg-white flex-1 rounded-2xl shadow-xl overflow-hidden px-5 py-6 flex flex-col">

                  {/* Post Content */}
                  <div className={`text-[15px] leading-relaxed text-slate-800 space-y-4 ${!state.previewContent ? 'flex-1 flex items-center justify-center' : ''}`}>
                    {!state.previewContent ? (
                      <p className="text-slate-400 font-normal text-center">
                        Your post will show up here
                      </p>
                    ) : state.previewContent.split('\n\n').map((paragraph, i) => {
                      if (paragraph.includes('boring tasks.')) {
                        const parts = paragraph.split('boring tasks.');
                        return (
                          <p key={i}>
                            {parts[0]}
                            <span className="font-semibold text-blue-600">boring tasks.</span>
                            {parts[1]}
                          </p>
                        )
                      }
                      if (paragraph.startsWith('•')) {
                        const bullets = paragraph.split('\n');
                        return (
                          <div key={i} className="pl-1">
                            {bullets.map((bullet, bi) => (
                              <p key={bi} className="mb-1">{bullet}</p>
                            ))}
                          </div>
                        )
                      }

                      return <p key={i}>{paragraph}</p>;
                    })}
                  </div>
                </div>

              </div>

              {/* Footer Bar (Absolute at bottom) */}
              <div className="absolute bottom-6 left-6 right-6 pt-4 flex items-center justify-end">
                <div className="flex items-center gap-3">
                  <button className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors">
                    Save Draft
                  </button>
                  <button className="px-5 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                    Schedule Post
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
