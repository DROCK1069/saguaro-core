/**
 * Change-order rollup → revised contract. Only APPROVED change orders move the
 * contract; pending are tracked separately; rejected are excluded entirely.
 */
import { Cents } from './money';
export type ChangeOrderStatus = 'pending' | 'approved' | 'rejected';
export interface ChangeOrder {
    id: string;
    description: string;
    amount: Cents;
    status: ChangeOrderStatus;
}
export interface ContractSummary {
    originalContract: Cents;
    approvedChangeOrders: Cents;
    pendingChangeOrders: Cents;
    revisedContract: Cents;
}
export declare function summarizeContract(originalContract: Cents, changeOrders: ChangeOrder[]): ContractSummary;
//# sourceMappingURL=changeOrder.d.ts.map