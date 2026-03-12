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
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { Label } from "@core/ui/label";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import GenericSelect from "@core/crud/components/generic-select";
import {
      Tag, Plus, Loader2, Pencil, Trash2, Clock, Users,
      Percent, DollarSign, CalendarDays, Hash, ShieldCheck,
} from "lucide-react";
import type { EditionPromotion } from "../../domain/entities/EditionPromotion";
import { parseLocalizedNumber } from "@core/utils/number-parser";

interface PromotionsTabProps {
      editionId: string;
      allowMonthly?: boolean;
      allowYearly?: boolean;
      allowLifetime?: boolean;
}

export function PromotionsTab({ editionId, allowMonthly = true, allowYearly = true, allowLifetime = true }: PromotionsTabProps) {
      const { t, direction } = useI18n();
      const vm = usePromotionsViewModel(editionId);

      if (vm.isLoading) {
            return (
                  <div className="flex items-center justify-center min-h-[200px]">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
            );
      }

      return (
            <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                              <Tag className="h-5 w-5 text-primary" />
                              <h2 className="text-lg font-semibold">
                                    {t("entitlements.promotions.title") || "Promotions"}
                              </h2>
                              <Badge variant="secondary" className="text-xs">
                                    {vm.promotions.length}
                              </Badge>
                        </div>
                        <Button size="sm" onClick={vm.openCreate} className="gradient-primary">
                              <Plus className="h-4 w-4 me-1" />
                              {t("entitlements.promotions.create") || "Create Promotion"}
                        </Button>
                  </div>

                  {/* Empty state */}
                  {vm.promotions.length === 0 && (
                        <Card>
                              <CardContent className="py-12 text-center">
                                    <Tag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                          {t("entitlements.promotions.empty") || "No promotions yet. Create your first one to attract customers."}
                                    </p>
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
                                    t={t}
                              />
                        ))}
                  </div>

                  {/* Create / Edit Dialog */}
                  <Dialog open={vm.showDialog} onOpenChange={(open) => !open && vm.closeDialog()}>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                          <Tag className="h-5 w-5 text-primary" />
                                          {vm.isEditing
                                                ? (t("entitlements.promotions.edit") || "Edit Promotion")
                                                : (t("entitlements.promotions.create") || "Create Promotion")}
                                    </DialogTitle>
                                    <DialogDescription>
                                          {vm.isEditing
                                                ? (t("entitlements.promotions.editDesc") || "Update the promotion details.")
                                                : (t("entitlements.promotions.createDesc") || "Create a discount promotion for this edition.")}
                                    </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-2">
                                    {/* Name */}
                                    <div className="space-y-1.5">
                                          <Label>{t("common.name") || "Name"}</Label>
                                          <Input
                                                value={vm.form.name}
                                                onChange={(e) => vm.setField("name", e.target.value)}
                                                placeholder="e.g. Summer Sale 20% Off"
                                          />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                          <Label>{t("common.description") || "Description"}</Label>
                                          <Input
                                                value={vm.form.description}
                                                onChange={(e) => vm.setField("description", e.target.value)}
                                                placeholder="Optional description..."
                                          />
                                    </div>

                                    {!vm.isEditing && (
                                          <>
                                                {/* Type + Value */}
                                                <div className="grid grid-cols-2 gap-3">
                                                      <div className="space-y-1.5">
                                                            <Label>{t("entitlements.promotions.discountType") || "Discount Type"}</Label>
                                                            <GenericSelect
                                                                  type="single"
                                                                  options={[
                                                                        { value: "Percentage", label: t("entitlements.promotions.percentage") || "Percentage" },
                                                                        { value: "FixedAmount", label: t("entitlements.promotions.fixedAmount") || "Fixed Amount" },
                                                                  ]}
                                                                  value={vm.form.type}
                                                                  onValueChange={(v: string | string[]) => vm.setField("type", (typeof v === "string" ? v : v[0]) as "Percentage" | "FixedAmount")}
                                                            />
                                                      </div>
                                                      <div className="space-y-1.5">
                                                            <Label>
                                                                  {vm.form.type === "Percentage"
                                                                        ? (t("entitlements.promotions.percentOff") || "% Off")
                                                                        : (t("entitlements.promotions.amountOff") || "Amount Off")}
                                                            </Label>
                                                            <Input
                                                                  type="number"
                                                                  min={0}
                                                                  max={vm.form.type === "Percentage" ? 100 : undefined}
                                                                  value={vm.form.discountValue || ""}
                                                                  onChange={(e) => vm.setField("discountValue", parseLocalizedNumber(e.target.value) ?? 0)}
                                                            />
                                                      </div>
                                                </div>

                                                {/* Currency (only for FixedAmount) */}
                                                {vm.form.type === "FixedAmount" && (
                                                      <div className="space-y-1.5">
                                                            <Label>{t("entitlements.promotions.currency") || "Currency"}</Label>
                                                            <GenericSelect
                                                                  type="single"
                                                                  options={SUPPORTED_CURRENCIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.code} — ${c.name}` }))}
                                                                  value={vm.form.discountCurrency}
                                                                  onValueChange={(v: string | string[]) => vm.setField("discountCurrency", typeof v === "string" ? v : v[0])}
                                                            />
                                                      </div>
                                                )}

                                                {/* Applicable Cycle */}
                                                <div className="space-y-1.5">
                                                      <Label>{t("entitlements.promotions.applicableCycle") || "Applicable Billing Cycle"}</Label>
                                                      <GenericSelect
                                                            type="single"
                                                            options={[
                                                                  { value: "any", label: t("common.any") || "Any Cycle" },
                                                                  ...(allowMonthly ? [{ value: "Monthly", label: t("entitlements.promotions.monthly") || "Monthly" }] : []),
                                                                  ...(allowYearly ? [{ value: "Yearly", label: t("entitlements.promotions.yearly") || "Yearly" }] : []),
                                                                  ...(allowLifetime ? [{ value: "Lifetime", label: t("entitlements.promotions.lifetime") || "Lifetime" }] : []),
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
                                                            <Label>{t("entitlements.promotions.requiresCode") || "Requires Promo Code"}</Label>
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
                                                            <Label>{t("entitlements.promotions.duration") || "Discount Duration"}</Label>
                                                            <GenericSelect
                                                                  type="single"
                                                                  options={[
                                                                        { value: "forever", label: t("entitlements.promotions.forever") || "Forever" },
                                                                        { value: "30", label: t("entitlements.promotions.oneMonth") || "1 Month" },
                                                                        { value: "90", label: t("entitlements.promotions.threeMonths") || "3 Months" },
                                                                        { value: "180", label: t("entitlements.promotions.sixMonths") || "6 Months" },
                                                                        { value: "365", label: t("entitlements.promotions.oneYear") || "1 Year" },
                                                                        { value: "730", label: t("entitlements.promotions.twoYears") || "2 Years" },
                                                                        { value: "custom", label: t("entitlements.promotions.custom") || "Custom..." },
                                                                  ]}
                                                                  value={
                                                                        vm.form.durationDays === 0 ? "forever"
                                                                              : vm.form.durationDays === 30 ? "30"
                                                                                    : vm.form.durationDays === 90 ? "90"
                                                                                          : vm.form.durationDays === 180 ? "180"
                                                                                                : vm.form.durationDays === 365 ? "365"
                                                                                                      : vm.form.durationDays === 730 ? "730"
                                                                                                            : "custom"
                                                                  }
                                                                  onValueChange={(v: string | string[]) => {
                                                                        const val = typeof v === "string" ? v : v[0];
                                                                        if (val === "forever") vm.setField("durationDays", 0);
                                                                        else if (val === "custom") { /* keep current value */ }
                                                                        else vm.setField("durationDays", parseInt(val));
                                                                  }}
                                                            />
                                                            {/* Custom days input — shown when duration doesn't match a preset */}
                                                            {![0, 30, 90, 180, 365, 730].includes(vm.form.durationDays) && (
                                                                  <Input
                                                                        type="number"
                                                                        min={1}
                                                                        value={vm.form.durationDays || ""}
                                                                        onChange={(e) => vm.setField("durationDays", parseInt(e.target.value) || 0)}
                                                                        placeholder={t("entitlements.promotions.customDays") || "Enter days..."}
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
                                                                        {t("entitlements.promotions.firstTimeOnly") || "First-Time Only"}
                                                                  </Label>
                                                            </div>
                                                      </div>
                                                </div>
                                          </>
                                    )}

                                    {/* Validity Dates */}
                                    <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1.5">
                                                <Label>{t("entitlements.promotions.validFrom") || "Valid From"}</Label>
                                                <DatePicker
                                                      value={vm.form.validFrom}
                                                      onChange={(v) => vm.setField("validFrom", v)}
                                                      placeholder={t("entitlements.promotions.validFrom") || "Valid From"}
                                                />
                                          </div>
                                          <div className="space-y-1.5">
                                                <Label>{t("entitlements.promotions.validUntil") || "Valid Until"}</Label>
                                                <DatePicker
                                                      value={vm.form.validUntil}
                                                      onChange={(v) => vm.setField("validUntil", v)}
                                                      placeholder={t("entitlements.promotions.validUntil") || "Valid Until"}
                                                />
                                          </div>
                                    </div>

                                    {/* Max Redemptions */}
                                    <div className="space-y-1.5">
                                          <Label>{t("entitlements.promotions.maxRedemptions") || "Max Redemptions"}</Label>
                                          <Input
                                                type="number"
                                                min={0}
                                                value={vm.form.maxRedemptions}
                                                onChange={(e) => vm.setField("maxRedemptions", e.target.value)}
                                                placeholder={t("entitlements.promotions.unlimited") || "Leave empty for unlimited"}
                                          />
                                    </div>
                              </div>

                              <DialogFooter>
                                    <Button variant="ghost" onClick={vm.closeDialog}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button
                                          onClick={() => vm.submit()}
                                          disabled={vm.isSubmitting || !vm.form.name}
                                          className="gradient-primary"
                                    >
                                          {vm.isSubmitting && <Loader2 className="h-4 w-4 animate-spin me-1" />}
                                          {vm.isEditing
                                                ? (t("common.save") || "Save")
                                                : (t("common.create") || "Create")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            </div>
      );
}

// ── Promotion Card ──

function PromotionCard({
      promo, onEdit, onDelete, onToggle, isToggling, isDeleting, t,
}: {
      promo: EditionPromotion;
      onEdit: () => void;
      onDelete: () => void;
      onToggle: () => void;
      isToggling: boolean;
      isDeleting: boolean;
      t: (key: string) => string;
}) {
      return (
            <Card className={`transition-all ${!promo.isActive ? "opacity-60" : ""}`}>
                  <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                              {/* Left: Info */}
                              <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-sm">{promo.name}</span>
                                          <Badge variant={promo.isActive ? "default" : "secondary"} className="text-[10px]">
                                                {promo.isActive
                                                      ? (t("common.active") || "Active")
                                                      : (t("common.inactive") || "Inactive")}
                                          </Badge>
                                          {promo.isExpired && (
                                                <Badge variant="destructive" className="text-[10px]">
                                                      {t("entitlements.promotions.expired") || "Expired"}
                                                </Badge>
                                          )}
                                          {promo.hasReachedLimit && (
                                                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                                                      {t("entitlements.promotions.limitReached") || "Limit Reached"}
                                                </Badge>
                                          )}
                                          {promo.data.firstTimeOnly && (
                                                <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
                                                      <ShieldCheck className="h-3 w-3 me-0.5" />
                                                      {t("entitlements.promotions.firstTimeOnly") || "First-Time Only"}
                                                </Badge>
                                          )}
                                    </div>

                                    {/* Discount info */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                          <span className="flex items-center gap-1">
                                                {promo.type === "Percentage" ? (
                                                      <Percent className="h-3 w-3" />
                                                ) : (
                                                      <DollarSign className="h-3 w-3" />
                                                )}
                                                <span className="font-medium text-foreground">{promo.discountLabel}</span>
                                          </span>

                                          {promo.promoCode && (
                                                <span className="flex items-center gap-1">
                                                      <Hash className="h-3 w-3" />
                                                      <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono">
                                                            {promo.promoCode}
                                                      </code>
                                                </span>
                                          )}

                                          <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {promo.durationDays === 0 ? (t("entitlements.promotions.forever") || "Forever")
                                                      : promo.durationDays === 30 ? (t("entitlements.promotions.oneMonth") || "1 Month")
                                                            : promo.durationDays === 90 ? (t("entitlements.promotions.threeMonths") || "3 Months")
                                                                  : promo.durationDays === 180 ? (t("entitlements.promotions.sixMonths") || "6 Months")
                                                                        : promo.durationDays === 365 ? (t("entitlements.promotions.oneYear") || "1 Year")
                                                                              : promo.durationDays === 730 ? (t("entitlements.promotions.twoYears") || "2 Years")
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
                                          <p className="text-[11px] text-muted-foreground">
                                                {promo.validFrom && `${t("common.from") || "From"}: ${new Date(promo.validFrom).toLocaleDateString()}`}
                                                {promo.validFrom && promo.validUntil && " — "}
                                                {promo.validUntil && `${t("common.to") || "To"}: ${new Date(promo.validUntil).toLocaleDateString()}`}
                                          </p>
                                    )}
                              </div>

                              {/* Right: Actions */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                    <Switch
                                          checked={promo.isActive}
                                          onCheckedChange={onToggle}
                                          disabled={isToggling}
                                    />
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                          onClick={onEdit}
                                    >
                                          <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive"
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
