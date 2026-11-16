"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { SectionInfoPopover } from "../../components/SectionInfoPopover";
import type {
  PatScopeOption,
  PersonalAccessToken,
} from "../../viewmodels/useIntegrationsFederationViewModel";
import type { IntegrationsPatQuotaItem } from "./IntegrationsTelemetryStrip";
import { PatScopeBadgeWithInspector } from "./PatScopeBadgeWithInspector";
import { ArrowUpRight, Clock, Code2, Key, Network, Plus, RefreshCw, SlidersHorizontal, Trash2 } from "lucide-react";

function formatPatDate(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

/** Props for PatConsoleListSection. */
export interface PatConsoleListSectionProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  personalTokens: PersonalAccessToken[];
  scopeCatalog?: PatScopeOption[];
  patQuota?: IntegrationsPatQuotaItem | null;
  isRollingToken: boolean;
  isRevokingToken: boolean;
  onOpenCreate: () => void;
  onRequestRoll: (token: PersonalAccessToken) => void;
  onRequestRevoke: (token: PersonalAccessToken) => void;
}

/**
 * Personal Access Tokens ledger displaying localized bilingual permission badges,
 * hover/focus scope inspectors, deep-links to /account/integrations/[id], and Sudo actions.
 */
export function PatConsoleListSection({
  t,
  personalTokens,
  scopeCatalog = [],
  patQuota,
  isRollingToken,
  isRevokingToken,
  onOpenCreate,
  onRequestRoll,
  onRequestRevoke,
}: PatConsoleListSectionProps) {
  const { language } = useI18n();
  const [showTechnicalKeys, setShowTechnicalKeys] = useState(false);

  const catalogByCode = new Map<string, PatScopeOption>();
  for (const s of scopeCatalog) catalogByCode.set(s.code.toLowerCase(), s);

  const remainingSlots =
    patQuota && !patQuota.isUnlimited
      ? (patQuota.remaining ?? Math.max(0, patQuota.maxLimit - patQuota.activeCount))
      : null;
  const isQuotaReached = Boolean(
    patQuota && !patQuota.isUnlimited && (remainingSlots ?? 1) <= 0
  );

  const resolveScopeOption = (pat: PersonalAccessToken, code: string): PatScopeOption => {
    const match =
      pat.scopeDetails?.find((d) => d.code.toLowerCase() === code.toLowerCase()) ??
      catalogByCode.get(code.toLowerCase());
    if (match) return match;
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
  };

  return (
    <Card
      data-testid="integrations-pat-console-card"
      className="border border-nx-line bg-nx-surface hover:border-nx-line-hi transition-colors"
    >
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-nx-accent shrink-0" aria-hidden="true" />
            <CardTitle className="text-base font-bold text-nx-ink">
              {t("profile.integrations.patTitle")}
            </CardTitle>
            <SectionInfoPopover i18nPrefix="profile.infoPopover.personalAccessTokens" />
          </div>
          <CardDescription className="text-xs text-nx-ink-3 mt-1">
            {t("profile.integrations.patSubtitle")}
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {personalTokens.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-nx-line bg-nx-ground px-2.5 py-1">
              <Code2 className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
              <Label htmlFor="list-show-keys-switch" className="text-[11px] text-nx-ink-2 cursor-pointer">
                {t("profile.integrations.showTechnicalKeysLabel")}
              </Label>
              <Switch
                id="list-show-keys-switch"
                checked={showTechnicalKeys}
                onCheckedChange={setShowTechnicalKeys}
              />
            </div>
          )}

          {isQuotaReached && (
            <Badge
              data-testid="pat-quota-reached-badge"
              variant="warning"
              className="text-[11px] font-semibold"
            >
              {t("profile.integrations.quotaReachedBadge")}
            </Badge>
          )}
          <Button
            type="button"
            size="sm"
            data-testid="open-create-pat-modal-btn"
            disabled={isQuotaReached}
            title={
              isQuotaReached
                ? t("profile.integrations.quotaReachedHint", {
                    max: patQuota?.maxLimit ?? personalTokens.length,
                  })
                : undefined
            }
            onClick={onOpenCreate}
            className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5 w-fit"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t("profile.integrations.createTokenBtn")}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isQuotaReached && (
          <div
            data-testid="pat-quota-reached-hint"
            className="p-3 rounded-xl border border-warning-strong/30 bg-warning/10 text-xs text-nx-ink-2"
          >
            {t("profile.integrations.quotaReachedHint", {
              max: patQuota?.maxLimit ?? personalTokens.length,
            })}
          </div>
        )}
        {personalTokens.length === 0 ? (
          <div className="p-6 rounded-xl border border-nx-line bg-nx-ground text-center space-y-2">
            <p className="text-xs font-semibold text-nx-ink">
              {t("profile.integrations.emptyTokensTitle")}
            </p>
            <p className="text-xs text-nx-ink-3">{t("profile.integrations.emptyTokensDesc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {personalTokens.map((pat) => {
              const detailHref = `/account/integrations/${encodeURIComponent(pat.id)}`;
              const visibleScopes = pat.scopes.slice(0, 6);
              const overflowCount = Math.max(0, pat.scopes.length - visibleScopes.length);

              return (
                <div
                  key={pat.id}
                  data-testid={`pat-row-${pat.id}`}
                  className="p-4 rounded-xl border border-nx-line bg-nx-ground flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 hover:border-nx-line-hi transition-colors"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={detailHref}
                        data-testid={`inspect-pat-link-${pat.id}`}
                        className="inline-flex items-center gap-1 text-sm font-bold text-nx-ink hover:text-nx-accent transition-colors"
                      >
                        <span>{pat.name}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
                      </Link>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] border-nx-line bg-nx-surface text-nx-ink-2"
                      >
                        <bdi dir="ltr">{pat.prefix}...</bdi>
                      </Badge>
                      {pat.rateLimitPerMinute != null && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] border-nx-line text-nx-ink-3"
                        >
                          {pat.rateLimitPerMinute} rpm
                        </Badge>
                      )}
                    </div>

                    {pat.description && (
                      <p className="text-xs text-nx-ink-2 leading-snug">{pat.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-nx-ink-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {t("profile.integrations.expiresAt")}: {formatPatDate(pat.expiresAt)}
                      </span>
                      <span>
                        {t("profile.integrations.lastUsed")}:{" "}
                        {pat.lastUsedAt
                          ? formatPatDate(pat.lastUsedAt)
                          : t("profile.integrations.neverUsed")}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {visibleScopes.map((code) => (
                        <PatScopeBadgeWithInspector
                          key={code}
                          scope={resolveScopeOption(pat, code)}
                          language={language}
                          t={t}
                          showCodeInline={showTechnicalKeys}
                        />
                      ))}
                      {overflowCount > 0 && (
                        <Link
                          href={detailHref}
                          className="text-[11px] font-medium text-nx-accent hover:underline px-1.5"
                        >
                          {t("profile.integrations.moreScopesLink", { count: overflowCount })}
                        </Link>
                      )}
                      {pat.allowedCidrs.map((cidr) => (
                        <Badge
                          key={cidr}
                          className="bg-info/15 text-info border border-info/30 text-[10px] font-mono gap-1"
                        >
                          <Network className="h-2.5 w-2.5" aria-hidden="true" />
                          <bdi dir="ltr">{cidr}</bdi>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Button type="button" variant="outline" size="sm" asChild className="h-8 text-xs font-medium gap-1.5">
                      <Link href={detailHref} data-testid={`configure-pat-btn-${pat.id}`}>
                        <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>{t("profile.integrations.inspectConfigureBtn")}</span>
                      </Link>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`roll-pat-btn-${pat.id}`}
                      onClick={() => onRequestRoll(pat)}
                      disabled={isRollingToken}
                      className="h-8 text-xs font-semibold gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{t("profile.integrations.rollTokenBtn")}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`revoke-pat-btn-${pat.id}`}
                      onClick={() => onRequestRevoke(pat)}
                      disabled={isRevokingToken}
                      className="h-8 text-xs font-semibold border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{t("profile.integrations.revokeBtn")}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
