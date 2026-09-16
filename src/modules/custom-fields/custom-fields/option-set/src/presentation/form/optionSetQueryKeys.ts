/**
 * Query key factories for option sets.
 */

export const OPTION_SET_QUERY_ROOT = ["customFields", "optionSets"] as const;

export function optionSetsQueryKey() {
  return [...OPTION_SET_QUERY_ROOT, "list"] as const;
}

export function optionSetDetailQueryKey(optionSetId: string) {
  return [...OPTION_SET_QUERY_ROOT, "detail", optionSetId] as const;
}

export function optionSetVersionQueryKey(versionId: string) {
  return [...OPTION_SET_QUERY_ROOT, "version", versionId] as const;
}
