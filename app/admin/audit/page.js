"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  FileCode,
  Calendar,
  Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { getAuditLogs, formatDateTime } from "@/lib/dataService";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // BACKEND INTEGRATION:
      // supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
      const data = await getAuditLogs({
        search,
        entity_type: entityFilter || undefined,
      });
      setLogs(data);
      setLoading(false);
    }
    load();
  }, [search, entityFilter]);

  const handleInspectLog = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  return (
    <AppShell
      role="admin"
      breadcrumbs={[
        { label: "Admin Console", href: "/admin/dashboard" },
        { label: "Immutable Audit Trail" },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Immutable Audit Trail & Security Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Permanent, tamper-evident log of verification decisions, clearance approvals, and administrative actions.
          </p>
        </div>

        <Alert variant="info" title="Tamper-Evident Security Principle">
          Audit entries are generated via PostgreSQL triggers and service-role procedures. Records are strictly read-only for auditors and administrators and cannot be altered or removed.
        </Alert>

        {/* Filter bar */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search by Actor Name, Action, Correlation ID, Reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              options={[
                { value: "", label: "All Entity Types" },
                { value: "financial_instruments", label: "Financial Instruments" },
                { value: "clearance_records", label: "Clearance Records" },
                { value: "system_settings", label: "System Settings" },
                { value: "workflow_tasks", label: "Workflow Tasks" },
              ]}
            />
          </div>
        </Card>

        {/* Table */}
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
              header: "Action & Entity",
              key: "action",
              render: (row) => (
                <div>
                  <span className="font-bold text-slate-900 font-mono text-xs block">
                    {row.action}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {row.entity_type} ({row.entity_id})
                  </span>
                </div>
              ),
            },
            {
              header: "Actor & Role",
              key: "actor_name",
              render: (row) => (
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {row.actor_name}
                  </span>
                  <span className="text-[11px] text-blue-700 font-medium">
                    {row.actor_role}
                  </span>
                </div>
              ),
            },
            {
              header: "Correlation ID",
              key: "correlation_id",
              render: (row) => (
                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {row.correlation_id}
                </span>
              ),
            },
            {
              header: "Decision Reason",
              key: "reason",
              render: (row) => (
                <span className="text-xs text-slate-600 max-w-xs truncate block" title={row.reason}>
                  {row.reason}
                </span>
              ),
            },
            {
              header: "Payload",
              align: "right",
              render: (row) => (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleInspectLog(row)}
                >
                  Inspect JSON
                </Button>
              ),
            },
          ]}
        />

        {/* Inspect JSON Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Audit Event: ${selectedLog?.action}`}
          description={`Correlation ID: ${selectedLog?.correlation_id} • Actor: ${selectedLog?.actor_name}`}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Close Inspector
            </Button>
          }
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 font-sans font-bold block mb-1">
                Before State (JSON Snapshot):
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto text-[11px]">
                {JSON.stringify(selectedLog?.before_data || {}, null, 2)}
              </pre>
            </div>

            <div>
              <span className="text-slate-500 font-sans font-bold block mb-1">
                After State (JSON Snapshot):
              </span>
              <pre className="p-3 bg-slate-900 text-blue-400 rounded-lg overflow-x-auto text-[11px]">
                {JSON.stringify(selectedLog?.after_data || {}, null, 2)}
              </pre>
            </div>

            <div className="font-sans text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Recorded Reason:</strong> {selectedLog?.reason}
            </div>
          </div>
        </Modal>

      </div>
    </AppShell>
  );
}
