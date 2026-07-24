/**
 * Currency display formatting — the ONE place a money value becomes a
 * human-readable string, shared by the web dashboard and the native field app.
 * AI extracts, the engine computes, and THIS module renders. Two shapes:
 *
 *   fmtMoney       "$1,234,567"                full, whole-dollar, grouped
 *   fmtMoneyShort  "$1.2M" · "$450k" · "$920"  compact KPI / tile / chart label
 *   fmtMoneyPrecise"$45.50"                     full, two-decimal (rates, unit $)
 *
 * INPUT UNIT — the `fmtMoney*` helpers take **DOLLARS** (a plain number, e.g.
 * 32_000_000 → "$32.0M"). Saguaro's list/summary columns (contract_value,
 * billed_to_date, revised_contract_value, hourly_rate, …) are stored in whole
 * dollars, so these are the drop-in helpers for every current call-site.
 * For engine-native **integer cents** (the `Cents` type from ./money) use
 * fmtCents / fmtCentsShort — they divide by 100 first.
 *
 * CANONICAL RULES (this resolves the prior cross-repo drift):
 *   • billions  → one decimal, "B"        →  $1.4B
 *   • millions  → one decimal, "M"        →  $32.0M     (NEVER "$32M")
 *   • thousands → integer, lowercase "k"  →  $450k      (NEVER "$450K")
 *   • < $1,000  → whole dollars, grouped  →  $920
 *   • null / undefined / non-finite       →  "—"
 *
 * Display formatting must never throw, so these functions are total: bad input
 * degrades to the em-dash rather than raising (unlike the arithmetic helpers in
 * ./money, which assert integer cents).
 */
import type { Cents } from './money';

const DASH = '—';

/** Core compact formatter over a finite DOLLAR amount. Sign is preserved. */
function short(dollars: number): string {
  const abs = Math.abs(dollars);
  if (abs >= 1e9) return `$${(dollars / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(dollars / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${Math.round(dollars / 1e3).toLocaleString('en-US')}k`;
  return `$${Math.round(dollars).toLocaleString('en-US')}`;
}

/** Compact money for KPI tiles / charts / dense lists. Input: DOLLARS. */
export function fmtMoneyShort(dollars: number | null | undefined): string {
  if (dollars == null || !Number.isFinite(dollars)) return DASH;
  return short(dollars);
}

/** Full, whole-dollar money with thousands separators. Input: DOLLARS. */
export function fmtMoney(dollars: number | null | undefined): string {
  if (dollars == null || !Number.isFinite(dollars)) return DASH;
  return `$${Math.round(dollars).toLocaleString('en-US')}`;
}

/** Full money with two-decimal cents precision ($45.50) — rates & unit prices. Input: DOLLARS. */
export function fmtMoneyPrecise(dollars: number | null | undefined): string {
  if (dollars == null || !Number.isFinite(dollars)) return DASH;
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Compact money from engine-native integer CENTS. */
export function fmtCentsShort(cents: Cents | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return DASH;
  return short(cents / 100);
}

/** Full, whole-dollar money from engine-native integer CENTS. */
export function fmtCents(cents: Cents | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return DASH;
  return `$${Math.round(cents / 100).toLocaleString('en-US')}`;
}
