// UI-EXCEPTION: compact studio layout
/**
 * QuickLinksCard — Grid of links to Stripe Dashboard pages.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import {
  ExternalLink,
  CreditCard,
  Landmark,
  Users,
  Globe,
  Code,
  Webhook,
  Activity,
  Building2,
} from "lucide-react";
import { PlatformStripeLinks } from "../../domain/entities/PlatformStripeDashboard";

interface QuickLinksCardProps {
  links: PlatformStripeLinks;
}

/**
 * React presentation component representing the quick links card UI element.
 */
export function QuickLinksCard({ links }: QuickLinksCardProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-[#635bff]" />
          <CardTitle className="text-base">{t("entitlements.platformStripe.quickLinks")}</CardTitle>
        </div>
        <CardDescription>{t("entitlements.platformStripe.quickLinksDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickLink
            icon={CreditCard}
            label={t("entitlements.platformStripe.linkPayments")}
            href={links.payments}
          />
          <QuickLink
            icon={Landmark}
            label={t("entitlements.platformStripe.linkPayouts")}
            href={links.payouts}
          />
          <QuickLink
            icon={Users}
            label={t("entitlements.platformStripe.linkConnect")}
            href={links.connect}
          />
          <QuickLink
            icon={Globe}
            label={t("entitlements.platformStripe.linkCustomers")}
            href={links.customers}
          />
          <QuickLink
            icon={Code}
            label={t("entitlements.platformStripe.linkDevelopers")}
            href={links.developers}
          />
          <QuickLink
            icon={Webhook}
            label={t("entitlements.platformStripe.linkWebhooks")}
            href={links.webhooks}
          />
          <QuickLink
            icon={Activity}
            label={t("entitlements.platformStripe.linkEvents")}
            href={links.events}
          />
          <QuickLink
            icon={Building2}
            label={t("entitlements.platformStripe.linkDashboard")}
            href={links.dashboard}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Private Subcomponent ──

function QuickLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <button
      onClick={() => window.open(href, "_blank")}
      className="group flex items-center gap-2 rounded-lg border border-border/50 p-3 text-sm font-medium transition-all duration-200 hover:border-[#635bff]/30 hover:bg-[#635bff]/5"
    >
      <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-[#635bff]" />
      <span>{label}</span>
      <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
