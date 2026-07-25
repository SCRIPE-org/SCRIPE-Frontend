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

/**
 * Presentation UI component rendering the tenant plan step billing.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlanStepBilling({ form, updateForm, t }: TenantPlanStepBillingProps) {
  return (
    <div className="space-y-8">
      {/* ── Billing Cycles ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-nx-line pb-2">
          <h3 className="text-lg font-semibold leading-tight tracking-tight text-nx-ink">
            {t("entitlements.tenantPlans.billingCycles")}
          </h3>
          <Info className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-4">
            <div className="space-y-0.5">
              <Label htmlFor="allowMonthly" className="text-base">
                {t("entitlements.tenantPlans.allowMonthly")}
              </Label>
              <p className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.tenantPlans.billingCycleMonthlyDesc")}
              </p>
            </div>
            <Switch
              id="allowMonthly"
              checked={form.allowMonthly ?? true}
              onCheckedChange={(checked) => updateForm({ allowMonthly: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-4">
            <div className="space-y-0.5">
              <Label htmlFor="allowYearly" className="text-base">
                {t("entitlements.tenantPlans.allowYearly")}
              </Label>
              <p className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.tenantPlans.billingCycleYearlyDesc")}
              </p>
            </div>
            <Switch
              id="allowYearly"
              checked={form.allowYearly ?? false}
              onCheckedChange={(checked) => updateForm({ allowYearly: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-surface p-4">
            <div className="space-y-0.5">
              <Label htmlFor="allowLifetime" className="text-base">
                {t("entitlements.tenantPlans.allowLifetime")}
              </Label>
              <p className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.tenantPlans.billingCycleLifetimeDesc")}
              </p>
            </div>
            <Switch
              id="allowLifetime"
              checked={form.allowLifetime ?? false}
              onCheckedChange={(checked) => updateForm({ allowLifetime: checked })}
            />
          </div>
        </div>
      </div>

      {/* ── Quotas & Access ── */}
      <div className="space-y-4">
        <h3 className="border-b border-nx-line pb-2 text-lg font-semibold leading-tight tracking-tight text-nx-ink">
          {t("entitlements.tenantPlans.quotasAndAccess")}
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxUsers">{t("entitlements.tenantPlans.maxUsers")}</Label>
            <Input
              id="maxUsers"
              type="number"
              min={-1}
              value={form.maxUsers ?? -1}
              onChange={(e) => updateForm({ maxUsers: parseInt(e.target.value, 10) || -1 })}
            />
            <p className="text-xs leading-relaxed text-nx-ink-3">
              {t("entitlements.tenantPlans.maxUsersDesc")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxSubscribers" className="flex items-center gap-1.5">
              {t("entitlements.tenantPlans.maxSubscribers")}
              <span className="text-xs font-normal text-nx-ink-3">
                {t("entitlements.tenantPlans.maxSubscribersOptionalHint")}
              </span>
            </Label>
            <Input
              id="maxSubscribers"
              type="number"
              min={0}
              value={form.maxSubscribers ?? ""}
              onChange={(e) =>
                updateForm({
                  maxSubscribers: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              placeholder={t("entitlements.tenantPlans.maxSubscribersPlaceholder")}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised p-4">
          <div className="space-y-0.5">
            <Label htmlFor="isSelfServiceEnabled">
              {t("entitlements.tenantPlans.isSelfServiceEnabled")}
            </Label>
            <p className="text-sm leading-relaxed text-nx-ink-2">
              {t("entitlements.tenantPlans.isSelfServiceEnabledDesc")}
            </p>
          </div>
          <Switch
            id="isSelfServiceEnabled"
            checked={form.isSelfServiceEnabled ?? true}
            onCheckedChange={(checked) => updateForm({ isSelfServiceEnabled: checked })}
          />
        </div>
      </div>

      {/* ── Trial & Grace Period ── */}
      <div className="space-y-4">
        <h3 className="border-b border-nx-line pb-2 text-lg font-semibold leading-tight tracking-tight text-nx-ink">
          {t("entitlements.tenantPlans.trialAndGrace")}
        </h3>

        <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised p-4">
          <div className="space-y-0.5">
            <Label htmlFor="allowTrial">{t("entitlements.tenantPlans.allowTrial")}</Label>
            <p className="text-sm leading-relaxed text-nx-ink-2">
              {t("entitlements.tenantPlans.allowTrialDesc")}
            </p>
          </div>
          <Switch
            id="allowTrial"
            checked={form.allowTrial ?? false}
            onCheckedChange={(checked) => updateForm({ allowTrial: checked })}
          />
        </div>

        {form.allowTrial && (
          <div className="motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none rounded-nx-md border border-nx-accent bg-nx-accent-wash p-4 duration-nx-standard ease-nx-enter">
            <div className="max-w-xs space-y-2">
              <Label htmlFor="trialDays" className="text-nx-accent">
                {t("entitlements.tenantPlans.trialDays")}
              </Label>
              <Input
                id="trialDays"
                type="number"
                min={1}
                max={365}
                value={form.trialDays ?? 14}
                onChange={(e) => updateForm({ trialDays: parseInt(e.target.value, 10) || 14 })}
              />
              <p className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.tenantPlans.trialDaysDesc")}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2">
          <Label htmlFor="gracePeriodDays">
            {t("entitlements.tenantPlans.gracePeriodDays")}
          </Label>
          <p className="text-xs leading-relaxed text-nx-ink-3">
            {t("entitlements.tenantPlans.gracePeriodDesc")}
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
