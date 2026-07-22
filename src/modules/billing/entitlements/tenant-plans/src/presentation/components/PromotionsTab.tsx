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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
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
  if (type === "Percentage") return <Percent className="h-3.5 w-3.5 text-info" />;
  if (type === "FixedAmount") return <DollarSign className="h-3.5 w-3.5 text-success" />;
  return <Gift className="h-3.5 w-3.5 text-primary" />;
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
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/20">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <DiscountIcon type={promo.discountType} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wider">{promo.code}</span>
          <Badge
            variant={promo.isActive && promo.isValid ? "success" : "secondary"}
            className="text-[10px]"
          >
            {promo.isActive && promo.isValid ? (
              <>
                <CheckCircle className="me-0.5 h-2.5 w-2.5" />
                {t("entitlements.tenantPlans.activeBadge") || "Active"}
              </>
            ) : (
              <>
                <XCircle className="me-0.5 h-2.5 w-2.5" />
                {t("entitlements.tenantPlans.inactiveBadge") || "Inactive"}
              </>
            )}
          </Badge>
          {promo.isAutoApplied && (
            <Badge variant="outline" className="text-[10px]">
              {t("entitlements.promotions.auto") || "Auto"}
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>
            {promo.formattedDiscount} {t("entitlements.promotions.off") || "off"}
          </span>
          <span>·</span>
          <span>
            {promo.currentRedemptions}/{promo.maxRedemptions ?? "∞"}{" "}
            {t("entitlements.promotions.used") || "used"}
          </span>
          {promo.expiresAt && (
            <>
              <span>·</span>
              <span>
                {t("entitlements.promotions.expires") || "Expires"}{" "}
                {formatUtc(promo.expiresAt, "MMM d, yyyy")}
              </span>
            </>
          )}
        </div>
        {promo.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{promo.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(promo)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive/80"
          onClick={() => onDelete(promo.id)}
          loading={isDeleting}
        >
          {!isDeleting && <Trash2 className="h-3.5 w-3.5" />}
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>{t("entitlements.promotions.code") || "Code"} *</Label>
          <Input
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="SUMMER20"
            required
            className="font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label>{t("entitlements.promotions.discountType") || "Discount Type"} *</Label>
          <select
            value={form.discountType}
            onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="Percentage">
              {t("entitlements.promotions.percentage") || "Percentage"}
            </option>
            <option value="FixedAmount">
              {t("entitlements.promotions.fixedAmount") || "Fixed Amount"}
            </option>
            <option value="FreeTrial">
              {t("entitlements.promotions.freeTrial") || "Free Trial (days)"}
            </option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>{t("entitlements.promotions.value") || "Value"} *</Label>
          <Input
            type="number"
            min={0}
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>{t("entitlements.promotions.maxRedemptions") || "Max Redemptions"}</Label>
          <Input
            type="number"
            min={1}
            value={form.maxRedemptions}
            onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))}
            placeholder={t("entitlements.tenantPlans.unlimitedUsers") || "Unlimited"}
          />
        </div>
        <div className="space-y-1">
          <Label>{t("entitlements.promotions.startsAt") || "Starts At"} *</Label>
          <Input
            type="date"
            value={form.startsAt}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>{t("entitlements.promotions.expiresAt") || "Expires At"}</Label>
          <Input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>{t("entitlements.promotions.minimumAmount") || "Minimum Amount"}</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.minimumAmount}
            onChange={(e) => setForm((f) => ({ ...f, minimumAmount: e.target.value }))}
            placeholder={t("entitlements.promotions.noMinimum") || "No minimum"}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>{t("common.description") || "Description"}</Label>
        <Input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder={t("entitlements.promotions.optionalDescription") || "Optional description"}
        />
      </div>

      <div className="flex items-center gap-6 pt-1">
        {[
          { key: "isActive", label: t("entitlements.tenantPlans.activeBadge") || "Active" },
          { key: "isAutoApplied", label: t("entitlements.promotions.autoApply") || "Auto-Apply" },
          { key: "isStackable", label: t("entitlements.promotions.stackable") || "Stackable" },
        ].map(({ key, label }) => (
          <label key={key} className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            {label}
          </label>
        ))}
      </div>

      <DialogFooter>
        <Button type="submit" loading={isLoading} className="min-w-[100px]">
          {initial ? t("common.updated") || "Update" : t("common.new") || "Create"}
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
            <Tag className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">
              {t("entitlements.tenantPlans.promotionsTitle") || "Promotions"}
            </CardTitle>
            {vm.totalCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {vm.totalCount}
              </Badge>
            )}
          </div>
          <Button size="sm" onClick={() => vm.setIsCreateOpen(true)}>
            <Plus className="me-1 h-4 w-4" />
            {t("common.create") || "New Promo"}
          </Button>
        </div>
        <CardDescription>
          {t("entitlements.tenantPlans.promotionsDesc") ||
            "Discount codes and offers for this plan."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-8 ps-8 text-sm"
            placeholder={t("entitlements.promotions.searchPlaceholder") || "Search promo codes…"}
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {vm.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : vm.promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Tag className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {t("entitlements.promotions.noPromotions") || "No promotions yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("entitlements.promotions.createFirst") ||
                "Create your first promo code for this plan."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {vm.promotions.map((promo) => (
              <PromoRow
                key={promo.id}
                promo={promo}
                onEdit={vm.openEdit}
                onDelete={vm.deletePromotion}
                isDeleting={vm.isDeleting}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {vm.totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={vm.page <= 1}
              onClick={() => vm.setPage((p) => p - 1)}
            >
              {t("common.previous") || "Previous"}
            </Button>
            <span className="flex items-center px-2 text-sm text-muted-foreground">
              {vm.page} / {vm.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={vm.page >= vm.totalPages}
              onClick={() => vm.setPage((p) => p + 1)}
            >
              {t("common.next") || "Next"}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={vm.isCreateOpen} onOpenChange={vm.setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t("entitlements.promotions.newPromotion") || "New Promotion"}
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
              <Pencil className="h-4 w-4" />
              {t("entitlements.promotions.editPromotion") || "Edit Promotion"}
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
