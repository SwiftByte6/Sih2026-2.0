"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Zap,
  Server,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader, MetricCard } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import {
  getIntegrationLogs,
  triggerBankPingDiagnostic,
  formatDateTime,
} from "@/lib/dataService";

export default function IntegrationsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulatingPing, setSimulatingPing] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getIntegrationLogs();
      setLogs(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSimulatePing = async () => {
    setSimulatingPing(true);
    try {
      const newLog = await triggerBankPingDiagnostic({ bankCode: "SBI" });
      setLogs((prev) => [newLog, ...prev]);
      setSimulatingPing(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 3000);
    } catch (err) {
      console.error("Diagnostic ping failed:", err);
      setSimulatingPing(false);
    }
  };

  return (
    <AppShell
      role="admin"
      breadcrumbs={[
        { label: "Admin Console", href: "/admin/dashboard" },
        { label: "Bank Integration Logs" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Core Banking Connector Diagnostics & Sync Logs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gateway health, API round-trip latencies, retry queues, and simulated dummy bank integration logs.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={Zap}
            loading={simulatingPing}
            onClick={handleSimulatePing}
          >
            Test Gateway Ping (Dummy API)
          </Button>
        </div>

        {pingSuccess && (
          <Alert variant="success" title="Gateway Ping Succeeded">
            Dummy Bank API Core Banking Connector responded with HTTP 200 OK (Roundtrip Latency: 288ms).
          </Alert>
        )}

        <SimulatedNoticeBanner message="Bank API integration layer is currently operating in sandbox simulation mode. Live bank integrations require authorized access and documented interfaces." />

        {/* Bank Connectors Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                State Bank of India CBS
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2 font-tabular-nums">
              342ms
            </div>
            <span className="text-[11px] text-slate-500">Average response latency</span>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Punjab National Bank CBS
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2 font-tabular-nums">
              418ms
            </div>
            <span className="text-[11px] text-slate-500">Average response latency</span>
          </Card>

          <Card className="p-4 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Bank of Baroda CBS
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 mt-2 font-tabular-nums">
              Timeout (504)
            </div>
            <span className="text-[11px] text-amber-700 font-semibold">Scheduled retry queued</span>
          </Card>
        </div>

        {/* Logs Grid */}
        <Card className="p-5">
          <SectionHeader
            title="Core Banking API Sync Event History"
            description="Transaction log recording every verification dispatch, HTTP response code, and latency"
          />

          <Table
            loading={loading}
            data={logs}
            columns={[
              {
                header: "Timestamp",
                key: "created_at",
                render: (row) => (
                  <span className="text-xs font-mono text-slate-700 font-tabular-nums">
                    {formatDateTime(row.created_at)}
                  </span>
                ),
              },
              {
                header: "Provider Connector",
                key: "provider_name",
                render: (row) => (
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      {row.provider_name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Op: {row.operation}
                    </span>
                  </div>
                ),
              },
              {
                header: "Target Instrument",
                key: "instrument_reference",
                render: (row) => (
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {row.instrument_reference}
                  </span>
                ),
              },
              {
                header: "HTTP Status",
                key: "http_status",
                render: (row) => (
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      row.http_status === 200
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    HTTP {row.http_status}
                  </span>
                ),
              },
              {
                header: "Latency",
                key: "duration_ms",
                align: "right",
                render: (row) => (
                  <span className="text-xs font-tabular-nums font-medium text-slate-700">
                    {row.duration_ms} ms
                  </span>
                ),
              },
              {
                header: "Response Summary",
                key: "response_summary",
                render: (row) => (
                  <div className="text-xs text-slate-600 max-w-sm">
                    {row.response_summary}
                    {row.error_message && (
                      <div className="text-rose-700 text-[11px] font-medium mt-0.5">
                        {row.error_message}
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AppShell>
  );
}
