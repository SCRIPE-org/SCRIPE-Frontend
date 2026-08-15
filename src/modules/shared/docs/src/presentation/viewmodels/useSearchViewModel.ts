"use client";

import { useState, useCallback, useEffect } from "react";
import type { SearchResult } from "../../domain/interfaces/IDocsRepository";

/**
 * Search ViewModel — handles Cmd+K modal state.
 */
export function useSearchViewModel(searchFn: (query: string) => SearchResult[]) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return {
    isSearchOpen,
    openSearch,
    closeSearch,
    searchFn,
  };
}
