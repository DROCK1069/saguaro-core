/**
 * Takeoff normalization — the deterministic guardrail around AI-extracted line
 * items. Source of truth for each line is qty × unit cost; the AI's own total is
 * accepted only when within 10% of that, else recomputed. Invalid lines dropped.
 * Project total derived from validated lines — never trusted from the model.
 */
import { Cents } from './money';
export interface RawTakeoffItem {
    description: string;
    quantity: number;
    unit: string;
    unitCostCents: Cents;
    totalCents?: Cents;
    laborHours?: number;
}
export interface TakeoffItem {
    description: string;
    quantity: number;
    unit: string;
    unitCostCents: Cents;
    totalCents: Cents;
    laborHours: number;
}
export interface TakeoffTotals {
    items: TakeoffItem[];
    materialCents: Cents;
    laborCents: Cents;
    contingencyPercent: number;
    projectTotalCents: Cents;
}
export declare function normalizeTakeoff(raw: RawTakeoffItem[], opts?: {
    laborRateCents?: Cents;
    contingencyPercent?: number;
}): TakeoffTotals;
//# sourceMappingURL=takeoff.d.ts.map