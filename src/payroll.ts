/**
 * Certified-payroll wage math (DOL WH-347 / Davis-Bacon prevailing wage).
 * Single source of truth for a worker's gross wages over a payroll period,
 * computed in exact integer cents. Three statutory tiers:
 *   straight time @ base · overtime @ 1.5× base · double time @ 2× base.
 * Fringe benefits are a SEPARATE identity — never folded into gross wages
 * (WH-347 reports fringe in its own column). Callers/AI classify hours into
 * tiers; this engine does the money, so web + native cross-foot to the cent.
 */
import { Cents, extend, scaleCents, sumCents } from './money';

/** Statutory FLSA / Davis-Bacon overtime multiplier (time-and-a-half). */
export const OT_MULTIPLIER = 1.5;
/** Statutory double-time multiplier. */
export const DT_MULTIPLIER = 2;

/** Hours already classified into pay tiers for one worker over a period. */
export interface PayrollHours {
  stHours: number; // straight time — paid at the base rate
  otHours: number; // overtime      — paid at OT_MULTIPLIER × base
  dtHours: number; // double time   — paid at DT_MULTIPLIER × base
}

/**
 * Gross wages for one worker: ST @ base + OT @ 1.5× + DT @ 2×, in exact cents.
 * `baseRateCents` is the straight-time hourly rate in integer cents (run a
 * dollar rate through money.toCents first). Each tier's extended cost is
 * rounded to the cent independently and then summed — matching the canonical
 * web certified-payroll screen exactly.
 */
export function payrollGross(
  stHours: number,
  otHours: number,
  dtHours: number,
  baseRateCents: Cents,
): Cents {
  return sumCents([
    extend(stHours, baseRateCents),
    extend(otHours, scaleCents(baseRateCents, OT_MULTIPLIER)),
    extend(dtHours, scaleCents(baseRateCents, DT_MULTIPLIER)),
  ]);
}

/** {@link payrollGross} taking a pre-classified {@link PayrollHours} bundle. */
export const payrollGrossOf = (h: PayrollHours, baseRateCents: Cents): Cents =>
  payrollGross(h.stHours, h.otHours, h.dtHours, baseRateCents);

/**
 * Fringe-benefit dollars for one worker: paid on ALL hours worked
 * (ST + OT + DT) at the flat fringe hourly rate, in exact cents. Kept apart
 * from gross wages per WH-347 — fringe has its own column and is never part
 * of the gross-wage figure.
 */
export function payrollFringe(totalHours: number, fringeRateCents: Cents): Cents {
  return extend(totalHours, fringeRateCents);
}
