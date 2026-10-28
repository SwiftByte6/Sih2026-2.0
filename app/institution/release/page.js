"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  PlusCircle,
  Upload,
  AlertCircle,
  Building2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import {
  getReleaseRequests,
  createReleaseRequest,
  formatINR,
  formatDate,
} from "@/lib/dataService";

export default function InstitutionReleasePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Release Application Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFdr, setSelectedFdr] = useState("fdr-008");
  const [affidavitUploaded, setAffidavitUploaded] = useState(true);
  const [requestLetterUploaded, setRequestLetterUploaded] = useState(true);
  const [remarks, setRemarks] = useState("Ten-year regulatory term completed. Requesting NOC under Clause 6.46.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const institutionId = "inst-001";

  useEffect(() => {
    async function load() {
      const data = await getReleaseRequests({ institution_id: institutionId });
      setRequests(data);
      setLoading(false);
    }
    load();
  }, [institutionId]);

  const handleCreateReleaseRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newReq = await createReleaseRequest({
        institutionId,
        instrumentId: selectedFdr,
        requestType: "RELEASE",
        reason: remarks,
      });

      setRequests((prev) => [newReq, ...prev]);
      setSuccessMsg(`Release application filed successfully under reference ${newReq.request_reference}.`);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to create release request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="institution"
      breadcrumbs={[
        { label: "Dashboard", href: "/institution/dashboard" },
        { label: "Release & Refund Applications" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Security Deposit Release & Refund Applications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Apply for release of completed 10-year term deposits under AICTE Approval Process Handbook Clause 6.46 & Affidavit-6.
            </p>
          </div>
          <Button size="sm" icon={PlusCircle} onClick={() => setModalOpen(true)}>
            Apply for Release / Refund
          </Button>
        </div>

        {successMsg && (
          <Alert variant="success" title="Application Filed">
            {successMsg}
          </Alert>
        )}

        <Alert variant="info" title="Clause 6.46 Release Procedure & Affidavit-6 Requirements">
          Technical institutions that have completed the 10-year regulatory lock-in duration are eligible to apply for release. Required documents include notarized Affidavit-6 on stamp paper, an official request letter, copy of the FDR, and clearance from AICTE Legal, Approval, Finance, and Regional Offices.
        </Alert>

        {/* Existing Applications Table */}
        <Table
          loading={loading}
          data={requests}
          emptyTitle="No release requests on file"
          emptyDescription="You have not initiated any security deposit release applications."
          columns={[
            {
              header: "Reference",
              key: "request_reference",
              render: (row) => (
                <div>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {row.request_reference}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-mono">
                    {row.fdr_number}
                  </span>
                </div>
              ),
            },
            {
              header: "Bank & Instrument",
              key: "bank_name",
              render: (row) => (
                <div>
                  <span className="text-xs font-semibold text-slate-800">
                    {row.bank_name}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {row.instrument_reference}
                  </span>
                </div>
              ),
            },
            {
              header: "Deposit Amount",
              key: "amount",
              align: "right",
              render: (row) => (
                <span className="font-bold text-slate-900 text-xs font-tabular-nums">
                  {formatINR(row.amount)}
                </span>
              ),
            },
            {
              header: "Submitted Date",
              key: "submitted_at",
              render: (row) => (
                <span className="text-xs text-slate-700 font-tabular-nums">
                  {formatDate(row.submitted_at)}
                </span>
              ),
            },
            {
              header: "Clearances Status",
              key: "clearances",
              render: (row) => (
                <div className="text-xs">
                  <span className="font-semibold text-slate-800">
                    {row.clearances_summary?.cleared || 0} of {row.clearances_summary?.total || 4} Cleared
                  </span>
                  <span className="text-slate-400 text-[11px] block">
                    {row.clearances_summary?.pending || 0} pending review
                  </span>
                </div>
              ),
            },
            {
              header: "Status",
              key: "status",
              render: (row) => (
                <StatusBadge status={row.status} type="release" size="sm" />
              ),
            },
            {
              header: "Action",
              align: "right",
              render: (row) => (
                <Link href={`/official/release/${row.id}`}>
                  <Button variant="secondary" size="sm">
                    View Progress
                  </Button>
                </Link>
              ),
            },
          ]}
        />

        {/* Modal: Apply for Release */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Apply for Security Deposit Release (Clause 6.46)"
          description="Submit Affidavit-6 and request letter to initiate multi-cell clearances"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={handleCreateReleaseRequest}
              >
                Submit Release Application
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <Select
              label="Select Matured Instrument to Release"
              required
              value={selectedFdr}
              onChange={(e) => setSelectedFdr(e.target.value)}
              options={[
                { value: "fdr-008", label: "FDR-2016-ND-008 — Union Bank of India (₹30,00,000) [Matured 10-Yr Term]" },
                { value: "fdr-001", label: "FDR-2024-ND-001 — State Bank of India (₹35,00,000)" },
              ]}
            />

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <span className="font-bold text-slate-900 block">
                Required Statutory Uploads Checklist:
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Notarized Affidavit-6 on Non-Judicial Stamp Paper
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Attached</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Official Request Letter on Institution Letterhead
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">Attached</span>
              </div>
            </div>

            <Textarea
              label="Application Remarks & Justification"
              required
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <SimulatedNoticeBanner message="Submitting will assign this release application to the AICTE Approval Bureau and initiate automated clearance tasks across Legal, Finance, and Regional Offices." />
          </div>
        </Modal>

      </div>
    </AppShell>
  );
}
