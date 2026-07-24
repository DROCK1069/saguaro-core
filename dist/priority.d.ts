/**
 * Priority — the canonical task / issue priority scale for Saguaro.
 *
 * ONE definition of the low -> medium -> high -> critical ladder, its display
 * labels, its semantic tone, and its sort rank, shared by the web dashboard
 * (saguaro-crm) and the native field app (saguaro-field). Before this module
 * the four values were re-declared ~8x per app and disagreed on:
 *   - casing: 'high' (mobile / API writers) vs 'High' (several web screens),
 *     so a row saved lowercase then rendered by a Title-Case-keyed color/label
 *     map fell through to a gray fallback and dropped out of filter chips;
 *   - tone: 'high' shown RED on every 3-level screen but AMBER on 4-level
 *     screens, and mobile's 4-level screens collapsed high + critical to the
 *     same RED so the two top levels were visually indistinguishable;
 *   - the 'low' color: neutral vs green vs blue across surfaces.
 *
 * Values are lowercase — matching what every writer actually persists.
 * Presentation is DERIVED, never re-typed at the call site:
 *   PRIORITY_LABELS[p] -> 'Low' | 'Medium' | 'High' | 'Critical'
 *   PRIORITY_TONE[p]   -> a semantic tone both apps' Pill / Badge render
 *   PRIORITY_RANK[p]   -> 0..3 ascending, for sorting / compare
 *
 * normalizePriority() folds the live synonyms ('urgent' / 'emergency' ->
 * 'critical', 'normal' -> 'medium', 'none' -> 'low') and any casing back onto
 * the canonical set, so data written by one surface always resolves on another.
 *
 * Framework-free, no app imports. AI extracts/judges; this module defines.
 */
/** The canonical scale, ascending in severity. Lowercase — this is what is stored. */
export declare const PRIORITIES: readonly ["low", "medium", "high", "critical"];
export type Priority = (typeof PRIORITIES)[number];
/** Title-Case display labels. For rendering only — never persist these. */
export declare const PRIORITY_LABELS: Record<Priority, string>;
/**
 * Semantic tone per priority. A small vocabulary both apps already render:
 * mobile <Pill tone={...}> understands neutral | green | amber | red | blue;
 * web maps these onto its palette (DIM | BLUE | AMBER | RED) or Badge tones.
 * One distinct tone per level, so critical (red) and high (amber) are never
 * collapsed to the same color again.
 */
export type PriorityTone = 'neutral' | 'blue' | 'amber' | 'red';
export declare const PRIORITY_TONE: Record<Priority, PriorityTone>;
/** Ascending severity rank (low = 0 ... critical = 3) for sorting / comparison. */
export declare const PRIORITY_RANK: Record<Priority, number>;
/** { value, label } list for dropdowns / pickers, ascending low -> critical. */
export declare const PRIORITY_OPTIONS: ReadonlyArray<{
    value: Priority;
    label: string;
}>;
/** Type guard: is this exactly a canonical (lowercase) priority value? */
export declare function isPriority(value: unknown): value is Priority;
/**
 * Fold any incoming value (casing, surrounding whitespace, known synonyms)
 * onto the canonical set. Returns null when unrecognizable, so the caller
 * chooses the default rather than this module guessing.
 */
export declare function normalizePriority(value: unknown): Priority | null;
/** Normalize with a caller-chosen fallback (default 'medium'). */
export declare function toPriority(value: unknown, fallback?: Priority): Priority;
/**
 * Display label for any input. Falls back to a humanized copy of the raw
 * string (so an unrecognized DB value still renders something sensible).
 */
export declare function priorityLabel(value: unknown): string;
/** Semantic tone for any input; unknown -> 'neutral'. */
export declare function priorityTone(value: unknown): PriorityTone;
/** Sort rank for any input; unknown sorts lowest (-1). */
export declare function priorityRank(value: unknown): number;
/**
 * Comparator for Array.prototype.sort. Default 'desc' puts critical first —
 * the order list screens want. Pass 'asc' for low first.
 */
export declare function comparePriority(a: unknown, b: unknown, direction?: 'asc' | 'desc'): number;
//# sourceMappingURL=priority.d.ts.map