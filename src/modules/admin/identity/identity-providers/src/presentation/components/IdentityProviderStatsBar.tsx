/**
 * Identity Provider Stats Bar
 *
 * Statistics display for identity provider management.
 * Shows totals, protocol distribution, and active status.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import type { IdentityProviderListItem } from "../../domain/entities/IdentityProvider";
import { Card, CardContent } from "@core/ui/card";
import { Shield, Users, Radio, Fingerprint, Activity } from "lucide-react";

interface Props {
  items: IdentityProviderListItem[];
}

/**
 * Presentation UI component rendering the identity provider stats bar.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function IdentityProviderStatsBar({ items }: Props) {
  const { t } = useI18n();

  const total = items.length;
  const active = items.filter((item) => item.isActive).length;
  const inactive = total - active;

  const oidcCount = items.filter((item) => item.protocol === "oidc").length;
  const oauth2Count = items.filter((item) => item.protocol === "oauth2").length;
  const samlCount = items.filter((item) => item.protocol === "saml").length;

  const adminCount = items.filter((item) => item.enabledForAdmins).length;
  const userCount = items.filter((item) => item.enabledForUsers).length;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {/* Total Configured */}
      <Card className="relative overflow-hidden">
        <div className="absolute end-0 top-0 p-3 opacity-10">
          <Fingerprint className="h-12 w-12 text-nx-accent" aria-hidden="true" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
            {t("identityProviders.statsTotal")}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums tracking-tight text-nx-ink">
              {total}
            </span>
            <span className="text-xs text-nx-ink-3">{t("identityProviders.statsConfigured")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Active vs Inactive */}
      <Card className="relative overflow-hidden">
        <div className="absolute end-0 top-0 p-3 opacity-10">
          <Activity className="h-12 w-12 text-success" aria-hidden="true" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
            {t("identityProviders.statsActive")}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums tracking-tight text-success">
              {active}
            </span>
            <span className="text-xs text-nx-ink-3">
              {t("identityProviders.statsActiveInactive", { active, inactive })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Protocols */}
      <Card className="relative overflow-hidden">
        <div className="absolute end-0 top-0 p-3 opacity-10">
          <Radio className="h-12 w-12 text-info" aria-hidden="true" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
            {t("identityProviders.statsProtocols")}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {oidcCount > 0 && (
              <span className="inline-flex items-center rounded-nx-sm bg-info/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-info">
                OIDC: {oidcCount}
              </span>
            )}
            {oauth2Count > 0 && (
              <span className="inline-flex items-center rounded-nx-sm bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-success">
                OAuth2: {oauth2Count}
              </span>
            )}
            {samlCount > 0 && (
              <span className="inline-flex items-center rounded-nx-sm bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-warning">
                SAML: {samlCount}
              </span>
            )}
            {total === 0 && <span className="text-xs text-nx-ink-3">—</span>}
          </div>
        </CardContent>
      </Card>

      {/* Scopes */}
      <Card className="relative overflow-hidden">
        <div className="absolute end-0 top-0 p-3 opacity-10">
          <Shield className="h-12 w-12 text-nx-accent" aria-hidden="true" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-nx-ink-3">
            {t("identityProviders.statsAudience")}
          </p>
          <div className="mt-1.5 flex gap-2">
            <span className="flex items-center gap-1 text-xs text-nx-ink-3">
              <Shield className="h-3 w-3 text-nx-accent" aria-hidden="true" />
              {t("identityProviders.statsAdmins")}{" "}
              <strong className="font-semibold tabular-nums text-nx-ink">{adminCount}</strong>
            </span>
            <span className="flex items-center gap-1 text-xs text-nx-ink-3">
              <Users className="h-3 w-3 text-info" aria-hidden="true" />
              {t("identityProviders.statsUsers")}{" "}
              <strong className="font-semibold tabular-nums text-nx-ink">{userCount}</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
