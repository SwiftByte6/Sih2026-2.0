"use client";

import React, { useState } from "react";

export function SystemWorkflowSection() {
  const [activeStage, setActiveStage] = useState(null);

  const stages = {
    portal: {
      title: "College Portal",
      category: "Intake Channel",
      desc: "Authenticated institution interface where colleges initiate security deposit submissions, view requirements, and track verification status.",
    },
    upload: {
      title: "Document Upload",
      category: "Secure Ingestion",
      desc: "Private encrypted vault capturing Fixed Deposit Receipts (FDRs), bank confirmation letters, and Clause 6.46 affidavits.",
    },
    analysis: {
      title: "AI Document Analysis",
      category: "Document Intelligence",
      desc: "Multi-modal OCR vision engine extracting certificate numbers, bank branch details, principal amount, maturity date, and lien marks.",
    },
    matching: {
      title: "3-Way Data Matching",
      category: "Reconciliation Engine",
      desc: "Deterministic cross-verification comparing institution claim, AI-extracted text, and Core Banking ledger records [Simulated].",
    },
    platform: {
      title: "AICTE Compliance Platform",
      category: "Central Governance Engine",
      desc: "Unified coordination hub managing risk scoring, discrepancy flags, rule enforcement, and end-to-end instrument lifecycle.",
    },
    validation: {
      title: "Compliance Validation",
      category: "Rule Engine",
      desc: "Automated validation of Approval Process Handbook mandates, including joint lien in favor of Member Secretary and mandatory tenure.",
    },
    review: {
      title: "Official Review",
      category: "Official Adjudication",
      desc: "AICTE scrutiny officers review split-screen evidence, inspect variance highlights, and grant official verification or defect notices.",
    },
    notifications: {
      title: "In-App Notifications / Email Preview",
      category: "Alerts & Discrepancy Preview",
      desc: "Generates instant in-app alerts and official discrepancy email previews for college authorities when rectifications are required.",
    },
    audit: {
      title: "Audit Trail",
      category: "Immutable Ledger",
      desc: "Cryptographically verifiable timestamped audit log capturing every submission, AI extraction, officer decision, and status mutation.",
    },
  };

  const currentInfo = activeStage ? stages[activeStage] : stages.platform;

  return (
    <section
      id="system-workflow"
      className="workflow-diagram relative overflow-hidden bg-white py-16 text-[#17172B] select-none sm:py-20"
    >
      {/* Animation Styles */}
      <style>{`
        @keyframes flowForward {
          from {
            stroke-dashoffset: 40;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.04);
          }
        }

        .workflow-diagram [class*="bg-[#0b1436]"],
        .workflow-diagram [class*="bg-[#09112e]"],
        .workflow-diagram [class*="bg-[#060d24]"] {
          background: #ffffff;
          border-color: #e8e3ff;
          box-shadow: 0 8px 24px rgba(96, 72, 232, 0.08);
        }
        .workflow-diagram [class*="bg-gradient-to-b"] {
          background: linear-gradient(180deg, #f7f4ff 0%, #ffffff 100%);
          border-color: #6048e8;
          box-shadow: 0 0 28px rgba(96, 72, 232, 0.18);
        }
        .workflow-diagram .workflow-center-node {
          border-color: rgba(96, 72, 232, 0.3);
          box-shadow: none;
        }
        .workflow-diagram [class*="text-white"] {
          color: #17172b;
        }
        .workflow-diagram [class*="text-slate-400"],
        .workflow-diagram [class*="text-slate-200"] {
          color: #66677a;
        }
        .workflow-diagram [class*="text-blue-400"],
        .workflow-diagram [class*="text-blue-300"],
        .workflow-diagram [class*="text-blue-200"],
        .workflow-diagram [class*="text-cyan-400"] {
          color: #6048e8;
        }
        .workflow-diagram [class*="border-[#1b2b63]"],
        .workflow-diagram [class*="border-[#1e3573]"] {
          border-color: #e8e3ff;
        }
        .workflow-diagram [class*="bg-blue-600"],
        .workflow-diagram [class*="bg-cyan-500"] {
          background: #f0ecff;
        }
        .workflow-diagram [class*="bg-blue-500"],
        .workflow-diagram [class*="bg-cyan-400"] {
          background: #6048e8;
        }
        .workflow-diagram [class*="shadow-[0_0_20px_rgba(59,130,246"],
        .workflow-diagram [class*="shadow-[0_0_20px_rgba(56,189,248"] {
          box-shadow: 0 8px 24px rgba(96, 72, 232, 0.14);
        }
        .workflow-diagram .workflow-svg path[stroke="#38bdf8"],
        .workflow-diagram .workflow-svg path[stroke="#3b82f6"] {
          stroke: #6048e8;
        }
        .workflow-diagram .workflow-svg path[stroke="#223d7a"] {
          stroke: #d8cfff;
        }
        .workflow-diagram .workflow-svg path[fill="#38bdf8"] {
          fill: #6048e8;
        }
        .workflow-diagram .workflow-svg stop[stop-color="#38bdf8"],
        .workflow-diagram .workflow-svg stop[stop-color="#2563eb"] {
          stop-color: #6048e8;
        }
        .workflow-diagram .workflow-svg {
          opacity: 0.9;
        }
        .workflow-diagram [class*="bg-[#09112e]"],
        .workflow-diagram [class*="bg-[#060d24]"] {
          background: #ffffff;
        }
      `}</style>

      {/* Subtle Dotted Matrix Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, #D8CFFF 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Soft ambient purple glow */}
      <div className="absolute top-1/2 left-1/2 h-[440px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6048E8]/10 blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===================================================================
            HEADER: Connected Systems. Unified FDR Governance.
            =================================================================== */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="inline-flex items-center rounded-full border border-[#DDD5FF] bg-[#F7F4FF] px-3 py-1 text-xs font-semibold text-[#6048E8] mb-4">
            <span>End-to-End Governance Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#17172B] leading-tight">
            Connected Systems.{" "}
            <span className="bg-gradient-to-r from-[#17172B] via-[#6048E8] to-[#A99BEA] bg-clip-text text-transparent">
              Unified FDR Governance.
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#66677A] leading-relaxed max-w-2xl">
            From institutional submissions to document verification, official
            decisions, and actionable notifications — manage the complete security
            deposit lifecycle through one integrated platform.
          </p>
        </div>

        {/* ===================================================================
            DESKTOP & TABLET INTEGRATION DIAGRAM (Scalable Vector Canvas)
            =================================================================== */}
        <div className="hidden md:block relative w-full max-w-5xl mx-auto rounded-2xl border border-[#E8E3FF] bg-white/80 p-4 shadow-[0_18px_50px_rgba(96,72,232,0.1)] backdrop-blur-md sm:p-6">
          
          {/* Top Status Header */}
         

          {/* SVG Diagram Canvas */}
          <div className="relative w-full aspect-[1000/520]">
            <svg
              className="workflow-svg absolute inset-0 w-full h-full overflow-visible"
              viewBox="0 0 1000 520"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Cyan Glow Filter */}
                <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Electric Blue Gradient */}
                <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>

                {/* Arrowhead Markers */}
                <marker
                  id="arrowCyan"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
                </marker>
                <marker
                  id="arrowBlue"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6" />
                </marker>
              </defs>

              {/* =============================================================
                  CONNECTING PATHS (Subtle Dotted Tracks + Animated Glowing Beams)
                  ============================================================= */}
              
              {/* 1. College Portal (200, 260) -> Document Upload (230, 260) */}
              <path
                d="M 195 260 L 230 260"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 195 260 L 230 260"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="12 28"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.4s linear infinite" }}
              />

              {/* 2. Document Upload (305, 225) -> AI Document Analysis (305, 128) */}
              <path
                d="M 305 225 L 305 128"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 305 225 L 305 128"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="12 28"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.4s linear infinite" }}
              />

              {/* 3. AI Document Analysis (385, 95) -> 3-Way Data Matching (615, 95) */}
              <path
                d="M 385 95 L 615 95"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 385 95 L 615 95"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="16 34"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.8s linear infinite" }}
              />

              {/* 4. 3-Way Matching (695, 128) -> AICTE Platform (560, 215) */}
              <path
                d="M 695 128 C 695 180, 570 170, 560 215"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 695 128 C 695 180, 570 170, 560 215"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="14 30"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.8s linear infinite" }}
              />

              {/* 5. Document Upload direct to Platform (380, 260) -> Platform (420, 260) */}
              <path
                d="M 380 260 L 420 260"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 380 260 L 420 260"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="10 25"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.5s linear infinite" }}
              />

              {/* 6. AICTE Platform (580, 260) -> Compliance Validation (620, 260) */}
              <path
                d="M 580 260 L 620 260"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 580 260 L 620 260"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="10 25"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.5s linear infinite" }}
              />

              {/* 7. Compliance Validation (775, 260) -> Official Review (815, 260) */}
              <path
                d="M 775 260 L 815 260"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 775 260 L 815 260"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="10 25"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.5s linear infinite" }}
              />

              {/* 8. AICTE Platform (460, 305) -> Audit Trail (365, 395) */}
              <path
                d="M 460 305 C 460 350, 365 350, 365 395"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 460 305 C 460 350, 365 350, 365 395"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="12 28"
                markerEnd="url(#arrowBlue)"
                fill="none"
                style={{ animation: "flowForward 1.6s linear infinite" }}
              />

              {/* 9. AICTE Platform (540, 305) -> Notifications (635, 395) */}
              <path
                d="M 540 305 C 540 350, 635 350, 635 395"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 540 305 C 540 350, 635 350, 635 395"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="12 28"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 1.6s linear infinite" }}
              />

              {/* 10. Official Review (890, 295) -> Notifications (745, 425) */}
              <path
                d="M 890 295 C 890 380, 770 425, 745 425"
                stroke="#223d7a"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                fill="none"
              />
              <path
                d="M 890 295 C 890 380, 770 425, 745 425"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="14 30"
                markerEnd="url(#arrowCyan)"
                fill="none"
                style={{ animation: "flowForward 2s linear infinite" }}
              />
            </svg>

            {/* ===============================================================
                HTML COMPONENT NODES (Centered on Exact Vector Terminals)
                =============================================================== */}

            {/* 1. College Portal Node */}
            <div
              className="absolute top-[260px] left-[120px] -translate-x-1/2 -translate-y-1/2 z-10 w-[150px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("portal")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-blue-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Step 01
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  College Portal
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Deposit Ingestion
                </div>
              </div>
            </div>

            {/* 2. Document Upload Node */}
            <div
              className="absolute top-[260px] left-[305px] -translate-x-1/2 -translate-y-1/2 z-10 w-[150px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("upload")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-blue-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Step 02
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  Document Upload
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  FDR Certificate Scans
                </div>
              </div>
            </div>

            {/* 3. AI Document Analysis Node (Top Pipeline) */}
            <div
              className="absolute top-[95px] left-[305px] -translate-x-1/2 -translate-y-1/2 z-10 w-[160px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("analysis")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-cyan-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    AI Pipeline
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  AI Document Analysis
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                   Flash OCR
                </div>
              </div>
            </div>

            {/* 4. 3-Way Data Matching Node (Top Pipeline) */}
            <div
              className="absolute top-[95px] left-[695px] -translate-x-1/2 -translate-y-1/2 z-10 w-[160px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("matching")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-cyan-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Verification
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  3-Way Data Matching
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Claim ↔ OCR ↔ Bank CBS
                </div>
              </div>
            </div>

            {/* 5. CENTER NODE: AICTE Compliance Platform */}
            <div
              className="absolute top-[260px] left-[500px] -translate-x-1/2 -translate-y-1/2 z-20 w-[160px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("platform")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="workflow-center-node relative bg-gradient-to-b from-[#162a69]/50 via-[#0f1d4a]/50 to-[#08102d]/30 border-2 border-[#6048E8]/30 rounded-2xl p-3.5 text-center shadow-none transition-all duration-200 group-hover:scale-105">
                
                <div className="text-xl font-extrabold lowercase tracking-tight text-white">
                  aicte
                </div>
                <div className="text-[11px] font-semibold text-blue-200 leading-tight mt-0.5">
                  Compliance Platform
                </div>
              </div>
            </div>

            {/* 6. Compliance Validation Node */}
            <div
              className="absolute top-[260px] left-[698px] -translate-x-1/2 -translate-y-1/2 z-10 w-[155px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("validation")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-blue-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Step 03
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  Compliance Validation
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Clause 2.25 Mandates
                </div>
              </div>
            </div>

            {/* 7. Official Review Node */}
            <div
              className="absolute top-[260px] left-[890px] -translate-x-1/2 -translate-y-1/2 z-10 w-[145px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("review")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-blue-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Step 04
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  Official Review
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Split-Screen Adjudication
                </div>
              </div>
            </div>

            {/* 8. Audit Trail Node (Bottom Pipeline) */}
            <div
              className="absolute top-[425px] left-[365px] -translate-x-1/2 -translate-y-1/2 z-10 w-[165px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("audit")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-blue-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Audit Log
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  Audit Trail
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Immutable State History
                </div>
              </div>
            </div>

            {/* 9. In-App Notifications / Email Preview Node (Bottom Pipeline) */}
            <div
              className="absolute top-[425px] left-[635px] -translate-x-1/2 -translate-y-1/2 z-10 w-[205px] cursor-pointer group"
              onMouseEnter={() => setActiveStage("notifications")}
              onMouseLeave={() => setActiveStage(null)}
            >
              <div className="bg-[#0b1436] hover:bg-[#101c4a] border border-[#1e3573] hover:border-cyan-400 rounded-xl p-3 shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.35)]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Alert Dispatch
                  </span>
                </div>
                <div className="font-semibold text-white text-xs leading-snug">
                  In-App & Email Preview
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Discrepancy Rectifications
                </div>
              </div>
            </div>

          </div>

          {/* Contextual Interactive Detail Footer Bar */}
          <div className="mt-4 pt-3 border-t border-[#1b2b63]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-[#060d24]/60 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-bold text-white text-sm">
                {currentInfo.title}
              </span>
              <span className="text-cyan-400 font-medium">
                [{currentInfo.category}]
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:max-w-xl">
              {currentInfo.desc}
            </p>
          </div>
        </div>

        {/* ===================================================================
            MOBILE RESPONSIVE WORKFLOW LIST (< 768px)
            =================================================================== */}
        <div className="md:hidden space-y-3 mt-6">
          <div className="bg-[#09112e]/80 border border-[#1b2b63] rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2b63] pb-3">
              <span className="font-extrabold text-white lowercase text-xl font-mono tracking-tight">
                aicte
              </span>
              <span className="text-xs text-cyan-400 font-semibold">
                Governance Workflow
              </span>
            </div>

            {/* Mobile Vertical Flow */}
            <div className="space-y-2.5">
              {/* Step 1: College Portal */}
              <div className="p-3 rounded-xl bg-[#0b1436] border border-[#1e3573]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-blue-400">
                    Step 01
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">
                  College Portal
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Self-service interface for colleges to register security deposits.
                </p>
              </div>

              {/* Step 2: Document Upload */}
              <div className="p-3 rounded-xl bg-[#0b1436] border border-[#1e3573]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-blue-400">
                    Step 02
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">
                  Document Upload
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Encrypted upload for FDR certificates, bank slips & affidavits.
                </p>
              </div>

              {/* Step 3: AI Document Analysis */}
              <div className="p-3 rounded-xl bg-[#0b1436] border border-cyan-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-cyan-400">
                    AI Pipeline
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">
                  AI Document Analysis
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">                </p>
              </div>

              {/* Step 4: 3-Way Data Matching */}
              <div className="p-3 rounded-xl bg-[#0b1436] border border-cyan-500/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-cyan-400">
                    Verification
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">
                  3-Way Data Matching
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Cross-checks submitted claims ↔ OCR extraction ↔ Bank CBS ledger [Simulated].
                </p>
              </div>

              {/* Step 5: Compliance Validation */}
              <div className="p-3 rounded-xl bg-[#0b1436] border border-[#1e3573]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-blue-400">
                    Step 03
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">
                  Compliance Validation
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Automated checks for Clause 2.25 joint lien and 10-year lock-in.
                </p>
              </div>

              {/* Step 6: Official Review */}
              <div className="p-3 rounded-xl bg-[#0b1436] border border-[#1e3573]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-blue-400">
                    Step 04
                  </span>
                </div>
                <div className="font-semibold text-white text-xs">
                  Official Review
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Split-screen verification viewer and definitive approval decisions.
                </p>
              </div>

              {/* Step 7: Notifications & Audit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#0b1436] border border-cyan-500/40">
                  <div className="flex items-center gap-1.5 mb-1 text-cyan-400">
                    <span className="text-[10px] font-bold uppercase">
                      In-App & Email Preview
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Alerts registrars of flagged discrepancies and status updates.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0b1436] border border-[#1e3573]">
                  <div className="flex items-center gap-1.5 mb-1 text-blue-400">
                    <span className="text-[10px] font-bold uppercase">
                      Audit Trail
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Immutable timestamped ledger of all state transitions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default SystemWorkflowSection;
