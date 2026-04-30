import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Checkbox } from "@core/ui/checkbox";
import { useI18n } from "@core/providers/i18n-provider";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../../domain/entities/EditionRequests";

interface WizardStepBillingProps {
  form: CreateEditionRequest | UpdateEditionRequest;
  onChange: (updates: Partial<UpdateEditionRequest | CreateEditionRequest>) => void;
}

export function WizardStepBilling({ form, onChange }: WizardStepBillingProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-8">
      {/* Billing Cycles */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("entitlements.editions.wizard.allowedBillingCycles") || "Allowed Billing Cycles"}
        </h3>
        <div className="border border-border divide-y divide-border">
          {[
            {
              key: "allowMonthly" as const,
              label: t("entitlements.editions.wizard.monthly") || "Monthly",
              desc: t("entitlements.editions.wizard.monthlyDesc") || "Billed every month",
            },
            {
              key: "allowYearly" as const,
              label: t("entitlements.editions.wizard.annual") || "Annual",
              desc: t("entitlements.editions.wizard.annualDesc") || "Billed once per year (best for savings)",
            },
            {
              key: "allowLifetime" as const,
              label: t("entitlements.editions.wizard.lifetime") || "Lifetime",
              desc: t("entitlements.editions.wizard.lifetimeDesc") || "One-time payment, permanent access",
            },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30">
              <Checkbox
                id={key}
                checked={form[key] ?? false}
                onCheckedChange={(v) => onChange({ [key]: !!v })}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Trial Config */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            id="allowTrial"
            checked={form.allowTrial ?? false}
            onCheckedChange={(v) => onChange({ allowTrial: !!v })}
          />
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {t("entitlements.editions.wizard.freeTrial") || "Free Trial"}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("entitlements.editions.wizard.freeTrialDesc") || "Allow tenants to trial this edition"}
            </div>
          </div>
        </label>

        {form.allowTrial && (
          <div className="border border-dashed border-primary/40 bg-primary/5 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
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
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <Checkbox
                    id="trialIsFree"
                    checked={form.trialIsFree ?? true}
                    onCheckedChange={(v) => onChange({ trialIsFree: !!v })}
                  />
                  <span className="text-sm font-medium">
                    {t("entitlements.editions.wizard.completelyFree") || "Completely Free Trial"}
                  </span>
                </label>
              </div>
              {!form.trialIsFree && (
                <div className="space-y-1.5">
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

      {/* Self-Service Controls */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {t("entitlements.editions.wizard.checkoutMode") || "Checkout Mode"}
        </h3>
        <div className="border border-border divide-y divide-border">
          <label className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30">
            <Checkbox
              id="isSelfService"
              checked={form.isSelfServiceEnabled ?? true}
              onCheckedChange={(v) => onChange({ isSelfServiceEnabled: !!v })}
            />
            <div>
              <div className="text-sm font-medium">
                {t("entitlements.editions.wizard.selfService") || "Self-Service Checkout"}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("entitlements.editions.wizard.selfServiceDesc") || "Tenants can subscribe via Stripe Checkout without contacting sales"}
              </div>
            </div>
          </label>
          <label className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30">
            <Checkbox
              id="isContactSalesOnly"
              checked={form.isContactSalesOnly ?? false}
              onCheckedChange={(v) => onChange({ isContactSalesOnly: !!v })}
            />
            <div>
              <div className="text-sm font-medium">
                {t("entitlements.editions.wizard.contactSalesOnly") || "Contact Sales Only"}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("entitlements.editions.wizard.contactSalesOnlyDesc") || "Disables self-service; admins generate payment links manually"}
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
