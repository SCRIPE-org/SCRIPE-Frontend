"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useSearchParams } from "next/navigation";

/**
 * React hook/ViewModel orchestrating state and data flows for billing hub view model.
 * Handles active states updates, form fields validations, and browser navigation controllers.
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
