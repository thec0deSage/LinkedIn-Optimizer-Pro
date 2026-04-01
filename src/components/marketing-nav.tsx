"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavLink = {
  label: string;
  href: string;
};

type MarketingNavProps = {
  desktopLinks: NavLink[];
  mobileLinks?: NavLink[];
};

export function MarketingNav({
  desktopLinks,
  mobileLinks = desktopLinks,
}: MarketingNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
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
          {desktopLinks.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="text-sm font-semibold text-slate-600 hover:text-[#213856] transition-colors"
            >
              {link.label}
            </Link>
          ))}
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
            {mobileLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-600"
              >
                {link.label}
              </Link>
            ))}
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
  );
}
