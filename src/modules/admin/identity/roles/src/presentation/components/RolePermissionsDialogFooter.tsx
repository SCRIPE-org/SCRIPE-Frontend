/**
 * Footer bar for RolePermissionsDialog showing selection count, unsaved diff badges,
 * and cancel/save controls.
 *
 * @module roles/presentation/components
 */
"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { DialogFooter } from "@core/ui/dialog";
import { useI18n } from "@core/providers/i18n-provider";
import { ShieldCheck } from "lucide-react";

/**
 * Props for RolePermissionsDialogFooter.
 */
export interface RolePermissionsDialogFooterProps {
  selectedCount: number;
  isDirty: boolean;
  changesCount: { added: number; removed: number };
  isSaving: boolean;
  isReadOnly: boolean;
  onCancel: () => void;
  onSave: () => void;
}

/**
 * Presentation UI component rendering RolePermissionsDialog footer controls.
 */
export function RolePermissionsDialogFooter({
  selectedCount,
  isDirty,
  changesCount,
  isSaving,
  isReadOnly,
  onCancel,
  onSave,
}: RolePermissionsDialogFooterProps) {
  const { t } = useI18n();

  return (
    <DialogFooter className="shrink-0 border-t border-nx-line px-6 py-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm tabular-nums text-nx-ink-2">
            {selectedCount} {t("common.selected")}
          </p>
          {isDirty && (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {changesCount.added > 0 && (
                <Badge variant="success">
                  +{changesCount.added} {t("common.add") || "added"}
                </Badge>
              )}
              {changesCount.removed > 0 && (
                <Badge variant="warning">
                  -{changesCount.removed} {t("common.delete") || "removed"}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onSave}
            disabled={isReadOnly}
            loading={isSaving}
            className="min-w-[7rem]"
          >
            {!isSaving && <ShieldCheck className="me-2 h-4 w-4" aria-hidden="true" />}
            {t("common.save")}
          </Button>
        </div>
      </div>
    </DialogFooter>
  );
}
