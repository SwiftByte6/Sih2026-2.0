"use client";

import { Play, CheckCircle2, ShieldCheck, Clock, FileCheck } from "lucide-react";

export function VideoPlaceholder({ videoUrl = null }) {
  if (videoUrl) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-black">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/50 flex flex-col items-center justify-center p-6 text-center select-none group">
      {/* Decorative ambient halo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(96,72,232,0.12)_0%,_transparent_70%)] pointer-events-none" />

      {/* Label Badge */}
      <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-indigo-100 text-[#6048E8] text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-4 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6048E8]" />
        <span>PRODUCT WALKTHROUGH</span>
      </div>

      {/* Centered Decorative Play Icon */}
      <div className="relative z-10 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white shadow-md border border-indigo-100 flex items-center justify-center text-[#6048E8] transition-transform group-hover:scale-105 duration-200">
        <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-[#6048E8] translate-x-0.5" />
      </div>

      {/* Placeholder Description */}
      <div className="relative z-10 mt-4 space-y-1">
        <p className="text-xs sm:text-sm font-semibold text-slate-800">
          Product demonstration coming soon
        </p>
        <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs mx-auto">
          Interactive video walkthrough of official verification, reconciliation, and release.
        </p>
      </div>

      {/* Discrete subtle watermark tag */}
      <div className="absolute bottom-3 right-3 text-[10px] text-slate-400/80 font-mono">
        16:9 • AICTE Preview
      </div>
    </div>
  );
}

export function PlatformPreviewSection() {
  const benefits = [
    {
      title: "Track FDR records and maturity dates",
      description:
        "Real-time visibility into active terms, statutory 5-year lock-in countdowns, and automated renewal alerts.",
      icon: Clock,
    },
    {
      title: "Identify documents or information requiring attention",
      description:
        "Instant discrepancy flags for mismatched bank FDR numbers, joint lien missing endorsements, or OCR read mismatches.",
      icon: ShieldCheck,
    },
    {
      title: "Follow submission and review status",
      description:
        "Trace progress seamlessly through Regional, Legal, and Finance bureau scrutiny to final NOC release.",
      icon: FileCheck,
    },
  ];

  return (
    <section
      id="preview"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
        {/* Left Column: Heading, description, and 3 benefits */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              A Clear View of Every Submission
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Understand document status, compliance gaps, and review progress
              from one centralized platform.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl border border-slate-200/70 bg-white hover:border-indigo-200 transition-colors shadow-2xs"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#6048E8] shrink-0 mt-0.5 font-bold text-xs">
                    0{index + 1}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Video Preview Placeholder */}
        <div className="lg:col-span-7">
          <VideoPlaceholder />
        </div>
      </div>
    </section>
  );
}
