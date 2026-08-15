"use client";

import { usePermissions } from "@core/hooks/use-permissions";
import { useI18n } from "@core/providers/i18n-provider";
import { PageHeader } from "@core/ui/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Settings,
  BarChart,
  Link as LinkIcon,
  Key,
  Receipt,
  Coins,
  FileText,
} from "lucide-react";

/**
 * Presentation UI component rendering the payment hub view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PaymentHubView() {
  const { t } = useI18n();
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();

  const superAdminCards = [
    {
      title: t("paymentHub.gatewayConfig"),
      description: "Configure platform-level payment gateway integrations for all tenants.",
      icon: <Settings className="h-6 w-6" />,
      href: "/payment-gateways",
    },
    {
      title: t("paymentHub.stripeConnect"),
      description: "Manage connected Stripe accounts for all tenants.",
      icon: <LinkIcon className="h-6 w-6" />,
      href: "/entitlements/stripe-connect",
    },
    {
      title: "Platform Stripe Dashboard",
      description: "View platform-wide Stripe metrics and settings.",
      icon: <BarChart className="h-6 w-6" />,
      href: "/entitlements/platform-stripe",
    },
    {
      title: t("commission.title"),
      description: "View raw commission ledger entries across all tenants.",
      icon: <Coins className="h-6 w-6" />,
      href: "/entitlements/commission-ledger",
    },
    {
      title: t("commission.invoices"),
      description: "Manage and waive commission invoices.",
      icon: <FileText className="h-6 w-6" />,
      href: "/entitlements/commission-invoices",
    },
  ];

  const tenantAdminCards = [
    {
      title: t("paymentHub.myCredentials"),
      description: "Configure your PayPal or Paymob API credentials.",
      icon: <Key className="h-6 w-6" />,
      href: "/entitlements/tenant-gateways",
    },
    {
      title: t("paymentHub.stripeConnect"),
      description: "Manage your Stripe Connect account.",
      icon: <LinkIcon className="h-6 w-6" />,
      href: "/entitlements/stripe-connect",
    },
    {
      title: t("paymentHub.billing"),
      description: "View your subscription invoices and billing history.",
      icon: <Receipt className="h-6 w-6" />,
      href: "/entitlements/invoices",
    },
    {
      title: t("commission.invoices"),
      description: "View your commission invoices charged by the platform.",
      icon: <FileText className="h-6 w-6" />,
      href: "/entitlements/commission-invoices",
    },
  ];

  const cards = isSuperAdmin ? superAdminCards : tenantAdminCards;

  const handleOpen = (href: string) => router.push(href);

  return (
    <div className="flex flex-col space-y-6">
      <PageHeader
        icon={Wallet}
        title={t("paymentHub.title")}
        description="Centralized hub for all payment and billing configuration."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Card
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => handleOpen(card.href)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleOpen(card.href);
              }
            }}
            className="cursor-pointer focus-visible:shadow-nx-focus focus-visible:outline-none active:shadow-[inset_0_0_0_1px_var(--nx-accent)]"
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div
                className="grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border border-nx-line bg-nx-accent-wash text-nx-accent"
                aria-hidden="true"
              >
                {card.icon}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate">{card.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{card.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
