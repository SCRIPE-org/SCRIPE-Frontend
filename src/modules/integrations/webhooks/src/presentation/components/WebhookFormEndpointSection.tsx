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
} from "lucide-react";
import type { WebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormEndpointSectionProps {
  vm: WebhookFormViewModel;
}

/**
 * Presentation UI component rendering the webhook form endpoint section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhookFormEndpointSection({ vm }: WebhookFormEndpointSectionProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Globe className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">
            {t("webhooks.form.endpointSection") || "Endpoint"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("webhooks.form.endpointSectionDesc") || "Where webhook events will be delivered"}
          </p>
        </div>
      </div>

      {/* Endpoint URL */}
      <div className="space-y-2">
        <Label htmlFor="webhook-url" className="text-sm font-medium">
          {t("webhooks.url") || "Endpoint URL"}
          <span className="ml-0.5 text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="webhook-url"
            placeholder={t("webhooks.urlPlaceholder") || "https://your-server.com/webhook"}
            value={vm.url}
            onChange={(e) => vm.setUrl(e.target.value)}
            className={`ps-9 font-mono text-sm ${
              vm.urlError
                ? "border-red-300 focus-visible:ring-red-500"
                : vm.url && !vm.urlError
                  ? "border-emerald-300 focus-visible:ring-emerald-500"
                  : ""
            }`}
          />
          {vm.url && !vm.urlError && (
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          )}
        </div>
        {vm.urlError && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {vm.urlError}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="webhook-desc" className="text-sm font-medium">
          {t("webhooks.description_field") || "Description"}
        </Label>
        <Textarea
          id="webhook-desc"
          placeholder={
            t("webhooks.descriptionPlaceholder") || "e.g. Production order notifications"
          }
          value={vm.description}
          onChange={(e) => vm.setDescription(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      {/* Scope Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t("webhooks.scope.label") || "Subscription Scope"}
        </Label>
        <RadioGroup
          value={vm.scope}
          onValueChange={(val) => vm.setScope(val as any)}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {vm.isPlatformScope ? (
            <>
              <Label
                htmlFor="scope-platform_only"
                className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all ${
                  vm.scope === "platform_only"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-md p-1.5 ${vm.scope === "platform_only" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Server className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">
                      {t("webhooks.scopePlatformOnly") || "Platform Events Only"}
                    </span>
                  </div>
                  <RadioGroupItem value="platform_only" id="scope-platform_only" />
                </div>
                <p className="ms-8 text-xs leading-relaxed text-muted-foreground">
                  {t("webhooks.scopePlatformOnlyDesc") ||
                    "System-wide events ignoring tenant actions"}
                </p>
              </Label>
              <Label
                htmlFor="scope-all_tenants"
                className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all ${
                  vm.scope === "all_tenants"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-md p-1.5 ${vm.scope === "all_tenants" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Globe className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">
                      {t("webhooks.scopeAllTenants") || "All Tenants (Global)"}
                    </span>
                  </div>
                  <RadioGroupItem value="all_tenants" id="scope-all_tenants" />
                </div>
                <p className="ms-8 text-xs leading-relaxed text-muted-foreground">
                  {t("webhooks.scopeAllTenantsDesc") || "All events across the entire platform"}
                </p>
              </Label>
            </>
          ) : (
            <>
              <Label
                htmlFor="scope-tenant_only"
                className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all ${
                  vm.scope === "tenant_only"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-md p-1.5 ${vm.scope === "tenant_only" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">
                      {t("webhooks.scopeTenantOnly") || "This Tenant Only"}
                    </span>
                  </div>
                  <RadioGroupItem value="tenant_only" id="scope-tenant_only" />
                </div>
                <p className="ms-8 text-xs leading-relaxed text-muted-foreground">
                  {t("webhooks.scopeTenantOnlyDesc") || "Events strictly from this tenant"}
                </p>
              </Label>
              <Label
                htmlFor="scope-tenant_with_children"
                className={`flex cursor-pointer flex-col gap-3 rounded-xl border-2 p-4 transition-all ${
                  vm.scope === "tenant_with_children"
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`rounded-md p-1.5 ${vm.scope === "tenant_with_children" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">
                      {t("webhooks.scopeTenantWithChildren") || "Tenant and Children"}
                    </span>
                  </div>
                  <RadioGroupItem value="tenant_with_children" id="scope-tenant_with_children" />
                </div>
                <p className="ms-8 text-xs leading-relaxed text-muted-foreground">
                  {t("webhooks.scopeTenantWithChildrenDesc") ||
                    "Events from this tenant and its descendants"}
                </p>
              </Label>
            </>
          )}
        </RadioGroup>
      </div>
    </section>
  );
}
