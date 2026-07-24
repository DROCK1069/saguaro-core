/**
 * franchiseTriage.ts — Franchise Rollout / Command Center triage engines.
 *
 * Pure, deterministic, framework-free. Turns raw procurement / risk / schedule /
 * escalation rows into the red/yellow/green triage a remote multi-site operator
 * needs. Single source of truth shared by the web dashboard (saguaro-crm — was
 * lib/franchise.ts) and the native field app (saguaro-field — was ~7 inline
 * copies across the cc-* Command Center screens).
 *
 * (Distinct from ./franchise, which holds the ROLLOUT_STAGES launch template —
 * that is the web lib/franchise-template.ts playbook, a different engine.)
 *
 * Drift resolved when this became canonical:
 *  1. toScale(): the very-high branch is now tested BEFORE the loose /high/
 *     branch. The old web copy (and mobile cc-kpis) tested /high/ first, so
 *     "very high" scored 4 instead of 5 — the very-high branch was unreachable
 *     for the literal words "very high". Canonical: very-high = 5. (Mobile
 *     cc-risks.tsx and franchise-rollout.tsx already had the corrected order;
 *     that construction wins.)
 *  2. ORDERED: now includes /releas/. "Released" is lifecycle stage 1 — strictly
 *     AFTER "Ordered" — and is a status these screens actually write (see
 *     nextLifecycleStatus + the vendor/long-lead advance actions). Without it a
 *     released long-lead item was scored as un-ordered and could flash red
 *     "Order overdue" despite the PO being released. (Only franchise-rollout.tsx
 *     had this fix; it is now canonical for every long-lead surface.)
 */
export type Severity = 'green' | 'yellow' | 'red';
export declare const num: (v: any) => number | null;
export interface LongLeadHealth {
    severity: Severity;
    state: 'delivered' | 'late' | 'order-now' | 'at-risk' | 'on-track' | 'unknown';
    label: string;
    orderByDate: string | null;
    daysToOrderBy: number | null;
    daysToNeeded: number | null;
    eta: string | null;
}
export declare function computeLongLead(it: Record<string, any>, nowMs?: number): LongLeadHealth;
export declare function toScale(v: any): number | null;
export interface RiskHealth {
    severity: Severity;
    score: number | null;
    likelihood: number | null;
    impact: number | null;
    band: 'Low' | 'Medium' | 'High' | 'Critical' | '—';
    isOpen: boolean;
}
export declare function computeRisk(r: Record<string, any>, nowMs?: number): RiskHealth;
export declare const SEVERITY_ORDER: Record<Severity, number>;
export declare function escalationSeverity(daysOverdue: any): Severity;
export interface EscalationLevel {
    level: 1 | 2 | 3 | 4;
    owner: string;
    short: string;
    color: string;
}
export declare function escalationLevel(daysOverdue: any): EscalationLevel;
export declare const LONGLEAD_LIFECYCLE: string[];
export declare function lifecycleStage(status: any): {
    index: number;
    label: string;
};
export declare function nextLifecycleStatus(status: any): string;
export declare function milestoneSlip(baseline: any, current: any, actual: any, floatDays?: any): {
    slip: number | null;
    severity: Severity;
};
//# sourceMappingURL=franchiseTriage.d.ts.map