"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { useI18n } from "@core/providers/i18n-provider";
import type { TrustMark } from "../../domain/entities/SignupContent";
import type { CreateTrustMarkParams } from "../../domain/interfaces/ISignupContentRepository";
import { TrustMarkFormSchema } from "../schemas/signup-content.schema";

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

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateTrustMarkParams>({
    resolver: zodResolver(TrustMarkFormSchema),
    defaultValues: toTrustMarkForm(editing),
  });

  const isRealData = useWatch({
    control,
    name: "isRealData",
    defaultValue: false,
  });

  useEffect(() => {
    reset(toTrustMarkForm(editing));
  }, [editing, reset]);

  const onSubmit = (data: CreateTrustMarkParams) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.key")}</Label>
          <Input {...register("key")} className="border-border bg-card text-foreground" />
          {errors.key && <p className="text-xs text-destructive">{errors.key.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.kind")}</Label>
          <Input {...register("kind")} className="border-border bg-card text-foreground" />
          {errors.kind && <p className="text-xs text-destructive">{errors.kind.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.labelEn")}</Label>
          <Input {...register("labelEn")} className="border-border bg-card text-foreground" />
          {errors.labelEn && <p className="text-xs text-destructive">{errors.labelEn.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.labelAr")}</Label>
          <Input {...register("labelAr")} className="border-border bg-card text-foreground" />
          {errors.labelAr && <p className="text-xs text-destructive">{errors.labelAr.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.iconKey")}</Label>
          <Input {...register("iconKey")} className="border-border bg-card text-foreground" />
          {errors.iconKey && <p className="text-xs text-destructive">{errors.iconKey.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.assetUrl")}</Label>
          <Input {...register("assetUrl")} className="border-border bg-card text-foreground" />
          {errors.assetUrl && <p className="text-xs text-destructive">{errors.assetUrl.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.sortOrder")}</Label>
          <Input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="border-border bg-card text-foreground"
          />
          {errors.sortOrder && <p className="text-xs text-destructive">{errors.sortOrder.message}</p>}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{t("signupContent.trustMarks.isRealData")}</Label>
        <Switch
          checked={isRealData}
          onCheckedChange={(v) => setValue("isRealData", v, { shouldValidate: true })}
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          {t("signupContent.trustMarks.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-info text-info-foreground hover:bg-info/90"
        >
          {isSaving ? t("signupContent.trustMarks.saving") : t("signupContent.trustMarks.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Presentation UI component rendering the trust mark dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
      <DialogContent className="border-border bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
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
