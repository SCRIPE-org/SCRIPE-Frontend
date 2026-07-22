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
import type { CustomerLogo } from "../../domain/entities/SignupContent";
import type { CreateCustomerLogoParams } from "../../domain/interfaces/ISignupContentRepository";
import { CustomerLogoFormSchema } from "../schemas/signup-content.schema";

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

function toCustomerLogoForm(editing: CustomerLogo | null): CreateCustomerLogoParams {
  if (!editing) return EMPTY;

  return {
    key: editing.key,
    name: editing.name,
    assetUrl: editing.assetUrl,
    isRealData: editing.isRealData,
    sortOrder: editing.sortOrder,
    isActive: editing.isActive,
  };
}

interface CustomerLogoDialogFormProps {
  onClose: () => void;
  onSave: (data: CreateCustomerLogoParams) => void;
  isSaving: boolean;
  editing: CustomerLogo | null;
}

function CustomerLogoDialogForm({
  onClose,
  onSave,
  isSaving,
  editing,
}: CustomerLogoDialogFormProps) {
  const { t } = useI18n();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateCustomerLogoParams>({
    resolver: zodResolver(CustomerLogoFormSchema),
    defaultValues: toCustomerLogoForm(editing),
  });

  const isRealData = useWatch({
    control,
    name: "isRealData",
    defaultValue: false,
  });

  useEffect(() => {
    reset(toCustomerLogoForm(editing));
  }, [editing, reset]);

  const onSubmit = (data: CreateCustomerLogoParams) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t("signupContent.customerLogos.key")}</Label>
        <Input {...register("key")} className="border-border bg-card text-foreground" />
        {errors.key && <p className="text-xs text-destructive">{errors.key.message}</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t("signupContent.customerLogos.name")}</Label>
        <Input {...register("name")} className="border-border bg-card text-foreground" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{t("signupContent.customerLogos.assetUrl")}</Label>
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
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">
          {t("signupContent.customerLogos.isRealData")}
        </Label>
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
          {t("signupContent.customerLogos.cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-info text-info-foreground hover:bg-info/90"
        >
          {isSaving
            ? t("signupContent.customerLogos.saving")
            : t("signupContent.customerLogos.save")}
        </Button>
      </DialogFooter>
    </form>
  );
}

/**
 * Presentation UI component rendering the customer logo dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CustomerLogoDialog({
  open,
  onClose,
  onSave,
  isSaving,
  editing,
}: CustomerLogoDialogProps) {
  const { t } = useI18n();
  const title = editing
    ? t("signupContent.customerLogos.edit")
    : t("signupContent.customerLogos.add");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-border bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <CustomerLogoDialogForm
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
