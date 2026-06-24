"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useSearchParams } from "next/navigation";

/**
 * React hook/ViewModel managing logic, state, and repository queries for billing hub view model.
 */
export function useBillingHubViewModel() {
  const tenantCode = useAppStore((s) => s.tenantCode);
  const isPlatformContext = tenantCode === null;

  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const allowedTabs = isPlatformContext
    ? ["overview", "subscriptions", "stripe-connect"]
    : ["overview", "subscriptions", "stripe-connect", "plans", "gateways"];

  const activeTab = tabParam && allowedTabs.includes(tabParam) ? tabParam : "overview";

  return {
    isPlatformContext,
    activeTab,
    allowedTabs,
  };
}
