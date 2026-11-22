/**
 * sovereignAccountKeys
 *
 * Centralized TanStack Query cache keys for all Sovereign Account Console slices.
 */
import type { SovereignActivityQuery } from "../../domain/entities/SovereignAccountEntities";

/**
 * Hierarchical query key factory for Sovereign Account Console queries.
 */
export const sovereignAccountKeys = {
  all: ["sovereign-account"] as const,
  context: () => [...sovereignAccountKeys.all, "context"] as const,
  dossier: () => [...sovereignAccountKeys.all, "dossier"] as const,
  security: () => [...sovereignAccountKeys.all, "security"] as const,
  sessions: () => [...sovereignAccountKeys.all, "sessions"] as const,
  governance: () => [...sovereignAccountKeys.all, "governance"] as const,
  activity: (q?: SovereignActivityQuery) =>
    q
      ? ([...sovereignAccountKeys.all, "activity", q] as const)
      : ([...sovereignAccountKeys.all, "activity"] as const),
  colleagues: (q: string) => [...sovereignAccountKeys.all, "colleagues", q] as const,
  preferences: () => [...sovereignAccountKeys.all, "preferences"] as const,
  notifications: () => [...sovereignAccountKeys.all, "notifications"] as const,
  plan: () => [...sovereignAccountKeys.all, "plan"] as const,
  integrations: () => [...sovereignAccountKeys.all, "integrations"] as const,
};
