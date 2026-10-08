"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { VenueAttentionPage } from "../../domain/entities/VenueAttention";

export type VenueAttentionStage = "loading" | "ready" | "error" | "forbidden";

export function useVenueAttentionViewModel(canView: boolean) {
  const { venueAttentionRepository } = getVenueContainer();
  const [stage, setStage] = useState<VenueAttentionStage>(canView ? "loading" : "forbidden");
  const [data, setData] = useState<VenueAttentionPage | null>(null);

  const load = useCallback(async () => {
    if (!canView) {
      setStage("forbidden");
      return;
    }
    setStage("loading");
    try {
      const response = await venueAttentionRepository.get();
      setData(response);
      setStage("ready");
    } catch {
      if (process.env.NODE_ENV !== "production") {
      setStage("error");
      }
      setStage("error");
    }
  }, [canView, venueAttentionRepository]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  return { stage, data, refresh: load };
}
