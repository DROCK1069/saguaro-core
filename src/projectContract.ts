/**
 * Project contract-value precedence — the single rule for "what is this project's
 * contract worth right now" across the web dashboard and the native field app.
 *
 * A project row can carry BOTH an original contract value and a revised one
 * (original + approved change orders). The revised value is authoritative the
 * moment it is positive, because it already folds in approved COs; the original
 * is only the pre-CO baseline. So the rule is:
 *
 *     revised_contract_value  when > 0   →   else the original contract value
 *
 * Never original-first. Original-first (and the equivalent "first non-null key
 * wins") silently ignores approved change orders and under-reports the contract
 * — and it is doubly wrong when the original column is a stored 0, which is a
 * present-but-empty value that a first-non-null scan would lock onto before ever
 * reaching the revised column. Selecting the first *positive* value in each tier
 * fixes both faults.
 *
 * This is a field-precedence resolver, NOT currency arithmetic: it returns the
 * project's stored contract figure verbatim (whole dollars, as persisted) and
 * does no cents conversion or rounding. It is deliberately tolerant of the row
 * shapes both apps hand it — number | string | null | undefined — mirroring the
 * `num()` coercion used at every call-site it replaces.
 *
 * NOTE — this resolves the *effective / current* contract value for display,
 * rollups and health. It is NOT the resolver for the *original* base contract
 * that feeds `summarizeContract` (changeOrder) or the pay-app engine; those need
 * the pre-CO original and must use `projectOriginalContract` (below), never this
 * helper, or approved COs get counted twice.
 */

/** A project-like row. Only the contract columns are read; anything else is ignored. */
export interface ProjectLike {
  revised_contract_value?: number | string | null;
  contract_value?: number | string | null;
  // legacy / alias columns seen across the two schemas:
  original_contract_value?: number | string | null;
  original_contract?: number | string | null;
  original_contract_amount?: number | string | null;
  total_contract_amount?: number | string | null;
  contract_amount?: number | string | null;
  contract_sum?: number | string | null;
  // No index signature — so concrete app Project types stay structurally assignable
  // (an index signature would force every caller's type to declare one too).
}

/**
 * Columns that hold the REVISED contract (original + approved COs), highest
 * precedence first. Kept to the single canonical column so the rule matches the
 * task spec exactly; extend here if a new revised alias ever appears.
 */
export const REVISED_CONTRACT_KEYS = ['revised_contract_value'] as const;

/**
 * Columns that hold the ORIGINAL / baseline contract, in fallback order. This is
 * the full alias chain the two apps historically scanned (contract_value first,
 * then the legacy synonyms) — preserved so this helper is a faithful drop-in for
 * every hand-rolled scan it replaces.
 */
export const ORIGINAL_CONTRACT_KEYS = [
  'contract_value',
  'total_contract_amount',
  'contract_sum',
  'original_contract_amount',
  'original_contract_value',
  'original_contract',
  'contract_amount',
] as const;

/** Coerce a stored cell (number | "$1,234.56" | null) to a finite number, else null. */
function coerceAmount(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** First strictly-positive value among the given keys, else null. */
function firstPositive(p: ProjectLike, keys: readonly string[]): number | null {
  const rec = p as Record<string, unknown>;
  for (const k of keys) {
    const n = coerceAmount(rec[k]);
    if (n !== null && n > 0) return n;
  }
  return null;
}

/**
 * The project's effective/current contract value — revised when positive, else
 * the original. Returns `null` when neither tier carries a positive value, so
 * callers can distinguish "unknown" from a real 0 (preserves the `number | null`
 * budget contract of the health engine).
 */
export function projectContractValueOrNull(p: ProjectLike | null | undefined): number | null {
  if (!p) return null;
  const revised = firstPositive(p, REVISED_CONTRACT_KEYS);
  if (revised !== null) return revised;
  return firstPositive(p, ORIGINAL_CONTRACT_KEYS);
}

/**
 * The project's effective/current contract value as a plain number, defaulting
 * to 0 when nothing positive is present. Use this at display / rollup sites that
 * already treat a missing contract as 0.
 */
export function projectContractValue(p: ProjectLike | null | undefined): number {
  return projectContractValueOrNull(p) ?? 0;
}

/**
 * The project's ORIGINAL (pre-change-order) contract value — the base that feeds
 * `summarizeContract`/pay-app math. Never mixes in the revised column, so adding
 * approved COs on top of this can't double-count. Returns 0 when none present.
 */
export function projectOriginalContract(p: ProjectLike | null | undefined): number {
  if (!p) return 0;
  return firstPositive(p, ORIGINAL_CONTRACT_KEYS) ?? 0;
}

export interface ContractValueBreakdown {
  /** revised_contract_value if positive, else null */
  revised: number | null;
  /** first positive original/baseline column, else null */
  original: number | null;
  /** the value the precedence rule selects (revised → original), or 0 */
  effective: number;
  /** which tier the effective value came from */
  source: 'revised' | 'original' | 'none';
}

/** Full breakdown behind {@link projectContractValue} — handy for tooltips/debug. */
export function contractValueBreakdown(p: ProjectLike | null | undefined): ContractValueBreakdown {
  const revised = p ? firstPositive(p, REVISED_CONTRACT_KEYS) : null;
  const original = p ? firstPositive(p, ORIGINAL_CONTRACT_KEYS) : null;
  if (revised !== null) return { revised, original, effective: revised, source: 'revised' };
  if (original !== null) return { revised, original, effective: original, source: 'original' };
  return { revised, original, effective: 0, source: 'none' };
}
