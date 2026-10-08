/**
 * useEntityLookupSearch — the debounced, paging search behind the reference picker (Wave 4)
 *
 * THE THREE RACES THIS HOOK EXISTS TO LOSE
 * ---------------------------------------
 * A picker that types straight through to an HTTP call has three separate bugs, and all three are
 * invisible on a fast local network:
 *
 *  1. A REQUEST PER KEYSTROKE. Eight characters is eight cross-module queries against another
 *     module's repository, seven of them thrown away. Fixed by the 300ms debounce.
 *  2. AN OUT-OF-ORDER RESPONSE OVERWRITING A NEWER ONE. Search "a", then "ab"; if "a" is slower, the
 *     list ends up showing results for "a" while the box says "ab", and looks like a server bug.
 *     Fixed by `requestSeqRef`: every request takes a ticket, and only the holder of the current
 *     ticket may write. Note that the `AbortController` alone does NOT fix this — an aborted request
 *     whose response is already in flight still settles.
 *  3. A WRITE AFTER UNMOUNT. Close the picker mid-flight and the response lands on a dead component.
 *     Fixed by request-local cancellation in the effect cleanup.
 *
 * EVERY FLAG IS DERIVED; NOTHING IS SET SYNCHRONOUSLY IN AN EFFECT
 * ---------------------------------------------------------------
 * `items`, `hasNextPage`, `error`, `isLoading` and `isLoadingMore` are all computed at render time
 * from two keys — a SCOPE key (target type + committed query + reload counter) and a REQUEST key
 * (scope plus page number) — compared against what has actually come back. Only the async callbacks
 * write state.
 *
 * That is not merely lint compliance. "Changing the query clears the accumulated items" stops being
 * a rule someone has to remember to enforce in three places and becomes arithmetic: results carry
 * the scope they belong to, so results from the previous query cannot be in scope for this one. The
 * earlier version cleared them explicitly, which worked and would have kept working right up until
 * a fourth reset path forgot to.
 *
 * The same reasoning covers the target type changing: `request` is re-derived from a fresh initial
 * state whenever `entityTypeKey` moves, so the search box, the committed query and the page number
 * all reset with no effect, no extra render, and no window in which the old query is live against
 * the new type.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { customFieldsContainer } from "../../../../di";
import {
  ENTITY_LOOKUP_DEFAULT_PAGE_SIZE,
  ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS,
  type EntityLookupItem,
} from "../../data/models/EntityLookupModel";
import { EntityLookupError } from "../../domain/entities/EntityLookupError";
import type {
  UseEntityLookupSearchArgs,
  UseEntityLookupSearchResult,
  SearchRequest,
} from "./useEntityLookupSearch.types";

/**
 * Documentation for module export
 */
export type {
  UseEntityLookupSearchArgs,
  UseEntityLookupSearchResult,
};

function initialRequest(entityTypeKey: string | null | undefined): SearchRequest {
  return { entityTypeKey, query: "", requestQuery: "", page: 1, nonce: 0 };
}

/** One shared empty array, so `items` has a stable identity while there is nothing to show. */
const NO_ITEMS: readonly EntityLookupItem[] = Object.freeze([]);

/**
 * Separator for the composite scope and request keys.
 *
 * NUL rather than a printable character because these keys are compared for equality and a collision
 * would silently make two different requests look like one: with `-`, the query "a" on page 11 and
 * the query "a-1" on page 1 produce the same key. Nothing that goes into a key — an entity type
 * registry key, a user's search text, a number — can contain a NUL, so the encoding is injective.
 */
const KEY_SEPARATOR = "\u0000";

/** Rows fetched so far, tagged with the scope they belong to. */
interface AccumulatedPages {
  scopeKey: string;
  items: EntityLookupItem[];
  hasNextPage: boolean;
}

/** A failure, tagged with the exact page request that produced it. */
interface RequestFailure {
  requestKey: string;
  error: EntityLookupError;
}

/**
 * Debounced, accumulating search over one entity type's selectable records.
 *
 * Contract worth stating because a caller will otherwise assume the opposite: `items` ACCUMULATES
 * across `loadMore`, and is EMPTY the moment the committed query changes. Accumulating without
 * clearing would leave the previous query's rows above the new query's, which reads as a broken
 * filter; clearing without accumulating would make `loadMore` replace the list instead of extending
 * it.
 */
export function useEntityLookupSearch({
  entityTypeKey,
  enabled = true,
  pageSize = ENTITY_LOOKUP_DEFAULT_PAGE_SIZE,
}: UseEntityLookupSearchArgs): UseEntityLookupSearchResult {
  const canFetch = enabled && !!entityTypeKey;

  const [stored, setStored] = useState<SearchRequest>(() => initialRequest(entityTypeKey));

  // The reset-on-target-change, expressed as a derivation. A stored request that belongs to a
  // different target type is not stale state to be cleaned up later -- it is simply not this
  // target's request, so it is never read.
  const request = useMemo(
    () => (stored.entityTypeKey === entityTypeKey ? stored : initialRequest(entityTypeKey)),
    [stored, entityTypeKey]
  );

  // Everything a page turn must NOT reset. Page number is deliberately absent.
  const scopeKey = `${entityTypeKey ?? ""}${KEY_SEPARATOR}${request.requestQuery}${KEY_SEPARATOR}${request.nonce}`;
  // One specific page request.
  const requestKey = `${scopeKey}${KEY_SEPARATOR}${request.page}`;

  const [accumulated, setAccumulated] = useState<AccumulatedPages | null>(null);
  const [failure, setFailure] = useState<RequestFailure | null>(null);
  const [settledRequestKey, setSettledRequestKey] = useState<string | null>(null);

  const inScope = accumulated !== null && accumulated.scopeKey === scopeKey;
  const items = inScope ? accumulated.items : (NO_ITEMS as EntityLookupItem[]);
  const hasNextPage = inScope ? accumulated.hasNextPage : false;
  const error = failure !== null && failure.requestKey === requestKey ? failure.error : null;

  // Busy until THIS request has settled. Derived rather than seeded, which incidentally fixes the
  // first-paint problem the previous version had to special-case: there is no frame in which the
  // panel has no rows and no in-flight flag, so it never flashes a confident "no results" before the
  // request has even started.
  const isSettled = settledRequestKey === requestKey;
  const isLoading = canFetch && !isSettled && request.page === 1;
  const isLoadingMore = canFetch && !isSettled && request.page > 1;

  // Ticket counter. Only the holder of the current ticket may write.
  const requestSeqRef = useRef(0);

  // The debounce. Runs only while the typed text differs from what has been committed, so once the
  // commit lands the effect re-runs and returns immediately -- no trailing timer, no second request.
  useEffect(() => {
    if (request.query === request.requestQuery) return;
    const timer = setTimeout(() => {
      // Committing also resets to page 1. Both live in one value so they cannot be applied apart.
      setStored({ ...request, requestQuery: request.query, page: 1 });
    }, ENTITY_LOOKUP_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [request]);

  const requestPage = request.page;
  const requestQuery = request.requestQuery;

  useEffect(() => {
    // Nothing to search. No state to clear either: every flag above already derives to its empty
    // value from `canFetch`, so this branch does no work rather than undoing work.
    if (!canFetch || !entityTypeKey) return;

    const seq = ++requestSeqRef.current;
    const controller = new AbortController();
    const isFirstPage = requestPage === 1;
    let cancelled = false;

    /** True once this effect has been cleaned up or a newer request owns the ticket. */
    const isStale = () => cancelled || seq !== requestSeqRef.current;

    void customFieldsContainer.entityLookupRepository
      .search(
        entityTypeKey,
        {
          search: requestQuery.trim() === "" ? null : requestQuery,
          page: requestPage,
          pageSize,
        },
        controller.signal
      )
      .then((result) => {
        if (isStale()) return;
        setAccumulated((prev) =>
          // Append only when this is a later page OF THE SAME SCOPE. The scope check is what stops a
          // page-2 response that arrived after a query change from being appended to the new query's
          // page 1.
          !isFirstPage && prev !== null && prev.scopeKey === scopeKey
            ? {
                scopeKey,
                items: [...prev.items, ...result.items],
                hasNextPage: result.hasNextPage,
              }
            : { scopeKey, items: result.items, hasNextPage: result.hasNextPage }
        );
      })
      .catch((caught: unknown) => {
        if (isStale()) return;
        const classified = EntityLookupError.from(caught);
        // A cancellation is our own doing, not an answer. Already unreachable here -- the staleness
        // check fires first on every path that aborts -- but surfacing one would put "lookup failed"
        // under the box on a keystroke that simply outran its request, so the guard is explicit
        // rather than inferred from the ordering of two other guards.
        if (classified.kind === "cancelled") return;
        setFailure({ requestKey, error: classified });
      })
      .finally(() => {
        if (isStale()) return;
        setSettledRequestKey(requestKey);
      });

    // Cleanup runs BEFORE the next effect body, so the abort lands while this request still holds the
    // current ticket and its replacement takes a new one -- which is what makes a late response
    // identifiable as stale rather than merely late.
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    canFetch,
    entityTypeKey,
    pageSize,
    requestPage,
    requestQuery,
    requestKey,
    scopeKey,
  ]);

  const setQuery = useCallback(
    (next: string) => {
      // Spreading `request` rather than `stored` re-anchors `entityTypeKey`, so typing into a picker
      // whose target type just changed commits against the NEW type instead of resurrecting the old
      // request.
      setStored({ ...request, query: next });
    },
    [request]
  );

  const loadMore = useCallback(() => {
    // Guarded rather than merely idempotent: without this, a scroll handler firing twice at the
    // bottom of the list would skip page 2 entirely and append page 3 to page 1.
    if (!hasNextPage || isLoading || isLoadingMore) return;
    setStored({ ...request, page: request.page + 1 });
  }, [hasNextPage, isLoading, isLoadingMore, request]);

  const reload = useCallback(() => {
    // Back to page 1 with a new nonce, which changes the scope and therefore empties the
    // accumulation: retrying from the middle of a paged list would otherwise stack a fresh page 1 on
    // top of pages 1..n.
    setStored({ ...request, page: 1, nonce: request.nonce + 1 });
  }, [request]);

  return {
    query: request.query,
    setQuery,
    items,
    isLoading,
    isLoadingMore,
    hasNextPage,
    loadMore,
    error,
    reload,
  };
}
