/**
 * PlanDetailsCard — Edition & Plan Information
 *
 * Shows edition name, subscription type, expiry behavior,
 * fallback edition, and date information.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { DetailRow } from "@core/ui/detail-row";
import { formatUtc } from "@core/common/utils";
import { CalendarDays, Clock, Crown, Package, RefreshCcw, Shield, Sparkles } from "lucide-react";
import { TYPE_VARIANTS, TYPE_KEY_MAP } from "../../constants";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";

interface PlanDetailsCardProps {
  sub: SubscriptionListItem;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the plan details card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PlanDetailsCard({ sub, t }: PlanDetailsCardProps) {
  const typeKey = TYPE_KEY_MAP[sub.type] ?? sub.type;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash">
            <Package className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          </div>
          <CardTitle className="text-sm font-semibold">
            {t("entSubscriptions.planDetails")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <DetailRow
          icon={Crown}
          label={t("entSubscriptions.edition")}
          value={sub.editionName || "—"}
        />
        <Separator />
        <DetailRow
          icon={RefreshCcw}
          label={t("entSubscriptions.type")}
          value={
            <Badge
              variant={
                (TYPE_VARIANTS as Record<string, "default" | "secondary" | "outline">)[sub.type] ??
                "outline"
              }
              className="text-[11px]"
            >
              {t(`entSubscriptions.${typeKey}`) || sub.type}
            </Badge>
          }
        />
        <Separator />
        <DetailRow
          icon={Shield}
          label={t("entSubscriptions.expiryBehavior")}
          value={
            <Badge variant="outline" className="text-[11px]">
              {sub.expiryBehavior === "Fallback"
                ? t("entSubscriptions.onExpiryFallback")
                : t("entSubscriptions.onExpirySuspend")}
            </Badge>
          }
        />
        {sub.fallbackEditionName && (
          <>
            <Separator />
            <DetailRow
              icon={Sparkles}
              label={t("entSubscriptions.fallbackEdition")}
              value={sub.fallbackEditionName}
              valueClassName="text-nx-ink-2"
            />
          </>
        )}
        <Separator />
        <DetailRow
          icon={CalendarDays}
          label={t("entSubscriptions.startDate")}
          value={sub.startDate ? formatUtc(sub.startDate, "MMM d, yyyy") : "—"}
        />
        <Separator />
        <DetailRow
          icon={Clock}
          label={t("common.createdAt")}
          value={sub.createdAt ? formatUtc(sub.createdAt, "MMM d, yyyy") : "—"}
          valueClassName="text-nx-ink-2"
        />
      </CardContent>
    </Card>
  );
}
