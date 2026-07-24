"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRIAGE_ORDER = void 0;
exports.computeHealth = computeHealth;
/**
 * Portfolio health engine — the single source of truth for Command Center triage.
 *
 * Turns a project's live signals into a Green / Yellow / Red status PLUS the
 * specific reasons behind it — so a remote PM can triage 10-20 jobs in one glance
 * and know exactly why anything is yellow or red (Rob's "immediate action item" rule).
 *
 * Framework-free and dependency-free: pure functions over plain project rows,
 * safe to import from the web dashboard (saguaro-crm) and the native field app
 * (saguaro-field) alike. Deterministic given `nowMs` — pass a fixed epoch in tests.
 *
 * Canonical origin: web lib/portfolio-health.ts. The field app previously carried
 * a hand-ported, lossy subset in app/cc-kpis.tsx (status/score only, no flags or
 * derived numbers, no injectable clock). This module supersedes both.
 */
const projectContract_1 = require("./projectContract");
const num = (v) => {
    if (v === null || v === undefined || v === '')
        return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,]/g, ''));
    return isNaN(n) ? null : n;
};
const firstNum = (p, keys) => {
    for (const k of keys) {
        const n = num(p[k]);
        if (n !== null)
            return n;
    }
    return null;
};
const firstDate = (p, keys) => {
    for (const k of keys) {
        const v = p[k];
        if (v)
            return String(v);
    }
    return null;
};
const daysBetween = (iso, now) => {
    if (!iso)
        return null;
    const t = Date.parse(iso);
    if (isNaN(t))
        return null;
    return Math.round((t - now) / 86400000);
};
function computeHealth(p, nowMs) {
    const now = nowMs ?? Date.parse(new Date().toISOString().slice(0, 10)); // day-granular, deterministic
    const flags = [];
    const percentComplete = firstNum(p, ['percent_complete', 'completeness_score']);
    const isDone = (percentComplete ?? 0) >= 100 || !!p.actual_end_date ||
        /complete|closed|closeout|won/i.test(String(p.status || ''));
    // ---- Budget ----
    const budget = (0, projectContract_1.projectContractValueOrNull)(p); // canonical revised-first contract value (projectContract.ts) — one rule platform-wide
    const cost = firstNum(p, ['cost_to_date']);
    const balance = firstNum(p, ['balance_to_finish']);
    let forecast = firstNum(p, ['projected_cost']);
    if (forecast === null && cost !== null && balance !== null)
        forecast = cost + balance;
    let variancePct = null;
    if (budget && budget > 0 && forecast !== null) {
        variancePct = ((forecast - budget) / budget) * 100;
        if (variancePct > 5)
            flags.push({ label: `Over budget ${variancePct.toFixed(0)}%`, severity: 'red' });
        else if (variancePct > 1)
            flags.push({ label: `Trending over budget`, severity: 'yellow' });
    }
    // ---- Schedule ----
    const finishDate = firstDate(p, ['target_finish_date', 'projected_end_date', 'revised_completion_date', 'end_date', 'estimated_completion', 'substantial_completion_date', 'substantial_completion']);
    const daysToFinish = daysBetween(finishDate, now);
    if (!isDone && daysToFinish !== null) {
        if (daysToFinish < 0)
            flags.push({ label: `${Math.abs(daysToFinish)}d past finish date`, severity: 'red' });
        else if (daysToFinish <= 30 && (percentComplete ?? 0) < 80)
            flags.push({ label: `Behind pace (${daysToFinish}d left)`, severity: 'yellow' });
    }
    // ---- Staleness (Rob: every project updated within 7 days) ----
    const lastUpdate = firstDate(p, ['last_activity_at', 'last_log_at', 'updated_at']);
    const d = daysBetween(lastUpdate, now);
    const daysSinceUpdate = d === null ? null : -d;
    if (!isDone && daysSinceUpdate !== null) {
        if (daysSinceUpdate > 14)
            flags.push({ label: `No update in ${daysSinceUpdate}d`, severity: 'red' });
        else if (daysSinceUpdate > 7)
            flags.push({ label: `Stale — ${daysSinceUpdate}d`, severity: 'yellow' });
    }
    // ---- Open items ----
    const openRfis = firstNum(p, ['rfi_count']);
    if (!isDone && openRfis !== null) {
        if (openRfis > 10)
            flags.push({ label: `${openRfis} open RFIs`, severity: 'red' });
        else if (openRfis > 5)
            flags.push({ label: `${openRfis} open RFIs`, severity: 'yellow' });
    }
    const openPunch = firstNum(p, ['open_punch_count', 'punch_count']);
    if (openPunch !== null && openPunch > 25)
        flags.push({ label: `${openPunch} punch items`, severity: 'yellow' });
    const openCos = firstNum(p, ['change_order_count']);
    // ---- Permit ----
    const permitExp = firstDate(p, ['permit_expiry']);
    const dPermit = daysBetween(permitExp, now);
    if (!isDone && dPermit !== null) {
        if (dPermit < 0)
            flags.push({ label: `Permit expired`, severity: 'red' });
        else if (dPermit <= 21)
            flags.push({ label: `Permit expires ${dPermit}d`, severity: 'yellow' });
    }
    // ---- Roll up ----
    const reds = flags.filter((f) => f.severity === 'red').length;
    const yellows = flags.filter((f) => f.severity === 'yellow').length;
    const status = reds > 0 ? 'red' : yellows > 0 ? 'yellow' : 'green';
    // Honor an explicit stored health_score when present (blend toward it).
    const stored = firstNum(p, ['health_score']);
    let score = Math.max(0, Math.min(100, 100 - reds * 30 - yellows * 12));
    if (stored !== null && stored >= 0 && stored <= 100)
        score = Math.round((score + stored) / 2);
    return {
        status, score, flags,
        percentComplete, budget, forecast, variancePct,
        finishDate, daysToFinish, daysSinceUpdate,
        openRfis, openPunch, openCos,
    };
}
// Triage order: red first, then yellow, then green (worst-first for the PM).
exports.TRIAGE_ORDER = { red: 0, yellow: 1, green: 2 };
//# sourceMappingURL=portfolioHealth.js.map