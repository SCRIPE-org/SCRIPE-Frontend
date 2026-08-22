/**
 * OptionSet ViewModel -- P-4 (shared option sets)
 *
 * State for the Option Sets admin screen: the set list, the selected set's version chain, and the
 * five write paths that live at set level (create set, update set, delete set, create draft version,
 * publish version). Editing a draft's OPTIONS is a separate concern with a separate hook --
 * `useOptionSetVersionEditor` -- because it is a local working copy over an array, not a query.
 *
 * NOT built on `useCrudViewModel`, for the same reason `useFieldGroupViewModel` is not: that hook is
 * paginated-table shaped (page/pageSize/search/sort, one modal per operation) and `GET
 * /custom-fields/option-sets` returns a BARE ARRAY -- no pagination envelope, no search parameter,
 * no sort parameter. Row 5.4's Value Types catalog and row 5.2's Field Groups screen both made this
 * call already; a third divergent read would be the odd one out, not this.
 *
 * THE THREE GATES EVERY SET-LEVEL WRITE HAS TO PASS, AND WHY THEY ARE CHECKED HERE
 * -------------------------------------------------------------------------------
 *  1. PERMISSION. Six distinct backend permissions, not one: `.publish` and `.bind` are separate
 *     actions from the CRUD quartet, so an admin can be allowed to rename a set without being
 *     allowed to make one of its drafts live.
 *  2. SYSTEM-MANAGED. All five mutating endpoints refuse a system-managed set for EVERY caller,
 *     Super Admin included. Refusing before the request is sent is not an optimisation: it is the
 *     difference between "the platform maintains this list, create your own variant" and a bare 403
 *     after the admin has typed a whole draft.
 *  3. OWNERSHIP. A tenant-scoped caller can SEE a platform-owned set -- inheriting the seeded ISO
 *     reference data is the entire point of it -- and every write path then refuses them. Same
 *     reasoning as `useFieldGroupViewModel.canMutate`: offering Edit on a row the backend will
 *     unconditionally reject is a more confusing failure than not offering it.
 *
 * Each gate produces an `OptionSetRefusal` carrying the locale path of the sentence that explains
 * it, so a disabled control can say WHY rather than just being grey. The refusal vocabulary is
 * exported and shared with the version editor.
 *
 * WRITES DO NOT THROW. Every mutation already reports its own failure through `onError`, so a
 * rethrow would either be reported twice or force a `catch {}` at every call site that does nothing.
 * Instead each write resolves to a value that says whether it happened (`string | null` for the two
 * creates, `boolean` for the rest), which is exactly what a view needs to decide whether to close
 * its editor.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { getCustomFieldsContainer } from "../../../../di";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type {
  CreateOptionSetInput,
  UpdateOptionSetInput,
  OptionSetItemInput,
} from "../../domain/interfaces/IOptionSetRepository";

/**
 * The `t` function's shape, named once so the two exported helpers below can accept it without
 * either importing the i18n provider (they are pure) or widening to `Function`.
 */
export type OptionSetTranslate = (key: string, params?: Record<string, string | number>) => string;

/**
 * Why a write was not offered, or was refused before a request went out.
 *
 * An enum rather than a bare message so a view can BRANCH on it -- `systemManaged` and
 * `platformOwned` get a read-only explanation panel in place of the editing controls, while
 * `permission` hides the control outright and `notDraft` merely disables it. A translated string
 * alone could not support that.
 */
export type OptionSetRefusalReason =
  | "permission"
  | "systemManaged"
  | "platformOwned"
  | "notDraft"
  | "alreadyPublished"
  | "emptyVersion"
  /** The version's items never loaded, so a full-replace save would send an empty list. */
  | "notLoaded"
  /** The working copy has validation issues; `messageKey` names the first one. */
  | "invalid";

/**
 * A refusal, paired with the locale path of the sentence that explains it.
 *
 * The MESSAGE KEY travels, not the message: these objects are built in `useMemo`/`useCallback`
 * bodies that would otherwise have to depend on `t` and re-create on every language switch, and
 * keeping them translation-free is also what lets the tests assert on a refusal without an i18n
 * provider in scope.
 */
export interface OptionSetRefusal {
  reason: OptionSetRefusalReason;
  /** Full dotted locale path, e.g. `optionSet.refusals.systemManaged`. */
  messageKey: string;
  /** Interpolation parameters for `messageKey`, when it takes any. */
  params?: Record<string, string | number>;
}

/**
 * Render one refusal as a toast.
 *
 * Exported and shared by both option-set hooks so the two screens cannot drift into describing the
 * same refusal differently. `permission` and `systemManaged` have dedicated toast titles in the
 * dictionary -- they are the two an admin hits most and the two most likely to be misread as a
 * defect -- so those get title + explanation; everything else is a single sentence that IS the
 * title.
 */
export function reportOptionSetRefusal(refusal: OptionSetRefusal, t: OptionSetTranslate): void {
  const message = t(refusal.messageKey, refusal.params);

  if (refusal.reason === "permission") {
    toast.error({ title: t("optionSet.toast.permissionDenied"), description: message });
    return;
  }
  if (refusal.reason === "systemManaged") {
    toast.error({ title: t("optionSet.toast.systemManagedRefused"), description: message });
    return;
  }
  toast.error({ title: message });
}

/**
 * Root of every option-set query key.
 *
 * Exported so a caller can invalidate the whole subtree in one call. The list, detail and version
 * keys below all extend it, which is deliberate: publishing changes the published version, the
 * incumbent's status, the set row's `publishedVersionNumber` AND the detail's version chain all at
 * once, and enumerating those four is how one of them gets forgotten.
 */
export const OPTION_SET_QUERY_ROOT = ["customFields", "optionSets"] as const;

/**
 * Key for the full set list.
 *
 * A factory rather than a constant so anything else reading the same unpaginated array -- the
 * binding picker on the field form is the obvious next consumer -- shares ONE cache entry instead of
 * fetching it again under a key of its own. Same reason `fieldGroupsQueryKey` is exported.
 *
 * The `"list"` segment keeps it a SIBLING of the detail keys rather than their parent, so
 * invalidating the list does not also drop every loaded detail.
 */
export function optionSetsQueryKey() {
  return [...OPTION_SET_QUERY_ROOT, "list"] as const;
}

/** Key for one set's detail (the set row plus its version chain, as summary rows). */
export function optionSetDetailQueryKey(optionSetId: string) {
  return [...OPTION_SET_QUERY_ROOT, "detail", optionSetId] as const;
}

/**
 * Key for one version WITH its items loaded.
 *
 * Keyed by version id alone, matching the endpoint: `GET versions/{versionId}` needs no set id, and
 * including one would let the same version sit in the cache twice.
 */
export function optionSetVersionQueryKey(versionId: string) {
  return [...OPTION_SET_QUERY_ROOT, "version", versionId] as const;
}

export function useOptionSetViewModel(selectedSetId: string | null) {
  const { optionSetRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { hasPermission, isSuperAdmin } = usePermissions();
  const { isInTenantWorld } = useTenantContext();

  const canView = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_VIEW);
  // One permission covers creating a set AND creating a version of one -- the backend gates
  // `POST ""` and `POST "{id}/versions"` on the same key, and the dictionary's
  // `permissions.create` sentence says so out loud.
  const canCreate = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_CREATE);
  const canUpdate = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_UPDATE);
  const canDelete = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_DELETE);
  const canPublish = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_PUBLISH);
  const canBind = hasPermission(CUSTOM_FIELDS_PERMISSIONS.OPTION_SET_BIND);

  /**
   * Same definition `useFieldGroupViewModel` and `CustomFieldListView` use: a Super Admin who has
   * not drilled into a tenant is a genuine platform principal. Everything created from there is
   * platform-owned, and only from there can an existing platform-owned row be mutated.
   */
  const isPlatformContext = isSuperAdmin && !isInTenantWorld;

  /**
   * `custom-field-option-sets.view` ships with this work package, so it is absent from every role
   * that predates it -- including roles holding the full `custom-fields.*` set. Firing the read
   * anyway would give those admins a 403 every time the screen mounts, which is why the query stays
   * idle instead. `useFieldGroupOptions` guards its read for the identical reason.
   */
  const {
    data: sets = [],
    isLoading: isSetsLoading,
    isError: isSetsError,
    refetch: refetchSets,
  } = useQuery({
    queryKey: optionSetsQueryKey(),
    queryFn: () => optionSetRepository.getAll(),
    enabled: canView,
  });

  const {
    data: detail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: optionSetDetailQueryKey(selectedSetId ?? ""),
    // Safe cast: `enabled` below keeps the function from running while the id is null. The
    // alternative -- an id-less request -- has no endpoint to hit.
    queryFn: () => optionSetRepository.getById(selectedSetId as string),
    enabled: canView && !!selectedSetId,
  });

  /**
   * The selected set's version chain, NEWEST FIRST, exactly as the server ordered it.
   *
   * Deliberately not re-sorted. Version numbers are monotonic and never reused, so the server's
   * descending order already puts the version an admin cares about -- the newest draft, or the
   * freshly published one -- at the top of the list.
   */
  const versions: OptionSetVersion[] = detail?.versions ?? [];

  /** The set half of the detail response, or null while nothing is selected or loaded. */
  const selectedSet: OptionSet | null = detail?.set ?? null;

  const invalidateSets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: optionSetsQueryKey() });
  }, [queryClient]);

  const invalidateDetail = useCallback(
    (optionSetId: string) => {
      queryClient.invalidateQueries({ queryKey: optionSetDetailQueryKey(optionSetId) });
    },
    [queryClient]
  );

  /**
   * Drop every option-set cache entry at once.
   *
   * Used by delete and publish, the two writes whose blast radius is wider than the row they name.
   * Delete takes the whole version chain with it; publish demotes the incumbent, so a version entry
   * loaded moments ago now reports the wrong status. Listing the affected keys individually is how
   * one gets missed.
   */
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: OPTION_SET_QUERY_ROOT });
  }, [queryClient]);

  // ── Refusal predicates ────────────────────────────────────────────────────────────────────────
  //
  // Gate order is permission first, then the set's own facts. A viewer who lacks the permission is
  // owed "you can't do this", not a lecture on the set's provenance -- and the control is hidden in
  // that case anyway, so the provenance sentence would never be read.

  /**
   * Ownership refusal, shared by all four set-level writes: a platform-owned set is readable and
   * bindable everywhere, writable only from platform context.
   */
  const refuseOwnership = useCallback(
    (set: OptionSet): OptionSetRefusal | null => {
      if (set.isPlatformOwned && !isPlatformContext) {
        return { reason: "platformOwned", messageKey: "optionSet.refusals.platformOwned" };
      }
      return null;
    },
    [isPlatformContext]
  );

  /**
   * The two facts that refuse every mutating path regardless of which one it is: the platform
   * maintains this set, or it is not this caller's to write.
   */
  const refuseSetLevel = useCallback(
    (set: OptionSet): OptionSetRefusal | null => {
      if (!set.isContentEditable) {
        return { reason: "systemManaged", messageKey: "optionSet.refusals.systemManaged" };
      }
      return refuseOwnership(set);
    },
    [refuseOwnership]
  );

  const refuseUpdate = useCallback(
    (set: OptionSet): OptionSetRefusal | null => {
      if (!canUpdate) {
        return { reason: "permission", messageKey: "optionSet.permissions.update" };
      }
      return refuseSetLevel(set);
    },
    [canUpdate, refuseSetLevel]
  );

  const refuseDelete = useCallback(
    (set: OptionSet): OptionSetRefusal | null => {
      if (!canDelete) {
        return { reason: "permission", messageKey: "optionSet.permissions.delete" };
      }
      return refuseSetLevel(set);
    },
    [canDelete, refuseSetLevel]
  );

  const refuseCreateVersion = useCallback(
    (set: OptionSet): OptionSetRefusal | null => {
      if (!canCreate) {
        return { reason: "permission", messageKey: "optionSet.permissions.create" };
      }
      return refuseSetLevel(set);
    },
    [canCreate, refuseSetLevel]
  );

  /**
   * Publish refusals, in the order an admin encounters them.
   *
   * `alreadyPublished` is split out from `notDraft` on purpose: both are "this is not a draft", but
   * telling someone their version is already the live one answers their question, while "only a
   * draft can be published" sends them looking for a draft that does not need to exist.
   *
   * The empty check reads `itemCount`, which is populated on the SUMMARY rows this screen holds --
   * `items` is null on those, so `items.length` would report 0 for every version in the chain and
   * refuse every publish.
   */
  const refusePublish = useCallback(
    (set: OptionSet, version: OptionSetVersion): OptionSetRefusal | null => {
      if (!canPublish) {
        return { reason: "permission", messageKey: "optionSet.permissions.publish" };
      }
      const setLevel = refuseSetLevel(set);
      if (setLevel) return setLevel;

      if (version.isPublished) {
        return { reason: "alreadyPublished", messageKey: "optionSet.refusals.alreadyPublished" };
      }
      if (!version.canPublish) {
        return { reason: "notDraft", messageKey: "optionSet.refusals.notDraft" };
      }
      if (version.itemCount === 0) {
        return { reason: "emptyVersion", messageKey: "optionSet.refusals.emptyVersion" };
      }
      return null;
    },
    [canPublish, refuseSetLevel]
  );

  const canUpdateSet = useCallback((set: OptionSet) => refuseUpdate(set) === null, [refuseUpdate]);
  const canDeleteSet = useCallback((set: OptionSet) => refuseDelete(set) === null, [refuseDelete]);
  const canCreateVersionFor = useCallback(
    (set: OptionSet) => refuseCreateVersion(set) === null,
    [refuseCreateVersion]
  );
  const canPublishVersion = useCallback(
    (set: OptionSet, version: OptionSetVersion) => refusePublish(set, version) === null,
    [refusePublish]
  );

  /** Turn a refusal into the sentence to show. Kept beside the predicates so views never guess. */
  const describeRefusal = useCallback(
    (refusal: OptionSetRefusal) => t(refusal.messageKey, refusal.params),
    [t]
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: (input: CreateOptionSetInput) => optionSetRepository.create(input),
    onSuccess: () => {
      invalidateSets();
      toast.success(t("optionSet.toast.created"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.createFailed"),
        description: err.message || undefined,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOptionSetInput }) =>
      optionSetRepository.update(id, input),
    onSuccess: (_data, variables) => {
      invalidateSets();
      invalidateDetail(variables.id);
      toast.success(t("optionSet.toast.updated"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.updateFailed"),
        description: err.message || undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => optionSetRepository.delete(id),
    onSuccess: () => {
      // The whole subtree, not just the list row: the deleted set's detail and every one of its
      // version entries are now stale too.
      invalidateAll();
      toast.success(t("optionSet.toast.deleted"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.deleteFailed"),
        description: err.message || undefined,
      });
    },
  });

  const createVersionMutation = useMutation({
    mutationFn: ({ optionSetId, items }: { optionSetId: string; items: OptionSetItemInput[] }) =>
      optionSetRepository.createVersion(optionSetId, items),
    onSuccess: (_data, variables) => {
      // Both, not one: the detail gains a row and the list row's `versionCount` goes up.
      invalidateDetail(variables.optionSetId);
      invalidateSets();
      toast.success(t("optionSet.toast.versionCreated"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.versionCreateFailed"),
        description: err.message || undefined,
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ versionId }: { versionId: string; versionNumber: number }) =>
      optionSetRepository.publishVersion(versionId),
    onSuccess: (_data, variables) => {
      invalidateAll();
      toast.success(t("optionSet.toast.published", { number: variables.versionNumber }));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("optionSet.toast.publishFailed"),
        description: err.message || undefined,
      });
    },
  });

  // ── Write paths ───────────────────────────────────────────────────────────────────────────────

  /**
   * Create a set. Resolves to the new set's encrypted id, or null when refused or failed.
   *
   * No set exists yet, so there is nothing to check beyond the permission. `isGlobal` is a REQUEST:
   * the backend re-checks it against super-admin status and answers 403 otherwise, which is why the
   * form's global toggle is gated on `isSuperAdmin` rather than on anything computed here.
   */
  const createSet = useCallback(
    async (input: CreateOptionSetInput): Promise<string | null> => {
      if (!canCreate) {
        reportOptionSetRefusal(
          { reason: "permission", messageKey: "optionSet.permissions.create" },
          t
        );
        return null;
      }
      try {
        return await createMutation.mutateAsync(input);
      } catch {
        return null;
      }
    },
    [canCreate, createMutation, t]
  );

  /**
   * Rename a set / change its description. Takes the ENTITY, not just an id, because two of the
   * three gates are facts about the set and an id cannot answer them.
   */
  const updateSet = useCallback(
    async (set: OptionSet, input: UpdateOptionSetInput): Promise<boolean> => {
      const refusal = refuseUpdate(set);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return false;
      }
      try {
        await updateMutation.mutateAsync({ id: set.id, input });
        return true;
      } catch {
        return false;
      }
    },
    [refuseUpdate, updateMutation, t]
  );

  const deleteSet = useCallback(
    async (set: OptionSet): Promise<boolean> => {
      const refusal = refuseDelete(set);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return false;
      }
      try {
        await deleteMutation.mutateAsync(set.id);
        return true;
      } catch {
        return false;
      }
    },
    [refuseDelete, deleteMutation, t]
  );

  /**
   * Create a new DRAFT version carrying `items`. Resolves to the new version's id, or null.
   *
   * The empty check is not redundant with the backend's: `POST {id}/versions` refuses an itemless
   * version, and the reason it refuses is worth saying in the admin's own words rather than as a
   * 400. A new draft copies nothing forward, so the caller has to collect at least one option before
   * calling this -- see `useOptionSetVersionEditor` for the validation the same list goes through.
   */
  const createVersion = useCallback(
    async (set: OptionSet, items: OptionSetItemInput[]): Promise<string | null> => {
      const refusal = refuseCreateVersion(set);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return null;
      }
      if (items.length === 0) {
        reportOptionSetRefusal(
          { reason: "emptyVersion", messageKey: "optionSet.items.validation.atLeastOne" },
          t
        );
        return null;
      }
      try {
        return await createVersionMutation.mutateAsync({ optionSetId: set.id, items });
      } catch {
        return null;
      }
    },
    [refuseCreateVersion, createVersionMutation, t]
  );

  /**
   * Publish a draft, demoting whatever was published before it.
   *
   * Takes the version ENTITY so the confirmation toast can name the number without a second lookup,
   * and so the draft/empty gates have something to read. Publishing moves NO bound field: every
   * field stays pinned to the version it was bound to until an admin rebinds it.
   */
  const publishVersion = useCallback(
    async (set: OptionSet, version: OptionSetVersion): Promise<boolean> => {
      const refusal = refusePublish(set, version);
      if (refusal) {
        reportOptionSetRefusal(refusal, t);
        return false;
      }
      try {
        await publishMutation.mutateAsync({
          versionId: version.id,
          versionNumber: version.versionNumber,
        });
        return true;
      } catch {
        return false;
      }
    },
    [refusePublish, publishMutation, t]
  );

  // ── Inline editor state ───────────────────────────────────────────────────────────────────────
  // Same shape as the Field Groups screen: an inline panel, never a dialog. Wave 5 row 5.6 spent a
  // commit removing nested-modal focus traps from this module, and a set-level form is four inputs.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const startCreate = useCallback(() => {
    setEditingId(null);
    setIsCreating(true);
  }, []);

  const startEdit = useCallback((id: string) => {
    setIsCreating(false);
    setEditingId(id);
  }, []);

  const closeEditor = useCallback(() => {
    setIsCreating(false);
    setEditingId(null);
  }, []);

  /**
   * The set currently being renamed, resolved from the list rather than re-fetched.
   *
   * `OptionSetResponse` is the same shape in the list and in the detail -- there is no sparse list
   * variant -- so the row already holds every value the edit form needs. Nothing here can arrive
   * undefined from the list and be blanked on save.
   */
  const editingSet = useMemo(
    () => (editingId ? (sets.find((set) => set.id === editingId) ?? null) : null),
    [editingId, sets]
  );

  return {
    // ── Set list ──
    sets,
    isSetsLoading,
    isSetsError,
    refetchSets,

    // ── Selected set detail ──
    /** The raw detail response, for a caller that wants both halves in one object. */
    detail,
    selectedSet,
    versions,
    isDetailLoading,
    isDetailError,
    refetchDetail,

    // ── Caller context and capabilities ──
    isPlatformContext,
    /** Only a Super Admin may ASK for a global set; the backend 403s anyone else who sends it. */
    isSuperAdmin,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canPublish,
    canBind,

    // ── Refusals: booleans for `disabled`, refusal objects for the explanation ──
    canUpdateSet,
    canDeleteSet,
    canCreateVersionFor,
    canPublishVersion,
    refuseUpdate,
    refuseDelete,
    refuseCreateVersion,
    refusePublish,
    describeRefusal,

    // ── Writes ──
    createSet,
    updateSet,
    deleteSet,
    createVersion,
    publishVersion,

    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreatingVersion: createVersionMutation.isPending,
    isPublishing: publishMutation.isPending,

    // ── Inline editor state ──
    editingId,
    editingSet,
    isCreating,
    startCreate,
    startEdit,
    closeEditor,
  };
}
