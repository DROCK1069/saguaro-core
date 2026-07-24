"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fmtMoneyShort = fmtMoneyShort;
exports.fmtMoney = fmtMoney;
exports.fmtMoneyPrecise = fmtMoneyPrecise;
exports.fmtCentsShort = fmtCentsShort;
exports.fmtCents = fmtCents;
const DASH = '—';
/** Core compact formatter over a finite DOLLAR amount. Sign is preserved. */
function short(dollars) {
    const abs = Math.abs(dollars);
    if (abs >= 1e9)
        return `$${(dollars / 1e9).toFixed(1)}B`;
    if (abs >= 1e6)
        return `$${(dollars / 1e6).toFixed(1)}M`;
    if (abs >= 1e3)
        return `$${Math.round(dollars / 1e3).toLocaleString('en-US')}k`;
    return `$${Math.round(dollars).toLocaleString('en-US')}`;
}
/** Compact money for KPI tiles / charts / dense lists. Input: DOLLARS. */
function fmtMoneyShort(dollars) {
    if (dollars == null || !Number.isFinite(dollars))
        return DASH;
    return short(dollars);
}
/** Full, whole-dollar money with thousands separators. Input: DOLLARS. */
function fmtMoney(dollars) {
    if (dollars == null || !Number.isFinite(dollars))
        return DASH;
    return `$${Math.round(dollars).toLocaleString('en-US')}`;
}
/** Full money with two-decimal cents precision ($45.50) — rates & unit prices. Input: DOLLARS. */
function fmtMoneyPrecise(dollars) {
    if (dollars == null || !Number.isFinite(dollars))
        return DASH;
    return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
/** Compact money from engine-native integer CENTS. */
function fmtCentsShort(cents) {
    if (cents == null || !Number.isFinite(cents))
        return DASH;
    return short(cents / 100);
}
/** Full, whole-dollar money from engine-native integer CENTS. */
function fmtCents(cents) {
    if (cents == null || !Number.isFinite(cents))
        return DASH;
    return `$${Math.round(cents / 100).toLocaleString('en-US')}`;
}
//# sourceMappingURL=formatMoney.js.map