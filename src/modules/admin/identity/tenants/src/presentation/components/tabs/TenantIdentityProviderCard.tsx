/**
 * TenantIdentityProviderCard — Flat Nexus row card for a single tenant-scoped identity provider.
 *
 * @module tenants/presentation/components/tabs
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Switch } from "@core/ui/switch";
import { cn } from "@core/common/utils";
import { CheckCircle2, PlugZap, Pencil, Trash2, AlertCircle } from "lucide-react";
import type {
  TenantIdentityProviderListItem,
  TenantIdpTestConnectionResult,
} from "../../../domain/entities/TenantIdentityProvider";

interface TenantIdentityProviderCardProps {
  provider: TenantIdentityProviderListItem;
  testResult?: TenantIdpTestConnectionResult;
  isToggling: boolean;
  isTesting: boolean;
  isLoadingDetail: boolean;
  onToggleActive: (provider: TenantIdentityProviderListItem, nextActive: boolean) => void;
  onTestConnection: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (provider: TenantIdentityProviderListItem) => void;
}

/**
 * Renders a flat Nexus slab card for a tenant-scoped identity provider with
 * protocol/status/MFA badges, active toggle switch, Test Connection action,
 * inline diagnostics banner, edit, and delete controls.
 */
export function TenantIdentityProviderCard({
  provider,
  testResult,
  isToggling,
  isTesting,
  isLoadingDetail,
  onToggleActive,
  onTestConnection,
  onEdit,
  onDelete,
}: TenantIdentityProviderCardProps) {
  const { t } = useI18n();
  const protocolLabel =
    provider.protocol === "saml"
      ? t("tenant.idpProtocolSamlShort")
      : provider.protocol === "oauth2"
        ? t("tenant.idpProtocolOAuth2Short")
        : t("tenant.idpProtocolOidcShort");

  return (
    <Card className="border-nx-line bg-nx-surface p-4 transition-colors hover:border-nx-line-hi">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-semibold text-nx-ink">{provider.name}</h4>
            <Badge variant="outline" className="font-mono text-[11px]">
              {protocolLabel}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-[11px]",
                provider.isActive
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-nx-line bg-nx-raised text-nx-ink-3"
              )}
            >
              {provider.isActive ? t("tenant.active") : t("tenant.inactive")}
            </Badge>
            {provider.trustIdpMfa && (
              <Badge
                variant="outline"
                className="border-info/30 bg-info/10 text-[11px] text-info"
              >
                {t("tenant.idpMfaTrustedBadge")}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-nx-ink-3">
            <span className="font-mono">{provider.slug}</span>
            {provider.enabledForAdmins && (
              <span className="text-nx-ink-2">{t("tenant.idpScopeAdmins")}</span>
            )}
            {provider.enabledForUsers && (
              <span className="text-nx-ink-2">{t("tenant.idpScopeUsers")}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-raised px-2.5 py-1.5">
            <span className="text-xs text-nx-ink-2">{t("tenant.active")}</span>
            <Switch
              checked={provider.isActive}
              disabled={isToggling}
              onCheckedChange={(checked) => onToggleActive(provider, checked)}
              aria-label={t("tenant.idpToggleActiveAria", { name: provider.name })}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={isTesting}
            onClick={() => onTestConnection(provider.id)}
            className="gap-1.5"
          >
            <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
            {t("tenant.idpTestConnection")}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoadingDetail}
            onClick={() => onEdit(provider.id)}
            aria-label={t("tenant.edit")}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(provider)}
            aria-label={t("tenant.delete")}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {testResult && (
        <output
          className={cn(
            "mt-3 flex items-start gap-2 rounded-nx-md border px-3 py-2 text-xs",
            testResult.isSuccess
              ? "border-success/20 bg-success/10 text-success"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          )}
        >
          {testResult.isSuccess ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium">{testResult.message}</p>
            {testResult.discoveredIssuer && (
              <p className="truncate font-mono text-[11px] opacity-90">
                {t("tenant.idpDiscoveredIssuer", { issuer: testResult.discoveredIssuer })}
              </p>
            )}
            {testResult.discoveredEndpoints.length > 0 && (
              <p className="text-[11px] opacity-90">
                {t("tenant.idpDiscoveredEndpoints", {
                  count: testResult.discoveredEndpoints.length,
                })}
              </p>
            )}
          </div>
        </output>
      )}
    </Card>
  );
}
