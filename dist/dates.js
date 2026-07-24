"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CLOSED_STATUSES = exports.toYMD = exports.EXPIRING_WINDOW_DAYS = exports.DAY_MS = void 0;
exports.parseYMD = parseYMD;
exports.formatYMD = formatYMD;
exports.todayDate = todayDate;
exports.today = today;
exports.daysBetween = daysBetween;
exports.daysUntil = daysUntil;
exports.isOverdue = isOverdue;
exports.addDays = addDays;
exports.ymdPlus = ymdPlus;
exports.prettyDate = prettyDate;
exports.daysUntilExpiry = daysUntilExpiry;
exports.isExpiringSoon = isExpiringSoon;
exports.isExpired = isExpired;
exports.expiryStatus = expiryStatus;
/** Milliseconds in one calendar day. */
exports.DAY_MS = 86400000;
/** Days-before-expiry that still count as "expiring soon" — INCLUSIVE (COI rule). */
exports.EXPIRING_WINDOW_DAYS = 30;
/**
 * Parse a date-only value to a Date at LOCAL midnight. Accepts:
 *   - "YYYY-MM-DD" (or any string that STARTS with it, e.g. a full ISO
 *     timestamp — only its calendar date is read, never its clock/zone),
 *   - a Date (re-pinned to local midnight),
 *   - epoch milliseconds.
 * Returns null when the value is empty or unparseable.
 */
function parseYMD(value) {
    if (value == null)
        return null;
    if (value instanceof Date) {
        if (isNaN(value.getTime()))
            return null;
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === 'number') {
        const t = new Date(value);
        if (isNaN(t.getTime()))
            return null;
        return new Date(t.getFullYear(), t.getMonth(), t.getDate());
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());
    if (!m)
        return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
}
/** Format a Date as its LOCAL "YYYY-MM-DD" (no UTC shift). */
function formatYMD(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
/** Alias — the mobile pickers historically exported this as `toYMD`. */
exports.toYMD = formatYMD;
/** Today at local midnight, as a Date. */
function todayDate() {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}
/** Today as local "YYYY-MM-DD". */
function today() {
    return formatYMD(todayDate());
}
/**
 * Whole calendar days from `a` to `b` (i.e. b − a). Rounds to the nearest day so
 * a 23-/25-hour DST boundary can never off-by-one it. Returns null when either
 * side is empty/unparseable. Positive when `b` is later than `a`.
 */
function daysBetween(a, b) {
    const A = parseYMD(a);
    const B = parseYMD(b);
    if (!A || !B)
        return null;
    return Math.round((B.getTime() - A.getTime()) / exports.DAY_MS);
}
/**
 * Whole calendar days from today until `target`: negative = past, 0 = today,
 * positive = future. null when `target` is empty/unparseable.
 */
function daysUntil(target) {
    return daysBetween(todayDate(), target);
}
/** Statuses that mean a record is no longer actionable (so never "overdue"). */
exports.DEFAULT_CLOSED_STATUSES = [
    'closed', 'resolved', 'complete', 'completed', 'done', 'verified', 'approved', 'answered',
];
/**
 * True when a due date has passed (strictly before today) AND the record is not
 * in a closed/done state. `due` is treated as a date-only value at local midnight.
 */
function isOverdue(due, status, closedStatuses = exports.DEFAULT_CLOSED_STATUSES) {
    if (!due)
        return false;
    if (status && closedStatuses.includes(String(status).toLowerCase()))
        return false;
    const d = daysUntil(due);
    return d !== null && d < 0;
}
function addDays(date, days) {
    const base = date instanceof Date
        ? new Date(date.getFullYear(), date.getMonth(), date.getDate())
        : parseYMD(date);
    if (!base)
        throw new Error(`addDays: invalid date "${String(date)}"`);
    base.setDate(base.getDate() + days);
    return date instanceof Date ? base : formatYMD(base);
}
/** Today shifted by `days`, as local "YYYY-MM-DD" (e.g. ymdPlus(7) = one week out). */
function ymdPlus(days = 0) {
    return formatYMD(addDays(todayDate(), days));
}
/**
 * Localized display string for a date-only value, e.g. "Mon, Jun 15, 2026".
 * Returns '' for empty/invalid. Override `options` for other shapes
 * (e.g. { month: 'short', day: 'numeric', year: 'numeric' }).
 */
function prettyDate(value, options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }, locale) {
    const d = parseYMD(value);
    return d ? d.toLocaleDateString(locale, options) : '';
}
// ── Expiry / COI status (insurance certs, warranties, compliance docs) ──────
/** Days until an expiry date; null when no/invalid date. Negative = already expired. */
function daysUntilExpiry(expiry) {
    return daysUntil(expiry);
}
/**
 * "Expiring soon" — expires today or within the next `windowDays`, INCLUSIVE.
 * Canonical COI rule: 0 <= daysUntil <= 30. Already-expired dates are NOT "soon".
 */
function isExpiringSoon(expiry, windowDays = exports.EXPIRING_WINDOW_DAYS) {
    const d = daysUntilExpiry(expiry);
    return d !== null && d >= 0 && d <= windowDays;
}
/** True when an expiry date is strictly in the past (before today). */
function isExpired(expiry) {
    const d = daysUntilExpiry(expiry);
    return d !== null && d < 0;
}
/**
 * Four-state expiry classification with the canonical INCLUSIVE boundary:
 *   none     → no / invalid date
 *   expired  → daysUntil < 0
 *   expiring → 0 <= daysUntil <= windowDays   (day 30 counts as "expiring")
 *   active   → daysUntil > windowDays
 */
function expiryStatus(expiry, windowDays = exports.EXPIRING_WINDOW_DAYS) {
    const d = daysUntilExpiry(expiry);
    if (d === null)
        return 'none';
    if (d < 0)
        return 'expired';
    if (d <= windowDays)
        return 'expiring';
    return 'active';
}
//# sourceMappingURL=dates.js.map