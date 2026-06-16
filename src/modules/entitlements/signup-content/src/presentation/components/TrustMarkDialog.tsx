"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";
import type { TrustMark } from "../../domain/entities/SignupContent";
import type { CreateTrustMarkParams } from "../../domain/interfaces/ISignupContentRepository";

interface TrustMarkDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateTrustMarkParams) => void;
  isSaving: boolean;
  editing: TrustMark | null;
}

const EMPTY: CreateTrustMarkParams = {
  key: "",
  kind: "",
  labelEn: "",
  labelAr: "",
  iconKey: "",
  assetUrl: "",
  isRealData: false,
  sortOrder: 0,
  isActive: true,
};

function toTrustMarkForm(editing: TrustMark | null): CreateTrustMarkParams {
  if (!editing) return EMPTY;

  return {
    key: editing.key,
    kind: editing.kind,
    labelEn: editing.labelEn,
    labelAr: editing.labelAr,
    iconKey: editing.iconKey ?? "",
    assetUrl: editing.assetUrl ?? "",
    isRealData: editing.isRealData,
    sortOrder: editing.sortOrder,
    isActive: editing.isActive,
  };
}

interface TrustMarkDialogFormProps {
  onClose: () => void;
  onSave: (data: CreateTrustMarkParams) => void;
  isSaving: boolean;
  editing: TrustMark | null;
}

function TrustMarkDialogForm({ onClose, onSave, isSaving, editing }: TrustMarkDialogFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<CreateTrustMarkParams>(() => toTrustMarkForm(editing));

  const set = (field: keyof CreateTrustMarkParams, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.key")}</label>
          <Input
            value={form.key}
            onChange={(e) => set("key", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.kind")}</label>
          <Input
            value={form.kind}
            onChange={(e) => set("kind", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.labelEn")}</label>
          <Input
            value={form.labelEn}
            onChange={(e) => set("labelEn", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.labelAr")}</label>
          <Input
            value={form.labelAr}
            onChange={(e) => set("labelAr", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.iconKey")}</label>
          <Input
            value={form.iconKey ?? ""}
            onChange={(e) => set("iconKey", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.assetUrl")}</label>
          <Input
            value={form.assetUrl ?? ""}
            onChange={(e) => set("assetUrl", e.target.value)}
            className="border-zinc-700 bg-zinc-900 text-white"
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
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-400">{t("signupContent.trustMarks.isRealData")}</label>
        <Switch checked={form.isRealData} onCheckedChange={(v) => set("isRealData", v)} />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-zinc-400 hover:text-white"
        >
          {t("signupContent.trustMarks.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-indigo-600 text-white hover:bg-indigo-500"
        >
          {isSaving ? t("signupContent.trustMarks.saving") : t("signupContent.trustMarks.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TrustMarkDialog({
  open,
  onClose,
  onSave,
  isSaving,
  editing,
}: TrustMarkDialogProps) {
  const { t } = useI18n();
  const title = editing ? t("signupContent.trustMarks.edit") : t("signupContent.trustMarks.add");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        <TrustMarkDialogForm
          key={`${editing?.id ?? "new"}:${open ? "open" : "closed"}`}
          onClose={onClose}
          onSave={onSave}
          isSaving={isSaving}
          editing={editing}
        />
      </DialogContent>
    </Dialog>
  );
}
