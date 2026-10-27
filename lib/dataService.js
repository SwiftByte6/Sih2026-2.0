// Centralized data provider service for AICTE Security Deposit & FDR Management Portal
// This service abstracts data retrieval and updates.
// BACKEND INTEGRATION: Every method contains documented Supabase queries, RLS expectations,
// and parameters ready for direct replacement without refactoring frontend components.

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

// --- Current Simulated User / Session State ---
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

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('institutions').select('*').order('institution_name')
 * RLS:
 *   - super_admin, aicte_admin, reviewer, auditor: SELECT on all records
 *   - institution_admin, institution_staff: SELECT where id = user's assigned institution_id
 */
export async function getInstitutions(filters = {}) {
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
  // BACKEND INTEGRATION: supabase.from('institutions').select('*').eq('id', id).single()
  return MOCK_INSTITUTIONS.find((i) => i.id === id) || null;
}

// ==========================================
// 2. FINANCIAL INSTRUMENTS
// ==========================================

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('financial_instruments')
 *   .select(`
 *     *,
 *     institutions (id, institution_name, aicte_institution_id, state),
 *     documents (id, original_filename, document_type, storage_path)
 *   `)
 * RLS:
 *   - Officials: SELECT all
 *   - Institutions: SELECT where institution_id = auth.user.institution_id
 */
export async function getInstruments(filters = {}) {
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
    // Under 90 days
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
    // Default newest first
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
  // BACKEND INTEGRATION:
  // supabase.from('financial_instruments').select(`
  //   *,
  //   institutions (*),
  //   documents (*),
  //   verification_requests (*),
  //   verification_checks (*),
  //   lifecycle_events (*)
  // `).eq('id', id).single()

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
// 3. VERIFICATION & DISCREPANCY REVIEWS
// ==========================================

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('financial_instruments')
 *   .select('*')
 *   .in('verification_status', ['PENDING_VERIFICATION', 'ACTION_REQUIRED', 'ERROR', 'PROCESSING'])
 *   .order('created_at', { ascending: false })
 */
export async function getVerificationQueue(filters = {}) {
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

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('verification_checks')
 *   .select(`
 *     *,
 *     financial_instruments (id, fdr_number, instrument_reference, bank_name, amount, institution_id,
 *       institutions (institution_name))
 *   `)
 *   .in('status', ['FAIL', 'WARNING', 'ERROR'])
 */
export async function getDiscrepancies() {
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

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('release_refund_requests')
 *   .select(`
 *     *,
 *     institutions (id, institution_name, aicte_institution_id),
 *     financial_instruments (*),
 *     clearance_records (*)
 *   `)
 */
export async function getReleaseRequests(filters = {}) {
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
  // BACKEND INTEGRATION:
  // supabase.from('release_refund_requests').select(`
  //   *,
  //   institutions (*),
  //   financial_instruments (*),
  //   release_request_documents (*),
  //   clearance_records (*)
  // `).eq('id', id).single()

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

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('workflow_tasks').select('*').order('due_at', { ascending: true })
 * RLS: Reviewers see their assigned tasks or unassigned open tasks
 */
export async function getTasks(filters = {}) {
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

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('notifications')
 *   .select('*')
 *   .eq('recipient_user_id', auth.uid())
 *   .order('scheduled_for', { ascending: false })
 */
export async function getNotifications(role = null) {
  let list = [...MOCK_NOTIFICATIONS];
  if (role) {
    list = list.filter((n) => n.recipient_role === role);
  }
  return list;
}

// ==========================================
// 7. AUDIT LOGS
// ==========================================

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).range(start, end)
 * RLS: super_admin, aicte_admin, auditor only
 */
export async function getAuditLogs(filters = {}) {
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

/**
 * BACKEND INTEGRATION:
 * Query: supabase.from('integration_sync_logs').select('*').order('created_at', { ascending: false })
 * RLS: super_admin, aicte_admin only
 */
export async function getIntegrationLogs() {
  return [...MOCK_INTEGRATION_LOGS];
}

// ==========================================
// 9. DASHBOARD METRICS SUMMARY
// ==========================================

/**
 * BACKEND INTEGRATION:
 * Aggregation query on financial_instruments, release_refund_requests, workflow_tasks
 */
export async function getDashboardMetrics(role = "official", institutionId = null) {
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
// 10. FORMATTING UTILITIES (INR & DATES)
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
