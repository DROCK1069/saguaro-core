"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTakeoffSanity = checkTakeoffSanity;
exports.checkPayAppSanity = checkPayAppSanity;
/**
 * Sanity layer — flags implausible numbers AFTER the deterministic calc.
 * It FLAGS for human review and never mutates values. This is the "catches what
 * a plain calculator can't" differentiator: an absurd unit cost, a duplicated
 * line, a pay app that doesn't reconcile.
 */
const money_1 = require("./money");
// Broad per-unit unit-cost sanity bands, in cents. Outside the band → flag.
// Intentionally generous — only catches clearly-wrong magnitudes (10–100× off).
const UNIT_COST_BAND_CENTS = {
    EA: [1, 1000000000],
    LF: [1, 500000],
    SF: [1, 200000],
    SY: [1, 500000],
    CY: [5000, 500000],
    CF: [1, 100000],
    LB: [1, 10000],
    TON: [1000, 5000000],
    GAL: [1, 100000],
    HR: [1000, 50000],
    LS: [1, 10000000000],
};
function checkTakeoffSanity(items) {
    const flags = [];
    for (const it of items) {
        if (it.quantity <= 0)
            flags.push({ severity: 'error', code: 'QTY_ZERO', message: 'Zero/negative quantity', ref: it.description });
        if (it.unitCostCents <= 0)
            flags.push({ severity: 'error', code: 'RATE_ZERO', message: 'Zero/negative unit cost', ref: it.description });
        if ((0, money_1.extend)(it.quantity, it.unitCostCents) !== it.totalCents) {
            flags.push({ severity: 'error', code: 'TOTAL_MISMATCH', message: 'Line total ≠ quantity × unit cost', ref: it.description });
        }
        const band = UNIT_COST_BAND_CENTS[it.unit];
        if (band && it.unitCostCents > 0 && (it.unitCostCents < band[0] || it.unitCostCents > band[1])) {
            flags.push({ severity: 'warn', code: 'RATE_OUT_OF_BAND', message: `Unit cost looks off for ${it.unit} — verify`, ref: it.description });
        }
    }
    const seen = new Map();
    for (const it of items) {
        const k = it.description.toLowerCase().trim();
        seen.set(k, (seen.get(k) || 0) + 1);
    }
    for (const [desc, n] of seen) {
        if (n > 1)
            flags.push({ severity: 'warn', code: 'DUPLICATE_LINE', message: `Duplicate line item appears ${n}×`, ref: desc });
    }
    return flags;
}
function checkPayAppSanity(result, retainagePercent) {
    const flags = [];
    if (!result.reconciles) {
        for (const e of result.errors)
            flags.push({ severity: 'error', code: 'NO_RECONCILE', message: e });
    }
    if (result.currentPaymentDue < 0)
        flags.push({ severity: 'error', code: 'NEGATIVE_DUE', message: 'Current payment due is negative' });
    if (result.completedAndStoredTotal > result.scheduledTotal)
        flags.push({ severity: 'error', code: 'OVERBILL', message: 'Completed + stored exceeds scheduled total' });
    if (retainagePercent > 20)
        flags.push({ severity: 'warn', code: 'RETAINAGE_HIGH', message: `Retainage ${retainagePercent}% is unusually high — verify` });
    return flags;
}
//# sourceMappingURL=sanity.js.map