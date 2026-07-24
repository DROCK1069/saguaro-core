/**
 * Unit-aware quantities — prevents adding SF to LF or mis-converting CY↔CF.
 * Conversions only succeed within the same physical dimension.
 */
export type Unit = 'SF' | 'SY' | 'LF' | 'CF' | 'CY' | 'GAL' | 'EA' | 'LB' | 'TON' | 'HR' | 'LS';
export declare function isConvertible(from: Unit, to: Unit): boolean;
export declare function convert(value: number, from: Unit, to: Unit): number;
//# sourceMappingURL=units.d.ts.map