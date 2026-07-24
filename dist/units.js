"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConvertible = isConvertible;
exports.convert = convert;
const UNITS = {
    SF: { dim: 'area', toBase: 1 },
    SY: { dim: 'area', toBase: 9 }, // 1 SY = 9 SF
    LF: { dim: 'length', toBase: 1 },
    CF: { dim: 'volume', toBase: 1 },
    CY: { dim: 'volume', toBase: 27 }, // 1 CY = 27 CF
    GAL: { dim: 'volume', toBase: 0.133680556 }, // 1 gal = 0.1337 CF
    LB: { dim: 'mass', toBase: 1 },
    TON: { dim: 'mass', toBase: 2000 }, // 1 ton = 2000 LB
    EA: { dim: 'count', toBase: 1 },
    HR: { dim: 'time', toBase: 1 },
    LS: { dim: 'lumpsum', toBase: 1 },
};
function isConvertible(from, to) {
    return !!UNITS[from] && !!UNITS[to] && UNITS[from].dim === UNITS[to].dim;
}
function convert(value, from, to) {
    const f = UNITS[from], t = UNITS[to];
    if (!f || !t)
        throw new Error(`Unknown unit: ${from}/${to}`);
    if (f.dim !== t.dim)
        throw new Error(`Incompatible units: ${from} (${f.dim}) → ${to} (${t.dim})`);
    return (value * f.toBase) / t.toBase;
}
//# sourceMappingURL=units.js.map