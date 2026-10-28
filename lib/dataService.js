// Unified Data Provider Service for AICTE Security Deposit & FDR Management Portal
// Dispatches between 'demo' mode (centralized mock store) and 'live' mode (Supabase PostgreSQL & Auth).
// Rule: In live mode, errors are thrown and displayed directly; never silently fallen back to mock data.

import { isLiveMode } from "./config";
import {
  MOCK_USERS,
  MOCK_INSTITUTIONS,
  MOCK_INSTRUMENTS,
  MOCK_DOCUMENTS,
  MOCK_VERIFICATION_REQUESTS,
  MOCK_VERIFICATION_CHECKS,
  MOCK_RELEASE_REQUESTS,
  MOCK_CLEARANCES,
  MOCK_TASKS,
  MOCK_NOTIFICATIONS,
  MOCK_LIFECYCLE_EVENTS,
  MOCK_AUDIT_LOGS,
  MOCK_INTEGRATION_LOGS,
} from "./mockData";

import {
  getInstitutionsLive,
  getInstitutionByIdLive,
  getInstrumentsLive,
  getInstrumentByIdLive,
  recordVerificationDecisionLive,
  getVerificationQueueLive,
  getDiscrepanciesLive,
  getReleaseRequestsLive,
  getReleaseRequestByIdLive,
  getTasksLive,
  getNotificationsLive,
  getAuditLogsLive,
  getIntegrationLogsLive,
  getDashboardMetricsLive,
  updateClearanceLive,
  approveReleaseLive,
  updateTaskStatusLive,
  markNotificationReadLive,
  markAllNotificationsReadLive,
  createInstrumentLive,
  sendClarificationLive,
  createReleaseRequestLive,
  updateSystemSettingsLive,
  triggerBankPingDiagnosticLive,
  createInstitutionLive,
  getDocumentSignedUrlLive,
  uploadDocumentLive,
} from "./supabase/dataLive";

// --- Current Simulated User / Session State for Demo Mode ---
let currentSimulatedUser = MOCK_USERS[0]; // Default: Dr. Rajesh Sharma (Official Reviewer)

export function getCurrentUser() {
  return currentSimulatedUser;
}

export function setCurrentUser(userId) {
  const found = MOCK_USERS.find((u) => u.id === userId);
  if (found) {
    currentSimulatedUser = found;
  }
  return currentSimulatedUser;
}

export function getAllUsers() {
  return MOCK_USERS;
}

// ==========================================
// 1. INSTITUTIONS
// ==========================================

export async function getInstitutions(filters = {}) {
  if (isLiveMode()) {
    return await getInstitutionsLive(filters);
  }

  let list = [...MOCK_INSTITUTIONS];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (i) =>
        i.institution_name.toLowerCase().includes(q) ||
        i.aicte_institution_id.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.state.toLowerCase().includes(q)
    );
  }
  if (filters.state) {
    list = list.filter((i) => i.state === filters.state);
  }
  return list;
}

export async function getInstitutionById(id) {
  if (isLiveMode()) {
    return await getInstitutionByIdLive(id);
  }
  return MOCK_INSTITUTIONS.find((i) => i.id === id) || null;
}

// ==========================================
// 2. FINANCIAL INSTRUMENTS
// ==========================================

export async function getInstruments(filters = {}) {
  if (isLiveMode()) {
    return await getInstrumentsLive(filters);
  }

  let list = [...MOCK_INSTRUMENTS];

  if (filters.institution_id) {
    list = list.filter((i) => i.institution_id === filters.institution_id);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (i) =>
        i.instrument_reference.toLowerCase().includes(q) ||
        i.fdr_number.toLowerCase().includes(q) ||
        i.bank_name.toLowerCase().includes(q) ||
        i.institution_name.toLowerCase().includes(q) ||
        i.account_holder_name.toLowerCase().includes(q)
    );
  }

  if (filters.lifecycle_status) {
    list = list.filter((i) => i.lifecycle_status === filters.lifecycle_status);
  }

  if (filters.verification_status) {
    list = list.filter((i) => i.verification_status === filters.verification_status);
  }

  if (filters.bank_name) {
    list = list.filter((i) => i.bank_name === filters.bank_name);
  }

  if (filters.expiring_soon) {
    list = list.filter((i) => i.days_to_maturity !== undefined && i.days_to_maturity >= 0 && i.days_to_maturity <= 90);
  }

  // Sorting
  if (filters.sort_by === "amount_desc") {
    list.sort((a, b) => b.amount - a.amount);
  } else if (filters.sort_by === "amount_asc") {
    list.sort((a, b) => a.amount - b.amount);
  } else if (filters.sort_by === "maturity_asc") {
    list.sort((a, b) => new Date(a.maturity_date) - new Date(b.maturity_date));
  } else {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Pagination simulation
  const page = parseInt(filters.page || 1, 10);
  const pageSize = parseInt(filters.pageSize || 10, 10);
  const total = list.length;
  const start = (page - 1) * pageSize;
  const items = list.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getInstrumentById(id) {
  if (isLiveMode()) {
    return await getInstrumentByIdLive(id);
  }

  const instrument = MOCK_INSTRUMENTS.find((i) => i.id === id);
  if (!instrument) return null;

  const documents = MOCK_DOCUMENTS.filter((d) => d.instrument_id === id);
  const verificationRequests = MOCK_VERIFICATION_REQUESTS.filter((vr) => vr.instrument_id === id);
  const verificationChecks = MOCK_VERIFICATION_CHECKS.filter((vc) => vc.instrument_id === id);
  const lifecycleEvents = MOCK_LIFECYCLE_EVENTS.filter((le) => le.instrument_id === id);
  const institution = MOCK_INSTITUTIONS.find((inst) => inst.id === instrument.institution_id);
  const parentInstrument = instrument.parent_instrument_id
    ? MOCK_INSTRUMENTS.find((pi) => pi.id === instrument.parent_instrument_id)
    : null;

  return {
    ...instrument,
    institution,
    documents,
    verificationRequests,
    verificationChecks,
    lifecycleEvents,
    parentInstrument,
  };
}

// ==========================================
// 3. VERIFICATION & DECISION RECORDING
// ==========================================

export async function recordVerificationDecision({
  instrumentId,
  decisionType,
  reason,
  actorId,
  actorName,
}) {
  if (isLiveMode()) {
    return await recordVerificationDecisionLive({
      instrumentId,
      decisionType,
      reason,
      actorId,
      actorName,
    });
  }

  // Demo Mode: In-memory mutation
  const foundIndex = MOCK_INSTRUMENTS.findIndex((i) => i.id === instrumentId);
  if (foundIndex === -1) return null;

  let newVerificationStatus = MOCK_INSTRUMENTS[foundIndex].verification_status;
  let newLifecycleStatus = MOCK_INSTRUMENTS[foundIndex].lifecycle_status;

  if (decisionType === "VERIFY") {
    newVerificationStatus = "VERIFIED";
    newLifecycleStatus = "ACTIVE";
  } else if (decisionType === "FLAG_DISCREPANCY") {
    newVerificationStatus = "ACTION_REQUIRED";
  } else if (decisionType === "REQUEST_INFO") {
    newVerificationStatus = "PROCESSING";
  } else if (decisionType === "REJECT") {
    newVerificationStatus = "REJECTED";
  }

  MOCK_INSTRUMENTS[foundIndex].verification_status = newVerificationStatus;
  MOCK_INSTRUMENTS[foundIndex].lifecycle_status = newLifecycleStatus;
  MOCK_INSTRUMENTS[foundIndex].notes = `Official Decision: ${reason}`;

  MOCK_LIFECYCLE_EVENTS.unshift({
    id: `life-${Date.now()}`,
    instrument_id: instrumentId,
    event_type: `OFFICIAL_${decisionType}`,
    from_status: MOCK_INSTRUMENTS[foundIndex].lifecycle_status,
    to_status: newLifecycleStatus,
    event_date: new Date().toISOString(),
    actor_name: actorName || "Dr. Rajesh Sharma (Senior Reviewer)",
    reason,
  });

  MOCK_AUDIT_LOGS.unshift({
    id: `aud-${Date.now()}`,
    actor_name: actorName || "Dr. Rajesh Sharma",
    actor_role: "reviewer",
    action: `VERIFICATION_DECISION_${decisionType}`,
    entity_type: "financial_instruments",
    entity_id: instrumentId,
    correlation_id: `CORR-${Date.now()}`,
    before_data: { verification_status: MOCK_INSTRUMENTS[foundIndex].verification_status },
    after_data: { verification_status: newVerificationStatus },
    reason,
    created_at: new Date().toISOString(),
  });

  return MOCK_INSTRUMENTS[foundIndex];
}

export async function getVerificationQueue(filters = {}) {
  if (isLiveMode()) {
    return await getVerificationQueueLive(filters);
  }

  const filterParams = {
    ...filters,
    verification_status: filters.status || undefined,
  };

  const all = await getInstruments({ ...filterParams, pageSize: 100 });
  const pendingItems = all.items.filter(
    (i) => i.verification_status !== "VERIFIED" && i.verification_status !== "NOT_STARTED"
  );

  return {
    items: pendingItems,
    total: pendingItems.length,
  };
}

export async function getDiscrepancies() {
  if (isLiveMode()) {
    return await getDiscrepanciesLive();
  }

  const discrepancyChecks = MOCK_VERIFICATION_CHECKS.filter(
    (c) => c.status === "FAIL" || c.status === "WARNING" || c.status === "ERROR"
  );

  return discrepancyChecks.map((check) => {
    const instrument = MOCK_INSTRUMENTS.find((i) => i.id === check.instrument_id);
    return {
      ...check,
      instrument,
    };
  });
}

// ==========================================
// 4. RELEASE & REFUND WORKFLOW
// ==========================================

export async function getReleaseRequests(filters = {}) {
  if (isLiveMode()) {
    return await getReleaseRequestsLive(filters);
  }

  let list = [...MOCK_RELEASE_REQUESTS];

  if (filters.institution_id) {
    list = list.filter((r) => r.institution_id === filters.institution_id);
  }

  if (filters.status) {
    list = list.filter((r) => r.status === filters.status);
  }

  if (filters.request_type) {
    list = list.filter((r) => r.request_type === filters.request_type);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.request_reference.toLowerCase().includes(q) ||
        r.fdr_number.toLowerCase().includes(q) ||
        r.institution_name.toLowerCase().includes(q) ||
        r.bank_name.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getReleaseRequestById(id) {
  if (isLiveMode()) {
    return await getReleaseRequestByIdLive(id);
  }

  const req = MOCK_RELEASE_REQUESTS.find((r) => r.id === id || r.request_reference === id);
  if (!req) return null;

  const clearances = MOCK_CLEARANCES.filter((c) => c.release_request_id === req.id);
  const instrument = MOCK_INSTRUMENTS.find((i) => i.id === req.instrument_id);
  const documents = MOCK_DOCUMENTS.filter((d) => d.instrument_id === req.instrument_id);

  return {
    ...req,
    clearances,
    instrument,
    documents,
  };
}

// ==========================================
// 5. WORKFLOW TASKS
// ==========================================

export async function getTasks(filters = {}) {
  if (isLiveMode()) {
    return await getTasksLive(filters);
  }

  let list = [...MOCK_TASKS];

  if (filters.status) {
    list = list.filter((t) => t.status === filters.status);
  }

  if (filters.priority) {
    list = list.filter((t) => t.priority === filters.priority);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.institution_name?.toLowerCase().includes(q)
    );
  }

  return list;
}

// ==========================================
// 6. NOTIFICATIONS
// ==========================================

export async function getNotifications(role = null) {
  if (isLiveMode()) {
    return await getNotificationsLive();
  }

  let list = [...MOCK_NOTIFICATIONS];
  if (role) {
    list = list.filter((n) => n.recipient_role === role);
  }
  return list;
}

// ==========================================
// 7. AUDIT LOGS
// ==========================================

export async function getAuditLogs(filters = {}) {
  if (isLiveMode()) {
    return await getAuditLogsLive(filters);
  }

  let list = [...MOCK_AUDIT_LOGS];

  if (filters.entity_type) {
    list = list.filter((l) => l.entity_type === filters.entity_type);
  }

  if (filters.action) {
    list = list.filter((l) => l.action.toLowerCase().includes(filters.action.toLowerCase()));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (l) =>
        l.actor_name.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.correlation_id?.toLowerCase().includes(q) ||
        l.reason?.toLowerCase().includes(q)
    );
  }

  return list;
}

// ==========================================
// 8. INTEGRATION SYNC LOGS
// ==========================================

export async function getIntegrationLogs() {
  if (isLiveMode()) {
    return await getIntegrationLogsLive();
  }
  return [...MOCK_INTEGRATION_LOGS];
}

// ==========================================
// 9. DASHBOARD METRICS SUMMARY
// ==========================================

export async function getDashboardMetrics(role = "official", institutionId = null) {
  if (isLiveMode()) {
    return await getDashboardMetricsLive(role, institutionId);
  }

  let instruments = [...MOCK_INSTRUMENTS];
  let releases = [...MOCK_RELEASE_REQUESTS];
  let tasks = [...MOCK_TASKS];

  if (institutionId) {
    instruments = instruments.filter((i) => i.institution_id === institutionId);
    releases = releases.filter((r) => r.institution_id === institutionId);
  }

  const totalSecuredAmount = instruments
    .filter((i) => i.lifecycle_status === "ACTIVE" || i.lifecycle_status === "EXPIRING")
    .reduce((sum, item) => sum + item.amount, 0);

  const pendingVerificationCount = instruments.filter(
    (i) => i.verification_status === "PENDING_VERIFICATION" || i.verification_status === "PROCESSING"
  ).length;

  const discrepanciesCount = instruments.filter((i) => i.verification_status === "ACTION_REQUIRED").length;

  const expiringSoonCount = instruments.filter(
    (i) => i.days_to_maturity !== undefined && i.days_to_maturity >= 0 && i.days_to_maturity <= 90
  ).length;

  const activeReleasesCount = releases.filter(
    (r) => r.status !== "COMPLETED" && r.status !== "REJECTED" && r.status !== "WITHDRAWN"
  ).length;

  const openTasksCount = tasks.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  return {
    totalInstruments: instruments.length,
    totalSecuredAmount,
    pendingVerificationCount,
    discrepanciesCount,
    expiringSoonCount,
    activeReleasesCount,
    openTasksCount,
    verifiedCount: instruments.filter((i) => i.verification_status === "VERIFIED").length,
  };
}

// ==========================================
// 10. CLEARANCES & RELEASE ACTIONS
// ==========================================

export async function updateClearance({
  clearanceId,
  status,
  remarks,
  refNumber,
  actorId,
}) {
  if (isLiveMode()) {
    return await updateClearanceLive({ clearanceId, status, remarks, refNumber, actorId });
  }

  // Demo Mode: In-memory mutation
  const idx = MOCK_CLEARANCES.findIndex((c) => c.id === clearanceId);
  if (idx !== -1) {
    MOCK_CLEARANCES[idx].status = status;
    MOCK_CLEARANCES[idx].remarks = remarks;
    MOCK_CLEARANCES[idx].reference_number = refNumber;
    MOCK_CLEARANCES[idx].resolved_at = new Date().toISOString();
    MOCK_CLEARANCES[idx].resolved_by_name = "Dr. Rajesh Sharma";

    // Check if all clearances for this release request are cleared
    const relReqId = MOCK_CLEARANCES[idx].release_request_id;
    const reqClearances = MOCK_CLEARANCES.filter((c) => c.release_request_id === relReqId);
    const allCleared = reqClearances.every((c) => c.status === "CLEARED");

    if (allCleared) {
      const relIdx = MOCK_RELEASE_REQUESTS.findIndex((r) => r.id === relReqId);
      if (relIdx !== -1) {
        MOCK_RELEASE_REQUESTS[relIdx].status = "UNDER_REVIEW";
      }
    }

    MOCK_AUDIT_LOGS.unshift({
      id: `aud-${Date.now()}`,
      actor_name: "Dr. Rajesh Sharma",
      actor_role: "reviewer",
      action: `CLEARANCE_UPDATE_${status}`,
      entity_type: "clearance_records",
      entity_id: clearanceId,
      correlation_id: `CORR-${Date.now()}`,
      reason: remarks,
      created_at: new Date().toISOString(),
    });

    return MOCK_CLEARANCES[idx];
  }
  return null;
}

export async function approveRelease({
  releaseRequestId,
  nocNumber,
  remarks,
  actorId,
}) {
  if (isLiveMode()) {
    return await approveReleaseLive({ releaseRequestId, nocNumber, remarks, actorId });
  }

  // Demo Mode: In-memory mutation
  const relIdx = MOCK_RELEASE_REQUESTS.findIndex(
    (r) => r.id === releaseRequestId || r.request_reference === releaseRequestId
  );
  if (relIdx !== -1) {
    MOCK_RELEASE_REQUESTS[relIdx].status = "COMPLETED";
    MOCK_RELEASE_REQUESTS[relIdx].completion_reference = nocNumber;
    MOCK_RELEASE_REQUESTS[relIdx].decision_by_name = "Meenakshi Sundaram (Finance Director)";
    MOCK_RELEASE_REQUESTS[relIdx].decision_at = new Date().toISOString();
    MOCK_RELEASE_REQUESTS[relIdx].notes = `Release officially approved. NOC Reference: ${nocNumber}. Remarks: ${remarks}`;

    const instId = MOCK_RELEASE_REQUESTS[relIdx].instrument_id;
    const instIdx = MOCK_INSTRUMENTS.findIndex((i) => i.id === instId);
    if (instIdx !== -1) {
      MOCK_INSTRUMENTS[instIdx].lifecycle_status = "RELEASED";
      MOCK_INSTRUMENTS[instIdx].notes = `Deposit released pursuant to NOC Reference: ${nocNumber}`;

      MOCK_LIFECYCLE_EVENTS.unshift({
        id: `life-${Date.now()}`,
        instrument_id: instId,
        event_type: "OFFICIAL_RELEASE_NOC_ISSUED",
        from_status: "RELEASE_PENDING",
        to_status: "RELEASED",
        event_date: new Date().toISOString(),
        actor_name: "Meenakshi Sundaram (Finance Director)",
        reason: `NOC Reference: ${nocNumber}. ${remarks}`,
      });
    }

    MOCK_AUDIT_LOGS.unshift({
      id: `aud-${Date.now()}`,
      actor_name: "Meenakshi Sundaram",
      actor_role: "finance_director",
      action: "RELEASE_REQUEST_APPROVED",
      entity_type: "release_refund_requests",
      entity_id: releaseRequestId,
      correlation_id: `CORR-${Date.now()}`,
      reason: remarks,
      after_data: { status: "COMPLETED", completion_reference: nocNumber },
      created_at: new Date().toISOString(),
    });

    return MOCK_RELEASE_REQUESTS[relIdx];
  }
  return null;
}

// ==========================================
// 11. WORKFLOW TASKS & NOTIFICATIONS
// ==========================================

export async function updateTaskStatus(taskId, status, actorId = null) {
  if (isLiveMode()) {
    return await updateTaskStatusLive({ taskId, status, actorId });
  }

  // Demo Mode
  const idx = MOCK_TASKS.findIndex((t) => t.id === taskId);
  if (idx !== -1) {
    MOCK_TASKS[idx].status = status;
    if (status === "COMPLETED") {
      MOCK_TASKS[idx].completed_at = new Date().toISOString();
    }
    return MOCK_TASKS[idx];
  }
  return null;
}

export async function markNotificationRead(notificationId) {
  if (isLiveMode()) {
    return await markNotificationReadLive(notificationId);
  }

  // Demo Mode
  const idx = MOCK_NOTIFICATIONS.findIndex((n) => n.id === notificationId);
  if (idx !== -1) {
    MOCK_NOTIFICATIONS[idx].is_read = true;
    return MOCK_NOTIFICATIONS[idx];
  }
  return null;
}

export async function markAllNotificationsRead(recipientUserId = null) {
  if (isLiveMode()) {
    return await markAllNotificationsReadLive(recipientUserId);
  }

  // Demo Mode
  MOCK_NOTIFICATIONS.forEach((n) => {
    n.is_read = true;
  });
  return true;
}

// ==========================================
// 12. INSTITUTION SUBMISSIONS & CLARIFICATIONS
// ==========================================

export async function createInstrument(formData, file = null, institutionId = "inst-001", actorId = null) {
  if (isLiveMode()) {
    return await createInstrumentLive({ formData, file, institutionId, actorId });
  }

  // Demo Mode: In-memory creation
  const newId = `fdr-gen-${Date.now()}`;
  const newRef = `FDR-${new Date().getFullYear()}-ND-${Math.floor(100 + Math.random() * 900)}`;

  const newInstrument = {
    id: newId,
    institution_id: institutionId,
    institution_name: "Delhi Institute of Engineering & Technology",
    aicte_institution_id: "1-109283741",
    instrument_type: "FDR",
    instrument_reference: newRef,
    bank_name: formData.bank_name,
    bank_branch: formData.bank_branch,
    bank_ifsc: formData.bank_ifsc,
    account_holder_name: `${formData.bank_name} & AICTE Joint Lien`,
    fdr_number: formData.fdr_number,
    amount: parseFloat(formData.amount),
    currency: "INR",
    issue_date: formData.issue_date,
    maturity_date: formData.maturity_date,
    lien_marked: Boolean(formData.lien_marked),
    lien_details: formData.lien_details,
    purpose: formData.purpose,
    lifecycle_status: "SUBMITTED",
    verification_status: "PENDING_VERIFICATION",
    notes: "Submitted via Institution Portal. Queued for AICTE verification.",
    created_at: new Date().toISOString(),
    days_to_maturity: Math.ceil((new Date(formData.maturity_date) - new Date()) / (1000 * 60 * 60 * 24)),
  };

  MOCK_INSTRUMENTS.unshift(newInstrument);

  // Add document
  MOCK_DOCUMENTS.unshift({
    id: `doc-${Date.now()}`,
    instrument_id: newId,
    document_type: "FDR_COPY",
    original_filename: file?.name || "SBI_Security_Deposit_Receipt_35Lakh.pdf",
    file_size_bytes: file?.size || 1468006,
    storage_path: `instruments/${newId}/receipt.pdf`,
    created_at: new Date().toISOString(),
  });

  // Add lifecycle event
  MOCK_LIFECYCLE_EVENTS.unshift({
    id: `life-${Date.now()}`,
    instrument_id: newId,
    event_type: "SUBMITTED",
    from_status: "DRAFT",
    to_status: "SUBMITTED",
    event_date: new Date().toISOString(),
    actor_name: formData.signatory_name || "Institution Registrar",
    reason: "New security deposit registered under Clause 1.12",
  });

  // Add baseline check
  MOCK_VERIFICATION_CHECKS.unshift({
    id: `vc-${Date.now()}`,
    instrument_id: newId,
    check_type: "INSTRUMENT_NUMBER",
    status: "PASS",
    expected_value: formData.fdr_number,
    observed_value: formData.fdr_number,
    message: "FDR reference matches Bank CBS record exactly.",
    is_simulated: true,
  });

  // Add audit log
  MOCK_AUDIT_LOGS.unshift({
    id: `aud-${Date.now()}`,
    actor_name: formData.signatory_name || "Institution Registrar",
    actor_role: "institution_admin",
    action: "INSTRUMENT_SUBMITTED",
    entity_type: "financial_instruments",
    entity_id: newId,
    correlation_id: `CORR-${Date.now()}`,
    reason: "New FDR deposit submission under Clause 1.12",
    created_at: new Date().toISOString(),
  });

  return newInstrument;
}

export async function sendClarification({ instrumentId, text, actorId = null }) {
  if (isLiveMode()) {
    return await sendClarificationLive({ instrumentId, text, actorId });
  }

  // Demo Mode
  const idx = MOCK_INSTRUMENTS.findIndex((i) => i.id === instrumentId);
  if (idx !== -1) {
    MOCK_INSTRUMENTS[idx].notes = `Clarification Submitted by Institution: ${text}`;

    MOCK_LIFECYCLE_EVENTS.unshift({
      id: `life-${Date.now()}`,
      instrument_id: instrumentId,
      event_type: "INSTITUTION_CLARIFICATION",
      event_date: new Date().toISOString(),
      actor_name: "Institution Registrar",
      reason: text,
    });

    MOCK_AUDIT_LOGS.unshift({
      id: `aud-${Date.now()}`,
      actor_name: "Institution Registrar",
      actor_role: "institution_admin",
      action: "CLARIFICATION_SUBMITTED",
      entity_type: "financial_instruments",
      entity_id: instrumentId,
      correlation_id: `CORR-${Date.now()}`,
      reason: text,
      created_at: new Date().toISOString(),
    });

    return MOCK_INSTRUMENTS[idx];
  }
  return null;
}

export async function createReleaseRequest({
  institutionId = "inst-001",
  instrumentId,
  requestType = "RELEASE",
  reason,
  actorId = null,
}) {
  if (isLiveMode()) {
    return await createReleaseRequestLive({ institutionId, instrumentId, requestType, reason, actorId });
  }

  // Demo Mode
  const ref = `REL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const inst = MOCK_INSTRUMENTS.find((i) => i.id === instrumentId) || MOCK_INSTRUMENTS[0];

  const newReq = {
    id: `rel-${Date.now()}`,
    request_reference: ref,
    institution_id: institutionId,
    institution_name: inst?.institution_name || "Delhi Institute of Engineering & Technology",
    instrument_id: instrumentId,
    instrument_reference: inst?.instrument_reference || "FDR-2016-ND-008",
    fdr_number: inst?.fdr_number || "UBI-FDR-6629104829",
    amount: inst?.amount || 3000000.0,
    bank_name: inst?.bank_name || "Union Bank of India",
    request_type: requestType,
    status: "CLEARANCE_PENDING",
    submitted_at: new Date().toISOString(),
    applicable_rule_reference: "Clause 6.46 - Release of Security Deposit / FDR on completion of 10-year term",
    clearances_summary: { total: 4, cleared: 0, pending: 4 },
    notes: reason,
  };

  MOCK_RELEASE_REQUESTS.unshift(newReq);

  // Initialize 4 clearances
  const cells = [
    { type: "LEGAL_CELL", name: "Legal Affairs Cell, AICTE HQ" },
    { type: "APPROVAL_BUREAU", name: "Bureau of Approval (North)" },
    { type: "FINANCE_BUREAU", name: "Finance & Accounts Bureau" },
    { type: "REGIONAL_OFFICE", name: "North Regional Office, Chandigarh" },
  ];

  cells.forEach((cell, idx) => {
    MOCK_CLEARANCES.push({
      id: `clr-${Date.now()}-${idx}`,
      release_request_id: newReq.id,
      clearance_type: cell.type,
      department_name: cell.name,
      status: "PENDING",
      reference_number: null,
      remarks: null,
    });
  });

  const instIdx = MOCK_INSTRUMENTS.findIndex((i) => i.id === instrumentId);
  if (instIdx !== -1) {
    MOCK_INSTRUMENTS[instIdx].lifecycle_status = "RELEASE_PENDING";
  }

  MOCK_AUDIT_LOGS.unshift({
    id: `aud-${Date.now()}`,
    actor_name: "Prof. Sunita Verma",
    actor_role: "institution_admin",
    action: "RELEASE_REQUEST_FILED",
    entity_type: "release_refund_requests",
    entity_id: newReq.id,
    correlation_id: `CORR-${Date.now()}`,
    reason,
    created_at: new Date().toISOString(),
  });

  return newReq;
}

// ==========================================
// 13. ADMIN SETTINGS & DIAGNOSTICS
// ==========================================

export async function updateSystemSettings(settings, actorId = null) {
  if (isLiveMode()) {
    return await updateSystemSettingsLive(settings, actorId);
  }

  // Demo Mode
  MOCK_AUDIT_LOGS.unshift({
    id: `aud-${Date.now()}`,
    actor_name: "Amitabh Kant",
    actor_role: "super_admin",
    action: "STATUTORY_THRESHOLDS_UPDATED",
    entity_type: "system_settings",
    correlation_id: `CORR-${Date.now()}`,
    after_data: settings,
    reason: "Admin updated statutory maturity warning thresholds and integration retry limits",
    created_at: new Date().toISOString(),
  });

  return settings;
}

export async function triggerBankPingDiagnostic({
  bankCode = "SBI",
  endpoint = "/api/v1/fdr/verify",
  actorId = null,
} = {}) {
  if (isLiveMode()) {
    return await triggerBankPingDiagnosticLive({ bankCode, endpoint, actorId });
  }

  // Demo Mode
  const durationMs = Math.floor(250 + Math.random() * 100);
  const newLog = {
    id: `int-${Date.now()}`,
    provider_name: `${bankCode} CBS Gateway`,
    operation: "HEALTH_PING_TEST",
    instrument_reference: "N/A",
    status: "SUCCEEDED",
    http_status: 200,
    duration_ms: durationMs,
    response_summary: `Dummy Core Banking Gateway responded with HTTP 200 OK (${durationMs}ms latency).`,
    created_at: new Date().toISOString(),
  };

  MOCK_INTEGRATION_LOGS.unshift(newLog);

  MOCK_AUDIT_LOGS.unshift({
    id: `aud-${Date.now()}`,
    actor_name: "Amitabh Kant",
    actor_role: "super_admin",
    action: "CORE_BANKING_PING_TEST",
    entity_type: "integration_sync_logs",
    entity_id: newLog.id,
    correlation_id: `CORR-${Date.now()}`,
    reason: `Ping test completed in ${durationMs}ms with status HTTP 200`,
    created_at: new Date().toISOString(),
  });

  return newLog;
}

export async function createInstitution(institutionData, actorId = null) {
  if (isLiveMode()) {
    return await createInstitutionLive(institutionData, actorId);
  }

  // Demo Mode
  const newInst = {
    id: `inst-${Date.now()}`,
    ...institutionData,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
  };

  MOCK_INSTITUTIONS.push(newInst);

  MOCK_AUDIT_LOGS.unshift({
    id: `aud-${Date.now()}`,
    actor_name: "Amitabh Kant",
    actor_role: "super_admin",
    action: "INSTITUTION_REGISTERED",
    entity_type: "institutions",
    entity_id: newInst.id,
    correlation_id: `CORR-${Date.now()}`,
    after_data: { institution_name: newInst.institution_name, aicte_id: newInst.aicte_institution_id },
    created_at: new Date().toISOString(),
  });

  return newInst;
}

// ==========================================
// 14. FORMATTING UTILITIES (INR & DATES)
// ==========================================

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatDate(dateStr) {
  if (!dateStr) return "Not available";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "Not available";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ==========================================
// 15. DOCUMENT STORAGE & SIGNED URL ACCESS
// ==========================================

export async function getDocumentSignedUrl(storagePath, expiresIn = 900) {
  if (isLiveMode()) {
    return await getDocumentSignedUrlLive(storagePath, expiresIn);
  }

  // Demo mode fallback: match with bundled demo PDF pack
  if (!storagePath) return "/AICTE_FDR_Demo_PDF_Pack/00_README_Demo_PDF_Index.pdf";
  const filename = storagePath.split("/").pop();
  if (filename) {
    return `/AICTE_FDR_Demo_PDF_Pack/${filename}`;
  }
  return "/AICTE_FDR_Demo_PDF_Pack/fdr-001_FDR-2024-ND-001_SIMULATED.pdf";
}

export async function uploadDocument({
  file,
  institutionId = "inst-001",
  instrumentId = null,
  documentType = "FDR_COPY",
  actorId = null,
}) {
  if (isLiveMode()) {
    return await uploadDocumentLive({ file, institutionId, instrumentId, documentType, actorId });
  }

  // Demo mode: in-memory mock update
  const newDoc = {
    id: `doc-${Date.now()}`,
    institution_id: institutionId,
    instrument_id: instrumentId,
    document_type: documentType,
    original_filename: file?.name || "uploaded_document.pdf",
    storage_bucket: "fdr-documents",
    storage_path: `instruments/${institutionId}/${Date.now()}_${file?.name || "document.pdf"}`,
    mime_type: "application/pdf",
    file_size_bytes: file?.size || 1024000,
    processing_status: "UPLOADED",
    uploaded_at: new Date().toISOString(),
    uploaded_by_name: "Institution Staff",
  };
  MOCK_DOCUMENTS.unshift(newDoc);
  return newDoc;
}

