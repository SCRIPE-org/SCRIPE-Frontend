"use client";

import { usePermissions } from "@core/hooks/use-permissions";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@core/ui/card";
import { useRouter } from "next/navigation";
import { Settings, BarChart, Link as LinkIcon, Key, Receipt, Coins, FileText } from "lucide-react";

export function PaymentHubView() {
  const { t } = useI18n();
  const router = useRouter();
  const { isSuperAdmin } = usePermissions();

  const superAdminCards = [
    {
      title: t("paymentHub.gatewayConfig") || "Gateway Configuration",
      description: "Configure platform-level payment gateway integrations for all tenants.",
      icon: <Settings className="h-6 w-6 text-primary" />,
      href: "/payment-gateways",
    },
    {
      title: t("paymentHub.stripeConnect") || "Marketplace Accounts",
      description: "Manage connected Stripe accounts for all tenants.",
      icon: <LinkIcon className="h-6 w-6 text-primary" />,
      href: "/entitlements/stripe-connect",
    },
    {
      title: "Platform Stripe Dashboard",
      description: "View platform-wide Stripe metrics and settings.",
      icon: <BarChart className="h-6 w-6 text-primary" />,
      href: "/entitlements/platform-stripe",
    },
    {
      title: t("commission.title") || "Commission Ledger",
      description: "View raw commission ledger entries across all tenants.",
      icon: <Coins className="h-6 w-6 text-primary" />,
      href: "/entitlements/commission-ledger",
    },
    {
      title: t("commission.invoices") || "Commission Invoices",
      description: "Manage and waive commission invoices.",
      icon: <FileText className="h-6 w-6 text-primary" />,
      href: "/entitlements/commission-invoices",
    },
  ];

  const tenantAdminCards = [
    {
      title: t("paymentHub.myCredentials") || "My Gateway Credentials",
      description: "Configure your PayPal or Paymob API credentials.",
      icon: <Key className="h-6 w-6 text-primary" />,
      href: "/entitlements/tenant-gateways",
    },
    {
      title: t("paymentHub.stripeConnect") || "Payment Account",
      description: "Manage your Stripe Connect account.",
      icon: <LinkIcon className="h-6 w-6 text-primary" />,
      href: "/entitlements/stripe-connect",
    },
    {
      title: t("paymentHub.billing") || "Billing & Invoices",
      description: "View your subscription invoices and billing history.",
      icon: <Receipt className="h-6 w-6 text-primary" />,
      href: "/entitlements/invoices",
    },
    {
      title: t("commission.invoices") || "Commission Invoices",
      description: "View your commission invoices charged by the platform.",
      icon: <FileText className="h-6 w-6 text-primary" />,
      href: "/entitlements/commission-invoices",
    },
  ];

  const cards = isSuperAdmin ? superAdminCards : tenantAdminCards;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t("paymentHub.title") || "Payment Hub"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Centralized hub for all payment and billing configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(card.href)}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                {card.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
