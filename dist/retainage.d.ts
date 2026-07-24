/**
 * Retainage — the single source of truth for the default percentage of each
 * progress payment withheld until substantial completion.
 *
 * Before this module the literal `10` was copy-pasted into ~26 web sites and
 * ~10 native sites, resolved with two INCOMPATIBLE fallback operators:
 *   `?? 10`  — nullish: preserves an explicit 0% (a real, valid contract term).
 *   `|| 10`  — truthy:  silently rewrites an explicit 0% retainage into 10%,
 *              over-withholding on zero-retainage contracts and their G702/G703
 *              pay-app PDFs. That divergence is the drift this module resolves.
 *
 * `resolveRetainagePct` gives every call-site one nullish-safe resolver: only a
 * genuinely absent value (null / undefined / blank string / non-finite) falls
 * back to the default; an explicit 0 is always preserved. Framework-free.
 */
import { Cents } from './money';
/** Industry-standard default retainage: 10% of completed & stored work. */
export declare const DEFAULT_RETAINAGE_PCT = 10;
/** Valid retainage percentages are 0–100 inclusive. */
export declare const MIN_RETAINAGE_PCT = 0;
export declare const MAX_RETAINAGE_PCT = 100;
/**
 * Retainage above this reads as unusual for US construction and is worth a
 * human glance (mirrors the sanity layer's RETAINAGE_HIGH threshold).
 */
export declare const RETAINAGE_HIGH_PCT = 20;
/** Clamp any number into the valid 0–100 retainage band. */
export declare function clampRetainagePct(pct: number): number;
/**
 * Resolve a stored/entered retainage percent to a usable number.
 *
 * Accepts a number, a numeric string (e.g. "10", " 7.5 " from a text input), or
 * null/undefined. NULLISH semantics — the whole point of this helper — so an
 * explicit 0 survives and is NOT replaced by the default. Anything genuinely
 * absent or non-numeric falls back to `fallback` (the 10% default unless a
 * caller passes a tenant/contract-level default). Result is clamped to 0–100.
 *
 * Use this to replace every `?? 10`, `|| 10`, and `!= null ? … : '10'` site.
 */
export declare function resolveRetainagePct(value?: number | string | null, fallback?: number): number;
/**
 * Retainage held on an amount, in exact integer cents. Thin wrapper over
 * `percentOf` so document generators and pay-app math share one rounding rule.
 */
export declare function retainageCents(amountCents: Cents, pct: number): Cents;
/** Human label for a retainage rate, e.g. 10 → "10%". */
export declare function retainageLabel(pct: number): string;
/** True when the rate is above the "verify this" threshold (see sanity layer). */
export declare function isRetainageUnusuallyHigh(pct: number): boolean;
//# sourceMappingURL=retainage.d.ts.map