export type HealthStatus = 'green' | 'yellow' | 'red';
export interface HealthFlag {
    label: string;
    severity: 'yellow' | 'red';
}
export interface ProjectHealth {
    status: HealthStatus;
    score: number;
    flags: HealthFlag[];
    percentComplete: number | null;
    budget: number | null;
    forecast: number | null;
    variancePct: number | null;
    finishDate: string | null;
    daysToFinish: number | null;
    daysSinceUpdate: number | null;
    openRfis: number | null;
    openPunch: number | null;
    openCos: number | null;
}
type AnyProject = Record<string, any>;
export declare function computeHealth(p: AnyProject, nowMs?: number): ProjectHealth;
export declare const TRIAGE_ORDER: Record<HealthStatus, number>;
export {};
//# sourceMappingURL=portfolioHealth.d.ts.map