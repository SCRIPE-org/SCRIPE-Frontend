import type { QueryClient } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";

const ENTITY_QUERY_KEY_PREFIXES: Record<string, ReadonlyArray<readonly unknown[]>> = {
  "identity.admin": [qk.admins.all],
  "identity.user": [qk.users.all],
  "party.person": [["parties-directory"], ["parties-stats-summary"], ["party-overview-stats"], ["party-profile"], ["party-picker-lookup"]],
  "party.organization": [["parties-directory"], ["parties-stats-summary"], ["party-overview-stats"], ["party-profile"], ["party-picker-lookup"]],
  "party.contact-point": [["parties-directory"], ["parties-stats-summary"], ["party-overview-stats"], ["party-profile"]],
  "crm.lead": [["crm"], ["leads"]],
  "crm.account": [["crm"], ["accounts"], ["parties-directory"], ["parties-stats-summary"]],
  "crm.contact": [["crm"], ["contacts"], ["parties-directory"], ["parties-stats-summary"]],
  "crm.opportunity": [["crm"], ["opportunities"]],
  "crm.activity": [["crm"], ["activities"]],
};

/**
 * Invalidates Data Exchange hub queries (`data-transfer` jobs, entities, presets)
 * and relevant active module queries upon import/export job completion.
 */
export function invalidateDataExchangeCompletionQueries(
  queryClient: QueryClient | null | undefined,
  entityKey?: string,
  isMultiSheet?: boolean
): void {
  if (!queryClient) return;

  void queryClient.invalidateQueries({ queryKey: qk.dataTransfer.all });

  if (isMultiSheet) {
    const seen = new Set<string>();
    for (const keys of Object.values(ENTITY_QUERY_KEY_PREFIXES)) {
      for (const queryKey of keys) {
        const token = JSON.stringify(queryKey);
        if (!seen.has(token)) {
          seen.add(token);
          void queryClient.invalidateQueries({ queryKey: [...queryKey] });
        }
      }
    }
    return;
  }

  const normalized = entityKey?.trim().toLowerCase();
  if (!normalized) return;

  const moduleKeys = ENTITY_QUERY_KEY_PREFIXES[normalized];
  if (moduleKeys) {
    for (const queryKey of moduleKeys) {
      void queryClient.invalidateQueries({ queryKey: [...queryKey] });
    }
  } else {
    void queryClient.invalidateQueries({ queryKey: [normalized] });
  }
}
