"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PresentationModeState {
  isPresentationMode: boolean;
  togglePresentationMode: () => void;
  setPresentationMode: (enabled: boolean) => void;
}

export const usePresentationMode = create<PresentationModeState>()(
  persist(
    (set) => ({
      isPresentationMode: false,
      togglePresentationMode: () =>
        set((state) => ({ isPresentationMode: !state.isPresentationMode })),
      setPresentationMode: (enabled) => set({ isPresentationMode: enabled }),
    }),
    {
      name: "scripe-presentation-mode",
    }
  )
);
