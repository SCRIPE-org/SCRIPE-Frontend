import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import type { SchedulableResourceTreeNode } from "../utils/resourceTree";
import type { PublicationChecklistReport } from "../../domain/entities/SchedulableResource";

export interface ResourceChecklistDialogProps {
  target: SchedulableResourceTreeNode | null;
  checklist: PublicationChecklistReport | null;
  loading: boolean;
  publishing: boolean;
  canPublish: boolean;
  t: (key: string) => string;
  onClose: () => void;
  onPublish: () => void;
}

export function ResourceChecklistDialog({
  target,
  checklist,
  loading,
  publishing,
  canPublish,
  t,
  onClose,
  onPublish,
}: ResourceChecklistDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("schedulableResource.checklistTitle")}</DialogTitle>
          <DialogDescription>
            {target?.resource.name} — {target?.resource.commercialReadinessNote}
          </DialogDescription>
        </DialogHeader>
        {loading && <p className="text-sm text-nx-ink-3">{t("common.loading")}</p>}
        {!loading && checklist && (
          <div className="space-y-3">
            {checklist.canPublish ? (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-4" />
                <span>{t("schedulableResource.checklistAllClear")}</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {checklist.blockers.map((b) => (
                  <li
                    key={b.code}
                    className="rounded-nx-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm"
                  >
                    {b.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t("common.close")}
          </Button>
          {canPublish && (
            <Button
              disabled={!checklist?.canPublish || target?.resource.isPublished || publishing}
              loading={publishing}
              onClick={onPublish}
            >
              {t("schedulableResource.actions.publish")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
