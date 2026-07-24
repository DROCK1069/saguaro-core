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
export const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export type Priority = (typeof PRIORITIES)[number];

/** Title-Case display labels. For rendering only — never persist these. */
export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

/**
 * Semantic tone per priority. A small vocabulary both apps already render:
 * mobile <Pill tone={...}> understands neutral | green | amber | red | blue;
 * web maps these onto its palette (DIM | BLUE | AMBER | RED) or Badge tones.
 * One distinct tone per level, so critical (red) and high (amber) are never
 * collapsed to the same color again.
 */
export type PriorityTone = 'neutral' | 'blue' | 'amber' | 'red';

export const PRIORITY_TONE: Record<Priority, PriorityTone> = {
  low: 'neutral',
  medium: 'blue',
  high: 'amber',
  critical: 'red',
};

/** Ascending severity rank (low = 0 ... critical = 3) for sorting / comparison. */
export const PRIORITY_RANK: Record<Priority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

/** { value, label } list for dropdowns / pickers, ascending low -> critical. */
export const PRIORITY_OPTIONS: ReadonlyArray<{ value: Priority; label: string }> =
  PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] }));

/**
 * Live synonyms seen in the DB and older surfaces, folded onto the canon:
 * warranty used 'emergency', field-issues used 'urgent', RFIs / submittals /
 * many API routes default to 'normal'.
 */
const PRIORITY_SYNONYMS: Record<string, Priority> = {
  urgent: 'critical',
  emergency: 'critical',
  normal: 'medium',
  none: 'low',
};

/** Type guard: is this exactly a canonical (lowercase) priority value? */
export function isPriority(value: unknown): value is Priority {
  return (
    typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
  );
}

/**
 * Fold any incoming value (casing, surrounding whitespace, known synonyms)
 * onto the canonical set. Returns null when unrecognizable, so the caller
 * chooses the default rather than this module guessing.
 */
export function normalizePriority(value: unknown): Priority | null {
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  if (!v) return null;
  if (isPriority(v)) return v;
  return PRIORITY_SYNONYMS[v] ?? null;
}

/** Normalize with a caller-chosen fallback (default 'medium'). */
export function toPriority(value: unknown, fallback: Priority = 'medium'): Priority {
  return normalizePriority(value) ?? fallback;
}

/**
 * Display label for any input. Falls back to a humanized copy of the raw
 * string (so an unrecognized DB value still renders something sensible).
 */
export function priorityLabel(value: unknown): string {
  const p = normalizePriority(value);
  if (p) return PRIORITY_LABELS[p];
  if (typeof value === 'string' && value.trim()) {
    const s = value.trim();
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return '';
}

/** Semantic tone for any input; unknown -> 'neutral'. */
export function priorityTone(value: unknown): PriorityTone {
  const p = normalizePriority(value);
  return p ? PRIORITY_TONE[p] : 'neutral';
}

/** Sort rank for any input; unknown sorts lowest (-1). */
export function priorityRank(value: unknown): number {
  const p = normalizePriority(value);
  return p ? PRIORITY_RANK[p] : -1;
}

/**
 * Comparator for Array.prototype.sort. Default 'desc' puts critical first —
 * the order list screens want. Pass 'asc' for low first.
 */
export function comparePriority(
  a: unknown,
  b: unknown,
  direction: 'asc' | 'desc' = 'desc',
): number {
  const diff = priorityRank(a) - priorityRank(b);
  return direction === 'asc' ? diff : -diff;
}
