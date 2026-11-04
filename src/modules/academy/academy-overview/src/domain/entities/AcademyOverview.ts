/**
 * Academy Overview domain model.
 * Reflects backend authoritative state without fabricated mock data.
 */
export interface AcademyOverviewState {
  stage: "loading" | "empty" | "ready" | "failed" | "unauthorized";
  isEnabled: boolean;
  tenantId: string | null;
  maxAthletes: number;
  maxPrograms: number;
  maxTrainingGroups: number;
  activeProgramsCount: number;
  activeOfferingsCount: number;
  activeEnrollmentsCount: number;
  pendingTrialsCount: number;
  configuredFeatures: string[];
  statusMessage: string;
  error?: string | null;
}
