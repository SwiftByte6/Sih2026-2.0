"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [cursorPosition, setCursorPosition] = useState({ x: 24, y: 34 });

  useEffect(() => {
    let timeoutId;
    let isMounted = true;

    const moveCursor = () => {
      if (!isMounted) return;

      setCursorPosition({
        x: 12 + Math.random() * 76,
        y: 16 + Math.random() * 66,
      });

      timeoutId = setTimeout(moveCursor, 2200 + Math.random() * 3200);
    };

    timeoutId = setTimeout(moveCursor, 1800);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <section className="relative w-full h-[calc(100vh-1rem)] sm:h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)] lg:h-[calc(100vh-2.5rem)] h-[calc(100svh-1rem)] sm:h-[calc(100svh-1.5rem)] md:h-[calc(100svh-2rem)] lg:h-[calc(100svh-2.5rem)] flex flex-col justify-between overflow-hidden bg-white">
      {/* Background Atmosphere: Radiant Lavender/Sky Glow & Subtle Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Broad purple atmosphere behind the hero */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[170%] sm:w-[1250px] h-[560px] sm:h-[680px] bg-[radial-gradient(ellipse_at_bottom,_rgba(124,58,237,0.24)_0%,_rgba(167,139,250,0.2)_38%,_rgba(221,214,254,0.12)_58%,_rgba(255,255,255,0)_78%)] blur-2xl" />

        {/* Left Cloud Motif */}
        <div className="absolute -left-12 sm:left-2 top-24 sm:top-20 w-44 sm:w-64 h-28 sm:h-36 bg-gradient-to-r from-blue-100/50 via-purple-100/40 to-transparent rounded-full blur-2xl opacity-70" />
        <svg
          className="absolute -left-8 top-28 sm:top-24 w-36 sm:w-56 h-auto text-indigo-50/60 hidden sm:block"
          viewBox="0 0 200 120"
          fill="currentColor"
        >
          <path d="M40 90 A30 30 0 0 1 80 50 A45 45 0 0 1 150 55 A35 35 0 0 1 180 90 Z" />
        </svg>

        {/* Right Cloud Motif */}
        <div className="absolute -right-12 sm:right-2 top-20 sm:top-16 w-48 sm:w-72 h-32 sm:h-40 bg-gradient-to-l from-indigo-100/55 via-purple-100/35 to-transparent rounded-full blur-2xl opacity-75" />
        <svg
          className="absolute -right-6 top-24 sm:top-20 w-40 sm:w-60 h-auto text-indigo-50/60 hidden sm:block"
          viewBox="0 0 220 120"
          fill="currentColor"
        >
          <path d="M50 95 A32 32 0 0 1 95 55 A48 48 0 0 1 170 60 A38 38 0 0 1 200 95 Z" />
        </svg>
      </div>

      {/* 1. Compact Navbar (Embedded at top of white page canvas) */}
      <header className="relative z-20 shrink-0 w-full px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-11 sm:h-12">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="AICTE Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-[#6048E8] transition-colors leading-none">
                AICTE FDR Portal
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Govt. of India
              </span>
            </div>
          </Link>

          {/* Centered Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-slate-600">
            <Link
              href="/#regulations"
              className="hover:text-slate-900 transition-colors"
            >
              Regulations
            </Link>
            <Link
              href="/#system-workflow"
              className="hover:text-slate-900 transition-colors"
            >
              Workflow
            </Link>
            <Link
              href="/#public-tracker"
              className="hover:text-slate-900 transition-colors"
            >
              Public Tracker
            </Link>
            <Link
              href="/#gateways"
              className="hover:text-slate-900 transition-colors"
            >
              Portals
            </Link>
          </nav>

          {/* Compact Right-side CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-[13px] font-semibold px-4 sm:px-5 py-2 rounded-full transition-colors shadow-xs"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Center Content: Eyebrow, Heading, Subtitle & Pill CTAs */}
      <div className="relative z-10 shrink-0 flex flex-col items-center text-center px-4 sm:px-6 pt-1 sm:pt-3 max-w-4xl mx-auto">
       

        {/* Main Heading */}
        <h1 className="text-2xl mt-15 sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold tracking-tight text-slate-900 leading-[1.12] max-w-3xl">
          Simplifying FDR Compliance for Institutions
        </h1>

        {/* Subtitle */}
        <p className="mt-2 sm:mt-2.5 text-xs sm:text-sm md:text-[15px] text-slate-600 max-w-2xl leading-relaxed">
          Manage FDR records, analyze documents, identify compliance gaps, and
          track maturity through one centralized platform.
        </p>

        {/* Pill-shaped CTA Buttons */}
        <div className="mt-3 sm:mt-4 flex items-center gap-2.5 sm:gap-3.5">
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-[#6048E8] hover:bg-[#5038D6] text-white text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-full transition-all shadow-md shadow-indigo-500/25 active:scale-95"
          >
            Get Started
          </Link>
          <a
            href="#system-workflow"
            className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs sm:text-sm font-semibold px-5 sm:px-6 py-2.5 rounded-full transition-all shadow-2xs active:scale-95"
          >
            Explore Workflow
          </a>
        </div>
      </div>

      {/* 3. Hero Visual Container (Dashboard Preview anchored & overlapping lower area) */}
      <div className="relative z-10 flex-1 min-h-0 w-full flex items-end justify-center px-3 sm:px-6 lg:px-10 pb-0 pt-2 sm:pt-3">
        <div className="relative w-full max-w-5xl flex flex-col items-center justify-end">
          {/* Subtle Floating Labels around Visual (matching TaskGo reference) */}
          <div className="hidden lg:flex items-center gap-1.5 absolute -top-10 -left-2 z-20 -rotate-2 bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm rounded-full px-3 py-1 text-[11px] font-medium text-slate-700 pointer-events-none">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Verification Officer</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 absolute -top-8 -right-2 z-20 rotate-2 bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm rounded-full px-3 py-1 text-[11px] font-medium text-slate-700 pointer-events-none">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Clause 6.46 Clearances</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 absolute top-24 -left-28 z-20 rotate-1 bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm rounded-full px-3 py-1 text-[11px] font-medium text-slate-700 pointer-events-none">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>3-Way Reconciliation</span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 absolute top-28 -right-28 z-20 -rotate-2 bg-white/95 backdrop-blur-xs border border-slate-200/90 shadow-sm rounded-full px-3 py-1 text-[11px] font-medium text-slate-700 pointer-events-none">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Joint Lien Encumbered</span>
          </div>

          {/* Large Rounded Dashboard Preview with Soft Shadow */}
          <div className="relative w-full flex justify-center">
            <div className="absolute bottom-0 left-1/2 h-[92%] w-[145%] -translate-x-1/2 translate-y-10 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(124,58,237,0.22)_0%,_rgba(167,139,250,0.16)_42%,_rgba(255,255,255,0)_76%)] blur-3xl pointer-events-none" />
            <div className="relative w-full rounded-t-2xl sm:rounded-t-3xl border border-white/60 bg-white/30 p-5 shadow-[0_24px_70px_rgba(96,72,232,0.18),0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="relative overflow-hidden rounded-t-xl sm:rounded-t-2xl border border-white/70 bg-white/75 shadow-[0_8px_24px_rgba(15,23,42,0.1)]">
                <Image
                  src="/dashboard.png"
                  alt="AICTE Official Verification Dashboard"
                  width={1912}
                  height={671}
                  priority
                  className="w-full h-auto object-contain object-top block max-h-[44svh] sm:max-h-[48svh] md:max-h-[52svh]"
                />
                <Image
                  src="/cursor.png"
                  alt=""
                  width={28}
                  height={28}
                  aria-hidden="true"
                  className="pointer-events-none absolute z-10 h-5 w-5 object-contain drop-shadow-md transition-[left,top] ease-in-out sm:h-6 sm:w-6"
                  style={{
                    left: `${cursorPosition.x}%`,
                    top: `${cursorPosition.y}%`,
                    transitionDuration: "2200ms",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
