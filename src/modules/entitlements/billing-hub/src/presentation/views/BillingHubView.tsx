"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { BillingDashboardView } from "@modules/entitlements/billing";
import { SubscriptionsOverviewView } from "@modules/entitlements/subscriptions";
import { ConnectOnboardingView } from "@modules/entitlements/stripe-connect";
import { TenantPlanComparisonView } from "@modules/entitlements/tenant-plans";
import { TenantPaymentGatewaysView } from "@modules/entitlements/tenant-gateways";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Banknote, ShieldAlert, BadgeDollarSign } from "lucide-react";
import { cn } from "@core/common/utils";
import { useBillingHubViewModel } from "../viewmodels/useBillingHubViewModel";

export function BillingHubView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { isPlatformContext, activeTab } = useBillingHubViewModel();

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground/95">
              {t("entitlements.hub.title") || "Billing & Plans Hub"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("entitlements.hub.desc") ||
                "Manage revenue dashboard, subscriptions, stripe connect, plans, and gateways."}
            </p>
          </div>
          <TabsList
            className={cn(
              "grid w-full bg-muted/40 p-1 sm:w-auto",
              isPlatformContext ? "grid-cols-3" : "grid-cols-5"
            )}
          >
            <TabsTrigger value="overview" className="gap-1.5 text-xs font-bold transition-all">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {t("entitlements.hub.tabs.overview") || "Overview"}
              </span>
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 text-xs font-bold transition-all">
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {t("entitlements.hub.tabs.subscriptions") || "Subscriptions"}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="stripe-connect"
              className="gap-1.5 text-xs font-bold transition-all"
            >
              <Banknote className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {t("entitlements.hub.tabs.stripeConnect") || "Stripe Connect"}
              </span>
            </TabsTrigger>
            {!isPlatformContext && (
              <>
                <TabsTrigger value="plans" className="gap-1.5 text-xs font-bold transition-all">
                  <BadgeDollarSign className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">
                    {t("entitlements.hub.tabs.plans") || "Plans"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="gateways" className="gap-1.5 text-xs font-bold transition-all">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">
                    {t("entitlements.hub.tabs.gateways") || "Gateways"}
                  </span>
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </div>

        <TabsContent value="overview" className="outline-none">
          <BillingDashboardView />
        </TabsContent>

        <TabsContent value="subscriptions" className="outline-none">
          <SubscriptionsOverviewView />
        </TabsContent>

        <TabsContent value="stripe-connect" className="outline-none">
          <ConnectOnboardingView />
        </TabsContent>

        {!isPlatformContext && (
          <>
            <TabsContent value="plans" className="outline-none">
              <TenantPlanComparisonView />
            </TabsContent>

            <TabsContent value="gateways" className="outline-none">
              <TenantPaymentGatewaysView />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
