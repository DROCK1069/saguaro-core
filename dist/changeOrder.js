"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeContract = summarizeContract;
/**
 * Change-order rollup → revised contract. Only APPROVED change orders move the
 * contract; pending are tracked separately; rejected are excluded entirely.
 */
const money_1 = require("./money");
function summarizeContract(originalContract, changeOrders) {
    const approvedChangeOrders = (0, money_1.sumCents)(changeOrders.filter((c) => c.status === 'approved').map((c) => c.amount));
    const pendingChangeOrders = (0, money_1.sumCents)(changeOrders.filter((c) => c.status === 'pending').map((c) => c.amount));
    return {
        originalContract,
        approvedChangeOrders,
        pendingChangeOrders,
        revisedContract: (0, money_1.addCents)(originalContract, approvedChangeOrders),
    };
}
//# sourceMappingURL=changeOrder.js.map