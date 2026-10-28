import Link from "next/link";
import { ShieldCheck, Building, KeyRound, ChevronRight } from "lucide-react";
import Image from "next/image";

export function PublicHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <Image src={'/logo.png'} width={60} height={60} alt="AICTE Logo" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link href="/#regulations" className="hover:text-blue-700 transition-colors">
            Approval Handbook Regulations
          </Link>
          <Link href="/#features" className="hover:text-blue-700 transition-colors">
            Core Features
          </Link>
          <Link href="/#public-tracker" className="hover:text-blue-700 transition-colors">
            Public Instrument Tracker
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white px-3.5 py-2 rounded-lg transition-colors font-medium text-xs shadow-xs"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Portal Login</span>
          </Link>
        </nav>

        {/* Mobile Login Button */}
        <div className="md:hidden">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <span className="font-bold text-slate-900 text-sm">
                AICTE Security Deposit & FDR Management Portal
              </span>
            </div>
            <p className="text-slate-500 max-w-md leading-relaxed text-xs">
              A centralised digital platform designed for institution-wise security deposits and Fixed Deposit Receipts (FDR) lifecycle management, verification, maturity tracking, and release processing under the AICTE Approval Process Handbook (2024–25 to 2026–27).
            </p>
            <div className="text-[11px] text-slate-400">
              Regulatory Basis: Clauses 1.12, 2.25, 6.46 & Affidavit-6.
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              Quick Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/official/dashboard" className="text-slate-600 hover:text-blue-700">
                  Verification Officer Portal
                </Link>
              </li>
              <li>
                <Link href="/institution/dashboard" className="text-slate-600 hover:text-blue-700">
                  Technical Institution Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="text-slate-600 hover:text-blue-700">
                  Council Administrator Console
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-600 hover:text-blue-700">
                  Authentication & Role Gateway
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              System Sandbox
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              This system is running in demonstration sandbox mode with simulated dummy bank API integrations and sample institutions. No actual funds are transferred.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Simulated Verification</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2">
          <div>
            © 2026 All India Council for Technical Education (AICTE). All rights reserved.
          </div>
          <div>
            Smart India Hackathon • Next.js App Router & Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
}
