/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import {
  Globe,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Server,
  Building2,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { WebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormEndpointSectionProps {
  vm: WebhookFormViewModel;
}

interface ScopeOption {
  value: string;
  icon: LucideIcon;
  labelKey: string;
  descKey: string;
}

const PLATFORM_SCOPES: ScopeOption[] = [
  {
    value: "platform_only",
    icon: Server,
    labelKey: "webhooks.scopePlatformOnly",
    descKey: "webhooks.scopePlatformOnlyDesc",
  },
  {
    value: "all_tenants",
    icon: Globe,
    labelKey: "webhooks.scopeAllTenants",
    descKey: "webhooks.scopeAllTenantsDesc",
  },
];

const TENANT_SCOPES: ScopeOption[] = [
  {
    value: "tenant_only",
    icon: Building2,
    labelKey: "webhooks.scopeTenantOnly",
    descKey: "webhooks.scopeTenantOnlyDesc",
  },
  {
    value: "tenant_with_children",
    icon: Users,
    labelKey: "webhooks.scopeTenantWithChildren",
    descKey: "webhooks.scopeTenantWithChildrenDesc",
  },
];

// Accent tint on selection, hairline at rest — the tint's border needs a
// color-mix, since --nx-accent holds a complete colour and Tailwind silently
// drops slash-alpha on it (badge.tsx's own alpha rule).
const scopeTileClass = (selected: boolean) =>
  selected
    ? "border-[color:color-mix(in_srgb,var(--nx-accent)_45%,transparent)] bg-nx-accent-wash"
    : "border-nx-line hover:border-nx-line-hi hover:bg-nx-hover";

const scopeIconClass = (selected: boolean) =>
  selected ? "bg-nx-accent-wash text-nx-accent" : "bg-nx-raised text-nx-ink-2";

/**
 * Presentation UI component rendering the webhook form endpoint section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhookFormEndpointSection({ vm }: WebhookFormEndpointSectionProps) {
  const { t } = useI18n();
  const scopeOptions = vm.isPlatformScope ? PLATFORM_SCOPES : TENANT_SCOPES;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-info/10 text-info">
          <Globe className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-nx-ink">
            {t("webhooks.form.endpointSection")}
          </h3>
          <p className="text-xs text-nx-ink-2">{t("webhooks.form.endpointSectionDesc")}</p>
        </div>
      </div>

      {/* Endpoint URL */}
      <div className="space-y-2">
        <Label htmlFor="webhook-url" className="text-sm font-medium">
          {t("webhooks.url")}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <ShieldCheck className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
          </div>
          <Input
            id="webhook-url"
            placeholder={t("webhooks.urlPlaceholder")}
            value={vm.url}
            onChange={(e) => vm.setUrl(e.target.value)}
            aria-invalid={!!vm.urlError}
            className={`ps-9 font-mono text-sm ${
              !vm.urlError && vm.url ? "border-success/50" : ""
            }`}
          />
          {vm.url && !vm.urlError && (
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
              <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            </div>
          )}
        </div>
        {vm.urlError && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
            {vm.urlError}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="webhook-desc" className="text-sm font-medium">
          {t("webhooks.description_field")}
        </Label>
        <Textarea
          id="webhook-desc"
          placeholder={t("webhooks.descriptionPlaceholder")}
          value={vm.description}
          onChange={(e) => vm.setDescription(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* Scope Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t("webhooks.scope.label")}</Label>
        <RadioGroup
          value={vm.scope}
          onValueChange={(val) => vm.setScope(val as any)}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {scopeOptions.map((option) => {
            const selected = vm.scope === option.value;
            const tileId = `scope-${option.value}`;
            return (
              <Label
                key={option.value}
                htmlFor={tileId}
                className={`flex cursor-pointer flex-col items-stretch gap-3 rounded-nx-lg border-2 p-4 transition-[color,background-color,border-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none ${scopeTileClass(selected)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-nx-sm p-1.5 ${scopeIconClass(selected)}`}>
                      <option.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="text-sm font-semibold text-nx-ink">{t(option.labelKey)}</span>
                  </div>
                  <RadioGroupItem value={option.value} id={tileId} />
                </div>
                <p className="ms-8 text-xs leading-relaxed text-nx-ink-2">{t(option.descKey)}</p>
              </Label>
            );
          })}
        </RadioGroup>
      </div>
    </section>
  );
}
