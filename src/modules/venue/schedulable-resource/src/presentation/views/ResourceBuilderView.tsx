"use client";

import React, { useState } from "react";
import { PageHeader } from "@core/ui/page-header";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@core/ui/alert-dialog";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { Boxes, Plus, Pencil, Trash2, CheckCircle2, ListChecks, Building2 } from "lucide-react";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { useResourceBuilderViewModel } from "../viewmodels/useResourceBuilderViewModel";
import type { SchedulableResourceTreeNode } from "../viewmodels/resourceTree";
import type { PublicationChecklistReport } from "../../domain/entities/SchedulableResource";

/** Every node id at or below `rootId` (rootId included), or an empty set if not found. */
function collectSubtreeIds(nodes: SchedulableResourceTreeNode[], rootId: string): Set<string> {
  const ids = new Set<string>();
  const collectAll = (list: SchedulableResourceTreeNode[]) => {
    for (const node of list) {
      ids.add(node.id);
      if (node.children?.length) collectAll(node.children);
    }
  };
  const findAndCollect = (list: SchedulableResourceTreeNode[]): boolean => {
    for (const node of list) {
      if (node.id === rootId) {
        collectAll([node]);
        return true;
      }
      if (node.children?.length && findAndCollect(node.children)) return true;
    }
    return false;
  };
  findAndCollect(nodes);
  return ids;
}

function flattenComposites(
  nodes: SchedulableResourceTreeNode[],
  excludeId?: string
): { value: string; label: string }[] {
  // Excluding only the node itself (not its descendants) let a user pick one
  // of the node's own children as its new parent. The backend's
  // CompositionCycleGuard always rejects the resulting cycle, so that was a
  // wasted, confusing round trip — exclude the whole excludeId subtree instead.
  const excludeIds = excludeId ? collectSubtreeIds(nodes, excludeId) : new Set<string>();
  const out: { value: string; label: string }[] = [];
  const walk = (list: SchedulableResourceTreeNode[]) => {
    for (const node of list) {
      if (node.resource.isComposite && !excludeIds.has(node.id)) {
        out.push({ value: node.id, label: node.resource.name });
      }
      if (node.children?.length) walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

interface ResourceNodeProps {
  node: SchedulableResourceTreeNode;
  depth: number;
  t: (key: string) => string;
  onEdit: (node: SchedulableResourceTreeNode) => void;
  onDelete: (node: SchedulableResourceTreeNode) => void;
  onChecklist: (node: SchedulableResourceTreeNode) => void;
}

function ResourceNode({ node, depth, t, onEdit, onDelete, onChecklist }: ResourceNodeProps) {
  const r = node.resource;
  return (
    <div className="space-y-2">
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-nx-md border border-nx-line bg-nx-surface px-4 py-3"
        style={{ marginInlineStart: depth * 24 }}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            {r.isComposite ? (
              <Boxes className="size-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            ) : (
              <Building2 className="size-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            )}
            <span className="font-medium">{r.name}</span>
            <Badge variant={r.isPublished ? "active" : "pending"}>
              {r.isPublished ? t("schedulableResource.status.published") : t("schedulableResource.status.draft")}
            </Badge>
          </div>
          <p className="text-sm text-nx-ink-3">
            {r.isComposite
              ? t("schedulableResource.compositeHint")
              : `${r.namedUnitLabel ?? t("schedulableResource.fields.unitCount")}: ${r.unitCount} · ${t(
                  "schedulableResource.fields.maxConcurrentUsage"
                )}: ${r.capacity?.maxConcurrentUsage ?? "-"}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" aria-label={t("schedulableResource.actions.checklist")} onClick={() => onChecklist(node)}>
            <ListChecks className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t("common.edit")} onClick={() => onEdit(node)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t("common.delete")} onClick={() => onDelete(node)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {node.children?.map((child) => (
        <ResourceNode
          key={child.id}
          node={child}
          depth={depth + 1}
          t={t}
          onEdit={onEdit}
          onDelete={onDelete}
          onChecklist={onChecklist}
        />
      ))}
    </div>
  );
}

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
      // 409 (dependents still attached), permission errors, etc. — surfaced
      // to the user instead of only landing in the console.
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

  if (loading && tree.length === 0) {
    return <LoadingSpinner showText={false} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Boxes}
        title={t("schedulableResource.title")}
        description={t("schedulableResource.description")}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t("schedulableResource.addNew")}
          </Button>
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

      <Dialog open={!!checklistTarget} onOpenChange={(open) => !open && setChecklistTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("schedulableResource.checklistTitle")}</DialogTitle>
            <DialogDescription>
              {checklistTarget?.resource.name} — {checklistTarget?.resource.commercialReadinessNote}
            </DialogDescription>
          </DialogHeader>
          {checklistLoading && <p className="text-sm text-nx-ink-3">{t("common.loading")}</p>}
          {!checklistLoading && checklist && (
            <div className="space-y-3">
              {checklist.canPublish ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="size-4" />
                  <span>{t("schedulableResource.checklistAllClear")}</span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {checklist.blockers.map((b) => (
                    <li key={b.code} className="rounded-nx-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                      {b.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setChecklistTarget(null)}>
              {t("common.close")}
            </Button>
            <Button
              disabled={!checklist?.canPublish || checklistTarget?.resource.isPublished || publishing}
              loading={publishing}
              onClick={handlePublishConfirm}
            >
              {t("schedulableResource.actions.publish")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          // Radix would otherwise dismiss synchronously on the confirm click,
          // before the delete resolves — block that path here instead, and
          // only clear the target from handleDeleteConfirm's own success path.
          if (deleting) return;
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("schedulableResource.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("schedulableResource.deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={deleting}>
                {t("common.cancel")}
              </Button>
            </AlertDialogCancel>
            {/* A plain Button, not AlertDialogAction: AlertDialogAction closes
                the dialog synchronously on click (Radix's Dialog.Close under
                the hood), which raced the async delete and let the dialog
                vanish before it resolved. Closing now happens only from
                handleDeleteConfirm, after remove() settles. */}
            <Button variant="destructive" loading={deleting} disabled={deleting} onClick={handleDeleteConfirm}>
              {t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
