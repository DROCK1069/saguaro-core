/**
 * Money — exact currency math in INTEGER CENTS. Never use floats for money.
 * One rounding rule everywhere: round half away from zero, to the cent.
 * This is the single source of truth for all currency arithmetic, web + native.
 */
export type Cents = number;
/** Round to nearest integer, half away from zero, with float-dust guard. */
export declare function roundHalfUp(n: number): number;
/** Parse a dollar amount (number or "$1,234.56") into integer cents. */
export declare function toCents(dollars: number | string): Cents;
export declare const toDollars: (c: Cents) => number;
export declare function formatUSD(c: Cents): string;
export declare const sumCents: (xs: Cents[]) => Cents;
export declare const addCents: (...xs: Cents[]) => Cents;
export declare const subCents: (a: Cents, b: Cents) => Cents;
/** percent (e.g. 10 → 10%) of an amount, rounded to the cent. */
export declare const percentOf: (c: Cents, percent: number) => Cents;
/** multiply an amount by a factor/quantity, rounded to the cent. */
export declare const scaleCents: (c: Cents, factor: number) => Cents;
/** line item: quantity × unit price (cents) → extended cost (cents). */
export declare const extend: (quantity: number, unitPriceCents: Cents) => Cents;
//# sourceMappingURL=money.d.ts.map