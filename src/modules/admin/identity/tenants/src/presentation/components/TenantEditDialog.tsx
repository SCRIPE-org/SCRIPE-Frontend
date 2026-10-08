/**
 * TenantEditDialog — Modal dialog allowing editing of basic tenant properties.
 */
"use client";

import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Properties for configuring the TenantEditDialog.
 */
export interface TenantEditDialogProps {
  /** Whether the dialog modal is currently open */
  open: boolean;
  /** Callback fired when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Current form field values for name, description, and status */
  form: {
    name: string;
    description: string;
    isActive: boolean;
  };
  /** Callback fired when tenant name changes */
  onSetName: (name: string) => void;
  /** Callback fired when tenant description changes */
  onSetDescription: (desc: string) => void;
  /** Callback fired when active state toggle changes */
  onSetActive: (active: boolean) => void;
  /** Callback fired when form is submitted */
  onSubmit: () => void;
  /** Whether save mutation is currently pending */
  isUpdating: boolean;
}

/**
 * Renders modal dialog for updating tenant display name, description, and active status.
 *
 * @param props Component properties.
 * @returns Modal dialog JSX element.
 */
export function TenantEditDialog({
  open,
  onOpenChange,
  form,
  onSetName,
  onSetDescription,
  onSetActive,
  onSubmit,
  isUpdating,
}: TenantEditDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("tenant.editTenant")}</DialogTitle>
          <DialogDescription>{t("tenant.editDialogDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tenant-edit-name">{t("tenant.name")}</Label>
            <Input
              id="tenant-edit-name"
              value={form.name}
              onChange={(e) => onSetName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant-edit-description">{t("tenant.descriptionLabel")}</Label>
            <Textarea
              id="tenant-edit-description"
              value={form.description}
              onChange={(e) => onSetDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="tenant-edit-active">{t("tenant.activeStatus")}</Label>
            <Switch id="tenant-edit-active" checked={form.isActive} onCheckedChange={onSetActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onSubmit} loading={isUpdating}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
