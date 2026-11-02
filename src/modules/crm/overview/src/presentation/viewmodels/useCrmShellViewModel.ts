"use client";

import { useState, useCallback } from "react";
import type { CrmTabId } from "../components/CrmShell";

/**
 * ViewModel hook coordinating shell tab switching and global CRM search bar state.
 * @param initialTab - Initial active tab identifier (default: "overview").
 * @returns State and navigation handlers for the CRM shell wrapper.
 */
export function useCrmShellViewModel(initialTab: CrmTabId = "overview") {
  const [activeTab, setActiveTab] = useState<CrmTabId>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleTabChange = useCallback((tab: CrmTabId) => {
    setActiveTab(tab);
  }, []);

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
