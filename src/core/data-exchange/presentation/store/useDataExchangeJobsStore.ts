"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DataTransferJobDto } from "../../domain/types";

export interface DataExchangeJobsStoreState {
  jobs: DataTransferJobDto[];
  isCollapsed: boolean;
  trackJob: (job: DataTransferJobDto) => void;
  upsertJob: (job: DataTransferJobDto) => void;
  dismissJob: (jobId: string) => void;
  clearFinished: () => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
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
    }),
    {
      name: "scripe_data_exchange_jobs_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.sessionStorage : (null as any)
      ),
    }
  )
);
