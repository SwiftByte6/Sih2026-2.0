// Explainable Review Prioritization & Risk Classification Engine
// Strictly rule-based operational triage. NOT a probability of fraud.
// Designed to assist AICTE officers in routing cases efficiently.

import { DISCREPANCY_SEVERITY } from "./discrepancyEngine";

export const RISK_LEVELS = {
  CRITICAL: {
    label: "Critical Priority",
    code: "CRITICAL",
    badgeClasses: "bg-red-50 text-red-800 border-red-200",
    description: "Material financial or identity conflict requiring immediate senior officer attention.",
  },
  HIGH: {
    label: "High Priority",
    code: "HIGH",
    badgeClasses: "bg-orange-50 text-orange-800 border-orange-200",
    description: "Statutory date variance, potential maturity expiry, or unverified regulatory encumbrance.",
  },
  MEDIUM: {
    label: "Medium Priority",
    code: "MEDIUM",
    badgeClasses: "bg-amber-50 text-amber-800 border-amber-200",
    description: "Missing supporting documents or non-critical formatting differences.",
  },
  LOW: {
    label: "Standard Review",
    code: "LOW",
    badgeClasses: "bg-blue-50 text-blue-800 border-blue-200",
    description: "Consistent records with clean document extraction; standard officer sign-off pending.",
  },
};

/**
 * Calculates case review priority based on detected discrepancies and verified status.
 * Ensures a high OCR confidence percentage CANNOT hide critical financial discrepancies!
 *
 * @param {Object} instrument - Instrument record
 * @param {Array} discrepancies - Array of detected discrepancies from discrepancyEngine
 * @returns {Object} { level, label, badgeClasses, score, reasons, isCritical }
 */
export function calculateReviewPriority(instrument = {}, discrepancies = []) {
  const reasons = [];
  let score = 10; // Base score for pending cases

  // 1. Critical severity checks (+50 pts each)
  const criticalIssues = discrepancies.filter((d) => d.severity === DISCREPANCY_SEVERITY.CRITICAL);
  if (criticalIssues.length > 0) {
    criticalIssues.forEach((issue) => {
      reasons.push(`${issue.field}: ${issue.reason}`);
      score += 50;
    });
  }

  // 2. High severity checks (+30 pts each)
  const highIssues = discrepancies.filter((d) => d.severity === DISCREPANCY_SEVERITY.HIGH);
  if (highIssues.length > 0) {
    highIssues.forEach((issue) => {
      reasons.push(`${issue.field}: ${issue.reason}`);
      score += 30;
    });
  }

  // 3. Medium severity checks (+15 pts each)
  const mediumIssues = discrepancies.filter((d) => d.severity === DISCREPANCY_SEVERITY.MEDIUM);
  if (mediumIssues.length > 0) {
    mediumIssues.forEach((issue) => {
      reasons.push(`${issue.field}: ${issue.reason}`);
      score += 15;
    });
  }

  // 4. Instrument verification status considerations
  if (instrument.verification_status === "ACTION_REQUIRED") {
    score += 25;
    if (!reasons.some((r) => r.includes("Action required"))) {
      reasons.push("Case is marked in ACTION_REQUIRED status pending institution/officer response.");
    }
  }

  // 5. Expiry boundary check
  const daysToMaturity = instrument.days_to_maturity !== undefined ? instrument.days_to_maturity : 999;
  if (daysToMaturity < 0 && instrument.lifecycle_status === "ACTIVE") {
    score += 40;
    reasons.push(`Instrument expired ${Math.abs(daysToMaturity)} days ago; statutory lock-in renewal required.`);
  } else if (daysToMaturity <= 90 && daysToMaturity >= 0) {
    score += 20;
    reasons.push(`Maturity approaching in ${daysToMaturity} days (Clause 6.46 90-day window).`);
  }

  // Determine Level strictly based on highest severity issue
  let level = RISK_LEVELS.LOW;

  if (criticalIssues.length > 0 || score >= 60) {
    level = RISK_LEVELS.CRITICAL;
  } else if (highIssues.length > 0 || score >= 40) {
    level = RISK_LEVELS.HIGH;
  } else if (mediumIssues.length > 0 || score >= 25) {
    level = RISK_LEVELS.MEDIUM;
  }

  if (reasons.length === 0) {
    reasons.push("No material discrepancies detected. Standard document verification queue.");
  }

  return {
    level: level.code,
    label: level.label,
    badgeClasses: level.badgeClasses,
    description: level.description,
    score: Math.min(score, 100),
    reasons,
    isCritical: level.code === "CRITICAL",
    unresolvedDiscrepancyCount: discrepancies.length,
  };
}
