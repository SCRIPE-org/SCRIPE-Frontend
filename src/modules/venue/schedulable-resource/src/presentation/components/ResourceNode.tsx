import React from "react";
import { Boxes, Building2, ListChecks, Pencil, Trash2 } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import type { SchedulableResourceTreeNode } from "../utils/resourceTree";

export interface ResourceNodeProps {
  node: SchedulableResourceTreeNode;
  depth: number;
  t: (key: string) => string;
  onEdit: (node: SchedulableResourceTreeNode) => void;
  onDelete: (node: SchedulableResourceTreeNode) => void;
  onChecklist: (node: SchedulableResourceTreeNode) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function ResourceNode({
  node,
  depth,
  t,
  onEdit,
  onDelete,
  onChecklist,
  canEdit,
  canDelete,
}: ResourceNodeProps) {
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
              {r.isPublished
                ? t("schedulableResource.status.published")
                : t("schedulableResource.status.draft")}
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
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("schedulableResource.actions.checklist")}
            onClick={() => onChecklist(node)}
          >
            <ListChecks className="size-4" />
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("common.edit")}
              onClick={() => onEdit(node)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("common.delete")}
              onClick={() => onDelete(node)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
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
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
