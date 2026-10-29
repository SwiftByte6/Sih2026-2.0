"use client";

import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="relative rounded-3xl sm:rounded-[32px] border border-indigo-100/80 bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-white p-8 sm:p-14 md:p-16 text-center max-w-4xl mx-auto shadow-xs overflow-hidden">
        {/* Subtle background ambient halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[radial-gradient(ellipse_at_top,_rgba(96,72,232,0.12)_0%,_transparent_75%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          {/* Centered Heading: Bold, compact, no eyebrow */}
          <h2 className="text-2xl sm:text-3xl md:text-[36px] font-extrabold tracking-tight text-slate-900 leading-tight">
            Bring Clarity to FDR Compliance
          </h2>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            Manage submissions, review records, and understand what needs attention through a structured workflow.
          </p>

          {/* Pill CTA Button */}
          <div className="pt-4 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#6048E8] hover:bg-[#5038D6] text-white text-sm sm:text-base font-semibold px-7 sm:px-8 py-3 sm:py-3.5 rounded-full transition-all shadow-md shadow-indigo-500/25 active:scale-95"
            >
              <span>Access the Platform</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
