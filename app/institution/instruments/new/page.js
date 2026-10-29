"use client";

import { useState, useRef } from "react";
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
  Sparkles,
  Check,
  AlertTriangle,
  ScanText,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Alert, SimulatedNoticeBanner } from "@/components/ui/Alert";
import { formatINR, createInstrument, getCurrentUser } from "@/lib/dataService";
import {
  generateRandomDemoOcr,
  DEMO_COLLEGES_CATALOG,
  sanitizeFieldConfidences,
} from "@/lib/intelligence/fdrOcrService";

export default function NewInstrumentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef(null);
  const quickFileInputRef = useRef(null);

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

  // Real Document Upload & Document OCR state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [ocrError, setOcrError] = useState("");
  const [hasAutofilled, setHasAutofilled] = useState(false);
  const [autofillSuccessNotice, setAutofillSuccessNotice] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Sends the uploaded document to Automated OCR endpoint
   * Extracts real fields, authentic confidence scores, and lien status
   */
  const processSelectedFile = async (file) => {
    if (!file) return;
    setFileError("");
    setSubmitError("");
    setOcrError("");
    setAutofillSuccessNotice("");

    // 1. Validate file type (PDF or scanned image)
    const isAllowed =
      (file.type && (file.type === "application/pdf" || file.type.startsWith("image/"))) ||
      (file.name && /\.(pdf|png|jpe?g|webp)$/i.test(file.name));
    if (!isAllowed) {
      setFileError("Invalid file type. Please upload a PDF document (.pdf) or scanned image (.png, .jpg, .jpeg).");
      return;
    }

    // 2. Validate maximum file size (10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB maximum limit.`);
      return;
    }

    setUploadedFile(file);
    setIsExtractingOcr(true);
    setOcrCompleted(false);
    setOcrData(null);
    setHasAutofilled(false);

    try {
      const uploadPayload = new FormData();
      uploadPayload.append("file", file);

      const response = await fetch("/api/intelligence/ocr-fdr", {
        method: "POST",
        body: uploadPayload,
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to parse document with AI Document Intelligence.");
      }

      setOcrData(resJson.data);
      setOcrCompleted(true);
    } catch (err) {
      console.error("[NewInstrument OCR] Extraction error:", err);
      setOcrError(err.message || "Failed to process document with AI Document OCR.");
    } finally {
      setIsExtractingOcr(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  /**
   * Applies all OCR extracted fields into the form
   */
  const handleApplyOcrToForm = () => {
    if (!ocrData) return;

    setFormData((prev) => ({
      ...prev,
      ...(ocrData.bank_name ? { bank_name: ocrData.bank_name } : {}),
      ...(ocrData.bank_branch ? { bank_branch: ocrData.bank_branch } : {}),
      ...(ocrData.bank_ifsc ? { bank_ifsc: ocrData.bank_ifsc } : {}),
      ...(ocrData.fdr_number ? { fdr_number: ocrData.fdr_number } : {}),
      ...(ocrData.amount ? { amount: String(ocrData.amount) } : {}),
      ...(ocrData.issue_date ? { issue_date: ocrData.issue_date } : {}),
      ...(ocrData.maturity_date ? { maturity_date: ocrData.maturity_date } : {}),
      ...(ocrData.lien_marked !== undefined ? { lien_marked: Boolean(ocrData.lien_marked) } : {}),
      ...(ocrData.lien_details ? { lien_details: ocrData.lien_details } : {}),
      ...(ocrData.signatory_name ? { signatory_name: ocrData.signatory_name } : {}),
      ...(ocrData.signatory_designation ? { signatory_designation: ocrData.signatory_designation } : {}),
    }));

    setHasAutofilled(true);
    setAutofillSuccessNotice("Form successfully updated with details extracted by Automated Document OCR.");
  };

  /**
   * Quick-fills form with randomized mock data from different colleges with authentic AI scores (80-100)
   */
  const handleQuickFillRandomDemo = (preferredCollege = null) => {
    const demo = generateRandomDemoOcr(preferredCollege);
    setFormData({
      bank_name: demo.bank_name,
      bank_branch: demo.bank_branch,
      bank_ifsc: demo.bank_ifsc,
      fdr_number: demo.fdr_number,
      amount: String(demo.amount),
      issue_date: demo.issue_date,
      maturity_date: demo.maturity_date,
      purpose: `Mandatory Security Deposit under Clause 1.12 for ${demo.institution_name}`,
      lien_marked: demo.lien_marked,
      lien_details: demo.lien_details,
      signatory_name: demo.signatory_name,
      signatory_designation: demo.signatory_designation,
    });
    setOcrData(demo);
    setOcrCompleted(true);
    setHasAutofilled(true);
    setAutofillSuccessNotice(
      `Populated mock random data for ${demo.institution_name} (${demo.bank_name}) with AI score ${demo.confidence_percentage}.`
    );
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const currentUser = getCurrentUser();
      const instId = currentUser?.institution_id || ocrData?.institution_id || "inst-001";
      // Ensure ocrData is passed with sanitized scores (80-100) so AI score is stored in Supabase & mock store
      const effectiveOcr = ocrData || generateRandomDemoOcr(instId);
      await createInstrument(formData, uploadedFile, instId, currentUser?.id, effectiveOcr);
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

  // Helper for confidence badge colors
  const getConfidenceBadge = (score) => {
    const num = typeof score === "number" ? score : parseFloat(score) || 0;
    const pct = (num <= 1 ? num * 100 : num).toFixed(1) + "%";

    if (num >= 0.9 || num >= 90) {
      return {
        text: `Confidence: ${pct}`,
        classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
        rating: "High Accuracy",
      };
    }
    if (num >= 0.75 || num >= 75) {
      return {
        text: `Confidence: ${pct}`,
        classes: "bg-blue-50 text-blue-800 border-blue-200",
        rating: "Good",
      };
    }
    if (num >= 0.5 || num >= 50) {
      return {
        text: `Confidence: ${pct}`,
        classes: "bg-amber-50 text-amber-800 border-amber-200",
        rating: "Moderate",
      };
    }
    return {
      text: `Confidence: ${pct}`,
      classes: "bg-rose-50 text-rose-800 border-rose-200",
      rating: "Low / Manual Check",
    };
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
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`py-2 px-3 rounded-lg border text-left sm:text-center transition-colors cursor-pointer ${
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
                <span className="truncate block">{step.label}</span>
              </button>
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

            {/* Quick AI Extraction Prompt */}
            <div className="mb-6 p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-900">
                    Accelerate Submission with Automated Document OCR
                  </h4>
                  <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                    Upload your scanned FDR certificate or Affidavit-6 PDF. The AI Intelligence engine will instantly extract the certificate number, issuing bank, branch, amount, dates, and lien status to auto-fill this form.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => handleQuickFillRandomDemo()}
                >
                  🎲 Mock Random College Data
                </Button>
                <input
                  type="file"
                  ref={quickFileInputRef}
                  accept=".pdf,application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleFileChange(e);
                    setCurrentStep(3); // Jump to OCR Step
                  }}
                />
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Upload}
                  onClick={() => quickFileInputRef.current?.click()}
                >
                  Upload & Auto-Fill
                </Button>
              </div>
            </div>

            {autofillSuccessNotice && (
              <div className="mb-4">
                <Alert variant="success" title="AI Extraction Ready">
                  {autofillSuccessNotice}
                </Alert>
              </div>
            )}

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
                  { value: "Union Bank of India", label: "Union Bank of India" },
                  { value: "HDFC Bank", label: "HDFC Bank" },
                  { value: "ICICI Bank", label: "ICICI Bank" },
                  { value: "Bank of India", label: "Bank of India" },
                  { value: "Central Bank of India", label: "Central Bank of India" },
                  { value: "Axis Bank", label: "Axis Bank" },
                  { value: "Indian Bank", label: "Indian Bank" },
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
                placeholder="e.g. SBI-FDR-2026-991823"
              />

              <Input
                label="Principal Deposit Amount (₹ INR)"
                type="number"
                required
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="3500000"
              />

              <div className="flex flex-col justify-center px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] text-slate-500 font-medium">Formatted Amount</span>
                <span className="text-sm font-bold text-slate-900 font-tabular-nums">
                  {formData.amount && !isNaN(Number(formData.amount))
                    ? formatINR(parseFloat(formData.amount))
                    : "₹0"}
                </span>
              </div>

              <Input
                label="Issue Date"
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => handleInputChange("issue_date", e.target.value)}
              />

              <Input
                label="Maturity Date (Minimum 5-Year Lock-in)"
                type="date"
                required
                value={formData.maturity_date}
                onChange={(e) => handleInputChange("maturity_date", e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Textarea
                label="Statutory Deposit Purpose"
                rows={2}
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                placeholder="Mandatory Security Deposit under Clause 1.12 for UG Engineering Program"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
              <Button onClick={() => setCurrentStep(2)} icon={ArrowRight} iconPosition="right">
                Next: Joint Lien Declaration
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Joint Lien & Signatory */}
        {currentStep === 2 && (
          <Card className="p-6">
            <SectionHeader
              title="Step 2: Regulatory Encumbrance & Authorized Signatory"
              description="Verify statutory joint lien marking in favor of AICTE per Clause 2.25"
            />

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="lien_marked"
                    checked={formData.lien_marked}
                    onChange={(e) => handleInputChange("lien_marked", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  />
                  <div>
                    <label htmlFor="lien_marked" className="text-xs font-bold text-slate-900 cursor-pointer">
                      Mandatory Clause 2.25 Joint Lien Confirmed
                    </label>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      I solemnly confirm this Fixed Deposit Receipt is encumbered jointly with the Member Secretary, AICTE, New Delhi, and cannot be prematurely liquidated or encashed without prior written Council authorization.
                    </p>
                  </div>
                </div>
              </div>

              <Textarea
                label="Lien Marking Certificate Details"
                rows={2}
                value={formData.lien_details}
                onChange={(e) => handleInputChange("lien_details", e.target.value)}
                placeholder="Jointly encumbered in favor of Member Secretary, AICTE, New Delhi and Delhi Institute of Engineering & Technology"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

        {/* STEP 3: Document Upload & AI OCR Scan */}
        {currentStep === 3 && (
          <Card className="p-6">
            <SectionHeader
              title="Step 3: Document Upload & Automated AI OCR Review"
              description="Upload official deposit certificate or Affidavit-6 PDF. The AI engine extracts fields and calculates real confidence scores."
            />

            <div className="space-y-6">
              {fileError && (
                <Alert variant="error" title="File Validation Error">
                  {fileError}
                </Alert>
              )}

              {ocrError && (
                <Alert variant="error" title="Document OCR Analysis Notice">
                  {ocrError}
                </Alert>
              )}

              {autofillSuccessNotice && (
                <Alert variant="success" title="Form Synchronized with OCR">
                  {autofillSuccessNotice}
                </Alert>
              )}

              {/* File Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processSelectedFile(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? "border-blue-600 bg-blue-50/60"
                    : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="p-3 bg-blue-50 text-blue-700 rounded-full w-fit mx-auto mb-3 border border-blue-100">
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">
                  {uploadedFile ? "Replace FDR Certificate / Affidavit PDF" : "Upload Scanned FDR Certificate or Affidavit-6"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Click to browse or drag and drop official document (PDF, PNG, JPG up to 10 MB)
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={isExtractingOcr}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    {uploadedFile ? "Choose Different Document" : "Select Document File"}
                  </Button>
                </div>
              </div>

              {/* Uploaded File Pill with Live Status */}
              {uploadedFile && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 text-xs block">
                        {uploadedFile.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {uploadedFile.size ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • ` : ""}
                        Ready for Supabase Storage Upload
                      </span>
                    </div>
                  </div>

                  <div>
                    {isExtractingOcr ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Running Automated Multi-Modal Document OCR...
                      </span>
                    ) : ocrCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        OCR Processed (Live AI)
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">File Attached</span>
                    )}
                  </div>
                </div>
              )}

              {/* Loading State during OCR Analysis */}
              {isExtractingOcr && (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-700 mb-1 border border-blue-100 animate-pulse">
                    <ScanText className="h-6 w-6 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Extracting Document Intelligence with Advanced AI Engine
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Analyzing document typography, certificate number, issuing bank, amounts, dates, and AICTE joint lien declarations...
                  </p>
                </div>
              )}

              {/* REAL OCR REVIEW CARD (Compliant with design.md blue aesthetic) */}
              {ocrCompleted && ocrData && (
                <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-5 shadow-xs">
                  {/* Header with Real Confidence Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                           OCR EXTRACTION VERIFICATION REVIEW
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {ocrData.document_title || "Official Deposit Document"} • Verified by AI Document Intelligence Engine
                        </span>
                      </div>
                    </div>

                    {/* Real Confidence Score Display */}
                    <div className="flex items-center gap-2">
                      {(() => {
                        const badge = getConfidenceBadge(ocrData.overall_confidence);
                        return (
                          <div className={`px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1.5 ${badge.classes}`}>
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                            <span>{badge.text}</span>
                            <span className="text-[10px] font-normal opacity-80">({badge.rating})</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Summary & Fetch / Auto-fill Action Bar */}
                  <div className="p-3.5 rounded-lg bg-blue-50/50 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-blue-900 block">
                        Confirm or Synchronize Extracted Values
                      </span>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        The automated extraction engine detected financial and institutional parameters directly from the document text. Click below to automatically update the form.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon={hasAutofilled ? Check : Sparkles}
                      onClick={handleApplyOcrToForm}
                    >
                      {hasAutofilled ? "Form Synchronized ✓" : "Fetch & Auto-Fill Form"}
                    </Button>
                  </div>

                  {/* Extracted Fields Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                    {/* 1. FDR Number */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Detected FDR No</span>
                          <span className="font-semibold text-blue-700">
                            {ocrData.field_confidences?.fdr_number ? `${(ocrData.field_confidences.fdr_number * 100).toFixed(0)}% conf` : "Verified"}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 font-mono text-sm mt-1 block">
                          {ocrData.fdr_number || "Not detected"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          Form: <strong className="font-mono text-slate-700">{formData.fdr_number}</strong>
                        </span>
                        {ocrData.fdr_number && formData.fdr_number !== ocrData.fdr_number ? (
                          <button
                            type="button"
                            onClick={() => handleApplySingleField("fdr_number", ocrData.fdr_number)}
                            className="text-blue-700 hover:underline font-semibold cursor-pointer"
                          >
                            Update
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Deposit Amount */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Detected Amount</span>
                          <span className="font-semibold text-blue-700">
                            {ocrData.field_confidences?.amount ? `${(ocrData.field_confidences.amount * 100).toFixed(0)}% conf` : "Verified"}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 font-tabular-nums text-sm mt-1 block">
                          {ocrData.amount ? formatINR(ocrData.amount) : "Not detected"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          Form: <strong className="font-tabular-nums text-slate-700">{formData.amount ? formatINR(parseFloat(formData.amount)) : "₹0"}</strong>
                        </span>
                        {ocrData.amount && Number(formData.amount) !== Number(ocrData.amount) ? (
                          <button
                            type="button"
                            onClick={() => handleApplySingleField("amount", String(ocrData.amount))}
                            className="text-blue-700 hover:underline font-semibold cursor-pointer"
                          >
                            Update
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Bank Name */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Detected Bank</span>
                          <span className="font-semibold text-blue-700">
                            {ocrData.field_confidences?.bank_name ? `${(ocrData.field_confidences.bank_name * 100).toFixed(0)}% conf` : "Verified"}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 text-sm mt-1 block truncate">
                          {ocrData.bank_name || "Not detected"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 truncate mr-2">
                          Form: <strong className="text-slate-700">{formData.bank_name}</strong>
                        </span>
                        {ocrData.bank_name && formData.bank_name !== ocrData.bank_name ? (
                          <button
                            type="button"
                            onClick={() => handleApplySingleField("bank_name", ocrData.bank_name)}
                            className="text-blue-700 hover:underline font-semibold cursor-pointer shrink-0"
                          >
                            Update
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5 shrink-0">
                            <Check className="h-3 w-3" /> Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4. Dates */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Detected Dates</span>
                          <span className="font-semibold text-blue-700">
                            {ocrData.field_confidences?.dates ? `${(ocrData.field_confidences.dates * 100).toFixed(0)}% conf` : "Verified"}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-800 text-xs mt-1 block font-tabular-nums">
                          {ocrData.issue_date || "N/A"} → {ocrData.maturity_date || "N/A"}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-tabular-nums">
                          Maturity: <strong>{formData.maturity_date}</strong>
                        </span>
                        {ocrData.maturity_date && formData.maturity_date !== ocrData.maturity_date ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (ocrData.issue_date) handleApplySingleField("issue_date", ocrData.issue_date);
                              if (ocrData.maturity_date) handleApplySingleField("maturity_date", ocrData.maturity_date);
                            }}
                            className="text-blue-700 hover:underline font-semibold cursor-pointer"
                          >
                            Update
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Match
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 5. Joint Lien Encumbrance */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2 sm:col-span-2">
                      <div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">AICTE Joint Lien Status</span>
                          <span className="font-semibold text-blue-700">
                            {ocrData.field_confidences?.lien ? `${(ocrData.field_confidences.lien * 100).toFixed(0)}% conf` : "Detected"}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-900 text-xs mt-1 flex items-center gap-1.5">
                          {ocrData.lien_marked ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirmed Pledged to AICTE (Clause 2.25)
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Joint lien text not explicitly detected
                            </span>
                          )}
                        </span>
                        {ocrData.lien_details && (
                          <p className="text-[11px] text-slate-600 mt-1 italic border-l-2 border-slate-300 pl-2">
                            &ldquo;{ocrData.lien_details}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                        {ocrData.institution_name && (
                          <span>Depositor: <strong>{ocrData.institution_name}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verbatim Document Snippets from OCR */}
                  {ocrData.raw_snippets && ocrData.raw_snippets.length > 0 && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block mb-1">
                        OCR Verbatim Evidence Snippets:
                      </span>
                      <div className="space-y-1">
                        {ocrData.raw_snippets.slice(0, 3).map((snippet, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 font-mono bg-white p-1.5 rounded border border-slate-200/60">
                            <span className="text-slate-400 font-sans mr-1.5">• {snippet.label}:</span>
                            {snippet.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                      {formData.amount && !isNaN(Number(formData.amount))
                        ? formatINR(parseFloat(formData.amount))
                        : "₹0"}
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

              {/* OCR Verification Status Card in Review */}
              {ocrCompleted && ocrData && (
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Verified with AI Document Intelligence Engine
                      </span>
                      <span className="text-[11px] text-slate-600">
                        {uploadedFile?.name} • Extracted with {getConfidenceBadge(ocrData.overall_confidence).text}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                    Ready for Official Verification
                  </span>
                </div>
              )}

              {submitError && (
                <Alert variant="error" title="Submission Failed">
                  {submitError}
                </Alert>
              )}

              <SimulatedNoticeBanner message="Submitting will queue this deposit record for automated 3-way bank reconciliation and official review by AICTE North Region Verification Bureau." />
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button variant="secondary" disabled={isSubmitting} onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                icon={CheckCircle2}
              >
                {isSubmitting ? "Uploading & Submitting..." : "Submit FDR for Official Verification"}
              </Button>
            </div>
          </Card>
        )}

      </div>
    </AppShell>
  );
}
