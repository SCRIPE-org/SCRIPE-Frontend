"use client";

import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import { CalendarRange, Beaker, ShoppingCart, Settings2 } from "lucide-react";
import type {
  CreateEditionRequest,
  UpdateEditionRequest,
} from "../../../domain/entities/EditionRequests";

interface WizardStepBillingProps {
  form: CreateEditionRequest | UpdateEditionRequest;
  onChange: (updates: Partial<UpdateEditionRequest | CreateEditionRequest>) => void;
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-nx-line pb-4">
      <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-nx-md bg-nx-accent-wash">
        <Icon className="h-4.5 w-4.5 text-nx-accent" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-nx-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-nx-ink-3">{desc}</p>
      </div>
    </div>
  );
}

function CycleToggle({
  id,
  label,
  desc,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-4 border px-4 py-3.5 transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none ${
        checked
          ? "border-nx-accent bg-nx-accent-wash shadow-nx-sm"
          : "border-nx-line hover:bg-nx-hover"
      }`}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-nx-ink">{label}</div>
        <div className="mt-0.5 text-xs text-nx-ink-3">{desc}</div>
      </div>
    </label>
  );
}

/**
 * Presentation UI component rendering the wizard step billing.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WizardStepBilling({ form, onChange }: WizardStepBillingProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-10">
      {/* ── Billing Cycles ── */}
      <section>
        <SectionHeader
          icon={CalendarRange}
          title={t("entitlements.editions.wizard.billingCyclesSection")}
          desc={t("entitlements.editions.wizard.billingCyclesSectionDesc")}
        />
        <div className="space-y-2">
          <CycleToggle
            id="allowMonthly"
            label={t("entitlements.editions.wizard.monthly")}
            desc={t("entitlements.editions.wizard.monthlyDesc")}
            checked={form.allowMonthly ?? false}
            onChange={(v) => onChange({ allowMonthly: v })}
          />
          <CycleToggle
            id="allowYearly"
            label={t("entitlements.editions.wizard.annual")}
            desc={t("entitlements.editions.wizard.annualDesc")}
            checked={form.allowYearly ?? false}
            onChange={(v) => onChange({ allowYearly: v })}
          />
          <CycleToggle
            id="allowLifetime"
            label={t("entitlements.editions.wizard.lifetime")}
            desc={t("entitlements.editions.wizard.lifetimeDesc")}
            checked={form.allowLifetime ?? false}
            onChange={(v) => onChange({ allowLifetime: v })}
          />
        </div>
      </section>

      {/* ── Trial Config ── */}
      <section>
        <SectionHeader
          icon={Beaker}
          title={t("entitlements.editions.wizard.trialSection")}
          desc={t("entitlements.editions.wizard.trialSectionDesc")}
        />
        <div className="space-y-4">
          <CycleToggle
            id="allowTrial"
            label={t("entitlements.editions.wizard.freeTrial")}
            desc={t("entitlements.editions.wizard.freeTrialDesc")}
            checked={form.allowTrial ?? false}
            onChange={(v) => onChange({ allowTrial: v })}
          />

          {form.allowTrial && (
            <div className="ms-6 space-y-4 border border-dashed border-nx-accent bg-nx-accent-wash p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="trialDays">
                    {t("entitlements.editions.wizard.trialDuration")}
                  </Label>
                  <Input
                    id="trialDays"
                    type="number"
                    min={1}
                    max={730}
                    value={form.trialDurationDays ?? 14}
                    onChange={(e) =>
                      onChange({ trialDurationDays: parseInt(e.target.value) || 14 })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <label
                    className="flex cursor-pointer items-center gap-2.5 pb-2"
                    htmlFor="trialIsFree"
                  >
                    <Checkbox
                      id="trialIsFree"
                      checked={form.trialIsFree ?? true}
                      onCheckedChange={(v) => onChange({ trialIsFree: !!v })}
                    />
                    <span className="text-sm font-medium">
                      {t("entitlements.editions.wizard.completelyFree")}
                    </span>
                  </label>
                </div>
                {!form.trialIsFree && (
                  <div className="space-y-2">
                    <Label htmlFor="trialDiscount">
                      {t("entitlements.editions.wizard.trialDiscount")}
                    </Label>
                    <Input
                      id="trialDiscount"
                      type="number"
                      min={0}
                      max={100}
                      value={form.trialDiscountPercent ?? 100}
                      onChange={(e) =>
                        onChange({ trialDiscountPercent: parseInt(e.target.value) || 100 })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Checkout Mode ── */}
      <section>
        <SectionHeader
          icon={ShoppingCart}
          title={t("entitlements.editions.wizard.checkoutSection")}
          desc={t("entitlements.editions.wizard.checkoutSectionDesc")}
        />
        <div className="space-y-2">
          <CycleToggle
            id="isSelfService"
            label={t("entitlements.editions.wizard.selfService")}
            desc={t("entitlements.editions.wizard.selfServiceDesc")}
            checked={form.isSelfServiceEnabled ?? true}
            onChange={(v) => onChange({ isSelfServiceEnabled: v })}
          />
          <CycleToggle
            id="isContactSalesOnly"
            label={t("entitlements.editions.wizard.contactSalesOnly")}
            desc={t("entitlements.editions.wizard.contactSalesOnlyDesc")}
            checked={form.isContactSalesOnly ?? false}
            onChange={(v) => onChange({ isContactSalesOnly: v })}
          />
        </div>
      </section>

      {/* ── Advanced Controls ── */}
      <section>
        <SectionHeader
          icon={Settings2}
          title={t("entitlements.editions.wizard.advancedSection")}
          desc={t("entitlements.editions.wizard.advancedSectionDesc")}
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gracePeriodDays">
              {t("entitlements.editions.wizard.gracePeriodDays")}
            </Label>
            <Input
              id="gracePeriodDays"
              type="number"
              min={0}
              max={365}
              value={form.gracePeriodDays ?? 0}
              onChange={(e) => onChange({ gracePeriodDays: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-nx-ink-3">
              {t("entitlements.editions.wizard.gracePeriodDaysDesc")}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxActiveSubscriptions">
              {t("entitlements.editions.wizard.maxActiveSubscriptions")}
            </Label>
            <Input
              id="maxActiveSubscriptions"
              type="number"
              min={-1}
              value={form.maxActiveSubscriptions ?? -1}
              onChange={(e) => onChange({ maxActiveSubscriptions: parseInt(e.target.value) || -1 })}
            />
            <p className="text-xs text-nx-ink-3">
              {t("entitlements.editions.wizard.maxActiveSubscriptionsDesc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
