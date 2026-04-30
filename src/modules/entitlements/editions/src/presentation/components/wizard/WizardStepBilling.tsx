"use client";

import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import { CalendarRange, Beaker, ShoppingCart } from "lucide-react";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../../domain/entities/EditionRequests";

interface WizardStepBillingProps {
  form: CreateEditionRequest | UpdateEditionRequest;
  onChange: (updates: Partial<UpdateEditionRequest | CreateEditionRequest>) => void;
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-border mb-5">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function CycleToggle({
  id, label, desc, checked, onChange,
}: { id: string; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer border transition-all ${
        checked
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-border hover:bg-muted/30"
      }`}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </label>
  );
}

export function WizardStepBilling({ form, onChange }: WizardStepBillingProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-10">
      {/* ── Billing Cycles ── */}
      <section>
        <SectionHeader
          icon={CalendarRange}
          title={t("entitlements.editions.wizard.billingCyclesSection") || "Allowed Billing Cycles"}
          desc={t("entitlements.editions.wizard.billingCyclesSectionDesc") || "Select which billing cycles tenants can use."}
        />
        <div className="space-y-2">
          <CycleToggle
            id="allowMonthly"
            label={t("entitlements.editions.wizard.monthly") || "Monthly"}
            desc={t("entitlements.editions.wizard.monthlyDesc") || "Billed every month. Best for flexibility."}
            checked={form.allowMonthly ?? false}
            onChange={(v) => onChange({ allowMonthly: v })}
          />
          <CycleToggle
            id="allowYearly"
            label={t("entitlements.editions.wizard.annual") || "Annual"}
            desc={t("entitlements.editions.wizard.annualDesc") || "Billed once per year. Best value for tenants."}
            checked={form.allowYearly ?? false}
            onChange={(v) => onChange({ allowYearly: v })}
          />
          <CycleToggle
            id="allowLifetime"
            label={t("entitlements.editions.wizard.lifetime") || "Lifetime"}
            desc={t("entitlements.editions.wizard.lifetimeDesc") || "One-time payment for permanent access."}
            checked={form.allowLifetime ?? false}
            onChange={(v) => onChange({ allowLifetime: v })}
          />
        </div>
      </section>

      {/* ── Trial Config ── */}
      <section>
        <SectionHeader
          icon={Beaker}
          title={t("entitlements.editions.wizard.trialSection") || "Free Trial"}
          desc={t("entitlements.editions.wizard.trialSectionDesc") || "Let tenants try this edition before committing."}
        />
        <div className="space-y-4">
          <CycleToggle
            id="allowTrial"
            label={t("entitlements.editions.wizard.freeTrial") || "Enable Free Trial"}
            desc={t("entitlements.editions.wizard.freeTrialDesc") || "Allow tenants to trial this edition."}
            checked={form.allowTrial ?? false}
            onChange={(v) => onChange({ allowTrial: v })}
          />

          {form.allowTrial && (
            <div className="border border-dashed border-primary/30 bg-primary/5 p-5 space-y-4 ms-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trialDays">
                    {t("entitlements.editions.wizard.trialDuration") || "Trial Duration (days)"}
                  </Label>
                  <Input
                    id="trialDays"
                    type="number"
                    min={1}
                    max={730}
                    value={form.trialDurationDays ?? 14}
                    onChange={(e) => onChange({ trialDurationDays: parseInt(e.target.value) || 14 })}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2.5 cursor-pointer pb-2" htmlFor="trialIsFree">
                    <Checkbox
                      id="trialIsFree"
                      checked={form.trialIsFree ?? true}
                      onCheckedChange={(v) => onChange({ trialIsFree: !!v })}
                    />
                    <span className="text-sm font-medium">
                      {t("entitlements.editions.wizard.completelyFree") || "Completely free"}
                    </span>
                  </label>
                </div>
                {!form.trialIsFree && (
                  <div className="space-y-2">
                    <Label htmlFor="trialDiscount">
                      {t("entitlements.editions.wizard.trialDiscount") || "Trial Discount %"}
                    </Label>
                    <Input
                      id="trialDiscount"
                      type="number"
                      min={0}
                      max={100}
                      value={form.trialDiscountPercent ?? 100}
                      onChange={(e) => onChange({ trialDiscountPercent: parseInt(e.target.value) || 100 })}
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
          title={t("entitlements.editions.wizard.checkoutSection") || "Checkout Mode"}
          desc={t("entitlements.editions.wizard.checkoutSectionDesc") || "Control how tenants subscribe."}
        />
        <div className="space-y-2">
          <CycleToggle
            id="isSelfService"
            label={t("entitlements.editions.wizard.selfService") || "Self-Service Checkout"}
            desc={t("entitlements.editions.wizard.selfServiceDesc") || "Tenants can subscribe instantly."}
            checked={form.isSelfServiceEnabled ?? true}
            onChange={(v) => onChange({ isSelfServiceEnabled: v })}
          />
          <CycleToggle
            id="isContactSalesOnly"
            label={t("entitlements.editions.wizard.contactSalesOnly") || "Contact Sales Only"}
            desc={t("entitlements.editions.wizard.contactSalesOnlyDesc") || "Disable self-service checkout."}
            checked={form.isContactSalesOnly ?? false}
            onChange={(v) => onChange({ isContactSalesOnly: v })}
          />
        </div>
      </section>
    </div>
  );
}
