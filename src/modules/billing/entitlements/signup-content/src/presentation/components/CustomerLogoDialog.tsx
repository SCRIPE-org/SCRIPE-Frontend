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
import type { CustomerLogo } from "../../domain/entities/SignupContent";
import type { CreateCustomerLogoParams } from "../../domain/interfaces/ISignupContentRepository";
import { createCustomerLogoFormSchema } from "../schemas/signup-content.schema";

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
  const schema = useMemo(() => createCustomerLogoFormSchema(t), [t]);

  const form = useForm<CreateCustomerLogoParams>({
    resolver: zodResolver(schema),
    defaultValues: toCustomerLogoForm(editing),
  });
  const { reset } = form;

  useEffect(() => {
    reset(toCustomerLogoForm(editing));
  }, [editing, reset]);

  const onSubmit = (data: CreateCustomerLogoParams) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("signupContent.customerLogos.key")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("signupContent.customerLogos.name")}</FormLabel>
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
              <FormLabel>{t("signupContent.customerLogos.assetUrl")}</FormLabel>
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
        <FormField
          control={form.control}
          name="isRealData"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-3 space-y-0">
              <FormLabel>{t("signupContent.customerLogos.isRealData")}</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("signupContent.customerLogos.cancel")}
          </Button>
          <Button type="submit" loading={isSaving}>
            {isSaving
              ? t("signupContent.customerLogos.saving")
              : t("signupContent.customerLogos.save")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
