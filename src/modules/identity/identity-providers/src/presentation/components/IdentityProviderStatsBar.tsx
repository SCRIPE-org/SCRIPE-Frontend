/**
 * Identity Provider Stats Bar
 *
 * Premium statistics display for identity provider management.
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
      <Card className="relative overflow-hidden border-border/80 bg-card/65 backdrop-blur-md transition-all hover:border-primary/20 hover:shadow-md">
        <div className="absolute right-0 top-0 p-3 opacity-10">
          <Fingerprint className="h-12 w-12 text-primary" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("identityProviders.statsTotal") || "Total Providers"}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">{total}</span>
            <span className="text-xs text-muted-foreground">
              {t("identityProviders.statsConfigured")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active vs Inactive */}
      <Card className="relative overflow-hidden border-border/80 bg-card/65 backdrop-blur-md transition-all hover:border-emerald-500/20 hover:shadow-md">
        <div className="absolute right-0 top-0 p-3 opacity-10">
          <Activity className="h-12 w-12 text-emerald-500" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("identityProviders.statsActive") || "Active Status"}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {active}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("identityProviders.statsActiveInactive", { active, inactive })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Protocols */}
      <Card className="relative overflow-hidden border-border/80 bg-card/65 backdrop-blur-md transition-all hover:border-indigo-500/20 hover:shadow-md">
        <div className="absolute right-0 top-0 p-3 opacity-10">
          <Radio className="h-12 w-12 text-indigo-500" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("identityProviders.statsProtocols") || "Protocols"}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {oidcCount > 0 && (
              <span className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                OIDC: {oidcCount}
              </span>
            )}
            {oauth2Count > 0 && (
              <span className="inline-flex items-center rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                OAuth2: {oauth2Count}
              </span>
            )}
            {samlCount > 0 && (
              <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                SAML: {samlCount}
              </span>
            )}
            {total === 0 && <span className="text-xs text-muted-foreground">—</span>}
          </div>
        </CardContent>
      </Card>

      {/* Scopes */}
      <Card className="relative overflow-hidden border-border/80 bg-card/65 backdrop-blur-md transition-all hover:border-violet-500/20 hover:shadow-md">
        <div className="absolute right-0 top-0 p-3 opacity-10">
          <Shield className="h-12 w-12 text-violet-500" />
        </div>
        <CardContent className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("identityProviders.statsAudience") || "Scope Audience"}
          </p>
          <div className="mt-1.5 flex gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-violet-500" />
              {t("identityProviders.statsAdmins")}{" "}
              <strong className="font-semibold text-foreground">{adminCount}</strong>
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3 text-sky-500" />
              {t("identityProviders.statsUsers")}{" "}
              <strong className="font-semibold text-foreground">{userCount}</strong>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
