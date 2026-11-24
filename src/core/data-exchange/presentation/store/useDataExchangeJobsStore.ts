"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { registerSessionCleanupCallback } from "@core/common/session-cleanup-registry";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import type { DataTransferJobDto } from "../../domain/types";

export const DATA_EXCHANGE_JOBS_STORAGE_PREFIX = "scripe_data_exchange_jobs_store";

function hasAuthenticatedPrincipal(): boolean {
  const userId = useAppStore?.getState?.()?.user?.id;
  return userId !== undefined && userId !== null && String(userId).trim().length > 0;
}

export function getDataExchangeJobsScopeKey(): string {
  let sessionTenant: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEYS.tenant_context);
      if (raw) {
        const parsed = JSON.parse(raw) as { id?: unknown } | null;
        if (typeof parsed?.id === "string" && parsed.id.trim().length > 0) {
          sessionTenant = parsed.id;
        }
      }
    } catch {
      /* ignore invalid sessionStorage JSON */
    }
  }
  const state = useAppStore?.getState?.();
  const tenantId =
    sessionTenant ??
    state?.user?.tenantId ??
    (state?.user === undefined ? state?.tenantCode : null) ??
    "platform";
  const userId = state?.user?.id ?? "anon";
  return `${tenantId}:${userId}`;
}

export function purgeDataExchangeJobsStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (
        key &&
        (key === DATA_EXCHANGE_JOBS_STORAGE_PREFIX ||
          key.startsWith(`${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:`))
      ) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore storage errors */
  }
}

const scopedSessionStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") return null;
    try {
      // Remove legacy unscoped and anonymous keys so unauthenticated routes stay clean
      window.sessionStorage.removeItem(name);
      window.sessionStorage.removeItem(`${name}:platform:anon`);
      if (!hasAuthenticatedPrincipal()) {
        return null;
      }
      return window.sessionStorage.getItem(`${name}:${getDataExchangeJobsScopeKey()}`);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(name);
      window.sessionStorage.removeItem(`${name}:platform:anon`);
      // Never persist Data Exchange UI state for unauthenticated ("anon") visitors (F12-F17)
      if (!hasAuthenticatedPrincipal()) {
        return;
      }
      window.sessionStorage.setItem(`${name}:${getDataExchangeJobsScopeKey()}`, value);
    } catch {
      /* ignore quota/security errors */
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(name);
      window.sessionStorage.removeItem(`${name}:platform:anon`);
      window.sessionStorage.removeItem(`${name}:${getDataExchangeJobsScopeKey()}`);
    } catch {
      /* ignore storage errors */
    }
  },
};

export interface DataExchangeJobsStoreState {
  jobs: DataTransferJobDto[];
  isCollapsed: boolean;
  trackJob: (job: DataTransferJobDto) => void;
  upsertJob: (job: DataTransferJobDto) => void;
  dismissJob: (jobId: string) => void;
  clearFinished: () => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  /** Rehydrates in-memory jobs for the active `${tenantId}:${userId}` scope without wiping other scopes. */
  syncScope: () => void;
  /** Clears in-memory state first and then purges all `scripe_data_exchange_jobs_store*` keys on logout. */
  reset: () => void;
}

export const useDataExchangeJobsStore = create<DataExchangeJobsStoreState>()(
  persist(
    (set) => ({
      jobs: [],
      isCollapsed: false,
      trackJob: (job: DataTransferJobDto) =>
        set((state) => {
          const index = state.jobs.findIndex((j) => j.id === job.id);
          if (index >= 0) {
            const next = [...state.jobs];
            next[index] = { ...next[index], ...job };
            return { jobs: next };
          }
          return { jobs: [job, ...state.jobs] };
        }),
      upsertJob: (job: DataTransferJobDto) =>
        set((state) => {
          const index = state.jobs.findIndex((j) => j.id === job.id);
          if (index >= 0) {
            const next = [...state.jobs];
            next[index] = { ...next[index], ...job };
            return { jobs: next };
          }
          return { jobs: [job, ...state.jobs] };
        }),
      dismissJob: (jobId: string) =>
        set((state) => ({
          jobs: state.jobs.filter((j) => j.id !== jobId),
        })),
      clearFinished: () =>
        set((state) => ({
          jobs: state.jobs.filter(
            (j) => j.status === "Queued" || j.status === "Running"
          ),
        })),
      toggleCollapsed: () =>
        set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
      syncScope: () => {
        if (typeof window === "undefined" || !hasAuthenticatedPrincipal()) {
          set({ jobs: [], isCollapsed: false });
          return;
        }
        try {
          const raw = window.sessionStorage.getItem(
            `${DATA_EXCHANGE_JOBS_STORAGE_PREFIX}:${getDataExchangeJobsScopeKey()}`
          );
          if (raw) {
            const parsed = JSON.parse(raw) as {
              state?: { jobs?: DataTransferJobDto[]; isCollapsed?: boolean };
            } | null;
            set({
              jobs: Array.isArray(parsed?.state?.jobs) ? parsed.state.jobs : [],
              isCollapsed: Boolean(parsed?.state?.isCollapsed),
            });
            return;
          }
        } catch {
          /* ignore malformed JSON */
        }
        set({ jobs: [], isCollapsed: false });
      },
      reset: () => {
        set({ jobs: [], isCollapsed: false });
        purgeDataExchangeJobsStorage();
      },
    }),
    {
      name: DATA_EXCHANGE_JOBS_STORAGE_PREFIX,
      storage: createJSONStorage(() => scopedSessionStorage),
    }
  )
);

registerSessionCleanupCallback(() => {
  useDataExchangeJobsStore.getState().reset();
});
