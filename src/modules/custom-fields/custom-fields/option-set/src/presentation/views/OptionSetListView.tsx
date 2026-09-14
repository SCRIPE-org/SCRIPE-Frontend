"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { SectionState } from "@core/ui/section-state";
import { ChevronLeft, ChevronRight, Globe2, Layers, Lock, Plus, X } from "lucide-react";
import { useOptionSetViewModel } from "../viewmodels/useOptionSetViewModel";
import {
  OptionSetEditorDialog,
  type OptionSetEditorReadOnlyReason,
  type OptionSetEditorSubmission,
} from "../components/OptionSetEditorDialog";
import { OptionSetTable } from "../components/OptionSetTable";
import { OptionSetDetailPanel } from "./OptionSetDetailPanel";
import type { OptionSet } from "../../domain/entities/OptionSet";
import type { OptionSetVersion } from "../../domain/entities/OptionSetVersion";
import type { OptionSetItemInput } from "../../domain/interfaces/IOptionSetRepository";

function toEditorReadOnlyReason(reason: string | undefined): OptionSetEditorReadOnlyReason | null {
  if (reason === "systemManaged" || reason === "platformOwned" || reason === "permission") {
    return reason;
  }
  return null;
}

/**
 * Presentation UI component rendering the Option Sets admin screen.
 */
export function OptionSetListView() {
  useModuleLocales(() => import("../../../locales"), "customFieldOptionSets");
  const { t, language, direction } = useI18n();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<OptionSet | null>(null);

  const vm = useOptionSetViewModel(selectedSetId);

  const editorTarget = vm.editingId !== null ? vm.editingSet : null;
  const isEditorOpen = vm.isCreating || editorTarget !== null;

  const editorReadOnlyReason = useMemo(
    () => (editorTarget ? toEditorReadOnlyReason(vm.refuseUpdate(editorTarget)?.reason) : null),
    [editorTarget, vm]
  );

  const handleSubmit = useCallback(
    async (submission: OptionSetEditorSubmission) => {
      if (submission.mode === "edit") {
        if (!editorTarget) {
          vm.closeEditor();
          return;
        }
        const updated = await vm.updateSet(editorTarget, {
          labelEn: submission.labelEn,
          labelAr: submission.labelAr.length > 0 ? submission.labelAr : null,
          description: submission.description.length > 0 ? submission.description : null,
        });
        if (updated) vm.closeEditor();
        return;
      }

      const createdId = await vm.createSet({
        stableKey: submission.stableKey,
        labelEn: submission.labelEn,
        labelAr: submission.labelAr.length > 0 ? submission.labelAr : null,
        description: submission.description.length > 0 ? submission.description : null,
        isGlobal: submission.isGlobal,
      });
      if (createdId === null) return;

      vm.closeEditor();
      setSelectedSetId(createdId);
    },
    [editorTarget, vm]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const deletedId = pendingDelete.id;

    const deleted = await vm.deleteSet(pendingDelete);
    if (!deleted) return;

    setPendingDelete(null);
    if (selectedSetId === deletedId) setSelectedSetId(null);
    if (vm.editingId === deletedId) vm.closeEditor();
  }, [pendingDelete, selectedSetId, vm]);

  const createVersionRefusal = useMemo(
    () => (vm.selectedSet ? vm.refuseCreateVersion(vm.selectedSet) : null),
    [vm]
  );

  const refusePublishForSelected = useCallback(
    (version: OptionSetVersion) =>
      vm.selectedSet ? vm.refusePublish(vm.selectedSet, version) : null,
    [vm]
  );

  const handleCreateVersion = useCallback(
    (items: OptionSetItemInput[]) =>
      vm.selectedSet ? vm.createVersion(vm.selectedSet, items) : Promise.resolve(null),
    [vm]
  );

  const handlePublishVersion = useCallback(
    (version: OptionSetVersion) =>
      vm.selectedSet ? vm.publishVersion(vm.selectedSet, version) : Promise.resolve(false),
    [vm]
  );

  const selectedSetLabel = vm.selectedSet ? vm.selectedSet.displayLabel(language) : null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        icon={Layers}
        title={t("optionSet.title")}
        description={t("optionSet.description")}
        eyebrow={
          <Link href="/custom-fields">
            <Button variant="ghost" size="sm">
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Button>
          </Link>
        }
        actions={
          vm.canCreate && !isEditorOpen ? (
            <Button size="sm" onClick={vm.startCreate}>
              <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("optionSet.addNew")}
            </Button>
          ) : undefined
        }
      />

      {vm.isPlatformContext && (
        <Alert variant="info">
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("optionSet.platformContext.title")}</AlertTitle>
          <AlertDescription>{t("optionSet.platformContext.description")}</AlertDescription>
        </Alert>
      )}

      {!vm.canView ? (
        <EmptyState icon={Lock} title={t("optionSet.permissions.view")} />
      ) : vm.isSetsError ? (
        <ErrorMessage message={t("optionSet.loadFailed")} onRetry={() => vm.refetchSets()} />
      ) : (
        <SectionState
          isLoading={vm.isSetsLoading}
          skeletonType="rows"
          skeletonRows={6}
          isEmpty={false}
        >
          {vm.sets.length === 0 ? (
            <EmptyState
              icon={Layers}
              title={t("optionSet.noItems.title")}
              description={t("optionSet.noItems.description")}
              action={
                vm.canCreate ? (
                  <Button size="sm" onClick={vm.startCreate}>
                    <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
                    {t("optionSet.addNew")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <OptionSetTable
              sets={vm.sets}
              selectedSetId={selectedSetId}
              onSelectSet={setSelectedSetId}
              canUpdateSet={vm.canUpdateSet}
              canDeleteSet={vm.canDeleteSet}
              onEditSet={(id) => vm.startEdit(id)}
              onDeleteSet={(s) => setPendingDelete(s)}
              language={language}
            />
          )}
        </SectionState>
      )}

      {selectedSetId !== null && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSetId(null)}
              aria-label={selectedSetLabel ? `${t("common.close")} ${selectedSetLabel}` : undefined}
            >
              <X className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />
              {t("common.close")}
            </Button>
          </div>

          <OptionSetDetailPanel
            key={selectedSetId}
            set={vm.selectedSet}
            versions={vm.versions}
            isLoading={vm.isDetailLoading}
            isError={vm.isDetailError}
            onRetry={() => void vm.refetchDetail()}
            createVersionRefusal={createVersionRefusal}
            refusePublish={refusePublishForSelected}
            describeRefusal={vm.describeRefusal}
            onCreateVersion={handleCreateVersion}
            onPublishVersion={handlePublishVersion}
            isCreatingVersion={vm.isCreatingVersion}
            isPublishing={vm.isPublishing}
          />
        </div>
      )}

      <OptionSetEditorDialog
        key={vm.editingId ?? "create"}
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) vm.closeEditor();
        }}
        optionSet={editorTarget}
        readOnlyReason={editorReadOnlyReason}
        canChooseScope={vm.isSuperAdmin}
        isPlatformContext={vm.isPlatformContext}
        isSaving={vm.isSaving}
        errorMessage={null}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        variant="destructive"
        title={t("optionSet.deleteTitle")}
        description={t("optionSet.deleteConfirm", {
          name: pendingDelete?.displayLabel(language) ?? "",
        })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        isLoading={vm.isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
