"use strict";
/**
 * Franchise Rollout workflow — the 8-stage location-launch pipeline, defined
 * once. This is the pure enum + ordering + stage-id guard shared by the web
 * dashboard (command-center rollout board, verification gates, owner portal,
 * pipeline API) and the native field app (Rollout HUB, Command Center board,
 * remote verification). Values are verbatim from the SCS Franchise Rollout
 * Workflow spec table (Site Selection → Training & Opening), left → right.
 *
 * No app/framework imports — deterministic, data-only. AI never authors these;
 * they are the fixed rails every location runs on (Core Value: Consistency).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStage = exports.STAGE_META = exports.STAGE_IDS = exports.ROLLOUT_STAGES = void 0;
// The 8-stage Franchise Rollout Workflow, verbatim from the SCS spec table
// (Site Selection → Training & Opening), left → right, each with its target
// duration. Order is 0-indexed and load-bearing: the board advances/retreats a
// location by ±1 on `order`, so entries MUST stay in ascending order.
exports.ROLLOUT_STAGES = [
    { id: 'site_selection', label: 'Site Selection', color: '#8E8E93', order: 0, weeks: '2–4 wk' },
    { id: 'design', label: 'Design', color: '#007AFF', order: 1, weeks: '6–8 wk' },
    { id: 'permitting', label: 'Permitting', color: '#AF52DE', order: 2, weeks: '4–12+ wk' },
    { id: 'procurement', label: 'Procurement', color: '#5AC8FA', order: 3, weeks: 'Parallel' },
    { id: 'construction', label: 'Construction', color: '#FF9500', order: 4, weeks: '10–16 wk' },
    { id: 'equipment_tech', label: 'Equipment & Tech', color: '#FF375F', order: 5, weeks: '2–3 wk' },
    { id: 'inspections_co', label: 'Inspections & CO', color: '#FFCC00', order: 6, weeks: '1–2 wk' },
    { id: 'training_opening', label: 'Training & Opening', color: '#34C759', order: 7, weeks: '1 wk' },
];
// Ordered list of stage ids — the canonical order of the pipeline.
exports.STAGE_IDS = exports.ROLLOUT_STAGES.map((s) => s.id);
// id → full stage record. Keyed by arbitrary string so callers can look up a
// persisted `projects.rollout_stage` value directly; missing keys are undefined.
exports.STAGE_META = Object.fromEntries(exports.ROLLOUT_STAGES.map((s) => [s.id, s]));
// Guard for a persisted `rollout_stage` value (e.g. validating a write payload).
const isStage = (v) => typeof v === 'string' && exports.STAGE_IDS.includes(v);
exports.isStage = isStage;
//# sourceMappingURL=franchise.js.map