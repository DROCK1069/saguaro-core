"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extend = exports.scaleCents = exports.percentOf = exports.subCents = exports.addCents = exports.sumCents = exports.toDollars = void 0;
exports.roundHalfUp = roundHalfUp;
exports.toCents = toCents;
exports.formatUSD = formatUSD;
function assertInt(c) {
    if (!Number.isInteger(c))
        throw new Error(`Money must be integer cents, got ${c}`);
    return c;
}
/** Round to nearest integer, half away from zero, with float-dust guard. */
function roundHalfUp(n) {
    if (!Number.isFinite(n))
        throw new Error('roundHalfUp: non-finite input');
    return Math.sign(n) * Math.round(Math.abs(n) + 1e-9);
}
/** Parse a dollar amount (number or "$1,234.56") into integer cents. */
function toCents(dollars) {
    const n = typeof dollars === 'string' ? Number(dollars.replace(/[$,\s]/g, '')) : dollars;
    if (!Number.isFinite(n))
        throw new Error(`toCents: invalid amount "${dollars}"`);
    return roundHalfUp(n * 100);
}
const toDollars = (c) => assertInt(c) / 100;
exports.toDollars = toDollars;
function formatUSD(c) {
    return (assertInt(c) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
const sumCents = (xs) => xs.reduce((a, b) => a + assertInt(b), 0);
exports.sumCents = sumCents;
const addCents = (...xs) => (0, exports.sumCents)(xs);
exports.addCents = addCents;
const subCents = (a, b) => assertInt(a) - assertInt(b);
exports.subCents = subCents;
/** percent (e.g. 10 → 10%) of an amount, rounded to the cent. */
const percentOf = (c, percent) => roundHalfUp((assertInt(c) * percent) / 100);
exports.percentOf = percentOf;
/** multiply an amount by a factor/quantity, rounded to the cent. */
const scaleCents = (c, factor) => roundHalfUp(assertInt(c) * factor);
exports.scaleCents = scaleCents;
/** line item: quantity × unit price (cents) → extended cost (cents). */
const extend = (quantity, unitPriceCents) => roundHalfUp(quantity * assertInt(unitPriceCents));
exports.extend = extend;
//# sourceMappingURL=money.js.map