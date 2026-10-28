"use client";

import { useState } from "react";
import {
  Settings,
  Clock,
  Bell,
  Save,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Database,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { updateSystemSettings } from "@/lib/dataService";

export default function AdminSettingsPage() {
  const [reminders, setReminders] = useState({
    threshold1: "90",
    threshold2: "60",
    threshold3: "30",
    threshold4: "7",
    escalationDays: "5",
    simulationMode: "enabled",
    autoRetryAttempts: "3",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateSystemSettings(reminders);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setIsSaving(false);
    }
  };

  return (
    <AppShell
      role="admin"
      breadcrumbs={[
        { label: "Admin Console", href: "/admin/dashboard" },
        { label: "System Rules & Thresholds" },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Rules & Statutory Thresholds Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automated cron intervals, maturity warning thresholds, and sandbox simulation behaviors.
          </p>
        </div>

        {saveSuccess && (
          <Alert variant="success" title="System Configuration Updated">
            Maturity reminder thresholds and operational parameters have been saved and logged in the immutable audit trail.
          </Alert>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Maturity Reminders */}
          <Card className="p-6">
            <SectionHeader
              title="Statutory Maturity Warning Thresholds (Days Prior to Expiry)"
              description="Background cron workers dispatch automated reminders to institutions and regional officers at these intervals"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input
                label="1st Stage Notice (Days)"
                type="number"
                required
                value={reminders.threshold1}
                onChange={(e) => setReminders({ ...reminders, threshold1: e.target.value })}
                helpText="Initial early reminder"
              />
              <Input
                label="2nd Stage Notice (Days)"
                type="number"
                required
                value={reminders.threshold2}
                onChange={(e) => setReminders({ ...reminders, threshold2: e.target.value })}
                helpText="Intermediate notice"
              />
              <Input
                label="3rd Stage Notice (Days)"
                type="number"
                required
                value={reminders.threshold3}
                onChange={(e) => setReminders({ ...reminders, threshold3: e.target.value })}
                helpText="Mandatory renewal window"
              />
              <Input
                label="Final Urgent Notice (Days)"
                type="number"
                required
                value={reminders.threshold4}
                onChange={(e) => setReminders({ ...reminders, threshold4: e.target.value })}
                helpText="Imminent expiry alert"
              />
            </div>
          </Card>

          {/* Section 2: Escalation & Workflows */}
          <Card className="p-6">
            <SectionHeader
              title="Verification Escalation & Retry Limits"
              description="Automated assignment rules for unresolved tasks and external API faults"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Officer Task Escalation Deadline (Days)"
                type="number"
                required
                value={reminders.escalationDays}
                onChange={(e) => setReminders({ ...reminders, escalationDays: e.target.value })}
                helpText="Unattended verification tasks escalate to Regional Director"
              />
              <Input
                label="Max Bank API Retry Attempts"
                type="number"
                required
                value={reminders.autoRetryAttempts}
                onChange={(e) => setReminders({ ...reminders, autoRetryAttempts: e.target.value })}
                helpText="Retry count on HTTP 504 timeouts before queuing for review"
              />
            </div>
          </Card>

          {/* Section 3: Sandbox Simulation Environment */}
          <Card className="p-6">
            <SectionHeader
              title="Core Banking Simulator Mode"
              description="Governs whether bank verification requests query the dummy mock API endpoint"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Simulation Mode"
                value={reminders.simulationMode}
                onChange={(e) => setReminders({ ...reminders, simulationMode: e.target.value })}
                options={[
                  { value: "enabled", label: "Enabled — Dummy Bank API (Simulated)" },
                  { value: "disabled", label: "Disabled — Direct Live Gateway (Restricted)" },
                ]}
                helpText="Sandbox mode flags all verification outputs as simulated."
              />
            </div>

            <div className="mt-4">
              <SimulatedNoticeBanner message="Never expose private service-role secrets on client components. Integration credentials must be stored strictly in server-side environment variables." />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              icon={Save}
            >
              Save Configuration & Record Audit Log
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
