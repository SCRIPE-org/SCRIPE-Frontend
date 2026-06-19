"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";

interface OAuthAppMetadataCardProps {
  createdAt?: string | null;
  modifiedAt?: string | null;
  tenantId?: string | null;
}

export function OAuthAppMetadataCard({
  createdAt,
  modifiedAt,
  tenantId,
}: OAuthAppMetadataCardProps) {
  const { t } = useI18n();

  return (
    <Card className="border border-border/80 bg-card/45 backdrop-blur-md p-4 space-y-3">
      <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Clock className="h-4 w-4" />
        {t("oauthApps.metadata") || "Information"}
      </h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between border-b border-border/40 pb-1.5">
          <span className="text-muted-foreground">
            {t("common.createdAt") || "Created"}:
          </span>
          <span className="font-medium text-foreground">
            {createdAt ? format(new Date(createdAt), "MMM d, yyyy HH:mm") : "—"}
          </span>
        </div>
        <div className="flex justify-between border-b border-border/40 pb-1.5">
          <span className="text-muted-foreground">
            {t("common.modifiedAt") || "Last modified"}:
          </span>
          <span className="font-medium text-foreground">
            {modifiedAt ? format(new Date(modifiedAt), "MMM d, yyyy HH:mm") : "—"}
          </span>
        </div>
        {tenantId && (
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-muted-foreground">
              {t("oauthApps.tenantScoped") || "Tenant"}:
            </span>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-border/80">
              {tenantId}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
