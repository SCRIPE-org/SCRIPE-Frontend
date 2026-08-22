/**
 * useEntityLookupAvailableTypes — the entity types this caller may point a reference AT (Wave 4)
 *
 * Backs the DEFINITION-level target-type picker on the custom-field definition form, which is the
 * only consumer `getAvailableTypes` has ever had: the endpoint and the repository method landed with
 * the rest of the lookup layer, and until an admin could actually SET the pin there was nothing to
 * call them from.
 *
 * WHY AN EMPTY LIST IS DATA AND NOT A FAILURE
 * -------------------------------------------
 * The server returns the FILTERED set — registered, backed by a provider composed into this
 * deployment, and permitted for this caller — so `[]` means "you may not reference anything". That is
 * a correct authorization outcome, and `EntityLookupController.GetAvailableTypes` documents only a
 * 200 for it: there is no `[PermissionRequired]` on that route and no 403 in its response contract.
 * Collapsing `[]` into an error would turn a correct answer into a bug report; leaving it as an
 * undifferentiated empty array would leave the caller rendering a dropdown with nothing in it and no
 * explanation. So `isEmpty` is a separate, DERIVED flag that is true only once a request has actually
 * succeeded — an empty list mid-flight is not the same claim, and a picker that could not tell the two
 * apart would flash "there is nothing you can reference" before the first response arrived.
 *
 * WHY THIS ONE USES react-query WHILE ITS TWO SIBLINGS HAND-ROLL THEIR FETCH
 * -------------------------------------------------------------------------
 * `useEntityLookupSearch` and `useResolveEntityReference` hand-roll on purpose, and their own headers
 * say why: a debounce window, out-of-order responses overwriting newer ones, and a live
 * `AbortController` per keystroke. NONE of that exists here. This is one parameterless GET whose
 * answer changes only when the deployment's composed modules or the caller's permissions change, so
 * the properties that actually matter are the opposite ones:
 *
 *   - CACHING ACROSS MODAL OPENS. The definition form is a modal; without a cache every open of the
 *     create or edit dialog re-queries. `useCustomFieldViewModel` already holds the sibling
 *     entity-type catalog for an hour for exactly this reason, and `staleTime` here matches it
 *     deliberately rather than by coincidence.
 *   - ONE FETCH FOR TWO FORMS. The create and edit forms are built from one config memo and both need
 *     this list; react-query's per-key dedup makes that one request instead of two.
 *
 * The closest precedent is not either sibling but `useFieldGroupOptions` — the other server-loaded
 * option list feeding a `FieldConfig.options` array on this same form — which is react-query-backed
 * for the same reasons. Copying the siblings' machinery here would be copying a solution to races
 * this hook cannot have.
 *
 * WHY IT RETURNS RAW TYPES RATHER THAN READY-MADE `FieldOption`s
 * -------------------------------------------------------------
 * Labelling needs the caller's language and the caller's sentinel copy, both of which live in the
 * consuming view's own i18n scope. Building options here would drag a `t` and a language into the
 * lookup layer and hand every future consumer one view's label format.
 */
"use client";

import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCustomFieldsContainer } from "../../../../di";
import type { EntityLookupType } from "../../data/models/EntityLookupModel";

/**
 * TanStack query key for the available-types list.
 *
 * Exported (like `fieldGroupsQueryKey`) so a caller that mutates permissions or switches tenant can
 * invalidate it by key rather than by guessing the string. Namespaced under `customFields` beside
 * `["customFields", "entityTypes"]` — the two lists answer different questions (every entity type a
 * definition may be defined AGAINST vs. every entity type a reference may POINT AT) and must never
 * share a cache entry.
 */
export const ENTITY_LOOKUP_AVAILABLE_TYPES_QUERY_KEY = [
  "customFields",
  "entityLookup",
  "availableTypes",
] as const;

/**
 * How long the list is treated as fresh.
 *
 * One hour, byte-for-byte the same figure `useCustomFieldViewModel` uses for the entity-type
 * catalogue. The answer is deployment- and permission-scoped, so within one admin session it is
 * effectively constant; a shorter window would buy nothing but requests on every modal open.
 */
const AVAILABLE_TYPES_STALE_TIME_MS = 1000 * 60 * 60;

/** Arguments for {@link useEntityLookupAvailableTypes}. */
export interface UseEntityLookupAvailableTypesArgs {
  /**
   * Gate for "do not ask yet". Defaults to true.
   *
   * Present for symmetry with `useEntityLookupSearch` and `useFieldGroupOptions`, not because a
   * permission makes the call refusable: `GET /entity-lookup/types` carries only the controller's
   * `[Authorize]`/`[AdminOnly]`, no `[PermissionRequired]`, and declares no 403 — so unlike
   * `GET /field-groups` there is no role for which fetching it is an error. It exists so a caller that
   * knows the picker can never be shown (a screen with no reference-typed definitions, say) can skip
   * the request outright.
   */
  enabled?: boolean;
}

/** What {@link useEntityLookupAvailableTypes} returns. */
export interface UseEntityLookupAvailableTypesResult {
  /** The types this caller may reference, in the server's order. Empty while loading and on failure. */
  types: EntityLookupType[];
  /** True while the list is in flight. */
  isLoading: boolean;
  /** True when the request itself failed — network, 500, an unavailable deployment. NOT "list was empty". */
  isError: boolean;
  /**
   * True only when the request SUCCEEDED and the server's answer was an empty list, i.e. "you may not
   * reference anything".
   *
   * Branch on this, never on `types.length === 0`: that expression is also true while loading and
   * after a failure, and the honest rendering of those three states is three different things.
   */
  isEmpty: boolean;
  /** Re-runs the query. For the retry affordance on `isError`. */
  refetch: () => void;
}

/**
 * Reads the entity types the current caller may point a reference at.
 *
 * @param args Optional `{ enabled }` gate; see {@link UseEntityLookupAvailableTypesArgs}.
 */
export function useEntityLookupAvailableTypes({
  enabled = true,
}: UseEntityLookupAvailableTypesArgs = {}): UseEntityLookupAvailableTypesResult {
  const { entityLookupRepository } = getCustomFieldsContainer();

  const {
    data: types = [],
    isPending,
    isError,
    isSuccess,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: ENTITY_LOOKUP_AVAILABLE_TYPES_QUERY_KEY,
    queryFn: () => entityLookupRepository.getAvailableTypes(),
    enabled,
    staleTime: AVAILABLE_TYPES_STALE_TIME_MS,
  });

  // `isPending && enabled`, not `isPending` alone: a disabled query is permanently pending in
  // react-query v5, and reporting that as "loading" would leave a caller showing a spinner forever
  // for a request that was never going to be made.
  const isLoading = enabled && isPending;

  // Derived, and gated on `isSuccess` rather than on `!isLoading`: the distinction this hook exists to
  // preserve is between "the server told us there is nothing" and "we do not know yet / we failed to
  // ask". Only the first of those may render as an explanatory empty state.
  const isEmpty = isSuccess && types.length === 0;

  // Wrapped so the returned identity is stable and callers get a `() => void` rather than
  // react-query's promise-returning refetch, which an onClick would otherwise leak as a floating
  // promise.
  const refetch = useCallback(() => {
    void refetchQuery();
  }, [refetchQuery]);

  return { types, isLoading, isError, isEmpty, refetch };
}
