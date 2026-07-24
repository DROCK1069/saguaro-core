import type { TakeoffItem } from './takeoff';
import type { PayAppResult } from './payapp';
export interface Flag {
    severity: 'warn' | 'error';
    code: string;
    message: string;
    ref?: string;
}
export declare function checkTakeoffSanity(items: TakeoffItem[]): Flag[];
export declare function checkPayAppSanity(result: PayAppResult, retainagePercent: number): Flag[];
//# sourceMappingURL=sanity.d.ts.map