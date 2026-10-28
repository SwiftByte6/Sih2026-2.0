"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  History,
  Bell,
  Settings,
  Shield,
  Building2,
  RefreshCw,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X,
  FileCheck2,
  Users,
  Activity,
  BrainCircuit,
} from "lucide-react";
import { getCurrentUser, setCurrentUser, getAllUsers } from "@/lib/dataService";
import { SimulatedNoticeBanner } from "@/components/ui/Alert";
import { isLiveMode } from "@/lib/config";
import Image from "next/image";

export function AppShell({ children, role = "official", title = "", breadcrumbs = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const currentUser = getCurrentUser();
  const allUsers = getAllUsers();

  const handleRoleSwitch = (newUserId) => {
    setCurrentUser(newUserId);
    setProfileDropdownOpen(false);
    const user = allUsers.find((u) => u.id === newUserId);
    if (user.role === "institution_admin" || user.role === "institution_staff") {
      router.push("/institution/dashboard");
    } else if (user.role === "super_admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/official/dashboard");
    }
  };

  // Navigation configurations based on role
  const officialNav = [
    { label: "Dashboard", href: "/official/dashboard", icon: LayoutDashboard },
    { label: "AICTE Intelligence Hub", href: "/official/intelligence", icon: BrainCircuit, badge: "AI" },
    { label: "Verification Queue", href: "/official/verification", icon: CheckCircle2 },
    { label: "Discrepancy Review", href: "/official/discrepancies", icon: AlertTriangle },
    { label: "Workflow Tasks", href: "/official/tasks", icon: FileCheck2 },
    { label: "Release & Refund", href: "/official/release", icon: FileText },
    { label: "Lifecycle History", href: "/official/lifecycle", icon: History },
    { label: "Notifications", href: "/official/notifications", icon: Bell },
  ];

  const institutionNav = [
    { label: "Overview", href: "/institution/dashboard", icon: LayoutDashboard },
    { label: "Security Deposits (FDR)", href: "/institution/instruments", icon: FileText },
    { label: "Submit New FDR", href: "/institution/instruments/new", icon: CheckCircle2 },
    { label: "Renewals & Replacements", href: "/institution/renewals", icon: RefreshCw },
    { label: "Release / Refund Request", href: "/institution/release", icon: FileCheck2 },
    { label: "Maturity Tracking", href: "/institution/maturity", icon: Clock },
  ];

  const adminNav = [
    { label: "Admin Console", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Institutions & Access", href: "/admin/institutions", icon: Building2 },
    { label: "Audit Trail", href: "/admin/audit", icon: Shield },
    { label: "Bank Integration Logs", href: "/admin/integrations", icon: Activity },
    { label: "System Rules & Thresholds", href: "/admin/settings", icon: Settings },
  ];

  let navItems = officialNav;
  let portalLabel = "AICTE Verification Portal";
  let roleTitle = "Verification Officer";

  if (role === "institution") {
    navItems = institutionNav;
    portalLabel = "Institution FDR Portal";
    roleTitle = "Technical Institution";
  } else if (role === "admin") {
    navItems = adminNav;
    portalLabel = "AICTE Admin Portal";
    roleTitle = "Council Administrator";
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Top Banner clarifying Live vs Demo mode */}
      {/* {isLiveMode() ? (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-[11px] py-1.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-semibold">Supabase Live Mode Active:</span>
            <span>Querying PostgreSQL database and enforcing Server-Side RLS.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-emerald-300 text-emerald-800 px-1.5 py-0.5 rounded">
            LIVE DB
          </span>
        </div>
      ) : (
        <SimulatedNoticeBanner className="rounded-none border-x-0 border-t-0 text-[11px] py-1.5 px-4 bg-blue-50/60 border-blue-200 text-blue-900" />
      )} */}

      <div className="flex flex-1">
        {/* DESKTOP SIDEBAR: 230px, fixed, subtle 1px border */}
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-60 lg:flex-col bg-white border-r border-slate-200 h-screen">
          {/* Brand Header */}
          <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
           <Image src="/logo.png" alt="AICTE Logo" width={52} height={52} className="h-16 w-15" />
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/official/dashboard" &&
                  item.href !== "/institution/dashboard" &&
                  item.href !== "/admin/dashboard" &&
                  pathname.startsWith(item.href));

              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? "text-blue-700" : "text-slate-400"
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Role Switcher Sandbox Helper
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Switch Sandbox Role
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleRoleSwitch("user-official-1")}
                className={`text-left px-2.5 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  role === "official"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                1. Official Role
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch("user-inst-1")}
                className={`text-left px-2.5 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  role === "institution"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                2. Institution Role
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch("user-admin-1")}
                className={`text-left px-2.5 py-1.5 text-xs rounded-md font-medium transition-colors ${
                  role === "admin"
                    ? "bg-blue-100 text-blue-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                3. Admin Role
              </button>
            </div>
          </div> */}

          {/* Footer User Info */}
          <div className="p-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                <Image src='/profile.jpg' height={28} width={28} alt="User Avatar" className="h-full w-full rounded-full"  />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser?.full_name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentUser?.designation}
                </p>
              </div>
            </div>
            <Link
              href="/login"
              title="Sign Out"
              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </aside>

        {/* MAIN APPLICATION CONTAINER */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
          {/* Top Bar (56px high) */}
          <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Mobile menu button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Link
                  href={
                    role === "institution"
                      ? "/institution/dashboard"
                      : role === "admin"
                      ? "/admin/dashboard"
                      : "/official/dashboard"
                  }
                  className="hover:text-blue-700 transition-colors"
                >
                  {roleTitle}
                </Link>
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center gap-2">
                    <span className="text-slate-300">/</span>
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-blue-700 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-slate-900 font-semibold">
                        {crumb.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            </div>

            {/* Top Right Utilities */}
            <div className="flex items-center gap-3">
              {/* Notifications Link */}
              <Link
                href="/official/notifications"
                className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  <span className="h-6 w-6 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-[10px]">
                <Image src='/profile.jpg' height={28} width={28} alt="User Avatar" className="h-full w-full rounded-full"  />
                  </span>
                  <span className="hidden sm:inline font-semibold">
                    {currentUser?.full_name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <div className="font-semibold text-slate-900">
                        {currentUser?.full_name}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {currentUser?.email}
                      </div>
                      <div className="mt-1 inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {currentUser?.role}
                      </div>
                    </div>
                    <Link
                      href="/"
                      className="block px-3.5 py-2 text-slate-700 hover:bg-slate-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Portal Home
                    </Link>
                    <Link
                      href="/login"
                      className="block px-3.5 py-2 text-red-600 hover:bg-red-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Sign Out
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-1">
                Navigation
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  <item.icon className="h-4 w-4 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Main Content Area: 32px padding, max width, white canvas card structure */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
