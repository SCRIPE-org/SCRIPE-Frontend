/**
 * CommissionRateConfig
 * Dialog for setting or clearing a per-tenant commission rate override.
 * Shows the 3-level resolution hierarchy clearly.
 */
"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@core/ui/form";
import { Info, X } from "lucide-react";
import type { ConnectAccountListItem } from "../../domain/entities/ConnectAccount";

type RateTarget = ConnectAccountListItem & { commissionRate?: number };

interface CommissionRateConfigProps {
  account: RateTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenantId: string, rate: number | null) => void;
  isSaving: boolean;
  t: (key: string) => string;
}

interface RateFormValues {
  rate: string;
}

function buildSchema(t: (key: string) => string) {
  return z.object({
    rate: z.string().refine(
      (val) => {
        if (val === "") return true;
        const parsed = parseFloat(val);
        return !isNaN(parsed) && parsed >= 0 && parsed <= 50;
      },
      { message: t("entitlements.stripeConnect.commissionRateInvalid") }
    ),
  });
}

function toDefaultValues(account: RateTarget): RateFormValues {
  return { rate: account.commissionRate != null ? (account.commissionRate * 100).toFixed(2) : "" };
}

interface CommissionRateFormProps {
  account: RateTarget;
  onClose: () => void;
  onSave: (tenantId: string, rate: number | null) => void;
  isSaving: boolean;
  t: (key: string) => string;
}

/**
 * The dialog's body — a real react-hook-form instance so the field wears the
 * shared Form anatomy (label/control/hint/error on one rhythm, aria-invalid
 * driving the input's error skin) instead of hand-rolled state + a bare
 * validation string.
 */
function CommissionRateForm({ account, onClose, onSave, isSaving, t }: CommissionRateFormProps) {
  const schema = useMemo(() => buildSchema(t), [t]);
  const form = useForm<RateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toDefaultValues(account),
  });

  useEffect(() => {
    form.reset(toDefaultValues(account));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.tenantId, account.commissionRate]);

  const onSubmit = (values: RateFormValues) => {
    if (values.rate === "") {
      onSave(account.tenantId, null);
      return;
    }
    onSave(account.tenantId, parseFloat(values.rate) / 100);
  };

  const handleClear = () => {
    form.setValue("rate", "", { shouldValidate: true });
    onSave(account.tenantId, null);
  };

  const effectiveRatePercent =
    account.effectiveCommissionRate != null
      ? (account.effectiveCommissionRate * 100).toFixed(2)
      : "—";

  const rateValue = form.watch("rate");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        {/* Effective rate display */}
        <div className="space-y-2 rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-nx-ink">
            <Info className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
            <span>
              {t("entitlements.stripeConnect.effectiveRate")}:{" "}
              <span className="tabular-nums">{effectiveRatePercent}%</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-nx-ink-2">
            {t("entitlements.stripeConnect.effectiveRateDesc")}
          </p>
          {/* Resolution chain badges */}
          <div className="mt-1 flex flex-wrap gap-1">
            {(["tenantOverride", "editionRate", "globalDefault"] as const).map((level) => (
              <Badge key={level} variant="outline" className="font-normal">
                {t(`entitlements.stripeConnect.rateLevel.${level}`)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Rate input */}
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("entitlements.stripeConnect.commissionRateOverride")} (%)</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    step={0.01}
                    placeholder={t("entitlements.stripeConnect.commissionRatePlaceholder")}
                    {...field}
                  />
                </FormControl>
                {rateValue !== "" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => form.setValue("rate", "", { shouldValidate: true })}
                    aria-label={t("common.clearSelection")}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
              </div>
              <FormDescription>{t("entitlements.stripeConnect.commissionRateFieldHint")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="gap-2">
          {account.commissionRate != null && (
            <Button type="button" variant="outline" onClick={handleClear} disabled={isSaving}>
              {t("entitlements.stripeConnect.commissionRateClearAction")}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={isSaving}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

/**
 * Presentation UI component rendering the commission rate config.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CommissionRateConfig({
  account,
  isOpen,
  onClose,
  onSave,
  isSaving,
  t,
}: CommissionRateConfigProps) {
  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("entitlements.stripeConnect.commissionRateOverride")}</DialogTitle>
          <DialogDescription>{t("entitlements.stripeConnect.commissionRateDesc")}</DialogDescription>
        </DialogHeader>

        <CommissionRateForm
          key={account.tenantId}
          account={account}
          onClose={onClose}
          onSave={onSave}
          isSaving={isSaving}
          t={t}
        />
      </DialogContent>
    </Dialog>
  );
}
