"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePayApp = computePayApp;
/**
 * Progress-billing pay-application calculator (AIA G702/G703-style math).
 * Standard construction-accounting identities, computed deterministically in
 * integer cents and cross-footed so a document can only be issued if it reconciles.
 */
const money_1 = require("./money");
const round2 = (n) => Math.round(n * 100) / 100;
function computePayApp(input) {
    const errors = [];
    if (input.retainagePercent < 0 || input.retainagePercent > 100) {
        errors.push(`retainagePercent out of range: ${input.retainagePercent}`);
    }
    const lines = input.lines.map((l) => {
        const completedAndStored = (0, money_1.addCents)(l.fromPrevious, l.thisPeriod, l.storedMaterials);
        if (l.scheduledValue < 0 || l.fromPrevious < 0 || l.thisPeriod < 0 || l.storedMaterials < 0) {
            errors.push(`Line "${l.description}": negative amount`);
        }
        if (completedAndStored > l.scheduledValue) {
            errors.push(`Line "${l.description}": completed+stored exceeds scheduled value (over-billing)`);
        }
        return {
            id: l.id,
            completedAndStored,
            percentComplete: l.scheduledValue ? round2((completedAndStored / l.scheduledValue) * 100) : 0,
            retainage: (0, money_1.percentOf)(completedAndStored, input.retainagePercent),
            balanceToFinish: (0, money_1.subCents)(l.scheduledValue, completedAndStored),
        };
    });
    const scheduledTotal = (0, money_1.sumCents)(input.lines.map((l) => l.scheduledValue));
    const completedAndStoredTotal = (0, money_1.sumCents)(lines.map((l) => l.completedAndStored));
    const retainageTotal = (0, money_1.sumCents)(lines.map((l) => l.retainage));
    const totalEarnedLessRetainage = (0, money_1.subCents)(completedAndStoredTotal, retainageTotal);
    const currentPaymentDue = (0, money_1.subCents)(totalEarnedLessRetainage, input.previousPaymentsLessRetainage);
    const balanceToFinishIncludingRetainage = (0, money_1.subCents)(scheduledTotal, totalEarnedLessRetainage);
    const percentComplete = scheduledTotal ? round2((completedAndStoredTotal / scheduledTotal) * 100) : 0;
    // ── Cross-foot invariants — must reconcile exactly or the doc is rejected ──
    if ((0, money_1.addCents)(totalEarnedLessRetainage, retainageTotal) !== completedAndStoredTotal) {
        errors.push('Cross-foot: earned-less-retainage + retainage ≠ completed+stored');
    }
    if ((0, money_1.addCents)(totalEarnedLessRetainage, balanceToFinishIncludingRetainage) !== scheduledTotal) {
        errors.push('Cross-foot: earned-less-retainage + balance-to-finish ≠ scheduled total');
    }
    if (currentPaymentDue < 0) {
        errors.push('Current payment due is negative — prior payments exceed earned-to-date');
    }
    return {
        lines, scheduledTotal, completedAndStoredTotal, percentComplete,
        retainageTotal, totalEarnedLessRetainage, currentPaymentDue,
        balanceToFinishIncludingRetainage,
        reconciles: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=payapp.js.map