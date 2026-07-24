/**
 * Date-only helpers — the single source of truth for YYYY-MM-DD calendar dates
 * (due_date, milestone / expiry dates, work_date, etc.), shared web + native.
 *
 * THE BUG THIS KILLS: a bare `new Date("2026-07-23")` parses as UTC midnight,
 * which in any negative-offset timezone (e.g. Arizona, UTC-7) is the *previous*
 * calendar day at 5pm local — so a stored due date renders / compares a day
 * early between the web app and the field app. Everything here pins a date-only
 * value to LOCAL midnight, so the calendar day you saved is the calendar day
 * every device shows. Deterministic, DST-safe, framework-free pure TS.
 *
 * Rule of thumb: use these ONLY for date-only values (no clock time). For true
 * instants (created_at / updated_at and other timestamptz columns) keep using
 * `new Date(iso)` — those already carry a timezone and must not be re-pinned.
 */
/** Milliseconds in one calendar day. */
export declare const DAY_MS = 86400000;
/** Days-before-expiry that still count as "expiring soon" — INCLUSIVE (COI rule). */
export declare const EXPIRING_WINDOW_DAYS = 30;
/** A bare calendar date, "YYYY-MM-DD". */
export type YMD = string;
/** Anything a date-only helper will accept. */
export type DateInput = string | number | Date | null | undefined;
/**
 * Parse a date-only value to a Date at LOCAL midnight. Accepts:
 *   - "YYYY-MM-DD" (or any string that STARTS with it, e.g. a full ISO
 *     timestamp — only its calendar date is read, never its clock/zone),
 *   - a Date (re-pinned to local midnight),
 *   - epoch milliseconds.
 * Returns null when the value is empty or unparseable.
 */
export declare function parseYMD(value: DateInput): Date | null;
/** Format a Date as its LOCAL "YYYY-MM-DD" (no UTC shift). */
export declare function formatYMD(d: Date): YMD;
/** Alias — the mobile pickers historically exported this as `toYMD`. */
export declare const toYMD: typeof formatYMD;
/** Today at local midnight, as a Date. */
export declare function todayDate(): Date;
/** Today as local "YYYY-MM-DD". */
export declare function today(): YMD;
/**
 * Whole calendar days from `a` to `b` (i.e. b − a). Rounds to the nearest day so
 * a 23-/25-hour DST boundary can never off-by-one it. Returns null when either
 * side is empty/unparseable. Positive when `b` is later than `a`.
 */
export declare function daysBetween(a: DateInput, b: DateInput): number | null;
/**
 * Whole calendar days from today until `target`: negative = past, 0 = today,
 * positive = future. null when `target` is empty/unparseable.
 */
export declare function daysUntil(target: DateInput): number | null;
/** Statuses that mean a record is no longer actionable (so never "overdue"). */
export declare const DEFAULT_CLOSED_STATUSES: readonly string[];
/**
 * True when a due date has passed (strictly before today) AND the record is not
 * in a closed/done state. `due` is treated as a date-only value at local midnight.
 */
export declare function isOverdue(due: DateInput, status?: string | null, closedStatuses?: readonly string[]): boolean;
/**
 * Shift a date by whole days, type-preserving:
 *   addDays(dateObj, n)      -> Date  (at local midnight of the shifted day)
 *   addDays("YYYY-MM-DD", n) -> "YYYY-MM-DD"
 * Throws on an unparseable string.
 */
export declare function addDays(date: Date, days: number): Date;
export declare function addDays(date: YMD, days: number): YMD;
/** Today shifted by `days`, as local "YYYY-MM-DD" (e.g. ymdPlus(7) = one week out). */
export declare function ymdPlus(days?: number): YMD;
/**
 * Localized display string for a date-only value, e.g. "Mon, Jun 15, 2026".
 * Returns '' for empty/invalid. Override `options` for other shapes
 * (e.g. { month: 'short', day: 'numeric', year: 'numeric' }).
 */
export declare function prettyDate(value: DateInput, options?: Intl.DateTimeFormatOptions, locale?: string): string;
/** Days until an expiry date; null when no/invalid date. Negative = already expired. */
export declare function daysUntilExpiry(expiry: DateInput): number | null;
/**
 * "Expiring soon" — expires today or within the next `windowDays`, INCLUSIVE.
 * Canonical COI rule: 0 <= daysUntil <= 30. Already-expired dates are NOT "soon".
 */
export declare function isExpiringSoon(expiry: DateInput, windowDays?: number): boolean;
/** True when an expiry date is strictly in the past (before today). */
export declare function isExpired(expiry: DateInput): boolean;
export type ExpiryStatus = 'none' | 'expired' | 'expiring' | 'active';
/**
 * Four-state expiry classification with the canonical INCLUSIVE boundary:
 *   none     → no / invalid date
 *   expired  → daysUntil < 0
 *   expiring → 0 <= daysUntil <= windowDays   (day 30 counts as "expiring")
 *   active   → daysUntil > windowDays
 */
export declare function expiryStatus(expiry: DateInput, windowDays?: number): ExpiryStatus;
//# sourceMappingURL=dates.d.ts.map