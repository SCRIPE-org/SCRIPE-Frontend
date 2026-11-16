"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import type {
  PatScopeOption,
  PersonalAccessToken,
} from "../../viewmodels/useIntegrationsFederationViewModel";
import {
  classifyPatScopeAccess,
  getLocalizedPatScopeDescription,
  getLocalizedPatScopeName,
} from "../../utils/patScopeTaxonomy";
import { Code2, KeyRound, Network } from "lucide-react";

/** Props for PatDetailReadonlyPanel. */
export interface PatDetailReadonlyPanelProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  token: PersonalAccessToken;
  fallbackCatalog: PatScopeOption[];
}

/**
 * Displays the granted permission breakdown grouped by module with bilingual EN/AR titles,
 * inline descriptions, access classification, and an optional technical scope key toggle.
 */
export function PatDetailReadonlyPanel({
  t,
  language,
  token,
  fallbackCatalog,
}: PatDetailReadonlyPanelProps) {
  const [showTechnicalKeys, setShowTechnicalKeys] = useState(false);

  const catalogByCode = new Map<string, PatScopeOption>();
  for (const item of fallbackCatalog) catalogByCode.set(item.code.toLowerCase(), item);
  for (const item of token.scopeDetails) catalogByCode.set(item.code.toLowerCase(), item);

  const resolvedScopes: PatScopeOption[] = token.scopes.map((code) => {
    const existing = catalogByCode.get(code.toLowerCase());
    if (existing) return existing;
    return {
      code,
      displayName: code,
      nameEn: code,
      nameAr: code,
      descriptionEn: "",
      descriptionAr: "",
      moduleKey: code.split(/[.:]/)[0] || "General",
      category: code.split(/[.:]/)[0] || "General",
      resource: code,
      action: code.split(".").pop() || "",
      isPlatformOnly: false,
    };
  });

  const grouped = new Map<string, PatScopeOption[]>();
  for (const scope of resolvedScopes) {
    const list = grouped.get(scope.moduleKey) ?? [];
    list.push(scope);
    grouped.set(scope.moduleKey, list);
  }

  return (
    <div className="space-y-4">
      <Card className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.integrations.cidrAllowlistLabel")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-nx-ink-3">
            {t("profile.integrations.cidrPerimeterDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token.allowedCidrs.length === 0 ? (
            <p className="text-xs text-nx-ink-2">
              {t("profile.integrations.cidrUnrestrictedDetail")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {token.allowedCidrs.map((cidr) => (
                <Badge
                  key={cidr}
                  variant="outline"
                  className="bg-info/10 text-info border-info/30 text-xs font-mono"
                >
                  <bdi dir="ltr">{cidr}</bdi>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        data-testid="pat-detail-permissions-card"
        className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
      >
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
              <CardTitle className="text-base font-bold text-nx-ink">
                {t("profile.integrations.grantedScopesCardTitle")} ({resolvedScopes.length})
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-nx-ink-3 mt-1">
              {t("profile.integrations.grantedScopesCardDesc")}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-nx-line bg-nx-ground px-3 py-1.5 shrink-0">
            <Code2 className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
            <Label htmlFor="detail-show-keys-switch" className="text-xs text-nx-ink-2 cursor-pointer">
              {t("profile.integrations.showTechnicalKeysLabel")}
            </Label>
            <Switch
              id="detail-show-keys-switch"
              data-testid="pat-detail-toggle-technical-keys"
              checked={showTechnicalKeys}
              onCheckedChange={setShowTechnicalKeys}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from(grouped.entries()).map(([moduleKey, items]) => (
            <div
              key={moduleKey}
              className="rounded-xl border border-nx-line bg-nx-ground overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-nx-line bg-nx-raised flex items-center justify-between">
                <span className="text-xs font-semibold text-nx-ink">{moduleKey}</span>
                <span className="text-[11px] font-mono text-nx-ink-3">{items.length}</span>
              </div>
              <div className="divide-y divide-nx-line">
                {items.map((scope) => {
                  const tier = classifyPatScopeAccess(scope.action || scope.code);
                  const tierLabel =
                    tier === "read"
                      ? t("profile.integrations.tierReadOnly")
                      : tier === "sensitive"
                        ? t("profile.integrations.tierSensitive")
                        : t("profile.integrations.tierWrite");
                  const tierBadgeClass =
                    tier === "sensitive"
                      ? "border-destructive/35 bg-destructive/10 text-destructive"
                      : tier === "write"
                        ? "border-warning-strong/35 bg-warning/10 text-warning-strong"
                        : "border-nx-line bg-nx-surface text-nx-ink-2";
                  const desc = getLocalizedPatScopeDescription(scope, language);

                  return (
                    <div
                      key={scope.code}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-nx-ink">
                            {getLocalizedPatScopeName(scope, language)}
                          </span>
                          {showTechnicalKeys && (
                            <code
                              dir="ltr"
                              className="text-[11px] font-mono text-nx-ink-3 bg-nx-surface border border-nx-line rounded px-1.5 py-0.5"
                            >
                              {scope.code}
                            </code>
                          )}
                        </div>
                        {desc && <p className="text-xs text-nx-ink-2">{desc}</p>}
                      </div>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${tierBadgeClass}`}>
                        {tierLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
