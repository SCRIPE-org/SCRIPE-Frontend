"use client";

import React, { useState } from "react";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { Boxes, Plus, Lock } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueResourceNav } from "@modules/venue/shared/src/presentation/components/VenueResourceNav";
import { useResourceBuilderViewModel } from "../viewmodels/useResourceBuilderViewModel";
import type { SchedulableResourceTreeNode } from "../utils/resourceTree";
import type { PublicationChecklistReport } from "../../domain/entities/SchedulableResource";
import { flattenComposites } from "../utils/compositeTreeHelpers";
import { ResourceNode } from "../components/ResourceNode";
import { ResourceChecklistDialog } from "../dialogs/ResourceChecklistDialog";
import { ResourceDeleteDialog } from "../dialogs/ResourceDeleteDialog";

/**
 * Visual tree builder and manager for schedulable venue resources.
 * Supports composite resource hierarchies, publication checklists, and CRUD workflows.
 */
export const ResourceBuilderView = React.memo(function ResourceBuilderView() {
  useModuleLocales(() => import("../../../locales"), "venue.schedulableResource");
  const { t } = useI18n();
  const {
    tree,
    loading,
    create,
    update,
    remove,
    getPublicationChecklist,
    publish,
    searchFacilityResourceProfiles,
  } = useResourceBuilderViewModel();
  const { error: toastError } = useEnhancedToast();

  const canView = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_VIEW);
  const canCreate = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_CREATE);
  const canUpdate = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_UPDATE);
  const canDelete = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_DELETE);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SchedulableResourceTreeNode | null>(null);
  const [checklistTarget, setChecklistTarget] = useState<SchedulableResourceTreeNode | null>(null);
  const [checklist, setChecklist] = useState<PublicationChecklistReport | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SchedulableResourceTreeNode | null>(null);
  const [deleting, setDeleting] = useState(false);

  const compositeOptions = flattenComposites(tree, editing?.id);

  const fields: FieldConfig[] = [
    {
      name: "facilityResourceProfileId",
      label: t("schedulableResource.fields.facilityResourceProfileId"),
      type: "server-select",
      searchType: "server",
      onServerSearch: searchFacilityResourceProfiles,
      required: true,
      placeholder: t("schedulableResource.placeholders.facilityResourceProfileId"),
      searchPlaceholder: t("schedulableResource.placeholders.facilityResourceProfileId"),
      description: t("schedulableResource.descriptions.facilityResourceProfileId"),
    },
    { name: "name", label: t("schedulableResource.fields.name"), type: "text", required: true },
    { name: "description", label: t("schedulableResource.fields.description"), type: "textarea" },
    {
      name: "parentSchedulableResourceId",
      label: t("schedulableResource.fields.parent"),
      type: "select",
      options: [{ value: "", label: t("schedulableResource.fields.noParent") }, ...compositeOptions],
      description: t("schedulableResource.descriptions.parent"),
    },
    { name: "isComposite", label: t("schedulableResource.fields.isComposite"), type: "switch" },
    {
      name: "namedUnitLabel",
      label: t("schedulableResource.fields.namedUnitLabel"),
      type: "text",
      isVisible: (v) => !v.isComposite,
      placeholder: t("schedulableResource.placeholders.namedUnitLabel"),
    },
    {
      name: "unitCount",
      label: t("schedulableResource.fields.unitCount"),
      type: "number",
      min: 1,
      isVisible: (v) => !v.isComposite,
    },
    {
      name: "allocationMode",
      label: t("schedulableResource.fields.allocationMode"),
      type: "select",
      isVisible: (v) => !v.isComposite,
      options: [
        { value: "SingleUnit", label: t("schedulableResource.allocationMode.singleUnit") },
        { value: "PooledUnits", label: t("schedulableResource.allocationMode.pooledUnits") },
      ],
    },
    {
      name: "maxConcurrentUsage",
      label: t("schedulableResource.fields.maxConcurrentUsage"),
      type: "number",
      min: 1,
      isVisible: (v) => !v.isComposite,
    },
  ];

  const initialValues = editing
    ? {
        name: editing.resource.name,
        description: editing.resource.description ?? "",
        parentSchedulableResourceId: editing.resource.parentSchedulableResourceId ?? "",
        isComposite: editing.resource.isComposite,
        namedUnitLabel: editing.resource.namedUnitLabel ?? "",
        unitCount: editing.resource.unitCount || 1,
        allocationMode: editing.resource.capacity?.allocationMode ?? "SingleUnit",
        maxConcurrentUsage: editing.resource.capacity?.maxConcurrentUsage ?? 1,
      }
    : {
        facilityResourceProfileId: "",
        name: "",
        description: "",
        parentSchedulableResourceId: "",
        isComposite: false,
        namedUnitLabel: "",
        unitCount: 1,
        allocationMode: "SingleUnit",
        maxConcurrentUsage: 1,
      };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload = { ...data, parentSchedulableResourceId: data.parentSchedulableResourceId || null };
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const openChecklist = async (node: SchedulableResourceTreeNode) => {
    setChecklistTarget(node);
    setChecklistLoading(true);
    try {
      const report = await getPublicationChecklist(node.id);
      setChecklist(report);
    } finally {
      setChecklistLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      toastError({ title: err instanceof Error ? err.message : t("common.error") });
    } finally {
      setDeleting(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (!checklistTarget) return;
    setPublishing(true);
    try {
      await publish(checklistTarget.id);
      setChecklistTarget(null);
      setChecklist(null);
    } catch (err) {
      toastError({ title: err instanceof Error ? err.message : t("common.error") });
    } finally {
      setPublishing(false);
    }
  };

  if (!canView) {
    return (
      <EmptyState
        icon={Lock}
        title={t("notAuthorized.title")}
        description={t("notAuthorized.description")}
      />
    );
  }

  if (loading && tree.length === 0) {
    return <LoadingSpinner showText={false} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <VenueResourceNav />
      <PageHeader
        icon={Boxes}
        title={t("schedulableResource.title")}
        description={t("schedulableResource.description")}
        actions={
          canCreate ? (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="size-4" />
              {t("schedulableResource.addNew")}
            </Button>
          ) : undefined
        }
      />

      {!loading && tree.length === 0 && (
        <EmptyState
          icon={Boxes}
          title={t("schedulableResource.noItems")}
          description={t("schedulableResource.noItemsDescription")}
        />
      )}

      <div className="space-y-3">
        {tree.map((node) => (
          <ResourceNode
            key={node.id}
            node={node}
            depth={0}
            t={t}
            onEdit={(n) => {
              setEditing(n);
              setFormOpen(true);
            }}
            onDelete={(n) => setDeleteTarget(n)}
            onChecklist={openChecklist}
            canEdit={canUpdate}
            canDelete={canDelete}
          />
        ))}
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("schedulableResource.editTitle") : t("schedulableResource.addNew")}
            </DialogTitle>
            <DialogDescription>{t("schedulableResource.formDescription")}</DialogDescription>
          </DialogHeader>
          <GenericForm
            fields={editing ? fields.filter((f) => f.name !== "facilityResourceProfileId") : fields}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ResourceChecklistDialog
        target={checklistTarget}
        checklist={checklist}
        loading={checklistLoading}
        publishing={publishing}
        canPublish={canUpdate}
        t={t}
        onClose={() => setChecklistTarget(null)}
        onPublish={handlePublishConfirm}
      />

      <ResourceDeleteDialog
        target={deleteTarget}
        deleting={deleting}
        t={t}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
});
