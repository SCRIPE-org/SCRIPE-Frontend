"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import type { CrmPersistedBoardSettings } from "../../types/crmSharedTypes";

const CLIENT_PREFS_STORAGE_PREFIX = "scripe-crm-client-prefs";

/**
 * Resolves the active `${tenantId}:${userId}` scope key for client-only CRM preference storage.
 * @returns Scoped storage suffix preventing cross-tenant or cross-user leakage.
 */
export function getCrmClientScopeKey(): string {
  const state = useAppStore.getState();
  let contextTenantId: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEYS.tenant_context);
      if (raw) {
        const parsed = JSON.parse(raw) as { id?: string | null };
        if (parsed?.id) contextTenantId = parsed.id;
      }
    } catch {
      // Ignore malformed session tenant context
    }
  }
  const tenant = contextTenantId || state?.user?.tenantId || state?.tenantCode || "platform";
  const user = state?.user?.id || "anon";
  return `${tenant}:${user}`;
}

let pendingScopeOverride: string | null = null;
let activeExplicitScope: string | null = null;
let lastObservedAppScope: string | null = null;
const scopeSnapshotCache = new Map<string, Partial<CrmClientPrefsState>>();

function extractPrefsSnapshot(state: CrmClientPrefsState): Partial<CrmClientPrefsState> {
  return {
    defaultDealViewMode: state.defaultDealViewMode,
    boardSettings: state.boardSettings,
    tipDismissed: state.tipDismissed,
    baseCurrency: state.baseCurrency,
    defaultDealCurrency: state.defaultDealCurrency,
    userOverrideCurrency: state.userOverrideCurrency,
    autoConvertToBase: state.autoConvertToBase,
    showOriginalCurrencyOnConverted: state.showOriginalCurrencyOnConverted,
    customRateOverrides: state.customRateOverrides,
  };
}

function resolveActiveScopeKey(): string {
  if (pendingScopeOverride) return pendingScopeOverride;
  const appScope = getCrmClientScopeKey();
  if (lastObservedAppScope !== null && appScope !== lastObservedAppScope) {
    activeExplicitScope = null;
  }
  lastObservedAppScope = appScope;
  return activeExplicitScope ?? appScope;
}

function isAnonymousCrmScope(scopeKey: string): boolean {
  return !scopeKey || scopeKey === "anon" || scopeKey.endsWith(":anon");
}

const tenantScopedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      window.localStorage.removeItem(`${name}:platform:anon`);
      const scopeKey = resolveActiveScopeKey();
      if (isAnonymousCrmScope(scopeKey)) return null;
      return window.localStorage.getItem(`${name}:${scopeKey}`);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(`${name}:platform:anon`);
      const scopeKey = resolveActiveScopeKey();
      if (isAnonymousCrmScope(scopeKey)) return;
      window.localStorage.setItem(`${name}:${scopeKey}`, value);
    } catch {
      // Ignore quota / private-mode storage errors
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(`${name}:platform:anon`);
      window.localStorage.removeItem(`${name}:${resolveActiveScopeKey()}`);
    } catch {
      // Ignore storage access errors
    }
  },
};

/** Client-only UI preference defaults (zero server/domain entities). */
export const DEFAULT_CRM_CLIENT_PREFS = {
  activeScopeKey: "platform:anon",
  defaultDealViewMode: "Table" as "Kanban" | "Table" | "SplitPane",
  boardSettings: {
    swimlaneMode: "none" as const,
    cardDensity: "Standard" as const,
    wipLimits: {} as Record<string, { min?: number; max?: number }>,
  } satisfies CrmPersistedBoardSettings,
  tipDismissed: false,
  baseCurrency: "SAR",
  defaultDealCurrency: "SAR",
  userOverrideCurrency: null as string | null,
  autoConvertToBase: true,
  showOriginalCurrencyOnConverted: true,
  customRateOverrides: {} as Record<string, number>,
};

/** Client-only CRM UI preference state contract. */
export interface CrmClientPrefsState {
  activeScopeKey: string;
  defaultDealViewMode: "Kanban" | "Table" | "SplitPane";
  boardSettings: CrmPersistedBoardSettings;
  tipDismissed: boolean;
  baseCurrency: string;
  defaultDealCurrency: string;
  userOverrideCurrency: string | null;
  autoConvertToBase: boolean;
  showOriginalCurrencyOnConverted: boolean;
  customRateOverrides: Record<string, number>;

  setDefaultDealViewMode: (mode: "Kanban" | "Table" | "SplitPane") => void;
  setBoardSettings: (updated: CrmPersistedBoardSettings) => void;
  setTipDismissed: (dismissed: boolean) => void;
  setDisplayCurrencyPrefs: (prefs: Partial<{
    baseCurrency: string;
    defaultDealCurrency: string;
    userOverrideCurrency: string | null;
    autoConvertToBase: boolean;
    showOriginalCurrencyOnConverted: boolean;
  }>) => void;
  setCustomRateOverride: (currency: string, ratePerUsd: number) => void;
  resetCustomRateOverrides: () => void;
  syncScopeContext: (nextScopeKey?: string) => void;
  resetClientPrefs: () => void;
}

/** Tenant- and user-scoped Zustand store for client-only CRM UI preferences. */
export const useCrmClientPrefsStore = create<CrmClientPrefsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CRM_CLIENT_PREFS,

      setDefaultDealViewMode: (mode) => set({ defaultDealViewMode: mode }),
      setBoardSettings: (updated) => set({ boardSettings: updated }),
      setTipDismissed: (dismissed) => set({ tipDismissed: dismissed }),
      setDisplayCurrencyPrefs: (prefs) =>
        set((state) => ({
          ...state,
          ...prefs,
          baseCurrency: (prefs.baseCurrency ?? state.baseCurrency).toUpperCase(),
          defaultDealCurrency: (prefs.defaultDealCurrency ?? state.defaultDealCurrency).toUpperCase(),
        })),
      setCustomRateOverride: (currency, ratePerUsd) =>
        set((state) => ({
          customRateOverrides: {
            ...state.customRateOverrides,
            [currency.toUpperCase()]: Math.max(0.0001, ratePerUsd),
          },
        })),
      resetCustomRateOverrides: () => set({ customRateOverrides: {} }),
      syncScopeContext: (explicitScopeKey) => {
        const currentState = get();
        const nextScope = explicitScopeKey || getCrmClientScopeKey();
        if (currentState.activeScopeKey === nextScope) return;
        scopeSnapshotCache.set(currentState.activeScopeKey, extractPrefsSnapshot(currentState));
        pendingScopeOverride = nextScope;
        activeExplicitScope = explicitScopeKey ?? null;
        lastObservedAppScope = getCrmClientScopeKey();
        try {
          const raw = tenantScopedStorage.getItem(CLIENT_PREFS_STORAGE_PREFIX);
          let restored: Partial<CrmClientPrefsState> = {};
          if (typeof raw === "string") {
            try {
              const parsed = JSON.parse(raw) as { state?: Partial<CrmClientPrefsState> };
              if (parsed?.state && typeof parsed.state === "object") {
                restored = parsed.state;
              }
            } catch {
              // Ignore malformed persisted payload for target scope
            }
          }
          if (Object.keys(restored).length === 0) {
            restored = scopeSnapshotCache.get(nextScope) ?? {};
          }
          set({
            ...DEFAULT_CRM_CLIENT_PREFS,
            ...restored,
            activeScopeKey: nextScope,
          });
        } finally {
          pendingScopeOverride = null;
        }
      },
      resetClientPrefs: () => {
        scopeSnapshotCache.clear();
        activeExplicitScope = null;
        lastObservedAppScope = null;
        const scope = getCrmClientScopeKey();
        set({ ...DEFAULT_CRM_CLIENT_PREFS, activeScopeKey: scope });
      },
    }),
    {
      name: CLIENT_PREFS_STORAGE_PREFIX,
      storage: createJSONStorage(() => tenantScopedStorage),
      version: 1,
    }
  )
);
