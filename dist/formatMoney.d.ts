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
/** Compact money for KPI tiles / charts / dense lists. Input: DOLLARS. */
export declare function fmtMoneyShort(dollars: number | null | undefined): string;
/** Full, whole-dollar money with thousands separators. Input: DOLLARS. */
export declare function fmtMoney(dollars: number | null | undefined): string;
/** Full money with two-decimal cents precision ($45.50) — rates & unit prices. Input: DOLLARS. */
export declare function fmtMoneyPrecise(dollars: number | null | undefined): string;
/** Compact money from engine-native integer CENTS. */
export declare function fmtCentsShort(cents: Cents | null | undefined): string;
/** Full, whole-dollar money from engine-native integer CENTS. */
export declare function fmtCents(cents: Cents | null | undefined): string;
//# sourceMappingURL=formatMoney.d.ts.map