/**
 * Field Groups Administration Screen
 *
 * Route: `/custom-fields/field-groups`.
 * Lists one entity type's groups in their configured display order and enables
 * creating, renaming, reordering, and deleting field groups.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { GenericSelect, type GenericSelectOption } from "@core/crud/components/generic-select";
import { ChevronLeft, ChevronRight, FolderTree, Globe2, Plus } from "lucide-react";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { useFieldGroupViewModel } from "../viewmodels/useFieldGroupViewModel";
import { FieldGroupList } from "../components/FieldGroupList";
import { FieldGroupEditor, type FieldGroupFormValues } from "../components/FieldGroupEditor";
import type { FieldGroup } from "../../domain/entities/FieldGroup";

export function FieldGroupListView() {
  useModuleLocales(() => import("../../../locales"), "customFieldGroups");
  useModuleLocales(
    () => import("../../../../custom-field/locales"),
    "customFields"
  );
  const { t, language, direction } = useI18n();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;

  const [entityTypeKey, setEntityTypeKey] = useState("");
  const [pendingDelete, setPendingDelete] = useState<FieldGroup | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const canCreate = usePermission(CUSTOM_FIELDS_PERMISSIONS.FIELD_GROUP_CREATE);

  const vm = useFieldGroupViewModel(entityTypeKey);

  const entityTypes = vm.entityTypes ?? [];
  const entityTypeOptions: GenericSelectOption[] = useMemo(
    () =>
      entityTypes.map((item) => ({
        value: item.key,
        label: `${language === "ar" ? item.displayNameAr : item.displayNameEn} (${item.key})`,
      })),
    [entityTypes, language]
  );

  const editingGroup = vm.groups.find((group) => group.id === vm.editingId) ?? null;

  const rowLabels = useMemo(
    () => ({
      moveUp: t("fieldGroup.moveUp"),
      moveDown: t("fieldGroup.moveDown"),
      edit: t("common.edit"),
      delete: t("common.delete"),
      global: t("fieldGroup.global"),
      sortOrder: t("fieldGroup.fields.sortOrder"),
    }),
    [t]
  );

  const editingId = vm.editingId;
  const isPlatformContext = vm.isPlatformContext;
  const editorLabels = useMemo(
    () => ({
      heading: editingId ? t("fieldGroup.editTitle") : t("fieldGroup.addNew"),
      stableKey: t("fieldGroup.fields.stableKey"),
      stableKeyHint: t("fieldGroup.fields.stableKeyHint"),
      labelEn: t("fieldGroup.fields.labelEn"),
      labelAr: t("fieldGroup.fields.labelAr"),
      sortOrder: t("fieldGroup.fields.sortOrder"),
      isGlobal: t("fieldGroup.fields.isGlobal"),
      isGlobalDescription: isPlatformContext
        ? t("fieldGroup.isGlobalDescription.platformContext")
        : t("fieldGroup.isGlobalDescription.tenantContext"),
      save: t("common.save"),
      cancel: t("common.cancel"),
    }),
    [t, editingId, isPlatformContext]
  );

  const handleSubmit = useCallback(
    async (values: FieldGroupFormValues) => {
      try {
        if (vm.editingId !== null) {
          await vm.updateGroup({
            id: vm.editingId,
            input: {
              labelEn: values.labelEn,
              labelAr: values.labelAr.length > 0 ? values.labelAr : null,
              sortOrder: values.sortOrder,
            },
          });
        } else {
          await vm.createGroup({
            entityTypeKey,
            stableKey: values.stableKey,
            labelEn: values.labelEn,
            labelAr: values.labelAr.length > 0 ? values.labelAr : null,
            sortOrder: values.sortOrder,
            isGlobal: values.isGlobal,
          });
        }
        vm.closeEditor();
      } catch {
        // Errors are surfaced via mutation callbacks
      }
    },
    [entityTypeKey, vm]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const deletedId = pendingDelete.id;
    try {
      await vm.deleteGroup(deletedId);
      setPendingDelete(null);
      if (vm.editingId === deletedId) vm.closeEditor();
    } catch {
      // Handled via mutation callback
    }
  }, [pendingDelete, vm]);

  const handleDrop = useCallback(
    (targetId: string) => {
      if (draggedId) vm.moveBefore(draggedId, targetId);
      setDraggedId(null);
      setDropTargetId(null);
    },
    [draggedId, vm]
  );

  const isEditorOpen = vm.isCreating || vm.editingId !== null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        icon={FolderTree}
        title={t("fieldGroup.title")}
        description={t("fieldGroup.description")}
        eyebrow={
          <Link href="/custom-fields">
            <Button variant="ghost" size="sm">
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Button>
          </Link>
        }
        actions={
          canCreate && entityTypeKey.length > 0 && !isEditorOpen ? (
            <Button size="sm" onClick={vm.startCreate}>
              <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("fieldGroup.addNew")}
            </Button>
          ) : undefined
        }
      />

      {vm.isPlatformContext && (
        <Alert variant="info">
          <Globe2 />
          <AlertTitle>{t("fieldGroup.platformContext.title")}</AlertTitle>
          <AlertDescription>{t("fieldGroup.platformContext.description")}</AlertDescription>
        </Alert>
      )}

      <div className="flex max-w-md flex-col gap-1.5">
        <Label htmlFor="field-group-entity-type">{t("fieldGroup.fields.entityTypeKey")}</Label>
        <GenericSelect
          id="field-group-entity-type"
          aria-label={t("fieldGroup.fields.entityTypeKey")}
          type="single"
          options={entityTypeOptions}
          value={entityTypeKey}
          onValueChange={(value: string | string[]) => {
            setEntityTypeKey(typeof value === "string" ? value : (value[0] ?? ""));
            vm.closeEditor();
          }}
          placeholder={t("fieldGroup.placeholders.entityTypeKey")}
          loading={vm.isEntityTypesLoading}
        />
        {vm.isEntityTypesError && (
          <ErrorMessage
            size="sm"
            message={t("customField.entityTypesLoadFailed")}
            onRetry={() => vm.refetchEntityTypes()}
          />
        )}
      </div>

      {entityTypeKey.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title={t("fieldGroup.selectEntityType.title")}
          description={t("fieldGroup.selectEntityType.description")}
        />
      ) : vm.isGroupsError ? (
        <ErrorMessage
          message={t("fieldGroup.loadFailed")}
          onRetry={() => vm.refetchGroups()}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {isEditorOpen && (
            <FieldGroupEditor
              key={vm.editingId ?? "create"}
              group={editingGroup}
              labels={editorLabels}
              canChooseScope={vm.isSuperAdmin}
              isPlatformContext={vm.isPlatformContext}
              isSaving={vm.isSaving}
              onSubmit={handleSubmit}
              onCancel={vm.closeEditor}
            />
          )}

          {vm.groups.length === 0 && !vm.isGroupsLoading ? (
            <EmptyState
              icon={FolderTree}
              title={t("fieldGroup.noItems.title")}
              description={t("fieldGroup.noItems.description")}
            />
          ) : (
            <FieldGroupList
              groups={vm.groups}
              language={language}
              labels={rowLabels}
              canMutate={vm.canMutate}
              canMoveUp={vm.canMoveUp}
              canMoveDown={vm.canMoveDown}
              isReordering={vm.isReordering}
              onMoveUp={vm.moveUp}
              onMoveDown={vm.moveDown}
              onEdit={vm.startEdit}
              onDelete={setPendingDelete}
              draggedId={draggedId}
              dropTargetId={dropTargetId}
              onDragStart={setDraggedId}
              onDragEnd={() => {
                setDraggedId(null);
                setDropTargetId(null);
              }}
              onDragEnterRow={setDropTargetId}
              onDropOnRow={handleDrop}
            />
          )}
        </div>
      )}

      <ConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        variant="destructive"
        title={t("fieldGroup.deleteTitle")}
        description={t("fieldGroup.deleteConfirm", {
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
