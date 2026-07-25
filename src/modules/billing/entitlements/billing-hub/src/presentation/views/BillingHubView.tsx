/**
 * @file BillingHubView.tsx
 * @description View component for the billing hub. Aggregates and navigates between billing dashboard,
 * subscriptions, stripe connect, plan comparisons, and payment gateway tabs. Uses dynamic loading
 * to isolate sub-module dependencies.
 */

"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { PageHeader } from "@core/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import dynamic from "next/dynamic";

const BillingDashboardView = dynamic(
  () => import("@modules/entitlements/billing").then((m) => ({ default: m.BillingDashboardView })),
  { ssr: false }
);
const SubscriptionsOverviewView = dynamic(
  () =>
    import("@modules/entitlements/subscriptions").then((m) => ({
      default: m.SubscriptionsOverviewView,
    })),
  { ssr: false }
);
const ConnectOnboardingView = dynamic(
  () =>
    import("@modules/entitlements/stripe-connect").then((m) => ({
      default: m.ConnectOnboardingView,
    })),
  { ssr: false }
);
const TenantPlanComparisonView = dynamic(
  () =>
    import("@modules/entitlements/tenant-plans").then((m) => ({
      default: m.TenantPlanComparisonView,
    })),
  { ssr: false }
);
const TenantPaymentGatewaysView = dynamic(
  () =>
    import("@modules/entitlements/tenant-gateways").then((m) => ({
      default: m.TenantPaymentGatewaysView,
    })),
  { ssr: false }
);

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Banknote, ShieldAlert, BadgeDollarSign } from "lucide-react";
import { cn } from "@core/common/utils";
import { useBillingHubViewModel } from "../viewmodels/useBillingHubViewModel";

/**
 * Presentation UI component rendering the billing hub view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <PageHeader
          icon={CreditCard}
          title={t("entitlements.hub.title")}
          description={t("entitlements.hub.desc")}
          tabs={
            <TabsList
              variant="pill"
              className={cn(
                "grid w-full sm:w-auto",
                isPlatformContext ? "grid-cols-3" : "grid-cols-5"
              )}
            >
              <TabsTrigger value="overview" className="gap-1.5 text-xs font-bold">
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">{t("entitlements.hub.tabs.overview")}</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-1.5 text-xs font-bold">
                <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">{t("entitlements.hub.tabs.subscriptions")}</span>
              </TabsTrigger>
              <TabsTrigger value="stripe-connect" className="gap-1.5 text-xs font-bold">
                <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden md:inline">{t("entitlements.hub.tabs.stripeConnect")}</span>
              </TabsTrigger>
              {!isPlatformContext && (
                <>
                  <TabsTrigger value="plans" className="gap-1.5 text-xs font-bold">
                    <BadgeDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden md:inline">{t("entitlements.hub.tabs.plans")}</span>
                  </TabsTrigger>
                  <TabsTrigger value="gateways" className="gap-1.5 text-xs font-bold">
                    <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden md:inline">{t("entitlements.hub.tabs.gateways")}</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          }
        />

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
