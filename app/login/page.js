"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Info,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/layout/PublicHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { MOCK_USERS, MOCK_INSTITUTIONS } from "@/lib/mockData";
import { setCurrentUser } from "@/lib/dataService";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("official");
  const [email, setEmail] = useState("rajesh.sharma@aicte-india.org");
  const [password, setPassword] = useState("••••••••••••");
  const [aicteId, setAicteId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedInstUser, setSelectedInstUser] = useState("user-inst-1");

  const institutionProfiles = [
    {
      userId: "user-inst-1",
      institutionId: "inst-001",
      name: "Delhi Institute of Engineering & Technology",
      contact: "Prof. Sunita Verma",
      email: "registrar@diet-delhi.edu.in",
      aicteId: "1-109283741",
    },
    {
      userId: "user-inst-2",
      institutionId: "inst-002",
      name: "Vivekananda College of Technology & Management",
      contact: "Dr. K. R. Ramanathan",
      email: "principal@vctm-chennai.ac.in",
      aicteId: "1-209384752",
    },
    {
      userId: "user-inst-3",
      institutionId: "inst-006",
      name: "Bangalore Institute of Advanced Technology",
      contact: "Dr. Ramesh Naidu",
      email: "registrar@biat-bengaluru.edu.in",
      aicteId: "1-602918374",
    },
    {
      userId: "user-inst-4",
      institutionId: "inst-007",
      name: "Gujarat Technological & Research Academy",
      contact: "Dr. Bhavin Patel",
      email: "principal@gtra-ahmedabad.ac.in",
      aicteId: "1-703819284",
    },
    {
      userId: "user-inst-5",
      institutionId: "inst-010",
      name: "National Institute of Engineering & Research (Kolkata)",
      contact: "Prof. Ananya Roy",
      email: "registrar@nier-kolkata.ac.in",
      aicteId: "1-100293847",
    },
  ];

  const handleSelectRolePreset = (roleType) => {
    setSelectedRole(roleType);
    setErrorMsg("");
    if (roleType === "official") {
      setEmail("rajesh.sharma@aicte-india.org");
      setAicteId("");
    } else if (roleType === "institution") {
      const p = institutionProfiles.find((ip) => ip.userId === selectedInstUser) || institutionProfiles[0];
      setEmail(p.email);
      setAicteId(p.aicteId);
    } else if (roleType === "admin") {
      setEmail("anil.deshmukh@aicte-india.org");
      setAicteId("");
    }
  };

  const handleSelectInstitutionProfile = (userId) => {
    setSelectedInstUser(userId);
    const p = institutionProfiles.find((ip) => ip.userId === userId);
    if (p) {
      setEmail(p.email);
      setAicteId(p.aicteId);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsLoading(false);
      let targetUser = MOCK_USERS[0];

      if (selectedRole === "institution") {
        targetUser = MOCK_USERS.find((u) => u.id === selectedInstUser) || MOCK_USERS.find((u) => u.id === "user-inst-1");
        setCurrentUser(targetUser.id);
        router.push("/institution/dashboard");
      } else if (selectedRole === "admin") {
        targetUser = MOCK_USERS.find((u) => u.id === "user-admin-1");
        setCurrentUser(targetUser.id);
        router.push("/admin/dashboard");
      } else {
        targetUser = MOCK_USERS.find((u) => u.id === "user-official-1");
        setCurrentUser(targetUser.id);
        router.push("/official/dashboard");
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex h-12 w-12 rounded-xl bg-blue-700 text-white items-center justify-center font-bold text-lg mb-3 shadow-xs">
              AI
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign In to AICTE Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Statutory Security Deposit & FDR Management System
            </p>
          </div>

          {/* Role Preset Tabs */}
          <div className="bg-slate-200/60 p-1 rounded-xl flex gap-1">
            <button
              type="button"
              onClick={() => handleSelectRolePreset("official")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                selectedRole === "official"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Council Official</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectRolePreset("institution")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                selectedRole === "institution"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Institution</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectRolePreset("admin")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                selectedRole === "admin"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Login Card */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {selectedRole === "institution" && (
                <div className="space-y-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <label className="block text-xs font-semibold text-blue-900">
                    Select Demo Institution / College Account:
                  </label>
                  <select
                    value={selectedInstUser}
                    onChange={(e) => handleSelectInstitutionProfile(e.target.value)}
                    className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {institutionProfiles.map((p) => (
                      <option key={p.userId} value={p.userId}>
                        {p.name} ({p.contact})
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-blue-700 font-mono">
                    Permanent AICTE ID: <strong>{aicteId}</strong>
                  </div>
                </div>
              )}

              <Input
                label="Official Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@aicte-india.org"
              />

              <Input
                label="Account Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />

              {showOtp && (
                <Input
                  label="Two-Factor Security Code (OTP)"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit code"
                  helpText="Simulated sandbox OTP: any 6 digits"
                />
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOtp}
                    onChange={(e) => setShowOtp(e.target.checked)}
                    className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                  />
                  <span>Simulate Two-Factor OTP</span>
                </label>
                <span className="text-slate-400">Sandbox Pre-filled</span>
              </div>

              {errorMsg && (
                <Alert variant="error" title="Authentication Error">
                  {errorMsg}
                </Alert>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full text-sm font-semibold h-10 mt-2"
              >
                Sign In to {selectedRole === "official" ? "Official Portal" : selectedRole === "institution" ? "Institution Portal" : "Admin Console"} →
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-100 text-center">
              <div className="text-[11px] text-slate-500">
                Active Sandbox Profile:{" "}
                <span className="font-semibold text-slate-800">
                  {selectedRole === "official"
                    ? "Dr. Rajesh Sharma (Senior Reviewer)"
                    : selectedRole === "institution"
                    ? `${institutionProfiles.find((p) => p.userId === selectedInstUser)?.contact} (${institutionProfiles.find((p) => p.userId === selectedInstUser)?.name})`
                    : "Anil Deshmukh (Council Super Admin)"}
                </span>
              </div>
            </div>
          </Card>

          <SimulatedNoticeBanner message="Development Sandbox: Click any role preset above and click Sign In to preview that role." />
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
