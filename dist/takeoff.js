"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTakeoff = normalizeTakeoff;
/**
 * Takeoff normalization — the deterministic guardrail around AI-extracted line
 * items. Source of truth for each line is qty × unit cost; the AI's own total is
 * accepted only when within 10% of that, else recomputed. Invalid lines dropped.
 * Project total derived from validated lines — never trusted from the model.
 */
const money_1 = require("./money");
const DEFAULT_LABOR_RATE_CENTS = 6500; // $65/hr blended
function normalizeTakeoff(raw, opts = {}) {
    const laborRate = opts.laborRateCents ?? DEFAULT_LABOR_RATE_CENTS;
    const contingencyPercent = Math.max(0, Math.min(50, opts.contingencyPercent ?? 10));
    const items = raw
        .map((r) => {
        const quantity = Math.max(0, Number(r.quantity) || 0);
        const unitCostCents = Math.max(0, Number(r.unitCostCents) || 0);
        const computed = (0, money_1.extend)(quantity, unitCostCents);
        const provided = Number(r.totalCents) || 0;
        const totalCents = provided > 0 && computed > 0 && Math.abs(provided - computed) / computed < 0.10 ? provided : computed;
        return {
            description: String(r.description || '').trim(),
            quantity,
            unit: String(r.unit || 'LS').toUpperCase(),
            unitCostCents,
            totalCents,
            laborHours: Math.max(0, Number(r.laborHours) || 0),
        };
    })
        .filter((it) => it.description.length > 0 && it.quantity > 0 && it.unitCostCents > 0);
    const materialCents = (0, money_1.sumCents)(items.map((i) => i.totalCents));
    const laborCents = (0, money_1.sumCents)(items.map((i) => (0, money_1.scaleCents)(laborRate, i.laborHours)));
    const projectTotalCents = (0, money_1.scaleCents)(materialCents + laborCents, 1 + contingencyPercent / 100);
    return { items, materialCents, laborCents, contingencyPercent, projectTotalCents };
}
//# sourceMappingURL=takeoff.js.map