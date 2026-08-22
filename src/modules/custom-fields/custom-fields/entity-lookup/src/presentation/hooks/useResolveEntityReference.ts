/**
 * useResolveEntityReference — turns a stored reference back into a name (Wave 4)
 *
 * WHY A STORED REFERENCE NEEDS A NETWORK CALL TO RENDER AT ALL
 * -----------------------------------------------------------
 * The server deliberately does not travel the display name with the value. A name snapshotted at
 * write time would be readable by anyone holding the OWNER record's permission, while the name itself
 * is guarded by the TARGET type's — so snapshotting is a permission bypass wearing a performance
 * argument. The consequence for this hook: the resolved name is render state and must never be
 * written back into form state that gets submitted.
 *
 * WHY `status` HAS SIX TERMINAL VALUES AND NOT `{ error: Error | null }`
 * --------------------------------------------------------------------
 * `forbidden`, `missing` and `invalid` are three different sentences with three different remedies:
 * a role change, a data change, and a re-pick. A single error channel makes them one grey dash, which
 * is precisely the state in which a dangling reference survives unnoticed for a year — named as such
 * in `EntityLookupController`'s own doc comment. So the taxonomy is carried in the state machine
 * rather than left for each caller to re-derive from an error message.
 *
 * `forbidden` in particular is a fact about the VIEWER, not the data: the reference is fine and must
 * stay saved. A control that rendered it as empty and then submitted the form would silently clear a
 * value the user was never allowed to see.
 *
 * WHY THE EFFECT KEYS ON A STRING AND NOT ON THE REFERENCE OBJECT
 * --------------------------------------------------------------
 * Callers hold a reference in form state and hand over a fresh object literal on most renders.
 * Depending on `reference` itself would re-resolve on every keystroke typed into an UNRELATED field
 * on the same form — a cross-module query per character.
 *
 * WHY `status` AND `item` ARE DERIVED RATHER THAN STORED
 * -----------------------------------------------------
 * The settled outcome carries the request key it belongs to, so `idle` and `loading` are arithmetic
 * on that key rather than states someone has to remember to write. Clearing the field therefore
 * empties it in the same render, with no effect and no intermediate frame in which a record the user
 * just removed is still on screen — and an outcome for a reference that is no longer held simply
 * stops matching, so it can never be read.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { customFieldsContainer } from "../../../../di";
import type {
  EntityLookupItem,
  EntityLookupReference,
} from "../../data/models/EntityLookupModel";
import {
  EntityLookupError,
  type EntityLookupFailureKind,
} from "../../domain/entities/EntityLookupError";

/**
 * The resolve state machine.
 *
 * - `idle` — no reference held. The field is empty; this is not a failure.
 * - `loading` — in flight.
 * - `resolved` — `item` is populated. Note `item.isActive === false` still lands here: a dormant row
 *   is a successful resolve and remains a valid, savable value.
 * - `forbidden` — 403. The caller lacks the TARGET type's view permission. Keep the value, keep the
 *   field non-editable, say "no access".
 * - `missing` — 404. The record does not resolve: deleted, soft-deleted, or another tenant's, merged
 *   into one answer server-side so this route cannot be used to probe for ids.
 * - `invalid` — the stored id is malformed or tampered with.
 * - `error` — everything else: offline, a 500, or a type this deployment does not have composed.
 */
export type EntityReferenceResolveStatus =
  | "idle"
  | "loading"
  | "resolved"
  | "forbidden"
  | "missing"
  | "invalid"
  | "error";

/** The statuses a finished request can land on — everything but the two the request key derives. */
type SettledResolveStatus = Exclude<EntityReferenceResolveStatus, "idle" | "loading">;

/** What {@link useResolveEntityReference} returns. */
export interface UseResolveEntityReferenceResult {
  /** The resolved record, or null in every state but `resolved`. */
  item: EntityLookupItem | null;
  /** Where the resolve got to. Branch on this, not on `item === null`. */
  status: EntityReferenceResolveStatus;
  /** Re-runs the resolve. For the retry affordance on `error`. */
  retry: () => void;
}

/**
 * Failure kind -> terminal status.
 *
 * `unavailable` collapses into `error` on purpose: an unregistered entity type key, or a module not
 * composed into this deployment, is a configuration fault rather than anything the person looking at
 * the form can act on, so it reads the same as a server error to them. The distinction survives on
 * `EntityLookupError.errorCode` for logs and for a future admin-facing view — it is narrowed here,
 * not discarded.
 *
 * `cancelled` is absent by design: a cancelled request is never a status, and the hook drops it
 * before consulting this table.
 */
const STATUS_BY_FAILURE_KIND: Record<
  Exclude<EntityLookupFailureKind, "cancelled">,
  SettledResolveStatus
> = {
  forbidden: "forbidden",
  missing: "missing",
  invalid: "invalid",
  unavailable: "error",
  unknown: "error",
};

/**
 * Separator for the composite request key.
 *
 * NUL rather than a printable character so the encoding is injective: the parts are compared only
 * as one joined string, and a separator that could occur inside a part would let two different
 * references produce the same key. An entity type registry key, an encrypted id and a counter can
 * none of them contain a NUL.
 */
const KEY_SEPARATOR = "\u0000";

/** A finished resolve, tagged with the request it answered. */
interface ResolveOutcome {
  requestKey: string;
  item: EntityLookupItem | null;
  status: SettledResolveStatus;
}

/**
 * Resolves one held reference to its display record.
 *
 * Accepts the READ shape (`{ entityTypeKey, entityId }`), typed as this submodule's own
 * `EntityLookupReference` rather than `CustomFieldValueModel`'s `CustomFieldEntityReferenceValue` so
 * the lookup layer carries no dependency on the values layer. The two are structurally identical, so
 * a caller passes its own type straight in.
 *
 * @param reference The stored reference, or null when the field is empty (`status: "idle"`).
 */
export function useResolveEntityReference(
  reference: EntityLookupReference | null
): UseResolveEntityReferenceResult {
  const entityTypeKey = reference?.entityTypeKey ?? null;
  const entityId = reference?.entityId ?? null;
  const [retryNonce, setRetryNonce] = useState(0);

  /**
   * Identifies the resolve being awaited, or null when there is nothing to resolve.
   *
   * The nonce is part of the key so `retry` is a key change like any other, rather than a second
   * mechanism for forcing a refetch.
   */
  const requestKey =
    entityTypeKey && entityId
      ? `${entityTypeKey}${KEY_SEPARATOR}${entityId}${KEY_SEPARATOR}${retryNonce}`
      : null;

  const [outcome, setOutcome] = useState<ResolveOutcome | null>(null);

  const settled =
    requestKey !== null && outcome !== null && outcome.requestKey === requestKey ? outcome : null;
  const status: EntityReferenceResolveStatus =
    requestKey === null ? "idle" : (settled?.status ?? "loading");
  const item = settled?.item ?? null;

  // Same ticket-and-mount discipline as `useEntityLookupSearch`. It matters here too, and for a less
  // obvious reason: clearing a reference and immediately picking a different one fires two resolves,
  // and if the first is slower the field ends up displaying the record the user just removed while
  // holding the id of the one they chose.
  const requestSeqRef = useRef(0);
  const isMountedRef = useRef(true);
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (requestKey === null || !entityTypeKey || !entityId) {
      // Bump the ticket so a resolve still in flight for the reference that was just cleared cannot
      // land afterwards. A ref write and nothing else: `status` and `item` already derive to
      // idle/null the moment `requestKey` goes null, in the same render.
      requestSeqRef.current += 1;
      return;
    }

    const seq = ++requestSeqRef.current;
    const controller = new AbortController();

    /** True once this resolve has been superseded or the component has gone. */
    const isStale = () => !isMountedRef.current || seq !== requestSeqRef.current;

    void customFieldsContainer.entityLookupRepository
      .resolve(entityTypeKey, entityId, controller.signal)
      .then((resolved) => {
        if (isStale()) return;
        setOutcome({ requestKey, item: resolved, status: "resolved" });
      })
      .catch((caught: unknown) => {
        if (isStale()) return;
        const classified = EntityLookupError.from(caught);
        // Leave the state alone on a cancellation: it is our own abort, and settling here would flash
        // "no access" over a field that is merely mid-refresh.
        if (classified.kind === "cancelled") return;
        setOutcome({
          requestKey,
          item: null,
          status: STATUS_BY_FAILURE_KIND[classified.kind],
        });
      });

    return () => controller.abort();
  }, [requestKey, entityTypeKey, entityId]);

  const retry = useCallback(() => setRetryNonce((prev) => prev + 1), []);

  return { item, status, retry };
}
