/**
 * Submittal status + disposition — the single source of truth for the construction
 * submittal lifecycle, the reviewer's AIA disposition stamp, status tone, and
 * ball-in-court derivation. Shared by the web dashboard, the web field PWA, the
 * web review API, and the native field app.
 *
 * The reviewer decides (approve / approved-as-noted / revise-resubmit / reject);
 * this module maps that decision to the canonical status, the AIA stamp text, the
 * semantic tone, and who holds the ball next. AI/UI never invents these strings —
 * they come from here. Deterministic, framework-free.
 *
 * Canonical resubmit status is "revise_resubmit" (the mobile field app is the
 * fuller, correct implementation). The legacy web value "resubmit" and other
 * live variants (pending / revise_and_resubmit / approved_as_noted) are accepted
 * on input via normalizeSubmittalStatus() so no historical row renders as unknown.
 */

// ── Canonical lifecycle status ──────────────────────────────────────────────
// draft → submitted → under_review → { approved | approved_as_noted |
// revise_resubmit | rejected }. revise_resubmit loops back to the preparer for a
// new revision; approved / approved_as_noted / rejected / void are closed. `void`
// is a cancelled/withdrawn submittal.
export type SubmittalStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'approved_as_noted'
  | 'revise_resubmit'
  | 'rejected'
  | 'void';

// The status a brand-new submittal is created with.
export const INITIAL_SUBMITTAL_STATUS: SubmittalStatus = 'draft';

// Ordered lifecycle used for pipeline steppers, status pickers, and filters.
export const SUBMITTAL_STATUSES: SubmittalStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'approved_as_noted',
  'revise_resubmit',
  'rejected',
];

// Closed / terminal statuses — no further workflow action is expected.
export const CLOSED_STATUSES: SubmittalStatus[] = ['approved', 'approved_as_noted', 'rejected', 'void'];

// Open statuses — still moving through the ball-in-court workflow.
export const OPEN_STATUSES: SubmittalStatus[] = ['draft', 'submitted', 'under_review', 'revise_resubmit'];

// ── Reviewer decisions & their AIA disposition ─────────────────────────────
// The four dispositions a reviewer can stamp on a returned submittal. These are
// the AIA G712-style actions.
export type ReviewDecision = 'approved' | 'approved_as_noted' | 'revise_resubmit' | 'rejected';

export const REVIEW_DECISIONS: ReviewDecision[] = ['approved', 'approved_as_noted', 'revise_resubmit', 'rejected'];

export type StatusTone = 'green' | 'amber' | 'red' | 'blue' | 'neutral';

// Ball-in-court party (reviewer-perspective, matching the field app's model):
//   you       — the reviewer/GC holds it (action needed on your side)
//   sub       — returned to the subcontractor/preparer to revise & resubmit
//   architect — with the architect/EOR
//   owner     — closed out / with the owner
export type SubmittalCourt = 'you' | 'architect' | 'sub' | 'owner';

// What one reviewer decision resolves to across every surface.
export interface Disposition {
  status: SubmittalStatus; // resulting submittal status
  label: string; // AIA stamp text written to review_action
  tone: StatusTone; // semantic tone for the pill
  court: SubmittalCourt; // who holds the ball after this decision
}

// The canonical decision → disposition map. `label` is the exact AIA stamp text.
export const REVIEW_DISPOSITION: Record<ReviewDecision, Disposition> = {
  approved: { status: 'approved', label: 'No Exceptions Taken', tone: 'green', court: 'owner' },
  approved_as_noted: { status: 'approved_as_noted', label: 'Make Corrections Noted', tone: 'green', court: 'owner' },
  revise_resubmit: { status: 'revise_resubmit', label: 'Revise and Resubmit', tone: 'amber', court: 'sub' },
  rejected: { status: 'rejected', label: 'Rejected', tone: 'red', court: 'architect' },
};

// AIA stamp text keyed by decision (thin accessor over REVIEW_DISPOSITION).
export const REVIEW_ACTION_LABELS: Record<ReviewDecision, string> = {
  approved: REVIEW_DISPOSITION.approved.label,
  approved_as_noted: REVIEW_DISPOSITION.approved_as_noted.label,
  revise_resubmit: REVIEW_DISPOSITION.revise_resubmit.label,
  rejected: REVIEW_DISPOSITION.rejected.label,
};

// Loose action verbs → canonical decision. Accepts the legacy web review-route
// verbs (approve / reject / resubmit) AND the canonical decision keys. This is
// where the historical "resubmit" drift is resolved: resubmit → revise_resubmit.
export const REVIEW_ACTION_VERBS: Record<string, ReviewDecision> = {
  approve: 'approved',
  approved: 'approved',
  approve_as_noted: 'approved_as_noted',
  approved_as_noted: 'approved_as_noted',
  approved_with_comments: 'approved_as_noted',
  make_corrections_noted: 'approved_as_noted',
  reject: 'rejected',
  rejected: 'rejected',
  resubmit: 'revise_resubmit',
  revise_resubmit: 'revise_resubmit',
  revise_and_resubmit: 'revise_resubmit',
};

// ── Status labels ───────────────────────────────────────────────────────────
// AIA-forward labels: approved → "No Exceptions Taken". Use these for the
// disposition stamp and the register pill.
export const STATUS_LABELS: Record<SubmittalStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'No Exceptions Taken',
  approved_as_noted: 'Make Corrections Noted',
  revise_resubmit: 'Revise and Resubmit',
  rejected: 'Rejected',
  void: 'Void',
};

// Compact labels for tight chips / KPI headers / pipeline steppers.
export const STATUS_LABELS_SHORT: Record<SubmittalStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  approved_as_noted: 'Approved as Noted',
  revise_resubmit: 'Revise & Resubmit',
  rejected: 'Rejected',
  void: 'Void',
};

// Ball-in-court party display labels (reviewer-perspective).
export const COURT_LABELS: Record<SubmittalCourt, string> = {
  you: 'Your Court',
  architect: 'Architect',
  sub: 'Sub',
  owner: 'Owner',
};

// ── Normalization ───────────────────────────────────────────────────────────
// Fold any raw/legacy status string to a canonical SubmittalStatus. Unknown or
// empty → the initial status. Legacy mappings:
//   pending           → submitted        (awaiting reviewer)
//   open              → submitted
//   in_review/review  → under_review
//   resubmit          → revise_resubmit  (the core drift fix)
//   revise_and_resubmit → revise_resubmit
//   approved_with_comments → approved_as_noted
//   closed/cancelled/canceled → void
export function normalizeSubmittalStatus(raw: string | null | undefined): SubmittalStatus {
  switch ((raw ?? '').toLowerCase().trim()) {
    case 'draft':
      return 'draft';
    case 'submitted':
    case 'pending':
    case 'open':
      return 'submitted';
    case 'under_review':
    case 'in_review':
    case 'review':
    case 'reviewing':
      return 'under_review';
    case 'approved':
    case 'no_exceptions_taken':
      return 'approved';
    case 'approved_as_noted':
    case 'approved_with_comments':
    case 'make_corrections_noted':
      return 'approved_as_noted';
    case 'revise_resubmit':
    case 'revise_and_resubmit':
    case 'resubmit':
    case 'revise':
      return 'revise_resubmit';
    case 'rejected':
    case 'reject':
      return 'rejected';
    case 'void':
    case 'closed':
    case 'cancelled':
    case 'canceled':
    case 'withdrawn':
      return 'void';
    default:
      return INITIAL_SUBMITTAL_STATUS;
  }
}

// ── Tone derivation ─────────────────────────────────────────────────────────
// Operates on the RAW string (accepts every live variant) so a legacy row never
// renders as a meaningless grey pill. Mirrors the fuller mobile implementation:
//   approved / approved_as_noted → green
//   rejected                     → red
//   revise_resubmit / under_review → amber
//   submitted / pending          → blue
//   draft / void / unknown       → neutral
export function statusTone(status: string | null | undefined): StatusTone {
  switch ((status ?? '').toLowerCase().trim()) {
    case 'approved':
    case 'approved_as_noted':
    case 'approved_with_comments':
    case 'no_exceptions_taken':
    case 'make_corrections_noted':
      return 'green';
    case 'rejected':
    case 'reject':
      return 'red';
    case 'revise_resubmit':
    case 'revise_and_resubmit':
    case 'resubmit':
    case 'revise':
    case 'under_review':
    case 'in_review':
    case 'review':
      return 'amber';
    case 'submitted':
    case 'pending':
    case 'open':
      return 'blue';
    default:
      return 'neutral';
  }
}

// ── Membership helpers ──────────────────────────────────────────────────────
export function isClosedStatus(status: string | null | undefined): boolean {
  return CLOSED_STATUSES.includes(normalizeSubmittalStatus(status));
}

export function isOpenStatus(status: string | null | undefined): boolean {
  return !isClosedStatus(status);
}

// Terminal = no further reviewer action expected (same set as closed).
export function isTerminalStatus(status: string | null | undefined): boolean {
  return isClosedStatus(status);
}

// ── Ball-in-court derivation ────────────────────────────────────────────────
// Who holds the submittal, derived from status (reviewer-perspective). Normalizes
// first, so every legacy variant maps correctly:
//   draft / submitted / under_review → you (reviewer action needed)
//   revise_resubmit                  → sub (back to the sub to revise)
//   rejected                         → architect
//   approved / approved_as_noted / void → owner (closed out)
export function deriveCourt(status: string | null | undefined): SubmittalCourt {
  switch (normalizeSubmittalStatus(status)) {
    case 'draft':
    case 'submitted':
    case 'under_review':
      return 'you';
    case 'revise_resubmit':
      return 'sub';
    case 'rejected':
      return 'architect';
    case 'approved':
    case 'approved_as_noted':
    case 'void':
      return 'owner';
    default:
      return 'you';
  }
}

// ── Review-decision resolution ──────────────────────────────────────────────
// Resolve a loose action verb (approve / reject / resubmit / a canonical
// decision key) to its full Disposition, or null if unrecognized. This is the
// canonical replacement for the web review route's ad-hoc statusMap.
export function resolveReviewDecision(action: string | null | undefined): Disposition | null {
  const decision = REVIEW_ACTION_VERBS[(action ?? '').toLowerCase().trim()];
  return decision ? REVIEW_DISPOSITION[decision] : null;
}

// Resolve a loose action verb to just the resulting canonical status, or null.
export function reviewDecisionToStatus(action: string | null | undefined): SubmittalStatus | null {
  return resolveReviewDecision(action)?.status ?? null;
}

// The set of loose verbs the review API accepts (for input validation).
export const REVIEW_ACTION_INPUTS: string[] = Object.keys(REVIEW_ACTION_VERBS);
