"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Activity,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MetricCard, Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import {
  getInstitutions,
  getAuditLogs,
  getIntegrationLogs,
  getInstruments,
  formatDateTime,
} from "@/lib/dataService";

export default function AdminDashboardPage() {
  const [institutionsCount, setInstitutionsCount] = useState(0);
  const [instrumentsCount, setInstrumentsCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState([]);
  const [integrationLogs, setIntegrationLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // Parallel system monitoring queries:
      // Promise.all([getInstitutions(), getInstruments(), getAuditLogs(), getIntegrationLogs()])
      const insts = await getInstitutions();
      const ins = await getInstruments({ pageSize: 1 });
      const auds = await getAuditLogs();
      const ints = await getIntegrationLogs();

      setInstitutionsCount(insts.length);
      setInstrumentsCount(ins.total);
      setAuditLogs(auds.slice(0, 4));
      setIntegrationLogs(ints);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <AppShell
      role="admin"
      breadcrumbs={[{ label: "Admin Console" }]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Council Administration & System Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Platform monitoring, immutable audit trail inspection, bank CBS connectors, and statutory reminder threshold configuration.
          </p>
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Registered Institutions"
            value={loading ? "..." : institutionsCount}
            subtitle="Affiliated technical institutes"
            icon={Building2}
          />

          <MetricCard
            title="Managed Financial Instruments"
            value={loading ? "..." : instrumentsCount}
            subtitle="Total security deposits"
            icon={Database}
          />

          <MetricCard
            title="Bank CBS Connector"
            value="Operational"
            subtitle="Dummy Bank API (Simulated)"
            icon={Activity}
            badge={
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Sandbox Mode
              </span>
            }
          />

          <MetricCard
            title="Failed Integration Retries"
            value="1 Active"
            subtitle="Bank of Baroda 504 Timeout"
            icon={AlertTriangle}
            badge={
              <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Retry Queued
              </span>
            }
          />
        </div>

        {/* Two-Column Admin Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column (2/3): Core Banking Integration Sync Logs */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <SectionHeader
                title="Bank Integration Gateway Sync Events"
                description="Real-time transaction log from dummy bank verification connector"
                action={
                  <Link href="/admin/integrations">
                    <Button variant="tertiary" size="sm" icon={ArrowRight} iconPosition="right">
                      All Logs
                    </Button>
                  </Link>
                }
              />

              <div className="space-y-3">
                {integrationLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      log.status === "SUCCEEDED"
                        ? "bg-slate-50/70 border-slate-200"
                        : "bg-rose-50/50 border-rose-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] font-mono ${
                            log.status === "SUCCEEDED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          HTTP {log.http_status}
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {log.instrument_reference}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">
                          {log.provider_name}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 font-mono text-[11px]">
                        {log.response_summary}
                      </p>
                    </div>

                    <div className="text-right shrink-0 text-[11px] text-slate-400 font-tabular-nums">
                      <div>{log.duration_ms}ms latency</div>
                      <div>{formatDateTime(log.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Immutable Audit Logs Preview */}
            <Card className="p-5">
              <SectionHeader
                title="Recent Immutable Audit Events"
                description="Security log of sensitive actions, status modifications, and approvals"
                action={
                  <Link href="/admin/audit">
                    <Button variant="tertiary" size="sm" icon={ArrowRight} iconPosition="right">
                      Inspect Audit Trail
                    </Button>
                  </Link>
                }
              />

              <div className="space-y-2.5">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">
                          {log.action}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">
                          Actor: <strong>{log.actor_name}</strong> ({log.actor_role})
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5">
                        {log.reason}
                      </p>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono shrink-0">
                      {formatDateTime(log.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side Column (1/3): Admin Controls & Rules */}
          <div className="space-y-6">
            <Card className="p-5">
              <SectionHeader
                title="Administrative Quick Actions"
                description="System maintenance shortcuts"
              />

              <div className="space-y-2">
                <Link href="/admin/institutions" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
                    <Building2 className="h-4 w-4 text-blue-700" />
                    <span>Manage Institutions & Roles</span>
                  </Button>
                </Link>
                <Link href="/admin/audit" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-700" />
                    <span>Inspect Immutable Audit Logs</span>
                  </Button>
                </Link>
                <Link href="/admin/integrations" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
                    <Activity className="h-4 w-4 text-blue-700" />
                    <span>Core Banking Gateway Diagnostic</span>
                  </Button>
                </Link>
                <Link href="/admin/settings" className="block">
                  <Button variant="secondary" size="sm" className="w-full justify-start gap-2">
                    <Settings className="h-4 w-4 text-blue-700" />
                    <span>Configure Reminder Thresholds</span>
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-5 bg-slate-50 border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Audit Trail Immutability Invariant
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Per government compliance guidelines, audit records cannot be edited, rolled back, or deleted. Every authorization transition or role assignment generates a tamper-evident audit record with actor ID and correlation reference.
              </p>
            </Card>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
