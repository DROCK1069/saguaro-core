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
export type SubmittalStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'approved_as_noted' | 'revise_resubmit' | 'rejected' | 'void';
export declare const INITIAL_SUBMITTAL_STATUS: SubmittalStatus;
export declare const SUBMITTAL_STATUSES: SubmittalStatus[];
export declare const CLOSED_STATUSES: SubmittalStatus[];
export declare const OPEN_STATUSES: SubmittalStatus[];
export type ReviewDecision = 'approved' | 'approved_as_noted' | 'revise_resubmit' | 'rejected';
export declare const REVIEW_DECISIONS: ReviewDecision[];
export type StatusTone = 'green' | 'amber' | 'red' | 'blue' | 'neutral';
export type SubmittalCourt = 'you' | 'architect' | 'sub' | 'owner';
export interface Disposition {
    status: SubmittalStatus;
    label: string;
    tone: StatusTone;
    court: SubmittalCourt;
}
export declare const REVIEW_DISPOSITION: Record<ReviewDecision, Disposition>;
export declare const REVIEW_ACTION_LABELS: Record<ReviewDecision, string>;
export declare const REVIEW_ACTION_VERBS: Record<string, ReviewDecision>;
export declare const STATUS_LABELS: Record<SubmittalStatus, string>;
export declare const STATUS_LABELS_SHORT: Record<SubmittalStatus, string>;
export declare const COURT_LABELS: Record<SubmittalCourt, string>;
export declare function normalizeSubmittalStatus(raw: string | null | undefined): SubmittalStatus;
export declare function statusTone(status: string | null | undefined): StatusTone;
export declare function isClosedStatus(status: string | null | undefined): boolean;
export declare function isOpenStatus(status: string | null | undefined): boolean;
export declare function isTerminalStatus(status: string | null | undefined): boolean;
export declare function deriveCourt(status: string | null | undefined): SubmittalCourt;
export declare function resolveReviewDecision(action: string | null | undefined): Disposition | null;
export declare function reviewDecisionToStatus(action: string | null | undefined): SubmittalStatus | null;
export declare const REVIEW_ACTION_INPUTS: string[];
//# sourceMappingURL=submittal.d.ts.map