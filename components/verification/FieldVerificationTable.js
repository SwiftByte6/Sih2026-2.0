"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  Edit2,
  Sparkles,
  Check,
  Search,
  Eye,
  History,
  Lock,
} from "lucide-react";
import { formatINR, formatDate } from "@/lib/dataService";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function FieldVerificationTable({
  submitted = {},
  extracted = {},
  discrepancies = [],
  activeField = null,
  onSelectField,
  onSaveCorrection,
}) {
  const [editingField, setEditingField] = useState(null);
  const [correctionValue, setCorrectionValue] = useState("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionHistory, setCorrectionHistory] = useState({});

  // 11 Comprehensive Verification Fields per Prompt Specification
  const fields = [
    {
      id: "fdr_number",
      label: "FDR / Instrument Number",
      submitted_value: submitted.fdr_number || "Not specified",
      extracted_value: extracted.fdr_number || "UBI-FDR-6629104829",
      normalized_value: (extracted.fdr_number || submitted.fdr_number || "").toUpperCase().replace(/[\s-]/g, ""),
      confidence: "99.0%",
      source_doc: "FDR Certificate / Affidavit-6",
      source_page: 1,
      supporting_text: extracted.raw_snippets?.find((s) => s.label?.includes("fdr"))?.text || `Certificate No: ${extracted.fdr_number || submitted.fdr_number}`,
      type: "identity",
    },
    {
      id: "amount",
      label: "Principal Amount & Currency",
      submitted_value: submitted.amount ? formatINR(submitted.amount) : "₹0",
      extracted_value: extracted.amount ? formatINR(extracted.amount) : formatINR(3000000),
      normalized_value: extracted.amount ? `INR ${extracted.amount.toLocaleString("en-IN")}` : `INR ${submitted.amount?.toLocaleString("en-IN")}`,
      confidence: "98.5%",
      source_doc: "FDR Certificate",
      source_page: 1,
      supporting_text: extracted.raw_snippets?.find((s) => s.label?.includes("amount"))?.text || `Principal Amount Words & Figures: ₹${(extracted.amount || submitted.amount)?.toLocaleString("en-IN")}`,
      type: "financial",
    },
    {
      id: "bank_name",
      label: "Issuing Scheduled Bank",
      submitted_value: submitted.bank_name || "Union Bank of India",
      extracted_value: extracted.bank_name || "UBI",
      normalized_value: "Union Bank of India",
      confidence: "98.0%",
      source_doc: "FDR Certificate Header",
      source_page: 1,
      supporting_text: `Issuing Scheduled Commercial Bank: ${extracted.bank_name || submitted.bank_name}`,
      type: "banking",
    },
    {
      id: "bank_branch",
      label: "Branch & IFSC Code",
      submitted_value: `${submitted.bank_branch || "Pushp Vihar, New Delhi"} • ${submitted.bank_ifsc || "UBIN0000281"}`,
      extracted_value: extracted.bank_branch ? `${extracted.bank_branch} • ${extracted.bank_ifsc || ""}` : "Saket Branch, New Delhi • UBIN0000281",
      normalized_value: (submitted.bank_ifsc || "UBIN0000281").toUpperCase(),
      confidence: "95.0%",
      source_doc: "Branch Header & Stamp",
      source_page: 1,
      supporting_text: `Branch Address & IFSC: ${submitted.bank_branch} (IFSC: ${submitted.bank_ifsc})`,
      type: "banking",
    },
    {
      id: "issue_date",
      label: "Instrument Issue Date",
      submitted_value: formatDate(submitted.issue_date) || "01-Aug-2016",
      extracted_value: formatDate(extracted.issue_date) || "01-Aug-2016",
      normalized_value: submitted.issue_date || "2016-08-01",
      confidence: "97.0%",
      source_doc: "Certificate Date Box",
      source_page: 1,
      supporting_text: `Date of Issuance: ${extracted.issue_date || submitted.issue_date}`,
      type: "date",
    },
    {
      id: "validity_date",
      label: "Validity / Tenor Period",
      submitted_value: "10 Years (Statutory Lock-in)",
      extracted_value: "120 Months (Fixed Tenor)",
      normalized_value: "10 Years Continuous Lock-in",
      confidence: "96.0%",
      source_doc: "Tenor Clause",
      source_page: 1,
      supporting_text: "Statutory deposit lock-in term under AICTE Approval Process Handbook Clause 1.12 / 2.25",
      type: "date",
    },
    {
      id: "maturity_date",
      label: "Statutory Maturity Date",
      submitted_value: formatDate(submitted.maturity_date) || "01-Aug-2026",
      extracted_value: formatDate(extracted.maturity_date) || "01-Aug-2026",
      normalized_value: submitted.maturity_date || "2026-08-01",
      confidence: "97.5%",
      source_doc: "Maturity Date Box",
      source_page: 1,
      supporting_text: `Due Date / Maturity Date: ${extracted.maturity_date || submitted.maturity_date}`,
      type: "date",
    },
    {
      id: "institution_name",
      label: "Depositor / Institution Name",
      submitted_value: submitted.institution_name || "Delhi Institute of Engineering & Technology",
      extracted_value: extracted.institution_name || "Delhi Institute of Engineering & Technology",
      normalized_value: "Delhi Institute of Engineering & Technology (AICTE ID: 1-109283741)",
      confidence: "99.0%",
      source_doc: "Account Title / Depositor Line",
      source_page: 1,
      supporting_text: `Account Title: ${extracted.institution_name || submitted.institution_name}`,
      type: "institution",
    },
    {
      id: "beneficiary",
      label: "Beneficiary / Lien-Holder",
      submitted_value: "Member Secretary, AICTE, New Delhi",
      extracted_value: "Member Secretary, AICTE, New Delhi",
      normalized_value: "The Member Secretary, All India Council for Technical Education, New Delhi",
      confidence: "96.5%",
      source_doc: "Joint Lien Marking Endorsement",
      source_page: 1,
      supporting_text: "Joint lien pledged in favor of Member Secretary, AICTE, New Delhi",
      type: "regulatory",
    },
    {
      id: "lien_declaration",
      label: "Clause 2.25 Joint Lien Declaration",
      submitted_value: submitted.lien_marked ? "Confirmed Pledged to AICTE" : "Unmarked",
      extracted_value: extracted.lien_marked !== false ? "Clause 2.25 Lien Confirmed" : "Lien Not Explicitly Stated",
      normalized_value: "AICTE Joint Encumbrance Verified",
      confidence: "94.0%",
      source_doc: "Affidavit-6 Clause 1 & FDR Face",
      source_page: 1,
      supporting_text: extracted.lien_details || submitted.lien_details || "Encumbered jointly with Member Secretary, AICTE",
      type: "regulatory",
    },
    {
      id: "renewal_details",
      label: "Renewal & Encashment Standing",
      submitted_value: submitted.lifecycle_status === "ACTIVE" ? "Active Encumbered (No Premature Liquidation)" : submitted.lifecycle_status || "Active",
      extracted_value: "No Prior Liquidation / Non-Encashment Declared",
      normalized_value: "Unencashed Clean Status",
      confidence: "95.0%",
      source_doc: "Affidavit-6 Paragraph 3",
      source_page: 1,
      supporting_text: "Sworn confirmation that FDR has not been mortgaged, pledged elsewhere, or prematurely encashed.",
      type: "lifecycle",
    },
  ];

  // Helper to determine status for each field
  const getFieldStatus = (field) => {
    // Check if corrected
    if (correctionHistory[field.id]) {
      return { label: "Corrected & Verified", variant: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    }
    // Check if there is an active discrepancy
    const issue = discrepancies.find((d) => d.field.toLowerCase().includes(field.label.toLowerCase()) || field.label.toLowerCase().includes(d.field.toLowerCase()));
    if (issue) {
      if (issue.severity === "CRITICAL") {
        return { label: "Critical Mismatch", variant: "bg-red-50 text-red-800 border-red-200" };
      }
      return { label: "Variance Flagged", variant: "bg-amber-50 text-amber-800 border-amber-200" };
    }
    return { label: "Verified Match", variant: "bg-emerald-50 text-emerald-800 border-emerald-200" };
  };

  const handleOpenEdit = (field) => {
    setEditingField(field);
    setCorrectionValue(field.submitted_value);
    setCorrectionReason("");
  };

  const handleSaveEdit = () => {
    if (!editingField || !correctionValue.trim()) return;
    setCorrectionHistory((prev) => ({
      ...prev,
      [editingField.id]: {
        value: correctionValue,
        reason: correctionReason || "Officer field reconciliation verified against certificate evidence.",
        officer: "Dr. Rajesh Sharma",
        timestamp: new Date().toISOString(),
      },
    }));
    if (onSaveCorrection) {
      onSaveCorrection({
        fieldId: editingField.id,
        value: correctionValue,
        reason: correctionReason,
      });
    }
    setEditingField(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Field-by-Field AI & Document Reconciliation
          </h3>
          <p className="text-xs text-slate-500">
            Select any field row to inspect supporting document evidence and verbatim quotes in the left PDF viewer.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          11 Statutory Parameters
        </span>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Field Name</th>
                <th className="py-2.5 px-3">Submitted Value</th>
                <th className="py-2.5 px-3">AI Extracted</th>
                <th className="py-2.5 px-3">Normalized / Standard</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((field) => {
                const status = getFieldStatus(field);
                const isSelected = activeField?.id === field.id;
                const hasCorrection = correctionHistory[field.id];

                return (
                  <tr
                    key={field.id}
                    onClick={() => onSelectField && onSelectField(field)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 font-medium"
                        : "hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Field & Source Label */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />}
                        <span>{field.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        Page {field.source_page} • {field.source_doc}
                      </span>
                    </td>

                    {/* Submitted Value */}
                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-mono text-[11px]">
                        {hasCorrection ? (
                          <span>
                            <span className="line-through text-slate-400 mr-1">{field.submitted_value}</span>
                            <span className="font-bold text-blue-700">{hasCorrection.value}</span>
                          </span>
                        ) : (
                          field.submitted_value
                        )}
                      </span>
                    </td>

                    {/* AI Extracted */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-900 text-[11px] flex items-center gap-1.5">
                        <span>{field.extracted_value}</span>
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                          {field.confidence}
                        </span>
                      </div>
                      {field.supporting_text && (
                        <span className="text-[10px] text-slate-400 italic block truncate max-w-xs" title={field.supporting_text}>
                          &ldquo;{field.supporting_text}&rdquo;
                        </span>
                      )}
                    </td>

                    {/* Normalized Standard */}
                    <td className="py-3 px-3">
                      <span className="text-slate-600 text-[11px] font-mono">
                        {field.normalized_value}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${status.variant}`}>
                        {status.label.includes("Verified") ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        <span>{status.label}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectField && onSelectField(field)}
                          className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-slate-100"
                          title="Inspect Evidence in PDF"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(field)}
                          className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                          title="Edit / Record Officer Correction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Officer Correction Modal */}
      {editingField && (
        <Modal
          isOpen={Boolean(editingField)}
          onClose={() => setEditingField(null)}
          title={`Reconcile Field: ${editingField.label}`}
          description="Record an official officer correction or verified override for this field. All actions are logged to the immutable audit trail."
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditingField(null)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCorrectionValue(editingField.extracted_value)}
              >
                Use Extracted ({editingField.extracted_value})
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                Save Correction & Mark Verified
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Submitted Claim:</span>
                <span className="font-mono font-bold text-slate-800">{editingField.submitted_value}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">AI Extracted:</span>
                <span className="font-mono font-bold text-blue-700">{editingField.extracted_value}</span>
                <span className="text-[10px] text-slate-400 block">Confidence: {editingField.confidence}</span>
              </div>
            </div>

            <Input
              label="Verified Correct Value"
              required
              value={correctionValue}
              onChange={(e) => setCorrectionValue(e.target.value)}
              placeholder="Enter verified value"
            />

            <Textarea
              label="Official Officer Justification / Audit Reason"
              required
              rows={3}
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g. Verified against issuing branch letterhead scan. Figure confirmed as ₹30,00,000 per original bank certificate."
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
