"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";
import type { DataTransferJobDto } from "../../domain/types";

export const DATA_EXCHANGE_JOBS_STORAGE_PREFIX = "scripe_data_exchange_jobs_store";

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
      // Remove legacy unscoped key so prior-session jobs never bleed across accounts/tenants
      window.sessionStorage.removeItem(name);
      return window.sessionStorage.getItem(`${name}:${getDataExchangeJobsScopeKey()}`);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(`${name}:${getDataExchangeJobsScopeKey()}`, value);
    } catch {
      /* ignore quota/security errors */
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(name);
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
      reset: () => {
        purgeDataExchangeJobsStorage();
        set({ jobs: [], isCollapsed: false });
      },
    }),
    {
      name: DATA_EXCHANGE_JOBS_STORAGE_PREFIX,
      storage: createJSONStorage(() => scopedSessionStorage),
    }
  )
);
