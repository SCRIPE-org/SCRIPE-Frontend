"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";
import type { CustomerLogo } from "../../domain/entities/SignupContent";
import type { CreateCustomerLogoParams } from "../../domain/interfaces/ISignupContentRepository";

interface CustomerLogoDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateCustomerLogoParams) => void;
  isSaving: boolean;
  editing: CustomerLogo | null;
}

const EMPTY: CreateCustomerLogoParams = {
  key: "",
  name: "",
  assetUrl: "",
  isRealData: false,
  sortOrder: 0,
  isActive: true,
};

export function CustomerLogoDialog({ open, onClose, onSave, isSaving, editing }: CustomerLogoDialogProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<CreateCustomerLogoParams>(EMPTY);

  useEffect(() => {
    if (editing) {
      setForm({
        key: editing.key,
        name: editing.name,
        assetUrl: editing.assetUrl,
        isRealData: editing.isRealData,
        sortOrder: editing.sortOrder,
        isActive: editing.isActive,
      });
    } else {
      setForm(EMPTY);
    }
  }, [editing, open]);

  const set = (field: keyof CreateCustomerLogoParams, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const title = editing
    ? t("signupContent.customerLogos.edit")
    : t("signupContent.customerLogos.add");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{t("signupContent.customerLogos.key")}</label>
            <Input
              value={form.key}
              onChange={(e) => set("key", e.target.value)}
              className="border-zinc-700 bg-zinc-900 text-white"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{t("signupContent.customerLogos.name")}</label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="border-zinc-700 bg-zinc-900 text-white"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{t("signupContent.customerLogos.assetUrl")}</label>
            <Input
              value={form.assetUrl}
              onChange={(e) => set("assetUrl", e.target.value)}
              className="border-zinc-700 bg-zinc-900 text-white"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.sortOrder")}</label>
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
              className="border-zinc-700 bg-zinc-900 text-white"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400">{t("signupContent.customerLogos.isRealData")}</label>
            <Switch
              checked={form.isRealData}
              onCheckedChange={(v) => set("isRealData", v)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              {t("signupContent.customerLogos.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {isSaving ? t("signupContent.customerLogos.saving") : t("signupContent.customerLogos.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
