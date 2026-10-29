"use client";

import Image from "next/image";
import Link from "next/link";

export function CompactFooter() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="AICTE Logo"
            width={28}
            height={28}
            className="object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">
              AICTE FDR Portal
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400 text-[11px]">
              Govt. of India
            </span>
          </div>
        </div>

        {/* Links to existing sections */}
        <nav className="flex flex-wrap items-center justify-center gap-5 text-slate-500 font-medium">
          <Link
            href="/#features"
            className="hover:text-slate-900 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#system-workflow"
            className="hover:text-slate-900 transition-colors"
          >
            Workflow
          </Link>
          <Link
            href="/#preview"
            className="hover:text-slate-900 transition-colors"
          >
            Platform Preview
          </Link>
          <Link
            href="/#regulations"
            className="hover:text-slate-900 transition-colors"
          >
            Regulations
          </Link>
          <Link
            href="/#public-tracker"
            className="hover:text-slate-900 transition-colors"
          >
            Public Tracker
          </Link>
          <Link
            href="/login"
            className="text-[#6048E8] hover:text-[#5038D6] font-semibold transition-colors"
          >
            Portal Login
          </Link>
        </nav>

        {/* Copyright */}
        <div className="text-[11px] text-slate-400 text-center sm:text-right">
          © {new Date().getFullYear()} AICTE FDR Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
