"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import type { CreateTenantPlanRequest } from "../../../domain/entities/TenantPlanRequests";
import { Info } from "lucide-react";

interface TenantPlanStepBillingProps {
  form: Partial<CreateTenantPlanRequest>;
  updateForm: (updates: Partial<CreateTenantPlanRequest>) => void;
  t: (key: string) => string;
}

export function TenantPlanStepBilling({ form, updateForm, t }: TenantPlanStepBillingProps) {
  return (
    <div className="space-y-8">
      {/* ── Billing Cycles ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <h3 className="font-semibold text-lg">{t("entitlements.tenantPlans.billingCycles") || "Billing Cycles"}</h3>
          <Info className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="space-y-0.5">
              <Label className="text-base">{t("entitlements.tenantPlans.allowMonthly") || "Monthly"}</Label>
              <p className="text-xs text-muted-foreground">Billed every month</p>
            </div>
            <Switch
              checked={form.allowMonthly ?? true}
              onCheckedChange={(checked) => updateForm({ allowMonthly: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="space-y-0.5">
              <Label className="text-base">{t("entitlements.tenantPlans.allowYearly") || "Yearly"}</Label>
              <p className="text-xs text-muted-foreground">Billed every year</p>
            </div>
            <Switch
              checked={form.allowYearly ?? false}
              onCheckedChange={(checked) => updateForm({ allowYearly: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="space-y-0.5">
              <Label className="text-base">{t("entitlements.tenantPlans.allowLifetime") || "Lifetime"}</Label>
              <p className="text-xs text-muted-foreground">One-time payment</p>
            </div>
            <Switch
              checked={form.allowLifetime ?? false}
              onCheckedChange={(checked) => updateForm({ allowLifetime: checked })}
            />
          </div>
        </div>
      </div>

      {/* ── Quotas & Access ── */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">{t("entitlements.tenantPlans.quotasAndAccess") || "Quotas & Access"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="maxUsers">{t("entitlements.tenantPlans.maxUsers") || "Max Users"} <span className="text-muted-foreground font-normal text-xs ml-1">(-1 for unlimited)</span></Label>
            <Input
              id="maxUsers"
              type="number"
              min={-1}
              value={form.maxUsers ?? -1}
              onChange={(e) => updateForm({ maxUsers: parseInt(e.target.value, 10) || -1 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxSubscribers">{t("entitlements.tenantPlans.maxSubscribers") || "Max Total Subscribers"} <span className="text-muted-foreground font-normal text-xs ml-1">(Optional)</span></Label>
            <Input
              id="maxSubscribers"
              type="number"
              min={0}
              value={form.maxSubscribers ?? ""}
              onChange={(e) => updateForm({ maxSubscribers: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              placeholder="e.g. 100 for limited release"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <Label>{t("entitlements.tenantPlans.isSelfServiceEnabled") || "Self-Service Checkout"}</Label>
            <p className="text-sm text-muted-foreground">
              {t("entitlements.tenantPlans.isSelfServiceEnabledDesc") || "Allow users to subscribe to this plan directly without admin approval."}
            </p>
          </div>
          <Switch
            checked={form.isSelfServiceEnabled ?? true}
            onCheckedChange={(checked) => updateForm({ isSelfServiceEnabled: checked })}
          />
        </div>
      </div>

      {/* ── Trial & Grace Period ── */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">{t("entitlements.tenantPlans.trialAndGrace") || "Trial & Grace Period"}</h3>
        
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <Label>{t("entitlements.tenantPlans.allowTrial") || "Allow Free Trial"}</Label>
            <p className="text-sm text-muted-foreground">
              {t("entitlements.tenantPlans.allowTrialDesc") || "Offer a free trial period before first billing."}
            </p>
          </div>
          <Switch
            checked={form.allowTrial ?? false}
            onCheckedChange={(checked) => updateForm({ allowTrial: checked })}
          />
        </div>

        {form.allowTrial && (
          <div className="p-4 rounded-lg border bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="trialDays" className="text-primary">{t("entitlements.tenantPlans.trialDays") || "Trial Duration (Days)"}</Label>
              <Input
                id="trialDays"
                type="number"
                min={1}
                max={365}
                value={form.trialDays ?? 14}
                onChange={(e) => updateForm({ trialDays: parseInt(e.target.value, 10) || 14 })}
                className="border-primary/20 focus-visible:ring-primary/30"
              />
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Label htmlFor="gracePeriodDays">{t("entitlements.tenantPlans.gracePeriodDays") || "Grace Period (Days)"}</Label>
          <p className="text-xs text-muted-foreground mb-2">
            {t("entitlements.tenantPlans.gracePeriodDesc") || "Days to allow access after billing fails before suspending."}
          </p>
          <Input
            id="gracePeriodDays"
            className="max-w-xs"
            type="number"
            min={0}
            max={30}
            value={form.gracePeriodDays ?? 3}
            onChange={(e) => updateForm({ gracePeriodDays: parseInt(e.target.value, 10) || 3 })}
          />
        </div>
      </div>
    </div>
  );
}
