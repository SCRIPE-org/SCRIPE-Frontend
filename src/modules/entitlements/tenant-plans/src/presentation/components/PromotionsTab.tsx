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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@core/ui/dialog";
import {
  Tag, Plus, Pencil, Trash2, Loader2, Search,
  Percent, DollarSign, Gift, CheckCircle, XCircle,
} from "lucide-react";
import { useTenantPlanPromotionsViewModel } from "../viewmodels/useTenantPlanPromotionsViewModel";
import type { TenantPlanPromotion } from "../../domain/entities/TenantPlan";
import type { CreatePromotionRequest, UpdatePromotionRequest } from "../../domain/entities/TenantPlanRequests";
import type { TFn } from "./shared-helpers";

interface PromotionsTabProps {
  planId: string;
  t: TFn;
}

// ── Discount type icon helper ──
function DiscountIcon({ type }: { type: string }) {
  if (type === "Percentage") return <Percent className="h-3.5 w-3.5 text-blue-500" />;
  if (type === "FixedAmount") return <DollarSign className="h-3.5 w-3.5 text-green-500" />;
  return <Gift className="h-3.5 w-3.5 text-purple-500" />;
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
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/20 transition-colors">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 shrink-0">
        <DiscountIcon type={promo.discountType} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-sm font-semibold tracking-wider">{promo.code}</span>
          <Badge variant={promo.isActive && promo.isValid ? "success" : "secondary"} className="text-[10px]">
            {promo.isActive && promo.isValid ? (
              <><CheckCircle className="h-2.5 w-2.5 me-0.5" />Active</>
            ) : (
              <><XCircle className="h-2.5 w-2.5 me-0.5" />Inactive</>
            )}
          </Badge>
          {promo.isAutoApplied && (
            <Badge variant="outline" className="text-[10px]">Auto</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
          <span>{promo.formattedDiscount} off</span>
          <span>·</span>
          <span>{promo.currentRedemptions}/{promo.maxRedemptions ?? "∞"} used</span>
          {promo.expiresAt && (
            <>
              <span>·</span>
              <span>Expires {new Date(promo.expiresAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
        {promo.description && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{promo.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(promo)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
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
    startsAt: initial?.startsAt ? initial.startsAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
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
          <Label>Code *</Label>
          <Input
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="SUMMER20"
            required
            className="font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label>Discount Type *</Label>
          <select
            value={form.discountType}
            onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="Percentage">Percentage</option>
            <option value="FixedAmount">Fixed Amount</option>
            <option value="FreeTrial">Free Trial (days)</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label>Value *</Label>
          <Input
            type="number"
            min={0}
            value={form.discountValue}
            onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Max Redemptions</Label>
          <Input
            type="number"
            min={1}
            value={form.maxRedemptions}
            onChange={e => setForm(f => ({ ...f, maxRedemptions: e.target.value }))}
            placeholder="Unlimited"
          />
        </div>
        <div className="space-y-1">
          <Label>Starts At *</Label>
          <Input
            type="date"
            value={form.startsAt}
            onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Expires At</Label>
          <Input
            type="date"
            value={form.expiresAt}
            onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <Label>Minimum Amount</Label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={form.minimumAmount}
            onChange={e => setForm(f => ({ ...f, minimumAmount: e.target.value }))}
            placeholder="No minimum"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label>Description</Label>
        <Input
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Optional description"
        />
      </div>

      <div className="flex items-center gap-6 pt-1">
        {[
          { key: "isActive", label: "Active" },
          { key: "isAutoApplied", label: "Auto-Apply" },
          { key: "isStackable", label: "Stackable" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
              className="rounded border-input h-4 w-4 accent-primary"
            />
            {label}
          </label>
        ))}
      </div>

      <DialogFooter>
        <Button type="submit" loading={isLoading} className="min-w-[100px]">
          {initial ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── Main Tab ──
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
              <Badge variant="secondary" className="text-xs">{vm.totalCount}</Badge>
            )}
          </div>
          <Button size="sm" onClick={() => vm.setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            {t("common.create") || "New Promo"}
          </Button>
        </div>
        <CardDescription>
          {t("entitlements.tenantPlans.promotionsDesc") || "Discount codes and offers for this plan."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="ps-8 h-8 text-sm"
            placeholder="Search promo codes…"
            value={vm.search}
            onChange={e => vm.setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {vm.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : vm.promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Tag className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No promotions yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first promo code for this plan.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {vm.promotions.map(promo => (
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
              variant="outline" size="sm"
              disabled={vm.page <= 1}
              onClick={() => vm.setPage(p => p - 1)}
            >Previous</Button>
            <span className="flex items-center text-sm text-muted-foreground px-2">
              {vm.page} / {vm.totalPages}
            </span>
            <Button
              variant="outline" size="sm"
              disabled={vm.page >= vm.totalPages}
              onClick={() => vm.setPage(p => p + 1)}
            >Next</Button>
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={vm.isCreateOpen} onOpenChange={vm.setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              New Promotion
            </DialogTitle>
          </DialogHeader>
          <PromotionForm
            planId={planId}
            onSubmit={data => vm.createPromotion(data as CreatePromotionRequest)}
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
              Edit Promotion
            </DialogTitle>
          </DialogHeader>
          {vm.selectedPromotion && (
            <PromotionForm
              planId={planId}
              initial={vm.selectedPromotion}
              onSubmit={data =>
                vm.updatePromotion({ id: vm.selectedPromotion!.id, data: data as UpdatePromotionRequest })
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
