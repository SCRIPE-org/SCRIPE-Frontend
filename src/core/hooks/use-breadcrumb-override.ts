"use client";

import { useEffect } from "react";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";

/**
 * useBreadcrumbOverride
 *
 * Dynamically overrides the last segment of the breadcrumb trail (e.g. for dynamic ID segments).
 * Unmounts automatically to restore default breadcrumb naming when navigating away.
 *
 * @param title - The label to show (e.g. workspace or subscription name), or null/undefined to show default.
 */
export function useBreadcrumbOverride(title: string | null | undefined) {
  useEffect(() => {
    if (!title) return;

    // Use live Zustand state directly to avoid re-renders on the page
    const setOverride = useNavigationStore.getState().setBreadcrumbOverride;
    setOverride(title);

    return () => {
      useNavigationStore.getState().setBreadcrumbOverride(null);
    };
  }, [title]);
}
