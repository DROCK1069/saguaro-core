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
export interface RolloutStage {
    id: string;
    label: string;
    color: string;
    order: number;
    weeks: string;
}
export declare const ROLLOUT_STAGES: RolloutStage[];
export declare const STAGE_IDS: string[];
export declare const STAGE_META: Record<string, RolloutStage>;
export declare const isStage: (v: unknown) => boolean;
//# sourceMappingURL=franchise.d.ts.map