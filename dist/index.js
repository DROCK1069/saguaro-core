"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Saguaro calculation engine — the single source of truth for all money and
 * quantity math, shared by the web dashboard and the native field app.
 * AI extracts/judges; this engine computes. Deterministic, integer-cents, tested.
 */
__exportStar(require("./money"), exports);
__exportStar(require("./formatMoney"), exports);
__exportStar(require("./units"), exports);
__exportStar(require("./payapp"), exports);
__exportStar(require("./changeOrder"), exports);
__exportStar(require("./takeoff"), exports);
__exportStar(require("./payroll"), exports);
__exportStar(require("./sanity"), exports);
__exportStar(require("./franchise"), exports);
__exportStar(require("./franchiseTriage"), exports);
__exportStar(require("./retainage"), exports);
__exportStar(require("./dates"), exports);
__exportStar(require("./submittal"), exports);
__exportStar(require("./portfolioHealth"), exports);
__exportStar(require("./priority"), exports);
__exportStar(require("./projectContract"), exports);
//# sourceMappingURL=index.js.map