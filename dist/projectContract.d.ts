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
    original_contract_value?: number | string | null;
    original_contract?: number | string | null;
    original_contract_amount?: number | string | null;
    total_contract_amount?: number | string | null;
    contract_amount?: number | string | null;
    contract_sum?: number | string | null;
    [key: string]: unknown;
}
/**
 * Columns that hold the REVISED contract (original + approved COs), highest
 * precedence first. Kept to the single canonical column so the rule matches the
 * task spec exactly; extend here if a new revised alias ever appears.
 */
export declare const REVISED_CONTRACT_KEYS: readonly ["revised_contract_value"];
/**
 * Columns that hold the ORIGINAL / baseline contract, in fallback order. This is
 * the full alias chain the two apps historically scanned (contract_value first,
 * then the legacy synonyms) — preserved so this helper is a faithful drop-in for
 * every hand-rolled scan it replaces.
 */
export declare const ORIGINAL_CONTRACT_KEYS: readonly ["contract_value", "total_contract_amount", "contract_sum", "original_contract_amount", "original_contract_value", "original_contract", "contract_amount"];
/**
 * The project's effective/current contract value — revised when positive, else
 * the original. Returns `null` when neither tier carries a positive value, so
 * callers can distinguish "unknown" from a real 0 (preserves the `number | null`
 * budget contract of the health engine).
 */
export declare function projectContractValueOrNull(p: ProjectLike | null | undefined): number | null;
/**
 * The project's effective/current contract value as a plain number, defaulting
 * to 0 when nothing positive is present. Use this at display / rollup sites that
 * already treat a missing contract as 0.
 */
export declare function projectContractValue(p: ProjectLike | null | undefined): number;
/**
 * The project's ORIGINAL (pre-change-order) contract value — the base that feeds
 * `summarizeContract`/pay-app math. Never mixes in the revised column, so adding
 * approved COs on top of this can't double-count. Returns 0 when none present.
 */
export declare function projectOriginalContract(p: ProjectLike | null | undefined): number;
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
export declare function contractValueBreakdown(p: ProjectLike | null | undefined): ContractValueBreakdown;
//# sourceMappingURL=projectContract.d.ts.map