/**
 * PlanDetailsCard — Edition & Plan Information
 *
 * Shows edition name, subscription type, expiry behavior,
 * fallback edition, and date information.
 */
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { CalendarDays, Clock, Crown, Package, RefreshCcw, Shield, Sparkles } from "lucide-react";
import { TYPE_VARIANTS, TYPE_KEY_MAP } from "../../constants";
import { InfoRow } from "./InfoRow";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";

interface PlanDetailsCardProps {
  sub: SubscriptionListItem;
  t: (key: string) => string;
}

export function PlanDetailsCard({ sub, t }: PlanDetailsCardProps) {
  const typeKey = TYPE_KEY_MAP[sub.type] ?? sub.type;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            {t("entSubscriptions.planDetails") || "Plan Details"}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow
          icon={<Crown className="h-3.5 w-3.5" />}
          label={t("entSubscriptions.edition") || "Edition"}
          value={sub.editionName}
        />
        <Separator />
        <InfoRow
          icon={<RefreshCcw className="h-3.5 w-3.5" />}
          label={t("entSubscriptions.type") || "Type"}
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
        <InfoRow
          icon={<Shield className="h-3.5 w-3.5" />}
          label={t("entSubscriptions.expiryBehavior") || "On Expiry"}
          value={
            <Badge variant="outline" className="text-[11px]">
              {sub.expiryBehavior === "Fallback" ? "↓ Fallback" : "⏸ Suspend"}
            </Badge>
          }
        />
        {sub.fallbackEditionName && (
          <>
            <Separator />
            <InfoRow
              icon={<Sparkles className="h-3.5 w-3.5" />}
              label={t("entSubscriptions.fallbackEdition") || "Fallback Edition"}
              value={sub.fallbackEditionName}
              muted
            />
          </>
        )}
        <Separator />
        <InfoRow
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          label={t("entSubscriptions.startDate") || "Start Date"}
          value={sub.startDate ? format(new Date(sub.startDate), "MMM d, yyyy") : "—"}
        />
        <Separator />
        <InfoRow
          icon={<Clock className="h-3.5 w-3.5" />}
          label={t("common.createdAt") || "Created"}
          value={sub.createdAt ? format(new Date(sub.createdAt), "MMM d, yyyy") : "—"}
          muted
        />
      </CardContent>
    </Card>
  );
}
