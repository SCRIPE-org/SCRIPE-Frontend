"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Switch } from "@core/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";
import type { TrustMark } from "../../domain/entities/SignupContent";
import type { CreateTrustMarkParams } from "../../domain/interfaces/ISignupContentRepository";
import { createTrustMarkFormSchema } from "../schemas/signup-content.schema";

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
  const schema = useMemo(() => createTrustMarkFormSchema(t), [t]);

  const form = useForm<CreateTrustMarkParams>({
    resolver: zodResolver(schema),
    defaultValues: toTrustMarkForm(editing),
  });
  const { reset } = form;

  useEffect(() => {
    reset(toTrustMarkForm(editing));
  }, [editing, reset]);

  const onSubmit = (data: CreateTrustMarkParams) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.trustMarks.key")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.trustMarks.kind")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.trustMarks.labelEn")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="labelAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.trustMarks.labelAr")}</FormLabel>
                <FormControl>
                  <Input dir="rtl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iconKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.trustMarks.iconKey")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assetUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.trustMarks.assetUrl")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("signupContent.trustMarks.sortOrder")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="isRealData"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-3 space-y-0">
              <FormLabel>{t("signupContent.trustMarks.isRealData")}</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("signupContent.trustMarks.cancel")}
          </Button>
          <Button type="submit" loading={isSaving}>
            {isSaving ? t("signupContent.trustMarks.saving") : t("signupContent.trustMarks.save")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
