"use client";

import { create } from "zustand";
import {
  parseDashboardThemeJson,
  DEFAULT_DASHBOARD_THEME,
  type DashboardThemeConfig,
} from "../../domain/entities/DashboardThemeConfig";
import { STORAGE_KEYS } from "@core/config/storage-keys";

interface DashboardThemeState {
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
  draft: DashboardThemeConfig;
  setDraft: (
    draft: DashboardThemeConfig | ((prev: DashboardThemeConfig) => DashboardThemeConfig)
  ) => void;
  persistedConfig: DashboardThemeConfig;
  setPersistedConfig: (config: DashboardThemeConfig) => void;
  initialize: () => void;
  updateDraft: <K extends keyof DashboardThemeConfig>(
    key: K,
    value: DashboardThemeConfig[K]
  ) => void;
  updateNested: (section: keyof DashboardThemeConfig, field: string, value: unknown) => void;
  discardDraft: () => void;
  resetToDefault: () => void;
}

/**
 * Constant definition representing use dashboard theme store.
 */
export const useDashboardThemeStore = create<DashboardThemeState>((set, get) => ({
  isStudioOpen: false,
  setIsStudioOpen: (open) => set({ isStudioOpen: open }),
  draft: { ...DEFAULT_DASHBOARD_THEME },
  setDraft: (draft) =>
    set((state) => ({
      draft: typeof draft === "function" ? draft(state.draft) : draft,
    })),
  persistedConfig: { ...DEFAULT_DASHBOARD_THEME },
  setPersistedConfig: (config) => set({ persistedConfig: config }),
  initialize: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
    const parsed = parseDashboardThemeJson(stored);
    set({ persistedConfig: parsed, draft: parsed });
  },
  updateDraft: (key, value) =>
    set((state) => ({
      draft: { ...state.draft, [key]: value },
    })),
  updateNested: (section, field, value) =>
    set((state) => ({
      draft: {
        ...state.draft,
        [section]: {
          ...(state.draft[section] as object),
          [field]: value,
        },
      },
    })),
  discardDraft: () =>
    set((state) => ({
      draft: state.persistedConfig,
      isStudioOpen: false,
    })),
  resetToDefault: () =>
    set((state) => ({
      draft: {
        ...DEFAULT_DASHBOARD_THEME,
        theme: state.persistedConfig.theme,
        sidebarCollapsed: state.persistedConfig.sidebarCollapsed,
        language: state.persistedConfig.language,
      },
    })),
}));
