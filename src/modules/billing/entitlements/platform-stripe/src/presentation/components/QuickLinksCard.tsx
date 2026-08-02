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
import type { LucideIcon } from "lucide-react";
import { PlatformStripeLinks } from "../../domain/entities/PlatformStripeDashboard";

interface QuickLinksCardProps {
  links: PlatformStripeLinks;
}

/**
 * Presentation UI component rendering the quick links card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function QuickLinksCard({ links }: QuickLinksCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
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

function QuickLink({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  const { t } = useI18n();

  // A real anchor rather than a scripted window.open: these are navigations, so
  // they should be middle-clickable, copyable and announced as links.
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-surface p-3 text-sm font-medium text-nx-ink transition-[color,background-color,border-color] duration-nx-micro ease-nx-enter hover:border-nx-line-hi hover:bg-nx-hover focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
    >
      <Icon className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
      <span className="min-w-0 truncate">{label}</span>
      <ExternalLink className="ms-auto h-3 w-3 shrink-0 text-nx-ink-3" aria-hidden="true" />
      <span className="sr-only">{t("entitlements.platformStripe.opensInNewTab")}</span>
    </a>
  );
}
