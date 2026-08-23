/**
 * Option-set binding for one custom field -- the missing consumer P-4's backend shipped with no
 * caller. `OptionSetService.bind/rebind/unbind` have existed, tested, since that wave; nothing in the
 * product ever called them. This hook is the wire.
 *
 * THREE SEPARATE OPERATIONS, THREE SEPARATE ENTRY POINTS, NOT ONE "SAVE"
 * -----------------------------------------------------------------------
 * `bind`, `rebind` and `unbind` are different backend commands with different preconditions --
 * `BindOptionSetCommandHandler` 409s when the field version is ALREADY bound (use rebind);
 * `RebindOptionSetCommandHandler` 409s when it is NOT (use bind); `unbind` needs neither picker
 * selection at all. Collapsing them into one "attach this set" button would mean guessing which of
 * the two write paths to call, and guessing wrong is a 409 with no recovery offered. So this hook
 * exposes three actions and lets the dialog offer three controls -- see `OptionSetBindingDialog`.
 *
 * WHY THERE IS NO "IS THIS FIELD CURRENTLY BOUND" FLAG HERE, AND WHY THAT IS NOT AN OVERSIGHT
 * ---------------------------------------------------------------------------------------------
 * Nothing this product exposes says so. `FieldVersionSummary` (from `GET custom-fields/versions/
 * {id}`) does not carry `OptionSetVersionId` -- the backend's own record omits it -- and no
 * option-set read exposes a reverse lookup from field to set either. So this hook cannot pre-select
 * "Bind" over "Rebind" for the caller; it can only make each of the three actions do exactly what its
 * own handler documents, and let the server's refusal (surfaced verbatim through the toast) tell the
 * admin which one applies. Building a fake "currently bound" indicator by guessing would be worse
 * than admitting the product cannot answer that question yet.
 *
 * WHICH FIELD VERSION A BIND ACTUALLY TARGETS
 * --------------------------------------------
 * Every `CustomField` created through the normal command gets a `FieldDefinition`/`FieldVersion`
 * twin, published immediately (`FieldDefinitionBundleBuilder`), and `UpdateCustomFieldCommandHandler`
 * edits that SAME published version in place rather than minting a new one -- there is no
 * draft/publish UI in this product yet for an admin to have moved it. So "the field's Published
 * version" is the one live target a binding action can mean today, and `activeFieldVersionId` below
 * resolves exactly that. A field with no twin (predates the backfill) or no Published version yet has
 * nothing to bind, and every action here refuses locally rather than sending a request with no
 * target.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { toast } from "@core/hooks/use-enhanced-toast";
import { getCustomFieldsContainer } from "../../../../di";
import { useOptionSetViewModel } from "../../../../option-set/src/presentation/viewmodels/useOptionSetViewModel";
import type { OptionSet } from "../../../../option-set/src/domain/entities/OptionSet";
import type { OptionSetBindingOutcome } from "../../../../option-set/src/domain/interfaces/IOptionSetRepository";
import type { FieldVersionSummary } from "../../domain/entities/FieldInsight";

/** Which field's binding dialog is open, carrying its label so the dialog needs no second lookup. */
export interface OptionSetBindingTarget {
  fieldId: string;
  fieldLabel: string;
}

export function fieldVersionsQueryKey(fieldId: string) {
  return ["customField", "versions", fieldId] as const;
}

/**
 * The Published version in a field's chain, or null.
 *
 * Exported so a test can pin the selection rule against a chain carrying a Draft (from a future
 * versioning UI) alongside the Published version, without exercising the whole hook.
 */
export function resolveActiveFieldVersion(
  versions: readonly FieldVersionSummary[]
): FieldVersionSummary | null {
  return versions.find((version) => version.status === "Published") ?? null;
}

export function useOptionSetBindingViewModel() {
  const { customFieldRepository, optionSetRepository } = getCustomFieldsContainer();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const [target, setTarget] = useState<OptionSetBindingTarget | null>(null);

  const openBinding = useCallback(
    (fieldId: string, fieldLabel: string) => setTarget({ fieldId, fieldLabel }),
    []
  );
  const closeBinding = useCallback(() => setTarget(null), []);

  /**
   * The caller's readable option sets, and the two permissions that gate this whole screen --
   * `.view` to list them, `.bind` to act on the picker. Reused rather than re-derived: this is the
   * SAME hook the Option Sets admin screen runs, so a picker built on it can never disagree with that
   * screen about which sets exist or what canBind means. See this hook's own header for the three
   * gates every option-set write already passes through.
   *
   * `null`: this consumer never opens a set's own detail/version-chain view, only the list's
   * `isBindable` flag and `publishedVersionId`.
   */
  const optionSets = useOptionSetViewModel(null);

  const versionsQuery = useQuery({
    queryKey: fieldVersionsQueryKey(target?.fieldId ?? ""),
    queryFn: () => customFieldRepository.getVersions(target!.fieldId),
    enabled: target !== null,
    // Uncached, like useFieldInsightViewModel's usage query: a stale answer to "which version is
    // live" is the one input a binding action must not act on.
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

  const versions: FieldVersionSummary[] = versionsQuery.data?.versions ?? [];
  const activeVersion = useMemo(() => resolveActiveFieldVersion(versions), [versions]);
  const fieldVersionId = activeVersion?.id ?? null;

  /** Readable AND published -- see `OptionSet.isBindable`'s own doc comment for why `isSystemManaged` is not part of this filter. */
  const bindableSets: OptionSet[] = useMemo(
    () => optionSets.sets.filter((set) => set.isBindable),
    [optionSets.sets]
  );

  const invalidateAfterBindingChange = useCallback(() => {
    if (!target) return;
    // The version chain's own optionCount is now stale, and so is the usage dialog's count if the
    // admin opens it next -- both read through caches this hook does not own the only other copy of.
    queryClient.invalidateQueries({ queryKey: fieldVersionsQueryKey(target.fieldId) });
    queryClient.invalidateQueries({ queryKey: ["customField", "usage", target.fieldId] });
  }, [queryClient, target]);

  const describeOutcome = useCallback(
    (key: string, outcome: OptionSetBindingOutcome) =>
      t(key, {
        inserted: outcome.inserted,
        updated: outcome.updated,
        deactivated: outcome.deactivated,
        preserved: outcome.preservedLocalOptions,
      }),
    [t]
  );

  const bindMutation = useMutation({
    mutationFn: ({ fieldVersionId, optionSetVersionId }: { fieldVersionId: string; optionSetVersionId: string }) =>
      optionSetRepository.bind(fieldVersionId, optionSetVersionId),
    onSuccess: (outcome) => {
      invalidateAfterBindingChange();
      toast.success(describeOutcome("customField.optionSetBinding.toast.bound", outcome));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.optionSetBinding.toast.bindFailed"),
        description: err.message || undefined,
      });
    },
  });

  const rebindMutation = useMutation({
    mutationFn: ({ fieldVersionId, optionSetVersionId }: { fieldVersionId: string; optionSetVersionId: string }) =>
      optionSetRepository.rebind(fieldVersionId, optionSetVersionId),
    onSuccess: (outcome) => {
      invalidateAfterBindingChange();
      toast.success(describeOutcome("customField.optionSetBinding.toast.switched", outcome));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.optionSetBinding.toast.switchFailed"),
        description: err.message || undefined,
      });
    },
  });

  const unbindMutation = useMutation({
    mutationFn: (fieldVersionId: string) => optionSetRepository.unbind(fieldVersionId),
    onSuccess: () => {
      invalidateAfterBindingChange();
      toast.success(t("customField.optionSetBinding.toast.detached"));
    },
    onError: (err: Error) => {
      toast.error({
        title: t("customField.optionSetBinding.toast.detachFailed"),
        description: err.message || undefined,
      });
    },
  });

  /**
   * Shared precondition every one of the three actions below refuses locally rather than sending: no
   * `.bind` permission, or no resolvable field version to act on. Re-checked here rather than trusted
   * to the caller having disabled the right button, for the same reason `useOptionSetViewModel`'s own
   * writes re-check their gates -- defence in depth, and a hook-level test surface that does not need
   * a DOM click to exercise.
   */
  const refuseAction = useCallback((): string | null => {
    if (!optionSets.canBind) return "customField.optionSetBinding.toast.permissionDenied";
    if (fieldVersionId === null) return "customField.optionSetBinding.toast.noActiveVersion";
    return null;
  }, [optionSets.canBind, fieldVersionId]);

  const bind = useCallback(
    async (optionSetVersionId: string): Promise<boolean> => {
      const refusal = refuseAction();
      if (refusal) {
        toast.error({ title: t(refusal) });
        return false;
      }
      try {
        await bindMutation.mutateAsync({ fieldVersionId: fieldVersionId as string, optionSetVersionId });
        return true;
      } catch {
        return false;
      }
    },
    [refuseAction, bindMutation, fieldVersionId, t]
  );

  const rebind = useCallback(
    async (optionSetVersionId: string): Promise<boolean> => {
      const refusal = refuseAction();
      if (refusal) {
        toast.error({ title: t(refusal) });
        return false;
      }
      try {
        await rebindMutation.mutateAsync({ fieldVersionId: fieldVersionId as string, optionSetVersionId });
        return true;
      } catch {
        return false;
      }
    },
    [refuseAction, rebindMutation, fieldVersionId, t]
  );

  const unbind = useCallback(async (): Promise<boolean> => {
    const refusal = refuseAction();
    if (refusal) {
      toast.error({ title: t(refusal) });
      return false;
    }
    try {
      await unbindMutation.mutateAsync(fieldVersionId as string);
      return true;
    } catch {
      return false;
    }
  }, [refuseAction, unbindMutation, fieldVersionId, t]);

  return {
    target,
    openBinding,
    closeBinding,

    canView: optionSets.canView,
    canBind: optionSets.canBind,

    bindableSets,
    isSetsLoading: optionSets.isSetsLoading,
    isSetsError: optionSets.isSetsError,
    refetchSets: optionSets.refetchSets,

    isVersionLoading: versionsQuery.isFetching,
    isVersionError: versionsQuery.isError,
    refetchVersion: versionsQuery.refetch,
    hasActiveVersion: fieldVersionId !== null,

    bind,
    rebind,
    unbind,
    isBinding: bindMutation.isPending,
    isRebinding: rebindMutation.isPending,
    isUnbinding: unbindMutation.isPending,
  };
}
