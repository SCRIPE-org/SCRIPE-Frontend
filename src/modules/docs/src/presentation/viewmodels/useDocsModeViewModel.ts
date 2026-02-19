"use client";

import { useState, useCallback, useEffect } from "react";

export type DocsMode = "technical" | "commercial";

/**
 * useDocsModeViewModel — Manages the docs mode (Technical vs Commercial).
 * Persisted in localStorage so the user's choice is remembered.
 */
export function useDocsModeViewModel() {
      const [mode, setModeState] = useState<DocsMode>("technical");

      // Hydrate from localStorage on mount
      useEffect(() => {
            try {
                  const saved = localStorage.getItem("docs-mode") as DocsMode | null;
                  if (saved === "technical" || saved === "commercial") {
                        setModeState(saved);
                  }
            } catch {
                  // SSR or localStorage unavailable
            }
      }, []);

      const setMode = useCallback((newMode: DocsMode) => {
            setModeState(newMode);
            try {
                  localStorage.setItem("docs-mode", newMode);
            } catch {
                  // SSR
            }
      }, []);

      const toggleMode = useCallback(() => {
            setMode(mode === "technical" ? "commercial" : "technical");
      }, [mode, setMode]);

      const isTechnical = mode === "technical";
      const isCommercial = mode === "commercial";

      return {
            mode,
            setMode,
            toggleMode,
            isTechnical,
            isCommercial,
      };
}
