"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  FileText,
  AlertCircle,
  Building2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { formatINR, createInstrument } from "@/lib/dataService";

export default function NewInstrumentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    bank_name: "State Bank of India",
    bank_branch: "Pushp Vihar Branch, New Delhi",
    bank_ifsc: "SBIN0001234",
    fdr_number: "SBI-FDR-2026-991823",
    amount: "3500000",
    issue_date: "2026-10-01",
    maturity_date: "2031-10-01",
    purpose: "Mandatory Security Deposit under Clause 1.12 for UG Engineering Program",
    lien_marked: true,
    lien_details: "Jointly encumbered in favor of Member Secretary, AICTE, New Delhi and Delhi Institute of Engineering & Technology",
    signatory_name: "Prof. Sunita Verma",
    signatory_designation: "Registrar & Authorized Signatory",
  });

  // Simulated Document Upload & OCR state
  const [uploadedFile, setUploadedFile] = useState({
    name: "SBI_Security_Deposit_Receipt_35Lakh.pdf",
    size: "1.4 MB",
  });
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSimulateFileUpload = () => {
    setIsExtractingOcr(true);
    setTimeout(() => {
      setIsExtractingOcr(false);
      setOcrCompleted(true);
    }, 700);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createInstrument(formData, uploadedFile, "11111111-1111-1111-1111-111111111101");
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      setTimeout(() => {
        router.push("/institution/instruments");
      }, 1500);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError(err.message || "Failed to submit instrument record.");
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell
      role="institution"
      breadcrumbs={[
        { label: "Dashboard", href: "/institution/dashboard" },
        { label: "Security Deposits", href: "/institution/instruments" },
        { label: "New FDR Submission" },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/institution/instruments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to FDR Repository</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Submit New Security Deposit (FDR)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Register a Fixed Deposit Receipt under AICTE Approval Process Handbook (Clause 1.12 / 2.25).
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-medium">
            {[
              { num: 1, label: "Banking Details" },
              { num: 2, label: "Joint Lien Declaration" },
              { num: 3, label: "Document & OCR Scan" },
              { num: 4, label: "Review & Submit" },
            ].map((step) => (
              <div
                key={step.num}
                className={`py-2 px-3 rounded-lg border transition-colors ${
                  currentStep === step.num
                    ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                    : currentStep > step.num
                    ? "bg-slate-50 border-slate-200 text-slate-700"
                    : "border-transparent text-slate-400"
                }`}
              >
                <span className="block text-[11px] uppercase tracking-wider">
                  Step {step.num}
                </span>
                <span className="truncate">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {submissionSuccess && (
          <Alert variant="success" title="FDR Submission Successfully Recorded">
            Your security deposit record has been created and assigned reference <strong>FDR-2026-ND-010</strong>. It is now queued for AICTE official verification. Redirecting...
          </Alert>
        )}

        {/* STEP 1: Banking Details */}
        {currentStep === 1 && (
          <Card className="p-6">
            <SectionHeader
              title="Step 1: Financial Instrument & Banking Details"
              description="Provide exact details as stated on the bank deposit certificate"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Scheduled Bank Name"
                required
                value={formData.bank_name}
                onChange={(e) => handleInputChange("bank_name", e.target.value)}
                options={[
                  { value: "State Bank of India", label: "State Bank of India" },
                  { value: "Punjab National Bank", label: "Punjab National Bank" },
                  { value: "Canara Bank", label: "Canara Bank" },
                  { value: "Bank of Baroda", label: "Bank of Baroda" },
                  { value: "HDFC Bank", label: "HDFC Bank" },
                  { value: "ICICI Bank", label: "ICICI Bank" },
                  { value: "Union Bank of India", label: "Union Bank of India" },
                ]}
              />

              <Input
                label="Bank Branch Name"
                required
                value={formData.bank_branch}
                onChange={(e) => handleInputChange("bank_branch", e.target.value)}
                placeholder="e.g. Pushp Vihar Branch, New Delhi"
              />

              <Input
                label="Bank IFSC Code"
                required
                value={formData.bank_ifsc}
                onChange={(e) => handleInputChange("bank_ifsc", e.target.value)}
                placeholder="e.g. SBIN0001234"
              />

              <Input
                label="FDR / Receipt Certificate Number"
                required
                value={formData.fdr_number}
                onChange={(e) => handleInputChange("fdr_number", e.target.value)}
                placeholder="e.g. SBI-FDR-9823410294"
              />

              <Input
                label="Principal Secured Amount (INR)"
                required
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="e.g. 3500000"
                helpText={`Equivalent to: ${formatINR(parseFloat(formData.amount || 0))}`}
              />

              <Input
                label="Date of Issue / Deposit"
                required
                type="date"
                value={formData.issue_date}
                onChange={(e) => handleInputChange("issue_date", e.target.value)}
              />

              <Input
                label="Maturity Date (Min 5 Years)"
                required
                type="date"
                value={formData.maturity_date}
                onChange={(e) => handleInputChange("maturity_date", e.target.value)}
                helpText="Mandatory 5-year regulatory lock-in duration under Clause 1.12"
              />

              <Input
                label="Deposit Purpose / Approval Category"
                required
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                placeholder="e.g. Clause 1.12 Security Deposit for UG Engineering"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setCurrentStep(2)} icon={ArrowRight} iconPosition="right">
                Next: Joint Lien Declaration
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Joint Lien Declaration */}
        {currentStep === 2 && (
          <Card className="p-6">
            <SectionHeader
              title="Step 2: Statutory Joint Lien Declaration"
              description="Declaration of joint encumbrance in favor of the Member Secretary, AICTE"
            />

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-950 space-y-2">
                <span className="font-bold text-sm block text-blue-900">
                  Statutory Requirement under AICTE Approval Process Handbook
                </span>
                <p className="leading-relaxed">
                  Fixed Deposit Receipts submitted towards security deposit must be created jointly in the name of the institution and the Member Secretary, AICTE, New Delhi. The bank must register an explicit joint lien, prohibiting unauthorized premature withdrawal or alteration without written AICTE approval.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="lien-check"
                  checked={formData.lien_marked}
                  onChange={(e) => handleInputChange("lien_marked", e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-blue-700 focus:ring-blue-600 h-4 w-4"
                />
                <label htmlFor="lien-check" className="text-xs text-slate-800 leading-relaxed cursor-pointer">
                  <strong className="block text-slate-900">
                    Formal Joint Lien Registered with Scheduled Bank
                  </strong>
                  I hereby declare that the Fixed Deposit Receipt specified herein has been formally encumbered in favor of the Member Secretary, AICTE, New Delhi and the Bank Core Banking System has registered this joint lien restriction.
                </label>
              </div>

              <Textarea
                label="Lien Particulars & Bank Confirmation Remarks"
                required
                rows={3}
                value={formData.lien_details}
                onChange={(e) => handleInputChange("lien_details", e.target.value)}
                placeholder="Jointly encumbered in favor of Member Secretary, AICTE, New Delhi..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Authorized Signatory Name"
                  required
                  value={formData.signatory_name}
                  onChange={(e) => handleInputChange("signatory_name", e.target.value)}
                />
                <Input
                  label="Signatory Designation"
                  required
                  value={formData.signatory_designation}
                  onChange={(e) => handleInputChange("signatory_designation", e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} icon={ArrowRight} iconPosition="right">
                Next: Document Upload & OCR
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 3: Document Upload & OCR Scan */}
        {currentStep === 3 && (
          <Card className="p-6">
            <SectionHeader
              title="Step 3: Document Upload & Automated Extraction Review"
              description="Upload scanned deposit certificate. Review extracted fields before final submission."
            />

            <div className="space-y-6">
              {/* File Upload Zone */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 bg-slate-50/50 transition-colors">
                <Upload className="h-8 w-8 text-blue-700 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Upload Scanned FDR Certificate PDF
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Accepted formats: PDF, JPEG, PNG (Max file size: 10 MB)
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={isExtractingOcr}
                    onClick={handleSimulateFileUpload}
                  >
                    Simulate OCR Extraction
                  </Button>
                </div>
              </div>

              {/* Uploaded File Pill */}
              {uploadedFile && (
                <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-700" />
                    <span className="font-medium text-slate-800">{uploadedFile.name}</span>
                    <span className="text-slate-400">({uploadedFile.size})</span>
                  </div>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    OCR Processed
                  </span>
                </div>
              )}

              {/* OCR Review Comparison Card */}
              {ocrCompleted && (
                <div className="bg-purple-50/40 border border-purple-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      OCR Extraction Verification Review
                    </span>
                    <span className="text-[11px] font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                      Confidence: 98.4%
                    </span>
                  </div>

                  <p className="text-xs text-purple-950">
                    The extraction engine detected the following fields from your certificate. Confirm they match your entered details.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block text-[11px]">Detected FDR No</span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {formData.fdr_number}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block text-[11px]">Detected Amount</span>
                      <span className="font-bold text-slate-900 font-tabular-nums">
                        {formatINR(parseFloat(formData.amount))}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                      <span className="text-slate-400 block text-[11px]">Detected Bank</span>
                      <span className="font-semibold text-slate-900">
                        {formData.bank_name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(4)} icon={ArrowRight} iconPosition="right">
                Next: Final Review
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 4: Review & Submit */}
        {currentStep === 4 && (
          <Card className="p-6">
            <SectionHeader
              title="Step 4: Final Verification Review & Submission"
              description="Review all information before transmitting your deposit record to AICTE for official verification"
            />

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Institution</span>
                    <span className="text-sm font-bold text-slate-900">
                      Delhi Institute of Engineering & Technology
                    </span>
                    <span className="text-slate-500 block text-[11px]">AICTE ID: 1-109283741</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Deposit Amount</span>
                    <span className="text-lg font-bold text-slate-900 font-tabular-nums">
                      {formatINR(parseFloat(formData.amount))}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Bank & Branch</span>
                    <span className="font-semibold text-slate-800">{formData.bank_name}</span>
                    <div className="text-slate-500 text-[11px]">{formData.bank_branch}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">FDR Number</span>
                    <span className="font-semibold text-slate-800 font-mono">{formData.fdr_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">IFSC Code</span>
                    <span className="font-semibold text-slate-800 font-mono">{formData.bank_ifsc}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Issue Date</span>
                    <span className="font-semibold text-slate-800 font-tabular-nums">{formData.issue_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Maturity Date</span>
                    <span className="font-semibold text-slate-800 font-tabular-nums">{formData.maturity_date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Joint Lien</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      AICTE Encumbered
                    </span>
                  </div>
                </div>
              </div>

              <SimulatedNoticeBanner message="Submitting will queue this deposit record for automated dummy bank verification and official review by AICTE North Region Verification Bureau." />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button
                variant="primary"
                loading={isSubmitting}
                onClick={handleFinalSubmit}
                icon={CheckCircle2}
              >
                Submit FDR for Official Verification
              </Button>
            </div>
          </Card>
        )}

      </div>
    </AppShell>
  );
}
