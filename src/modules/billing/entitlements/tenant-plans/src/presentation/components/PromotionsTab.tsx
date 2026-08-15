// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * PromotionsTab — Full CRUD for plan-scoped promotions.
 * Replaces the static placeholder with a live data table + create/edit dialogs.
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { SectionState } from "@core/ui/section-state";
import { EmptyState } from "@core/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Search,
  Percent,
  DollarSign,
  Gift,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTenantPlanPromotionsViewModel } from "../viewmodels/useTenantPlanPromotionsViewModel";
import type { TenantPlanPromotion } from "../../domain/entities/TenantPlan";
import type {
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../../domain/entities/TenantPlanRequests";
import type { TFn } from "./shared-helpers";
import { formatUtc } from "@core/common/utils";

interface PromotionsTabProps {
  planId: string;
  t: TFn;
}

// ── Discount type icon helper ──
function DiscountIcon({ type }: { type: string }) {
  if (type === "Percentage")
    return <Percent className="h-3.5 w-3.5 text-info" aria-hidden="true" />;
  if (type === "FixedAmount")
    return <DollarSign className="h-3.5 w-3.5 text-success" aria-hidden="true" />;
  return <Gift className="h-3.5 w-3.5 text-nx-accent" aria-hidden="true" />;
}

// ── Promo row ──
function PromoRow({
  promo,
  onEdit,
  onDelete,
  isDeleting,
  t,
}: {
  promo: TenantPlanPromotion;
  onEdit: (p: TenantPlanPromotion) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  t: TFn;
}) {
  return (
    <div className="flex items-center gap-3 rounded-nx-md border border-nx-line bg-nx-surface p-3 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi motion-reduce:transition-none">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nx-accent-wash">
        <DiscountIcon type={promo.discountType} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wider">{promo.code}</span>
          <Badge variant={promo.isActive && promo.isValid ? "success" : "secondary"}>
            {promo.isActive && promo.isValid ? (
              <>
                <CheckCircle className="me-0.5 h-2.5 w-2.5" aria-hidden="true" />
                {t("entitlements.tenantPlans.activeBadge")}
              </>
            ) : (
              <>
                <XCircle className="me-0.5 h-2.5 w-2.5" aria-hidden="true" />
                {t("entitlements.tenantPlans.inactiveBadge")}
              </>
            )}
          </Badge>
          {promo.isAutoApplied && (
            <Badge variant="outline" className="text-[10px]">
              {t("entitlements.promotions.auto")}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-nx-ink-2">
          <span>
            {promo.formattedDiscount} {t("entitlements.promotions.off")}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {promo.currentRedemptions}/{promo.maxRedemptions ?? "∞"}{" "}
            {t("entitlements.promotions.used")}
          </span>
          {promo.expiresAt && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {t("entitlements.promotions.expires")} {formatUtc(promo.expiresAt, "MMM d, yyyy")}
              </span>
            </>
          )}
        </div>
        {promo.description && (
          <p className="mt-0.5 truncate text-xs text-nx-ink-2">{promo.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(promo)}
          aria-label={t("common.edit")}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-nx-danger"
          onClick={() => onDelete(promo.id)}
          loading={isDeleting}
          aria-label={t("common.delete")}
        >
          {!isDeleting && <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}

// ── Promotion Form (create + edit) ──
function PromotionForm({
  planId,
  initial,
  onSubmit,
  isLoading,
  t,
}: {
  planId: string;
  initial?: TenantPlanPromotion;
  onSubmit: (data: CreatePromotionRequest | UpdatePromotionRequest) => void;
  isLoading: boolean;
  t: TFn;
}) {
  const [form, setForm] = useState({
    code: initial?.code ?? "",
    description: initial?.description ?? "",
    discountType: initial?.discountType ?? "Percentage",
    discountValue: initial?.discountValue ?? 10,
    maxRedemptions: initial?.maxRedemptions ?? "",
    startsAt: initial?.startsAt
      ? initial.startsAt.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    expiresAt: initial?.expiresAt ? initial.expiresAt.slice(0, 10) : "",
    isActive: initial?.isActive ?? true,
    isAutoApplied: initial?.isAutoApplied ?? false,
    isStackable: initial?.isStackable ?? false,
    minimumAmount: initial?.minimumAmount ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tenantPlanId: planId,
      code: form.code.trim().toUpperCase(),
      description: form.description || undefined,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
      startsAt: new Date(form.startsAt).toISOString(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      isActive: form.isActive,
      isAutoApplied: form.isAutoApplied,
      isStackable: form.isStackable,
      minimumAmount: form.minimumAmount ? Number(form.minimumAmount) : undefined,
    });
  };

  const checkboxFields = [
    { key: "isActive" as const, label: t("entitlements.tenantPlans.activeBadge") },
    { key: "isAutoApplied" as const, label: t("entitlements.promotions.autoApply") },
    { key: "isStackable" as const, label: t("entitlements.promotions.stackable") },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="promo-code">{t("entitlements.promotions.code")} *</Label>
          <Input
            id="promo-code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="SUMMER20"
            required
            className="font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="promo-discount-type">{t("entitlements.promotions.discountType")} *</Label>
          <Select
            value={form.discountType}
            onValueChange={(v) => setForm((f) => ({ ...f, discountType: v }))}
          >
            <SelectTrigger id="promo-discount-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Percentage">{t("entitlements.promotions.percentage")}</SelectItem>
              <SelectItem value="FixedAmount">
                {t("entitlements.promotions.fixedAmount")}
              </SelectItem>
              <SelectItem value="FreeTrial">{t("entitlements.promotions.freeTrial")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="promo-value">{t("entitlements.promotions.value")} *</Label>
          <Input
            id="promo-value"
            type="number"
            min={0}
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="promo-max-redemptions">
            {t("entitlements.promotions.maxRedemptions")}
          </Label>
          <Input
            id="promo-max-redemptions"
            type="number"
            min={1}
            value={form.maxRedemptions}
            onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
            placeholder={t("entitlements.tenantPlans.unlimitedUsers")}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="promo-starts-at">{t("entitlements.promotions.startsAt")} *</Label>
          <Input
            id="promo-starts-at"
            type="date"
            value={form.startsAt}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="promo-expires-at">{t("entitlements.promotions.expiresAt")}</Label>
          <Input
            id="promo-expires-at"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="promo-minimum-amount">{t("entitlements.promotions.minimumAmount")}</Label>
          <Input
            id="promo-minimum-amount"
            type="number"
            min={0}
            step="0.01"
            value={form.minimumAmount}
            onChange={(e) => setForm((f) => ({ ...f, minimumAmount: e.target.value }))}
            placeholder={t("entitlements.promotions.noMinimum")}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="promo-description">{t("common.description")}</Label>
        <Input
          id="promo-description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder={t("entitlements.promotions.optionalDescription")}
        />
      </div>

      <div className="flex items-center gap-6 pt-1">
        {checkboxFields.map(({ key, label }) => {
          const fieldId = `promo-${key}`;
          return (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={fieldId}
                checked={form[key]}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, [key]: checked === true }))}
              />
              <Label htmlFor={fieldId} className="cursor-pointer text-sm font-normal">
                {label}
              </Label>
            </div>
          );
        })}
      </div>

      <DialogFooter>
        <Button type="submit" loading={isLoading} className="min-w-[100px]">
          {initial ? t("common.update") : t("common.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Main Tab ──
/**
 * Presentation UI component rendering the promotions tab.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PromotionsTab({ planId, t }: PromotionsTabProps) {
  const vm = useTenantPlanPromotionsViewModel(planId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-nx-accent" aria-hidden="true" />
            <CardTitle className="text-base">
              {t("entitlements.tenantPlans.promotionsTitle")}
            </CardTitle>
            {vm.totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {vm.totalCount.toLocaleString()}
              </Badge>
            )}
          </div>
          <Button size="sm" onClick={() => vm.setIsCreateOpen(true)}>
            <Plus className="me-1 h-4 w-4" aria-hidden="true" />
            {t("common.create")}
          </Button>
        </div>
        <CardDescription>{t("entitlements.tenantPlans.promotionsDesc")}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            className="h-8 ps-8 text-sm"
            placeholder={t("entitlements.promotions.searchPlaceholder")}
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            aria-label={t("entitlements.promotions.searchPlaceholder")}
          />
        </div>

        {/* List — SectionState governs loading/error; the empty branch keeps
            its own action slot (create dialog) rather than SectionState's
            single-string default, since the user can act here. */}
        <SectionState
          isLoading={vm.isLoading}
          error={vm.error as Error | null}
          skeletonType="rows"
          skeletonRows={3}
          height={160}
        >
          {vm.promotions.length === 0 ? (
            <EmptyState
              bare
              size="sm"
              icon={Tag}
              title={t("entitlements.promotions.noPromotions")}
              description={t("entitlements.promotions.createFirst")}
              action={
                <Button size="sm" onClick={() => vm.setIsCreateOpen(true)}>
                  <Plus className="me-1 h-4 w-4" aria-hidden="true" />
                  {t("common.create")}
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {vm.promotions.map((promo) => (
                <PromoRow
                  key={promo.id}
                  promo={promo}
                  onEdit={vm.openEdit}
                  onDelete={vm.deletePromotion}
                  isDeleting={vm.isDeleting(promo.id)}
                  t={t}
                />
              ))}
            </div>
          )}
        </SectionState>

        {/* Pagination */}
        {vm.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={vm.page <= 1}
              onClick={() => vm.setPage((p) => p - 1)}
            >
              {t("common.previous")}
            </Button>
            <span className="flex items-center px-2 text-sm text-nx-ink-2">
              {vm.page} / {vm.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={vm.page >= vm.totalPages}
              onClick={() => vm.setPage((p) => p + 1)}
            >
              {t("common.next")}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={vm.isCreateOpen} onOpenChange={vm.setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" aria-hidden="true" />
              {t("entitlements.promotions.newPromotion")}
            </DialogTitle>
          </DialogHeader>
          <PromotionForm
            planId={planId}
            onSubmit={(data) => vm.createPromotion(data as CreatePromotionRequest)}
            isLoading={vm.isCreating}
            t={t}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={vm.isEditOpen} onOpenChange={vm.setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" aria-hidden="true" />
              {t("entitlements.promotions.editPromotion")}
            </DialogTitle>
          </DialogHeader>
          {vm.selectedPromotion && (
            <PromotionForm
              planId={planId}
              initial={vm.selectedPromotion}
              onSubmit={(data) =>
                vm.updatePromotion({
                  id: vm.selectedPromotion!.id,
                  data: data as UpdatePromotionRequest,
                })
              }
              isLoading={vm.isUpdating}
              t={t}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
