"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payrollGrossOf = exports.DT_MULTIPLIER = exports.OT_MULTIPLIER = void 0;
exports.payrollGross = payrollGross;
exports.payrollFringe = payrollFringe;
/**
 * Certified-payroll wage math (DOL WH-347 / Davis-Bacon prevailing wage).
 * Single source of truth for a worker's gross wages over a payroll period,
 * computed in exact integer cents. Three statutory tiers:
 *   straight time @ base · overtime @ 1.5× base · double time @ 2× base.
 * Fringe benefits are a SEPARATE identity — never folded into gross wages
 * (WH-347 reports fringe in its own column). Callers/AI classify hours into
 * tiers; this engine does the money, so web + native cross-foot to the cent.
 */
const money_1 = require("./money");
/** Statutory FLSA / Davis-Bacon overtime multiplier (time-and-a-half). */
exports.OT_MULTIPLIER = 1.5;
/** Statutory double-time multiplier. */
exports.DT_MULTIPLIER = 2;
/**
 * Gross wages for one worker: ST @ base + OT @ 1.5× + DT @ 2×, in exact cents.
 * `baseRateCents` is the straight-time hourly rate in integer cents (run a
 * dollar rate through money.toCents first). Each tier's extended cost is
 * rounded to the cent independently and then summed — matching the canonical
 * web certified-payroll screen exactly.
 */
function payrollGross(stHours, otHours, dtHours, baseRateCents) {
    return (0, money_1.sumCents)([
        (0, money_1.extend)(stHours, baseRateCents),
        (0, money_1.extend)(otHours, (0, money_1.scaleCents)(baseRateCents, exports.OT_MULTIPLIER)),
        (0, money_1.extend)(dtHours, (0, money_1.scaleCents)(baseRateCents, exports.DT_MULTIPLIER)),
    ]);
}
/** {@link payrollGross} taking a pre-classified {@link PayrollHours} bundle. */
const payrollGrossOf = (h, baseRateCents) => payrollGross(h.stHours, h.otHours, h.dtHours, baseRateCents);
exports.payrollGrossOf = payrollGrossOf;
/**
 * Fringe-benefit dollars for one worker: paid on ALL hours worked
 * (ST + OT + DT) at the flat fringe hourly rate, in exact cents. Kept apart
 * from gross wages per WH-347 — fringe has its own column and is never part
 * of the gross-wage figure.
 */
function payrollFringe(totalHours, fringeRateCents) {
    return (0, money_1.extend)(totalHours, fringeRateCents);
}
//# sourceMappingURL=payroll.js.map