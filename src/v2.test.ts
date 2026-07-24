/* Drift-fix proof for the v0.2.0 engines. Run: npx tsx src/v2.test.ts */
import { toCents } from './money';
import { toScale, computeRisk } from './franchiseTriage';
import { projectContractValue } from './projectContract';
import { parseYMD, daysBetween, EXPIRING_WINDOW_DAYS } from './dates';
import { payrollGross } from './payroll';
import { resolveReviewDecision, normalizeSubmittalStatus } from './submittal';
import { resolveRetainagePct } from './retainage';
import { fmtMoneyShort } from './formatMoney';
import { ROLLOUT_STAGES, isStage } from './franchise';
import { computeHealth } from './portfolioHealth';
import { normalizePriority, priorityTone } from './priority';

let pass = 0, fail = 0;
const check = (name: string, cond: boolean, detail = '') => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}  ${detail}`); }
};

console.log('RISK — toScale drift (very-high must beat loose /high/)');
check('toScale("very high") === 5 (was 4 — the bug)', toScale('very high') === 5, `got ${toScale('very high')}`);
check('toScale("high") === 4', toScale('high') === 4);
const risk = computeRisk({ likelihood: 'Very High', impact: 'Medium' });
check('Very High × Medium → score 15, band Critical (was 12/High)', risk.score === 15 && risk.band === 'Critical', `got ${risk.score}/${risk.band}`);

console.log('\nPROJECT VALUE — revised-first precedence');
check('revised $1.2M wins over original $1.0M', projectContractValue({ contract_value: 1000000, revised_contract_value: 1200000 }) === 1200000);
check('revised 0 falls back to original $1.0M', projectContractValue({ contract_value: 1000000, revised_contract_value: 0 }) === 1000000);

console.log('\nDATES — local-midnight parse (no UTC off-by-one)');
const d = parseYMD('2026-07-23')!;
check('parseYMD("2026-07-23") is LOCAL 2026-07-23', d.getFullYear() === 2026 && d.getMonth() === 6 && d.getDate() === 23, `${d}`);
check('daysBetween 07-23 → 07-24 === 1', daysBetween('2026-07-23', '2026-07-24') === 1);
check('EXPIRING_WINDOW_DAYS === 30 (COI inclusive)', EXPIRING_WINDOW_DAYS === 30);

console.log('\nPAYROLL — 3 tiers incl double-time');
check('40 ST + 5 OT + 2 DT @ $65 === $3,347.50', payrollGross(40, 5, 2, toCents(65)) === toCents(3347.5), `got ${payrollGross(40, 5, 2, toCents(65))}`);

console.log('\nSUBMITTAL — resubmit disposition drift');
check('resolveReviewDecision("resubmit").status === "revise_resubmit"', resolveReviewDecision('resubmit')?.status === 'revise_resubmit');
check('normalize "revise_and_resubmit" → "revise_resubmit"', normalizeSubmittalStatus('revise_and_resubmit') === 'revise_resubmit');
check('review "approve" stamps "No Exceptions Taken"', resolveReviewDecision('approve')?.label === 'No Exceptions Taken');

console.log('\nRETAINAGE — nullish preserves explicit 0%');
check('resolveRetainagePct("0") === 0 (not 10)', resolveRetainagePct('0') === 0);
check('resolveRetainagePct(null) === 10 (default)', resolveRetainagePct(null) === 10);

console.log('\nFORMAT — canonical money abbreviations');
check('fmtMoneyShort(1_200_000) === "$1.2M"', fmtMoneyShort(1200000) === '$1.2M', fmtMoneyShort(1200000));
check('fmtMoneyShort(450_000) === "$450k" (lowercase k)', fmtMoneyShort(450000) === '$450k', fmtMoneyShort(450000));

console.log('\nROLLOUT — 8-stage template');
check('ROLLOUT_STAGES has 8 stages', ROLLOUT_STAGES.length === 8);
check('isStage("construction") === true', isStage('construction') === true);
check('isStage("bogus") === false', isStage('bogus') === false);

console.log('\nPORTFOLIO HEALTH — budget now revised-first (consistency fix)');
const h = computeHealth({ contract_value: 1000000, revised_contract_value: 1200000, projected_cost: 1250000 });
check('health.budget uses revised $1.2M (not original $1.0M)', h.budget === 1200000, `got ${h.budget}`);
check('variance computed off revised → ~4% over → yellow', h.variancePct !== null && h.variancePct > 1 && h.variancePct < 6);

console.log('\nPRIORITY — casing + synonyms fold to canonical');
check('normalizePriority("High") === "high"', normalizePriority('High') === 'high');
check('normalizePriority("urgent") === "critical"', normalizePriority('urgent') === 'critical');
check('priorityTone("critical") === "red"', priorityTone('critical') === 'red');

console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ FAILURES'} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
