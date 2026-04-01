import Image from "next/image";
import Link from "next/link";

type SiteFooterProps = {
  anchorPrefix?: string;
};

const PRODUCT_LINKS = [
  { label: "Post Generator", href: "/login" },
  { label: "Bio Generator", href: "/bio-generator" },
  { label: "QR Generator", href: "/qr-generator" },
];

export function SiteFooter({ anchorPrefix = "" }: SiteFooterProps) {
  return (
    <footer className="bg-[#0d2137] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/[0.03] backdrop-blur-3xl rounded-[32px] border border-white/[0.08] p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative z-10">
            <div className="lg:max-w-sm space-y-5">
              <div className="flex items-center whitespace-nowrap min-w-0">
                <Image
                  src="/images/logo-white.svg"
                  alt="LinkedIn Optimizer Pro"
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
                  {PRODUCT_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-slate-400 hover:text-white transition-colors text-[15px]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-5 text-[15px]">
                  Explore
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href={`${anchorPrefix}#pricing`}
                      className="text-slate-400 hover:text-white transition-colors text-[15px]"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`${anchorPrefix}#blog`}
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
            &copy; 2026 LinkedIn Optimizer Pro. All rights reserved.
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
  );
}
