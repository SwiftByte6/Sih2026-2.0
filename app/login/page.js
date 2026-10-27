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

  const handleSelectRolePreset = (roleType) => {
    setSelectedRole(roleType);
    setErrorMsg("");
    if (roleType === "official") {
      setEmail("rajesh.sharma@aicte-india.org");
      setAicteId("");
    } else if (roleType === "institution") {
      setEmail("registrar@diet-delhi.edu.in");
      setAicteId("1-109283741");
    } else if (roleType === "admin") {
      setEmail("anil.deshmukh@aicte-india.org");
      setAicteId("");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    // BACKEND INTEGRATION:
    // Future Supabase Auth call:
    // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // Followed by fetching user role from `role_assignments` and redirecting accordingly.

    setTimeout(() => {
      setIsLoading(false);
      let targetUser = MOCK_USERS[0];

      if (selectedRole === "institution") {
        targetUser = MOCK_USERS.find((u) => u.id === "user-inst-1");
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
              <Input
                label="Official Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@aicte-india.org"
              />

              {selectedRole === "institution" && (
                <Input
                  label="AICTE Permanent Institute ID"
                  required
                  value={aicteId}
                  onChange={(e) => setAicteId(e.target.value)}
                  placeholder="e.g. 1-109283741"
                  helpText="Found on your AICTE Approval / EoA letter"
                />
              )}

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
                    ? "Prof. Sunita Verma (Delhi Institute)"
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
