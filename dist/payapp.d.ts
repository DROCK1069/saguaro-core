/**
 * Progress-billing pay-application calculator (AIA G702/G703-style math).
 * Standard construction-accounting identities, computed deterministically in
 * integer cents and cross-footed so a document can only be issued if it reconciles.
 */
import { Cents } from './money';
export interface SovLine {
    id: string;
    description: string;
    scheduledValue: Cents;
    fromPrevious: Cents;
    thisPeriod: Cents;
    storedMaterials: Cents;
}
export interface PayAppInput {
    lines: SovLine[];
    retainagePercent: number;
    previousPaymentsLessRetainage: Cents;
}
export interface PayAppLineResult {
    id: string;
    completedAndStored: Cents;
    percentComplete: number;
    retainage: Cents;
    balanceToFinish: Cents;
}
export interface PayAppResult {
    lines: PayAppLineResult[];
    scheduledTotal: Cents;
    completedAndStoredTotal: Cents;
    percentComplete: number;
    retainageTotal: Cents;
    totalEarnedLessRetainage: Cents;
    currentPaymentDue: Cents;
    balanceToFinishIncludingRetainage: Cents;
    reconciles: boolean;
    errors: string[];
}
export declare function computePayApp(input: PayAppInput): PayAppResult;
//# sourceMappingURL=payapp.d.ts.map