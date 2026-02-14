/**
 * TenantDialogs Component
 *
 * All dialogs for tenant CRUD operations with i18n support.
 */
"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantTreeNode } from "../../domain/entities/Tenant";

// Form state types
export interface CreateFormState {
  name: string;
  code: string;
  description: string;
}

export interface EditFormState {
  name: string;
  description: string;
  isActive: boolean;
}

export const initialCreateForm: CreateFormState = {
  name: "",
  code: "",
  description: "",
};

export const initialEditForm: EditFormState = {
  name: "",
  description: "",
  isActive: true,
};

// Create Dialog
interface CreateTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentTenant: TenantTreeNode | null;
  form: CreateFormState;
  setForm: React.Dispatch<React.SetStateAction<CreateFormState>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export function CreateTenantDialog({
  open,
  onOpenChange,
  parentTenant,
  form,
  setForm,
  onSubmit,
  isLoading,
}: CreateTenantDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {parentTenant ? t("tenant.createChild") : t("tenant.createTenant")}
          </DialogTitle>
          <DialogDescription>
            {parentTenant
              ? `${t("tenant.createChildDescription")} "${parentTenant.name}".`
              : t("tenant.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-name">{t("tenant.name")} *</Label>
            <Input
              id="create-name"
              placeholder={t("tenant.namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-code">{t("tenant.code")} *</Label>
            <Input
              id="create-code"
              placeholder={t("tenant.codePlaceholder")}
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
            />
            <p className="text-xs text-muted-foreground">{t("tenant.codeHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">{t("tenant.descriptionLabel")}</Label>
            <Textarea
              id="create-description"
              placeholder={t("tenant.descriptionPlaceholder")}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("tenant.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={!form.name || !form.code || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("tenant.creating")}
              </>
            ) : (
              t("tenant.create")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Dialog
interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  form: EditFormState;
  setForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export function EditTenantDialog({
  open,
  onOpenChange,
  tenantName,
  form,
  setForm,
  onSubmit,
  isLoading,
}: EditTenantDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("tenant.editTenant")}</DialogTitle>
          <DialogDescription>
            {t("tenant.editDescription")} &quot;{tenantName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">{t("tenant.name")} *</Label>
            <Input
              id="edit-name"
              placeholder={t("tenant.namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">{t("tenant.descriptionLabel")}</Label>
            <Textarea
              id="edit-description"
              placeholder={t("tenant.descriptionPlaceholder")}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="edit-active">{t("tenant.activeStatus")}</Label>
              <p className="text-xs text-muted-foreground">{t("tenant.activeHelp")}</p>
            </div>
            <Switch
              id="edit-active"
              checked={form.isActive}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("tenant.cancel")}
          </Button>
          <Button onClick={onSubmit} disabled={!form.name || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("tenant.saving")}
              </>
            ) : (
              t("tenant.save")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Dialog
interface DeleteTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteTenantDialog({
  open,
  onOpenChange,
  tenantName,
  onConfirm,
  isLoading,
}: DeleteTenantDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("tenant.deleteTenant")}</DialogTitle>
          <DialogDescription>
            {t("tenant.deleteConfirm")} &quot;{tenantName}&quot;? {t("tenant.deleteWarning")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("tenant.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("tenant.deleting")}
              </>
            ) : (
              t("tenant.delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
