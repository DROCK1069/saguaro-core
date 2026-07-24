"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.REVIEW_ACTION_INPUTS = exports.COURT_LABELS = exports.STATUS_LABELS_SHORT = exports.STATUS_LABELS = exports.REVIEW_ACTION_VERBS = exports.REVIEW_ACTION_LABELS = exports.REVIEW_DISPOSITION = exports.REVIEW_DECISIONS = exports.OPEN_STATUSES = exports.CLOSED_STATUSES = exports.SUBMITTAL_STATUSES = exports.INITIAL_SUBMITTAL_STATUS = void 0;
exports.normalizeSubmittalStatus = normalizeSubmittalStatus;
exports.statusTone = statusTone;
exports.isClosedStatus = isClosedStatus;
exports.isOpenStatus = isOpenStatus;
exports.isTerminalStatus = isTerminalStatus;
exports.deriveCourt = deriveCourt;
exports.resolveReviewDecision = resolveReviewDecision;
exports.reviewDecisionToStatus = reviewDecisionToStatus;
// The status a brand-new submittal is created with.
exports.INITIAL_SUBMITTAL_STATUS = 'draft';
// Ordered lifecycle used for pipeline steppers, status pickers, and filters.
exports.SUBMITTAL_STATUSES = [
    'draft',
    'submitted',
    'under_review',
    'approved',
    'approved_as_noted',
    'revise_resubmit',
    'rejected',
];
// Closed / terminal statuses — no further workflow action is expected.
exports.CLOSED_STATUSES = ['approved', 'approved_as_noted', 'rejected', 'void'];
// Open statuses — still moving through the ball-in-court workflow.
exports.OPEN_STATUSES = ['draft', 'submitted', 'under_review', 'revise_resubmit'];
exports.REVIEW_DECISIONS = ['approved', 'approved_as_noted', 'revise_resubmit', 'rejected'];
// The canonical decision → disposition map. `label` is the exact AIA stamp text.
exports.REVIEW_DISPOSITION = {
    approved: { status: 'approved', label: 'No Exceptions Taken', tone: 'green', court: 'owner' },
    approved_as_noted: { status: 'approved_as_noted', label: 'Make Corrections Noted', tone: 'green', court: 'owner' },
    revise_resubmit: { status: 'revise_resubmit', label: 'Revise and Resubmit', tone: 'amber', court: 'sub' },
    rejected: { status: 'rejected', label: 'Rejected', tone: 'red', court: 'architect' },
};
// AIA stamp text keyed by decision (thin accessor over REVIEW_DISPOSITION).
exports.REVIEW_ACTION_LABELS = {
    approved: exports.REVIEW_DISPOSITION.approved.label,
    approved_as_noted: exports.REVIEW_DISPOSITION.approved_as_noted.label,
    revise_resubmit: exports.REVIEW_DISPOSITION.revise_resubmit.label,
    rejected: exports.REVIEW_DISPOSITION.rejected.label,
};
// Loose action verbs → canonical decision. Accepts the legacy web review-route
// verbs (approve / reject / resubmit) AND the canonical decision keys. This is
// where the historical "resubmit" drift is resolved: resubmit → revise_resubmit.
exports.REVIEW_ACTION_VERBS = {
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
exports.STATUS_LABELS = {
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
exports.STATUS_LABELS_SHORT = {
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
exports.COURT_LABELS = {
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
function normalizeSubmittalStatus(raw) {
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
            return exports.INITIAL_SUBMITTAL_STATUS;
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
function statusTone(status) {
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
function isClosedStatus(status) {
    return exports.CLOSED_STATUSES.includes(normalizeSubmittalStatus(status));
}
function isOpenStatus(status) {
    return !isClosedStatus(status);
}
// Terminal = no further reviewer action expected (same set as closed).
function isTerminalStatus(status) {
    return isClosedStatus(status);
}
// ── Ball-in-court derivation ────────────────────────────────────────────────
// Who holds the submittal, derived from status (reviewer-perspective). Normalizes
// first, so every legacy variant maps correctly:
//   draft / submitted / under_review → you (reviewer action needed)
//   revise_resubmit                  → sub (back to the sub to revise)
//   rejected                         → architect
//   approved / approved_as_noted / void → owner (closed out)
function deriveCourt(status) {
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
function resolveReviewDecision(action) {
    const decision = exports.REVIEW_ACTION_VERBS[(action ?? '').toLowerCase().trim()];
    return decision ? exports.REVIEW_DISPOSITION[decision] : null;
}
// Resolve a loose action verb to just the resulting canonical status, or null.
function reviewDecisionToStatus(action) {
    return resolveReviewDecision(action)?.status ?? null;
}
// The set of loose verbs the review API accepts (for input validation).
exports.REVIEW_ACTION_INPUTS = Object.keys(exports.REVIEW_ACTION_VERBS);
//# sourceMappingURL=submittal.js.map