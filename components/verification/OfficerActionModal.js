"use client";

import { useState } from "react";
import {
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileText,
  Clock,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

export function OfficerActionModal({
  isOpen,
  onClose,
  actionType = "REQUEST_CLARIFICATION", // REQUEST_CLARIFICATION | RESOLVE_DISCREPANCY | ADD_INTERNAL_NOTE | RECORD_DECISION
  instrument = {},
  discrepancies = [],
  onExecuteAction,
}) {
  const [subject, setSubject] = useState("Clarification Regarding Security Deposit Verification — AICTE North Region");
  const [content, setContent] = useState("");
  const [officerReason, setOfficerReason] = useState("");
  const [selectedDiscrepancyId, setSelectedDiscrepancyId] = useState(discrepancies[0]?.id || "");
  const [internalTag, setInternalTag] = useState("LEGAL_BUREAU");
  const [decisionType, setDecisionType] = useState("VERIFY"); // VERIFY | FLAG_DISCREPANCY | REJECT
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [confirmConsequential, setConfirmConsequential] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateAiDraft = async () => {
    setIsDraftingAi(true);
    setError("");
    try {
      const response = await fetch("/api/intelligence/draft-clarification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instrument_reference: instrument.instrument_reference || "FDR-2024-ND-001",
          institution_name: instrument.institution_name || "Delhi Institute of Engineering & Technology",
          fdr_number: instrument.fdr_number || "SBI-FDR-9823410294",
          discrepancy: discrepancies[0]?.reason || "Variance noted between certificate and bank ledger.",
          clause: "Clause 2.25",
        }),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.draft) {
        setContent(resJson.draft);
      } else {
        // Fallback default regulatory draft
        setContent(
          `To,\nThe Principal / Registrar,\n${instrument.institution_name || "Technical Institution"}\n\nSubject: Clarification on Security Deposit FDR Verification (${instrument.fdr_number || "FDR"})\n\nRespected Sir/Madam,\n\nDuring official AICTE verification of your security deposit submission under Approval Process Handbook Clause 1.12 / 2.25, the following variance was noted:\n\n• ${discrepancies[0]?.reason || "Discrepancy between certificate scan and application details."}\n\nYou are hereby requested to provide a verified clarification letter from the issuing bank branch manager or submit an amended deposit receipt within 7 working days.\n\nRegards,\nDr. Rajesh Sharma\nSenior Verification Officer\nBureau of Approval, AICTE New Delhi`
        );
      }
    } catch {
      setContent(
        `To,\nThe Principal / Registrar,\n${instrument.institution_name || "Technical Institution"}\n\nSubject: Clarification on Security Deposit FDR Verification (${instrument.fdr_number || "FDR"})\n\nRespected Sir/Madam,\n\nDuring official AICTE verification of your security deposit submission under Approval Process Handbook Clause 1.12 / 2.25, the following variance was noted:\n\n• ${discrepancies[0]?.reason || "Discrepancy between certificate scan and application details."}\n\nYou are hereby requested to provide a verified clarification letter from the issuing bank branch manager or submit an amended deposit receipt within 7 working days.\n\nRegards,\nDr. Rajesh Sharma\nSenior Verification Officer\nBureau of Approval, AICTE New Delhi`
      );
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleSubmit = async () => {
    if (actionType === "RECORD_DECISION" && !confirmConsequential) {
      setError("Please confirm official authorization before signing off on this consequential decision.");
      return;
    }
    if (actionType === "REQUEST_CLARIFICATION" && !content.trim()) {
      setError("Please provide the clarification message text.");
      return;
    }
    if ((actionType === "RESOLVE_DISCREPANCY" || actionType === "RECORD_DECISION") && !officerReason.trim()) {
      setError("Please provide an official audit justification.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onExecuteAction({
        actionType,
        subject,
        content,
        reason: officerReason,
        discrepancyId: selectedDiscrepancyId,
        internalTag,
        decisionType,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setError(err.message || "Action could not be recorded.");
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (actionType) {
      case "REQUEST_CLARIFICATION":
        return "Request Clarification from College Administrator";
      case "RESOLVE_DISCREPANCY":
        return "Resolve Discrepancy with Official Audit Justification";
      case "ADD_INTERNAL_NOTE":
        return "Add Bureau Internal Review Note";
      case "RECORD_DECISION":
        return "Record Authorized Verification Decision";
      default:
        return "Council Officer Action";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      title={getModalTitle()}
      description={`Instrument: ${instrument.instrument_reference || "FDR"} • Institution: ${instrument.institution_name || "Institution"}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={actionType === "RECORD_DECISION" && decisionType === "REJECT" ? "destructive" : "primary"}
            size="sm"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {actionType === "REQUEST_CLARIFICATION"
              ? "Dispatch Clarification Request"
              : actionType === "RESOLVE_DISCREPANCY"
              ? "Confirm & Resolve Discrepancy"
              : actionType === "ADD_INTERNAL_NOTE"
              ? "Save Internal Note"
              : "Confirm & Record Decision"}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {error && (
          <Alert variant="error" title="Action Validation Error">
            {error}
          </Alert>
        )}

        {/* 1. REQUEST CLARIFICATION */}
        {actionType === "REQUEST_CLARIFICATION" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500 text-[11px]">
                Pre-fill official draft referencing AICTE Handbook Clause 2.25:
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Sparkles}
                loading={isDraftingAi}
                onClick={handleGenerateAiDraft}
              >
                Generate AI Regulatory Draft
              </Button>
            </div>

            <Input
              label="Subject Line"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <Textarea
              label="Official Clarification Notice"
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter official inquiry to the college administrator..."
            />

            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-800">
              This request will immediately alert the institution registrar on their college dashboard and email. The instrument status will transition to <strong>CLARIFICATION_REQUESTED</strong>.
            </div>
          </div>
        )}

        {/* 2. RESOLVE DISCREPANCY */}
        {actionType === "RESOLVE_DISCREPANCY" && (
          <div className="space-y-3">
            {discrepancies.length > 0 && (
              <Select
                label="Select Discrepancy to Resolve"
                required
                value={selectedDiscrepancyId}
                onChange={(e) => setSelectedDiscrepancyId(e.target.value)}
                options={discrepancies.map((d) => ({
                  value: d.id,
                  label: `[${d.severity}] ${d.field} — ${d.reason.substring(0, 60)}...`,
                }))}
              />
            )}

            <Textarea
              label="Official Officer Justification / Audit Reason"
              required
              rows={4}
              value={officerReason}
              onChange={(e) => setOfficerReason(e.target.value)}
              placeholder="e.g. Issuing branch manager confirmed via phone and official stamped letter that the deposit was re-dated on 2024-03-15 after administrative merger. Variance resolved."
            />

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
              This action will mark the flagged variance as <strong>RESOLVED</strong> in the discrepancy ledger and log your officer credentials to the permanent audit record.
            </div>
          </div>
        )}

        {/* 3. ADD INTERNAL NOTE */}
        {actionType === "ADD_INTERNAL_NOTE" && (
          <div className="space-y-3">
            <Select
              label="Target Bureau Tag"
              value={internalTag}
              onChange={(e) => setInternalTag(e.target.value)}
              options={[
                { value: "LEGAL_BUREAU", label: "Legal Affairs Cell" },
                { value: "APPROVAL_BUREAU", label: "Bureau of Approval" },
                { value: "FINANCE_BUREAU", label: "Finance & Accounts Bureau" },
                { value: "REGIONAL_DIRECTORATE", label: "Regional Directorate" },
              ]}
            />

            <Textarea
              label="Internal Officer Observation"
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g. Contacted Canara Bank zonal office regarding pending interest lien confirmation. Regional officer inspection scheduled."
            />

            <p className="text-[11px] text-slate-400">
              Internal notes are strictly restricted to authenticated Council officers and are never visible to applicant colleges.
            </p>
          </div>
        )}

        {/* 4. RECORD DECISION */}
        {actionType === "RECORD_DECISION" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "VERIFY", label: "Approve Verification", desc: "Mark instrument fully verified", color: "border-emerald-300 bg-emerald-50 text-emerald-900" },
                { type: "FLAG_DISCREPANCY", label: "Flag Variance", desc: "Require institution resolution", color: "border-amber-300 bg-amber-50 text-amber-900" },
                { type: "REJECT", label: "Reject Submission", desc: "Reject deposit record", color: "border-red-300 bg-red-50 text-red-900" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setDecisionType(item.type)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                    decisionType === item.type ? `${item.color} font-bold ring-2 ring-blue-600/30` : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">{item.desc}</span>
                </button>
              ))}
            </div>

            <Textarea
              label="Mandatory Decision Remarks / Regulatory Basis"
              required
              rows={4}
              value={officerReason}
              onChange={(e) => setOfficerReason(e.target.value)}
              placeholder="e.g. Fixed Deposit Receipt and Clause 2.25 joint lien verified against Core Banking records and original bank certificate scan. Recommended for approval."
            />

            {/* Consequential confirmation checkbox */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmConsequential}
                  onChange={(e) => setConfirmConsequential(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-[11px] text-slate-700 leading-relaxed font-medium">
                  I solemnly confirm that I have inspected the original certificate document, deterministic reconciliation outcomes, and AICTE Handbook clauses. I take official accountability for this verification decision.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
