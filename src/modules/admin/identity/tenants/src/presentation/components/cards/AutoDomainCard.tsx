/**
 * AutoDomainCard — Platform-Managed Subdomain Card
 *
 * Renders auto-provisioned platform domains (e.g. *.scripe.org)
 * with status badges, SSL indicators, and one-click copy.
 * Memoized to prevent unnecessary re-renders.
 *
 * @module tenants/presentation/components/cards
 */
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { CheckCircle2, Star, ShieldCheck, Copy, ExternalLink } from "lucide-react";
import type { TenantDomain } from "../../../domain/entities/TenantDomain";

/**
 * Documentation for module export
 */
export interface AutoDomainCardProps {
  domain: TenantDomain;
  onCopy: (text: string, label?: string) => void;
}

function AutoDomainCardComponent({ domain, onCopy }: AutoDomainCardProps) {
  const { t } = useI18n();

  return (
    <Card className="border-nx-line bg-nx-surface p-4 transition-colors hover:border-nx-line-hi">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-success/10 text-success">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-mono text-sm font-semibold text-nx-ink">
                {domain.domain}
              </span>
              {domain.isPrimary && (
                <Badge
                  variant="outline"
                  className="border-info/40 bg-info/10 px-1.5 text-[10px] text-info"
                >
                  <Star className="me-1 h-3 w-3 fill-info" aria-hidden="true" />
                  {t("tenant.domainsPrimary")}
                </Badge>
              )}
              <Badge variant="outline" className="border-nx-line px-1.5 text-[10px] text-nx-ink-2">
                {t("tenant.domainsAuto")}
              </Badge>
              <Badge
                variant="outline"
                className="border-success/40 bg-success/10 px-1.5 text-[10px] text-success"
              >
                <ShieldCheck className="me-1 h-3 w-3" aria-hidden="true" />
                {t("tenant.domainsSslActive")}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-nx-ink-2">{t("tenant.domainsSystemManagedHint")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onCopy(`https://${domain.domain}`, domain.domain)}
            className="h-8 gap-1.5 text-xs text-nx-ink-2"
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            {t("common.copy")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-nx-ink-2 hover:text-nx-ink"
            asChild
          >
            <a
              href={`https://${domain.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              title={domain.domain}
              aria-label={domain.domain}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

/**
 * Documentation for React.memo
 */
export const AutoDomainCard = React.memo(AutoDomainCardComponent);
