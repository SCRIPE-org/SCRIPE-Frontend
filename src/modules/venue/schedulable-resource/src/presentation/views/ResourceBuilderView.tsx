"use client";

import React, { useState } from "react";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
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
import { ResourceNode } from "../components/ResourceNode";
import { ResourceChecklistDialog } from "../dialogs/ResourceChecklistDialog";
import { ResourceDeleteDialog } from "../dialogs/ResourceDeleteDialog";
import { ResourceFormDialog } from "../dialogs/ResourceFormDialog";

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

  const handleSubmit = async (data: Record<string, unknown>) => {
    const payload = {
      ...data,
      parentSchedulableResourceId: data.parentSchedulableResourceId || null,
    };
    if (editing) await update(editing.id, payload);
    else await create(payload);
    setFormOpen(false);
    setEditing(null);
  };

  const openChecklist = async (node: SchedulableResourceTreeNode) => {
    setChecklistTarget(node);
    setChecklistLoading(true);
    try {
      setChecklist(await getPublicationChecklist(node.id));
    } finally {
      setChecklistLoading(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (!checklistTarget) return;
    setPublishing(true);
    try {
      await publish(checklistTarget.id);
      setChecklistTarget(null);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : t("common.unknownError"),
      });
    } finally {
      setDeleting(false);
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

  if (loading && tree.length === 0) return <LoadingSpinner showText={false} />;

  return (
    <div className="space-y-6">
      <VenueResourceNav />
      <PageHeader
        icon={Boxes}
        title={t("schedulableResource.builderTitle")}
        description={t("schedulableResource.builderDescription")}
        actions={
          canCreate ? (
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="size-4" />
              {t("schedulableResource.addNew")}
            </Button>
          ) : undefined
        }
      />

      {tree.length === 0 && (
        <EmptyState
          icon={Boxes}
          title={t("schedulableResource.empty")}
          description={t("schedulableResource.emptyDescription")}
          action={
            canCreate ? (
              <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus className="size-4" />
                {t("schedulableResource.addNew")}
              </Button>
            ) : undefined
          }
        />
      )}

      <div className="space-y-2">
        {tree.map((node) => (
          <ResourceNode
            key={node.id}
            node={node}
            depth={0}
            t={t}
            onEdit={(n) => { setEditing(n); setFormOpen(true); }}
            onDelete={(n) => setDeleteTarget(n)}
            onChecklist={openChecklist}
            canEdit={canUpdate}
            canDelete={canDelete}
          />
        ))}
      </div>

      <ResourceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
        tree={tree}
        t={t}
        searchFacilityResourceProfiles={searchFacilityResourceProfiles}
        onSubmit={handleSubmit}
      />

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
