"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CrmTabId } from "../../types/crmSharedTypes";

/** Canonical App Router paths for every CRM workspace tab. */
export const CRM_TAB_ROUTES: Record<CrmTabId, string> = {
  overview: "/crm",
  leads: "/crm/leads",
  deals: "/crm/opportunities",
  accounts: "/crm/accounts",
  contacts: "/crm/contacts",
  activities: "/crm/activities",
  pipelines: "/crm/pipelines",
  reports: "/crm/reports",
  settings: "/crm/settings",
};

/**
 * ViewModel hook coordinating shell tab switching, route navigation, and global CRM search bar state.
 * @param initialTab - Initial active tab identifier (default: "overview").
 * @returns State and navigation handlers for the CRM shell wrapper.
 */
export function useCrmShellViewModel(initialTab: CrmTabId = "overview") {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CrmTabId>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleTabChange = useCallback(
    (tab: CrmTabId) => {
      setActiveTab(tab);
      const targetRoute = CRM_TAB_ROUTES[tab];
      if (targetRoute) {
        router.push(targetRoute);
      }
    },
    [router]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    activeTab,
    searchQuery,
    handleTabChange,
    handleSearchChange,
  };
}
