"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LONGLEAD_LIFECYCLE = exports.SEVERITY_ORDER = exports.num = void 0;
exports.computeLongLead = computeLongLead;
exports.toScale = toScale;
exports.computeRisk = computeRisk;
exports.escalationSeverity = escalationSeverity;
exports.escalationLevel = escalationLevel;
exports.lifecycleStage = lifecycleStage;
exports.nextLifecycleStatus = nextLifecycleStatus;
exports.milestoneSlip = milestoneSlip;
const DAY = 86400000;
const today = (nowMs) => nowMs ?? Date.parse(new Date().toISOString().slice(0, 10));
const parse = (v) => {
    if (!v)
        return null;
    const t = Date.parse(String(v));
    return isNaN(t) ? null : t;
};
const daysFromNow = (v, nowMs) => {
    const t = parse(v);
    return t === null ? null : Math.round((t - today(nowMs)) / DAY);
};
const num = (v) => {
    if (v === null || v === undefined || v === '')
        return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[$,]/g, ''));
    return isNaN(n) ? null : n;
};
exports.num = num;
const DELIVERED = /deliver|receiv|complete|closed|installed|on.?site/i;
// /releas/ is intentionally included — see drift #2 in the file header.
const ORDERED = /order|ship|transit|production|manufactur|progress|confirm|po.?issued|releas/i;
function computeLongLead(it, nowMs) {
    const status = String(it.status || '');
    const isDelivered = DELIVERED.test(status) || !!it.received_date || ((0, exports.num)(it.received_qty) ?? 0) > 0;
    const isOrdered = isDelivered || ORDERED.test(status);
    const needed = it.needed_by_date || null;
    const lead = (0, exports.num)(it.lead_time_days);
    let orderByDate = null;
    if (needed && lead !== null) {
        orderByDate = new Date(parse(needed) - lead * DAY).toISOString().slice(0, 10);
    }
    const daysToNeeded = daysFromNow(needed, nowMs);
    const daysToOrderBy = daysFromNow(orderByDate, nowMs);
    const eta = it.expected_delivery_date || it.delivery_appointment || it.expected_ship_date || null;
    const etaDays = daysFromNow(eta, nowMs);
    if (isDelivered) {
        return { severity: 'green', state: 'delivered', label: 'Delivered', orderByDate, daysToOrderBy, daysToNeeded, eta };
    }
    // ETA lands after it's needed on site → will slip the schedule.
    if (needed && etaDays !== null && daysToNeeded !== null && etaDays > daysToNeeded) {
        return { severity: 'red', state: 'late', label: 'ETA after need-by', orderByDate, daysToOrderBy, daysToNeeded, eta };
    }
    // Not ordered and the order-by date is here/past → order right now or it's already blown.
    if (!isOrdered && daysToOrderBy !== null && daysToOrderBy <= 0) {
        return { severity: 'red', state: 'order-now', label: daysToOrderBy < 0 ? `Order overdue ${Math.abs(daysToOrderBy)}d` : 'Order today', orderByDate, daysToOrderBy, daysToNeeded, eta };
    }
    // Need-by already passed and nothing received.
    if (daysToNeeded !== null && daysToNeeded < 0) {
        return { severity: 'red', state: 'late', label: `${Math.abs(daysToNeeded)}d past need-by`, orderByDate, daysToOrderBy, daysToNeeded, eta };
    }
    // Order window closing (<=14d) while un-ordered, or tight ETA vs need.
    if (!isOrdered && daysToOrderBy !== null && daysToOrderBy <= 14) {
        return { severity: 'yellow', state: 'at-risk', label: `Order within ${daysToOrderBy}d`, orderByDate, daysToOrderBy, daysToNeeded, eta };
    }
    if (needed && etaDays !== null && daysToNeeded !== null && etaDays > daysToNeeded - 7) {
        return { severity: 'yellow', state: 'at-risk', label: 'Tight vs need-by', orderByDate, daysToOrderBy, daysToNeeded, eta };
    }
    if (daysToOrderBy === null && daysToNeeded === null) {
        return { severity: 'yellow', state: 'unknown', label: 'Missing dates', orderByDate, daysToOrderBy, daysToNeeded, eta };
    }
    return { severity: 'green', state: 'on-track', label: 'On track', orderByDate, daysToOrderBy, daysToNeeded, eta };
}
/* ── Risk register ─────────────────────────────────────────────────── */
// Text likelihood/impact → 1..5 scale. Accepts words or numeric strings.
function toScale(v) {
    if (v === null || v === undefined || v === '')
        return null;
    const n = (0, exports.num)(v);
    if (n !== null && n >= 1 && n <= 5)
        return Math.round(n);
    const s = String(v).trim().toLowerCase();
    if (/very\s*low|rare|remote|1/.test(s))
        return 1;
    // very-high MUST precede the loose /high/ test below, or "very high" scores 4.
    if (/very\s*high|almost|certain|severe|critical|5/.test(s))
        return 5;
    if (/^(high|likely|4)$/.test(s) || /high/.test(s))
        return 4;
    if (/med|moderate|possible|3/.test(s))
        return 3;
    if (/^(low|unlikely|2)$/.test(s) || /low/.test(s))
        return 2;
    return null;
}
const RISK_CLOSED = /closed|resolved|retired|mitigated|accepted|realiz/i;
function computeRisk(r, nowMs) {
    const likelihood = toScale(r.likelihood);
    const impact = toScale(r.impact);
    let score = (0, exports.num)(r.risk_score);
    if ((score === null || score < 1) && likelihood !== null && impact !== null)
        score = likelihood * impact;
    const isOpen = !RISK_CLOSED.test(String(r.status || ''));
    let severity = 'green';
    let band = '—';
    if (score !== null) {
        if (score >= 15) {
            severity = 'red';
            band = 'Critical';
        }
        else if (score >= 8) {
            severity = 'red';
            band = 'High';
        }
        else if (score >= 4) {
            severity = 'yellow';
            band = 'Medium';
        }
        else {
            severity = 'green';
            band = 'Low';
        }
    }
    // A resolved risk never shows red — it's history.
    if (!isOpen && severity === 'red')
        severity = 'yellow';
    const overdue = daysFromNow(r.due_date, nowMs);
    if (isOpen && overdue !== null && overdue < 0 && severity === 'green')
        severity = 'yellow';
    return { severity, score: score === null ? null : Math.round(score), likelihood, impact, band, isOpen };
}
/* ── Shared ────────────────────────────────────────────────────────── */
exports.SEVERITY_ORDER = { red: 0, yellow: 1, green: 2 };
// Escalation days-overdue → severity.
function escalationSeverity(daysOverdue) {
    const d = (0, exports.num)(daysOverdue) ?? 0;
    if (d >= 7)
        return 'red';
    if (d >= 1)
        return 'yellow';
    return 'green';
}
function escalationLevel(daysOverdue) {
    const d = (0, exports.num)(daysOverdue) ?? 0;
    if (d >= 14)
        return { level: 4, owner: 'Executive Leadership', short: 'Exec', color: '#FF3B30' };
    if (d >= 7)
        return { level: 3, owner: 'Director of Construction', short: 'Director', color: '#FF9500' };
    if (d >= 3)
        return { level: 2, owner: 'Project Manager', short: 'PM', color: '#FFCC00' };
    return { level: 1, owner: 'Superintendent', short: 'Super', color: '#34C759' };
}
// Long-lead procurement 6-stage lifecycle: Ordered → Released → Manufactured → Shipped → Delivered → Installed.
exports.LONGLEAD_LIFECYCLE = ['Ordered', 'Released', 'Manufactured', 'Shipped', 'Delivered', 'Installed'];
function lifecycleStage(status) {
    const s = String(status || '').toLowerCase();
    if (/install|on.?site|commission/.test(s))
        return { index: 5, label: 'Installed' };
    if (/deliver|receiv/.test(s))
        return { index: 4, label: 'Delivered' };
    if (/ship|transit|freight/.test(s))
        return { index: 3, label: 'Shipped' };
    if (/manufactur|production|fabricat|in.?build/.test(s))
        return { index: 2, label: 'Manufactured' };
    if (/releas|confirm|po.?issued/.test(s))
        return { index: 1, label: 'Released' };
    return { index: 0, label: 'Ordered' }; // pending / quoted / ordered / approved
}
// Advance a status string to the next lifecycle stage's canonical (lowercase) status.
function nextLifecycleStatus(status) {
    const cur = lifecycleStage(status).index;
    return exports.LONGLEAD_LIFECYCLE[Math.min(cur + 1, exports.LONGLEAD_LIFECYCLE.length - 1)].toLowerCase();
}
// Schedule milestone slip (baseline vs current/forecast, in days late) → severity.
function milestoneSlip(baseline, current, actual, floatDays) {
    const b = parse(baseline);
    const c = parse(actual) ?? parse(current);
    if (b === null || c === null)
        return { slip: null, severity: 'green' };
    const slip = Math.round((c - b) / DAY); // + = later than baseline
    const fl = (0, exports.num)(floatDays) ?? 0;
    const net = slip - Math.max(0, fl); // slip beyond available float
    if (net >= 7)
        return { slip, severity: 'red' };
    if (net >= 1)
        return { slip, severity: 'yellow' };
    return { slip, severity: 'green' };
}
//# sourceMappingURL=franchiseTriage.js.map