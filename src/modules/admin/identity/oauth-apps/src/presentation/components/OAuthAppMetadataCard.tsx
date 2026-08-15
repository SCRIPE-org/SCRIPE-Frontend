"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Clock } from "lucide-react";
import { formatDateTimeUtc } from "@core/common/utils";

interface OAuthAppMetadataCardProps {
  createdAt?: string | null;
  modifiedAt?: string | null;
  tenantId?: string | null;
}

/**
 * Presentation UI component rendering the o auth app metadata card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function OAuthAppMetadataCard({
  createdAt,
  modifiedAt,
  tenantId,
}: OAuthAppMetadataCardProps) {
  const { t } = useI18n();

  return (
    <Card className="space-y-3 p-4">
      <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-nx-ink-3">
        <Clock className="h-4 w-4" aria-hidden="true" />
        {t("oauthApps.metadata")}
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between border-b border-nx-line pb-1.5">
          <span className="text-nx-ink-2">{t("common.createdAt")}:</span>
          <span className="font-medium text-nx-ink">
            {createdAt ? formatDateTimeUtc(createdAt) : "—"}
          </span>
        </div>
        <div className="flex justify-between border-b border-nx-line pb-1.5">
          <span className="text-nx-ink-2">{t("common.modifiedAt")}:</span>
          <span className="font-medium text-nx-ink">
            {modifiedAt ? formatDateTimeUtc(modifiedAt) : "—"}
          </span>
        </div>
        {tenantId && (
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-nx-ink-2">{t("oauthApps.tenantScoped")}:</span>
            <Badge variant="outline" className="px-1.5 py-0 font-mono text-[10px]">
              {tenantId}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
