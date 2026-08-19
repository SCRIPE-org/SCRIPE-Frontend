/**
 * Field Groups admin screen -- Wave 5 row 5.2
 *
 * `/custom-fields/field-groups`. Lists one entity type's groups in their
 * display order and lets an admin create, rename, reorder and delete them.
 * `FieldGroup` shipped in Wave 1.1 as a table with no read or write path at
 * all; this screen and the group picker on the definitions form are its first.
 *
 * PAGE SHAPE, decided deliberately
 * --------------------------------
 * NOT a `CrudConfig` over `GenericCrudView`, for the same reason row 5.4's
 * Value Types catalog is not: the content is not a paginated, searchable,
 * sortable table. It is one entity type's hand-ordered list, read from an
 * endpoint with no pagination envelope and no search parameter, whose entire
 * purpose is an order the admin sets by hand. `GenericCrudView` would
 * contribute a pager over a single page, a search box the API cannot honour,
 * and column sorting that directly contradicts the manual order -- and would
 * still not provide the reorder affordance, which would have to be bolted on
 * beside it anyway.
 *
 * CONTAINER CHOICE: a plain route page, no dialog anywhere except the delete
 * confirmation. Create/edit is an INLINE panel (see FieldGroupEditor). Wave 5
 * row 5.6 spent a commit removing nested-modal focus traps from this module,
 * and three custom-fields screens are already routed as plain pages with zero
 * nesting; a four-input form is not disproportionate enough to need a Sheet,
 * let alone a Dialog. Nothing here can nest a modal inside a modal.
 *
 * REORDER ACCESSIBILITY: native drag is paired with real Move up / Move down
 * buttons (FieldGroupRow) -- WCAG 2.2 SC 2.5.7. The `@dnd-kit` reorder
 * implementations elsewhere in this codebase are pointer-only and are NOT the
 * pattern followed here.
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
import { GenericSelect } from "@core/crud/components/generic-select";
import { ChevronLeft, ChevronRight, FolderTree, Globe2, Plus } from "lucide-react";
import { CUSTOM_FIELDS_PERMISSIONS } from "../../../../permission-constants";
import { useFieldGroupViewModel } from "../viewmodels/useFieldGroupViewModel";
import { FieldGroupRow } from "../components/FieldGroupRow";
import { FieldGroupEditor, type FieldGroupFormValues } from "../components/FieldGroupEditor";
import type { FieldGroup } from "../../domain/entities/FieldGroup";

export function FieldGroupListView() {
  // Two dictionaries: this screen's own strings, plus the definitions screen's
  // (`customField.*`), which owns `common`-adjacent copy this page reuses and
  // the entity-type group labels below.
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

  const entityTypeOptions = useMemo(
    () =>
      (vm.entityTypes ?? []).map((item) => ({
        value: item.key,
        label: `${language === "ar" ? item.displayNameAr : item.displayNameEn} (${item.key})`,
      })),
    [vm.entityTypes, language]
  );

  const editingGroup = useMemo(
    () => vm.groups.find((group) => group.id === vm.editingId) ?? null,
    [vm.groups, vm.editingId]
  );

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

  const editorLabels = useMemo(
    () => ({
      heading: vm.editingId ? t("fieldGroup.editTitle") : t("fieldGroup.addNew"),
      labelEn: t("fieldGroup.fields.labelEn"),
      labelAr: t("fieldGroup.fields.labelAr"),
      sortOrder: t("fieldGroup.fields.sortOrder"),
      isGlobal: t("fieldGroup.fields.isGlobal"),
      isGlobalDescription: vm.isPlatformContext
        ? t("fieldGroup.isGlobalDescription.platformContext")
        : t("fieldGroup.isGlobalDescription.tenantContext"),
      save: t("common.save"),
      cancel: t("common.cancel"),
    }),
    [t, vm.editingId, vm.isPlatformContext]
  );

  const handleSubmit = useCallback(
    async (values: FieldGroupFormValues) => {
      try {
        if (editingGroup) {
          await vm.updateGroup({
            id: editingGroup.id,
            input: {
              labelEn: values.labelEn,
              labelAr: values.labelAr.length > 0 ? values.labelAr : null,
              sortOrder: values.sortOrder,
            },
          });
        } else {
          await vm.createGroup({
            entityTypeKey,
            labelEn: values.labelEn,
            labelAr: values.labelAr.length > 0 ? values.labelAr : null,
            sortOrder: values.sortOrder,
            isGlobal: values.isGlobal,
          });
        }
        // Only on success: a failed save leaves the panel open with the
        // admin's input intact, and the mutation's own onError has already
        // surfaced why.
        vm.closeEditor();
      } catch {
        // Swallowed deliberately. `mutateAsync` rejects in addition to firing
        // onError, and an un-awaited rejection here would surface as an
        // unhandled promise rejection with no extra information in it.
      }
    },
    [editingGroup, entityTypeKey, vm]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    try {
      await vm.deleteGroup(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      // Same reasoning as handleSubmit; the dialog stays open on failure.
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
          // GenericSelect's trigger is a role="combobox" DIV, so the <Label
          // htmlFor> above computes no accessible name for it. aria-label is
          // opt-in on this component and must be passed explicitly — every
          // CustomFields site already does.
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
              // Remounts when the target changes, so the uncontrolled initial
              // state inside the editor is re-seeded from the new group rather
              // than keeping the previous row's values.
              key={editingGroup?.id ?? "create"}
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
            <ul className="overflow-hidden rounded-nx-md border border-nx-line">
              {vm.groups.map((group) => (
                <FieldGroupRow
                  key={group.id}
                  group={group}
                  language={language}
                  labels={rowLabels}
                  canMutate={vm.canMutate(group)}
                  canMoveUp={vm.canMoveUp(group.id)}
                  canMoveDown={vm.canMoveDown(group.id)}
                  isReordering={vm.isReordering}
                  onMoveUp={() => vm.moveUp(group.id)}
                  onMoveDown={() => vm.moveDown(group.id)}
                  onEdit={() => vm.startEdit(group.id)}
                  onDelete={() => setPendingDelete(group)}
                  isDragging={draggedId === group.id}
                  isDropTarget={dropTargetId === group.id}
                  onDragStart={() => setDraggedId(group.id)}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDropTargetId(null);
                  }}
                  onDragEnterRow={() => setDropTargetId(group.id)}
                  onDropOnRow={() => handleDrop(group.id)}
                />
              ))}
            </ul>
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
        // Deleting a group UNGROUPS its fields — it never blocks and never
        // cascades. Saying so here is the difference between an admin who
        // knows what the button does and one who assumes it deletes the
        // fields inside.
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
