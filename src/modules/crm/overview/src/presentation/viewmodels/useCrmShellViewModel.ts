"use client";

import { useState, useCallback } from "react";
import type { CrmTabId } from "../components/CrmShell";

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
