/**
 * useRestrictableCustomFieldKeys -- Tier 1 slice 7
 *
 * Lists the custom-field keys an admin could restrict for one PERMISSION RESOURCE, so
 * the restricted-field picker can offer real names instead of requiring the admin to
 * know a machine key and type it blind. A typo there is not a validation error -- it
 * silently protects nothing.
 *
 * WHY A RESOURCE GOES TO SEVERAL ENTITY TYPES
 * ------------------------------------------
 * Field-level security straddles two vocabularies: restrictions are recorded per
 * permission resource (`party-people`), custom fields are defined per entity type
 * (`party.person`). The mapping is **one-to-many** -- `media.medias` and `media.file`
 * both register `medias` -- so this hook unions across every entity type reporting the
 * resource. Stopping at the first match would silently offer half the fields, and the
 * backend's own `CustomFieldRequiredFieldsQueryService` iterates the same way.
 *
 * WHY THE ADMIN LIST ENDPOINT, NOT THE VALUES ROUTE
 * ------------------------------------------------
 * `GET /custom-fields/values/{entityTypeKey}` looks like the obvious source and is the
 * wrong one: it **self-censors**. Slice 3 made it omit the *caller's own* restricted
 * fields, so an admin who is themselves restricted from `salary` would find `salary`
 * simply missing from the picker, with no explanation, and could never restrict it for
 * anyone else. The admin definitions list applies no such filter.
 *
 * WHY REQUIRED FIELDS ARE FLAGGED RATHER THAN HIDDEN
 * -------------------------------------------------
 * Restricting a required field is refused server-side (slice 4) and takes the WHOLE
 * permissions save down, not just that one tag. So a picker that offered required keys
 * unmarked would make that failure MORE likely than blind typing did. They are returned
 * with `isRequired` so the UI can mark them, not filtered out -- an admin may
 * legitimately want to make the field optional first.
 *
 * The flag is a SNAPSHOT and stays advisory: a field flipped to required after this
 * fetch still fails the save. The server remains the authority.
 */
"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getCustomFieldsContainer } from "../../../../di";

/** One offerable key, with the hint the UI needs to warn before a doomed save. */
export interface RestrictableCustomFieldKey {
  key: string;
  labelEn: string;
  /** True when restricting this key would be refused server-side today. */
  isRequired: boolean;
}

/**
 * Documentation for module export
 */
export interface UseRestrictableCustomFieldKeysArgs {
  /**
   * Whether the caller may read custom-field definitions at all. Both candidate
   * endpoints require `custom-fields.view`, and a role administrator holding
   * `roles.*` without it is an ordinary configuration. `false` keeps every query
   * idle so the dialog degrades to plain free text rather than firing a 403 on every
   * open -- the same reasoning, and the same shape, as `useFieldGroupOptions`.
   */
  enabled?: boolean;
}

/** Server-side cap on this endpoint's page size (`CustomFieldsController`). */
const MAX_PAGE_SIZE = 100;

const EMPTY: RestrictableCustomFieldKey[] = [];

/**
 * Documentation for useRestrictableCustomFieldKeys
 */
export function useRestrictableCustomFieldKeys(
  permissionResource: string | undefined,
  { enabled = true }: UseRestrictableCustomFieldKeysArgs = {}
) {
  const { customFieldRepository } = getCustomFieldsContainer();

  const canQuery = enabled && !!permissionResource && permissionResource.length > 0;

  // Shares the entity-types cache entry every other custom-fields screen uses
  // (identical key and repository method), so opening this dialog costs no extra
  // request on a warm cache.
  const { data: entityTypes = [], isLoading: isEntityTypesLoading } = useQuery({
    queryKey: ["customFields", "entityTypes"],
    queryFn: () => customFieldRepository.getEntityTypes(),
    staleTime: 1000 * 60 * 60,
    enabled: canQuery,
  });

  /**
   * Every entity type reporting this resource. Case-insensitive, matching how the
   * server compares resources everywhere else.
   *
   * `permissionResource` is optional on the wire: the backend omitted it until slice
   * 7, and both the server response and this client cache are held for an hour, so a
   * warm session keeps serving the resource-less shape well after that ships. An
   * entity type without it simply cannot be matched, which yields no suggestions --
   * the degradation the dialog is built to tolerate, rather than a crash or a wrong
   * answer.
   */
  // Deliberately NOT memoized. `enabled` is a destructured default parameter and
  // `canQuery` is a body-scoped const; the React Compiler cannot prove either is
  // stable, so depending on them makes it skip optimizing this hook entirely
  // (react-hooks/preserve-manual-memoization is an ERROR in this repo, not a warning).
  // The cost of recomputing is a filter over an hour-cached list of ~55 entity types,
  // and the array feeds `useQueries`, which keys off the query keys rather than the
  // array's identity — so a fresh reference per render changes nothing.
  const matchingEntityTypeKeys = canQuery
    ? entityTypes
        .filter(
          (item) =>
            item.permissionResource?.toLowerCase() === permissionResource!.toLowerCase()
        )
        .map((item) => item.key)
    : [];

  // One query per matching entity type. Nearly always exactly one; `useQueries`
  // rather than a single call because the count is data-driven and a hook count must
  // not vary between renders.
  const definitionQueries = useQueries({
    queries: matchingEntityTypeKeys.map((entityTypeKey) => ({
      queryKey: ["customFields", "restrictableKeys", entityTypeKey],
      queryFn: () =>
        customFieldRepository.getAll({
          page: 1,
          pageSize: MAX_PAGE_SIZE,
          entityTypeKey,
        }),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const keys = useMemo(() => {
    // No `canQuery` dependency, for the same compiler reason as above — and it would be
    // redundant: a disabled or unmatched resource yields no queries to iterate.
    if (definitionQueries.length === 0) return EMPTY;

    // Deduplicated by key, case-insensitively, because the same key can legitimately
    // exist on two entity types sharing a resource and the server matches
    // case-insensitively anyway -- two tags differing only in case would mean one
    // restriction. `isRequired` is OR-ed across duplicates: if restricting the key
    // would be refused for any of them, the warning has to show.
    const byLowerKey = new Map<string, RestrictableCustomFieldKey>();
    for (const query of definitionQueries) {
      for (const definition of query.data?.items ?? []) {
        const lower = definition.key.toLowerCase();
        const existing = byLowerKey.get(lower);
        byLowerKey.set(lower, {
          key: existing?.key ?? definition.key,
          labelEn: existing?.labelEn ?? definition.labelEn,
          isRequired: (existing?.isRequired ?? false) || definition.isRequired,
        });
      }
    }
    return [...byLowerKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [definitionQueries]);

  /**
   * True when the list is known to be incomplete because an entity type has more
   * definitions than one page can carry. Surfaced rather than silently truncated: a
   * picker that quietly omits a field teaches an admin the field cannot be
   * restricted.
   */
  const isTruncated = useMemo(
    () => definitionQueries.some((query) => (query.data?.totalCount ?? 0) > MAX_PAGE_SIZE),
    [definitionQueries]
  );

  return {
    keys,
    isLoading: isEntityTypesLoading || definitionQueries.some((query) => query.isLoading),
    isError: definitionQueries.some((query) => query.isError),
    isTruncated,
    /**
     * False when nothing could be offered *and* the reason is structural rather than
     * a still-loading query — no resource, no permission, or a backend that does not
     * yet report `permissionResource`. Lets the dialog stay silent instead of showing
     * an empty suggestion affordance.
     */
    isAvailable: canQuery && matchingEntityTypeKeys.length > 0,
  };
}
