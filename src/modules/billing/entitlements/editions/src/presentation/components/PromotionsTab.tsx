// FILE-EXCEPTION: file length
/**
 * PromotionsTab — Edition promotions management
 *
 * Displays a card-based table of promotions with inline actions
 * and a create/edit dialog. Follows the same UI patterns as PricingTab.
 */
"use client";

import { usePromotionsViewModel } from "../viewmodels/usePromotionsViewModel";
import { SUPPORTED_CURRENCIES } from "../../domain/entities/EditionPricing";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { DatePicker } from "@core/ui/date-picker";
import { Card, CardContent } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import { formatDateUtc } from "@core/common/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import GenericSelect from "@core/crud/components/generic-select";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Users,
  Percent,
  DollarSign,
  CalendarDays,
  Hash,
  ShieldCheck,
} from "lucide-react";
import type { EditionPromotion } from "../../domain/entities/EditionPromotion";
import { parseLocalizedNumber } from "@core/utils/number-parser";
import { useModuleLocales } from "@core/hooks/use-module-locales";

interface PromotionsTabProps {
  editionId: string;
  allowMonthly?: boolean;
  allowYearly?: boolean;
  allowLifetime?: boolean;
}

/**
 * Presentation UI component rendering the promotions tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PromotionsTab({
  editionId,
  allowMonthly = true,
  allowYearly = true,
  allowLifetime = true,
}: PromotionsTabProps) {
  useModuleLocales(() => import("../../../locales"), "editions");
  const { t, direction } = useI18n();
  const vm = usePromotionsViewModel(editionId);

  if (vm.isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSpinner size="sm" showText={false} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-nx-accent" />
          <h2 className="text-lg font-semibold">{t("entitlements.promotions.title")}</h2>
          <Badge variant="secondary" className="text-xs">
            {vm.promotions.length}
          </Badge>
        </div>
        <Button size="sm" onClick={vm.openCreate}>
          <Plus className="me-1 h-4 w-4" />
          {t("entitlements.promotions.create")}
        </Button>
      </div>

      {/* Empty state */}
      {vm.promotions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="mx-auto mb-3 h-10 w-10 text-nx-ink-3" />
            <p className="text-sm text-nx-ink-2">{t("entitlements.promotions.empty")}</p>
          </CardContent>
        </Card>
      )}

      {/* Promotions list */}
      <div className="grid gap-3">
        {vm.promotions.map((promo) => (
          <PromotionCard
            key={promo.id}
            promo={promo}
            onEdit={() => vm.openEdit(promo)}
            onDelete={() => vm.deletePromotion(promo.id)}
            onToggle={() => vm.toggleActive(promo.id, promo.isActive)}
            isToggling={vm.isToggling}
            isDeleting={vm.isDeleting}
          />
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={vm.showDialog} onOpenChange={(open) => !open && vm.closeDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-nx-accent" />
              {vm.isEditing
                ? t("entitlements.promotions.edit")
                : t("entitlements.promotions.create")}
            </DialogTitle>
            <DialogDescription>
              {vm.isEditing
                ? t("entitlements.promotions.editDesc")
                : t("entitlements.promotions.createDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>{t("common.name")}</Label>
              <Input
                value={vm.form.name}
                onChange={(e) => vm.setField("name", e.target.value)}
                placeholder="e.g. Summer Sale 20% Off"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>{t("common.description")}</Label>
              <Input
                value={vm.form.description}
                onChange={(e) => vm.setField("description", e.target.value)}
                placeholder={t("entitlements.promotions.optionalDescription")}
              />
            </div>

            {!vm.isEditing && (
              <>
                {/* Type + Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("entitlements.promotions.discountType")}</Label>
                    <GenericSelect
                      type="single"
                      options={[
                        {
                          value: "Percentage",
                          label: t("entitlements.promotions.percentage"),
                        },
                        {
                          value: "FixedAmount",
                          label: t("entitlements.promotions.fixedAmount"),
                        },
                      ]}
                      value={vm.form.type}
                      onValueChange={(v: string | string[]) =>
                        vm.setField(
                          "type",
                          (typeof v === "string" ? v : v[0]) as "Percentage" | "FixedAmount"
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>
                      {vm.form.type === "Percentage"
                        ? t("entitlements.promotions.percentOff")
                        : t("entitlements.promotions.amountOff")}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={vm.form.type === "Percentage" ? 100 : undefined}
                      value={vm.form.discountValue || ""}
                      onChange={(e) =>
                        vm.setField("discountValue", parseLocalizedNumber(e.target.value) ?? 0)
                      }
                    />
                  </div>
                </div>

                {/* Currency (only for FixedAmount) */}
                {vm.form.type === "FixedAmount" && (
                  <div className="space-y-1.5">
                    <Label>{t("entitlements.promotions.currency")}</Label>
                    <GenericSelect
                      type="single"
                      options={SUPPORTED_CURRENCIES.map((c) => ({
                        value: c.code,
                        label: `${c.flag} ${c.code} — ${c.name}`,
                      }))}
                      value={vm.form.discountCurrency}
                      onValueChange={(v: string | string[]) =>
                        vm.setField("discountCurrency", typeof v === "string" ? v : v[0])
                      }
                    />
                  </div>
                )}

                {/* Applicable Cycle */}
                <div className="space-y-1.5">
                  <Label>{t("entitlements.promotions.applicableCycle")}</Label>
                  <GenericSelect
                    type="single"
                    options={[
                      { value: "any", label: t("common.any") },
                      ...(allowMonthly
                        ? [
                            {
                              value: "Monthly",
                              label: t("entitlements.promotions.monthly"),
                            },
                          ]
                        : []),
                      ...(allowYearly
                        ? [
                            {
                              value: "Yearly",
                              label: t("entitlements.promotions.yearly"),
                            },
                          ]
                        : []),
                      ...(allowLifetime
                        ? [
                            {
                              value: "Lifetime",
                              label: t("entitlements.promotions.lifetime"),
                            },
                          ]
                        : []),
                    ]}
                    value={vm.form.applicableCycle || "any"}
                    onValueChange={(v: string | string[]) => {
                      const val = typeof v === "string" ? v : v[0];
                      vm.setField("applicableCycle", val === "any" ? "" : val);
                    }}
                  />
                </div>

                {/* Promo Code */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={vm.form.requiresCode}
                      onCheckedChange={(v) => vm.setField("requiresCode", v)}
                    />
                    <Label>{t("entitlements.promotions.requiresCode")}</Label>
                  </div>
                  {vm.form.requiresCode && (
                    <Input
                      value={vm.form.promoCode}
                      onChange={(e) => vm.setField("promoCode", e.target.value.toUpperCase())}
                      placeholder="e.g. SUMMER2026"
                      className="font-mono uppercase"
                    />
                  )}
                </div>

                {/* Duration + First Time Only */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>{t("entitlements.promotions.duration")}</Label>
                    <GenericSelect
                      type="single"
                      options={[
                        {
                          value: "forever",
                          label: t("entitlements.promotions.forever"),
                        },
                        { value: "30", label: t("entitlements.promotions.oneMonth") },
                        {
                          value: "90",
                          label: t("entitlements.promotions.threeMonths"),
                        },
                        {
                          value: "180",
                          label: t("entitlements.promotions.sixMonths"),
                        },
                        { value: "365", label: t("entitlements.promotions.oneYear") },
                        { value: "730", label: t("entitlements.promotions.twoYears") },
                        {
                          value: "custom",
                          label: t("entitlements.promotions.custom"),
                        },
                      ]}
                      value={
                        vm.form.durationDays === 0
                          ? "forever"
                          : vm.form.durationDays === 30
                            ? "30"
                            : vm.form.durationDays === 90
                              ? "90"
                              : vm.form.durationDays === 180
                                ? "180"
                                : vm.form.durationDays === 365
                                  ? "365"
                                  : vm.form.durationDays === 730
                                    ? "730"
                                    : "custom"
                      }
                      onValueChange={(v: string | string[]) => {
                        const val = typeof v === "string" ? v : v[0];
                        if (val === "forever") vm.setField("durationDays", 0);
                        else if (val === "custom") {
                          /* keep current value */
                        } else vm.setField("durationDays", parseInt(val));
                      }}
                    />
                    {/* Custom days input — shown when duration doesn't match a preset */}
                    {![0, 30, 90, 180, 365, 730].includes(vm.form.durationDays) && (
                      <Input
                        type="number"
                        min={1}
                        value={vm.form.durationDays || ""}
                        onChange={(e) => vm.setField("durationDays", parseInt(e.target.value) || 0)}
                        placeholder={t("entitlements.promotions.customDays")}
                        className="mt-1.5"
                      />
                    )}
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={vm.form.firstTimeOnly}
                        onCheckedChange={(v) => vm.setField("firstTimeOnly", v)}
                      />
                      <Label className="text-sm">
                        {t("entitlements.promotions.firstTimeOnly")}
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("entitlements.promotions.validFrom")}</Label>
                <DatePicker
                  value={vm.form.validFrom}
                  onChange={(v) => vm.setField("validFrom", v)}
                  placeholder={t("entitlements.promotions.validFrom")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("entitlements.promotions.validUntil")}</Label>
                <DatePicker
                  value={vm.form.validUntil}
                  onChange={(v) => vm.setField("validUntil", v)}
                  placeholder={t("entitlements.promotions.validUntil")}
                />
              </div>
            </div>

            {/* Max Redemptions */}
            <div className="space-y-1.5">
              <Label>{t("entitlements.promotions.maxRedemptions")}</Label>
              <Input
                type="number"
                min={0}
                value={vm.form.maxRedemptions}
                onChange={(e) => vm.setField("maxRedemptions", e.target.value)}
                placeholder={t("entitlements.promotions.unlimited")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={vm.closeDialog}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => vm.submit()} disabled={!vm.form.name} loading={vm.isSubmitting}>
              {vm.isEditing ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Promotion Card ──

function PromotionCard({
  promo,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
  isDeleting,
}: {
  promo: EditionPromotion;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  const { t } = useI18n();
  return (
    <Card
      className={`transition-opacity duration-nx-standard motion-reduce:transition-none ${!promo.isActive ? "opacity-60" : ""}`}
    >
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Info */}
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{promo.name}</span>
              <Badge variant={promo.isActive ? "default" : "secondary"} className="text-[10px]">
                {promo.isActive ? t("common.active") : t("common.inactive")}
              </Badge>
              {promo.isExpired && (
                <Badge variant="destructive" className="text-[10px]">
                  {t("entitlements.promotions.expired")}
                </Badge>
              )}
              {promo.hasReachedLimit && (
                <Badge variant="outline" className="border-warning/30 text-[10px] text-warning">
                  {t("entitlements.promotions.limitReached")}
                </Badge>
              )}
              {promo.data.firstTimeOnly && (
                <Badge variant="outline" className="border-info/30 text-[10px] text-info">
                  <ShieldCheck className="me-0.5 h-3 w-3" />
                  {t("entitlements.promotions.firstTimeOnly")}
                </Badge>
              )}
            </div>

            {/* Discount info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-nx-ink-3">
              <span className="flex items-center gap-1">
                {promo.type === "Percentage" ? (
                  <Percent className="h-3 w-3" />
                ) : (
                  <DollarSign className="h-3 w-3" />
                )}
                <span className="font-medium text-nx-ink">{promo.discountLabel}</span>
              </span>

              {promo.promoCode ? (
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <code className="rounded-nx-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[10px]">
                    {promo.promoCode}
                  </code>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Badge variant="outline" className="border-dashed text-[10px] text-nx-ink-3">
                    {t("entitlements.promotions.autoApplied")}
                  </Badge>
                </span>
              )}

              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {promo.durationDays === 0
                  ? t("entitlements.promotions.forever")
                  : promo.durationDays === 30
                    ? t("entitlements.promotions.oneMonth")
                    : promo.durationDays === 90
                      ? t("entitlements.promotions.threeMonths")
                      : promo.durationDays === 180
                        ? t("entitlements.promotions.sixMonths")
                        : promo.durationDays === 365
                          ? t("entitlements.promotions.oneYear")
                          : promo.durationDays === 730
                            ? t("entitlements.promotions.twoYears")
                            : `${promo.durationDays}d`}
              </span>

              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {promo.currentRedemptions}
                {promo.maxRedemptions != null ? `/${promo.maxRedemptions}` : "/∞"}
              </span>

              {promo.applicableCycle && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {promo.applicableCycle}
                </span>
              )}
            </div>

            {/* Date range */}
            {(promo.validFrom || promo.validUntil) && (
              <p className="text-[11px] text-nx-ink-3">
                {promo.validFrom && `${t("common.from")}: ${formatDateUtc(promo.validFrom)}`}
                {promo.validFrom && promo.validUntil && " — "}
                {promo.validUntil && `${t("common.to")}: ${formatDateUtc(promo.validUntil)}`}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Switch checked={promo.isActive} onCheckedChange={onToggle} busy={isToggling} />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive/80"
              onClick={onDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
