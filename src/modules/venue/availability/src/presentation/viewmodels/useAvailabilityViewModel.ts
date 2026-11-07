"use client";

import { useState, useCallback } from "react";
import { getVenueContainer } from "../../../../di";
import type {
  AvailabilityCalendar,
  AvailabilitySearchInput,
  AvailabilitySearchResult,
  ResourceBlock,
  ResourceBlockKind,
} from "../../domain/entities/Availability";

/**
 * Custom React hook providing the MVVM presentation layer for Resource Availability.
 *
 * Exposes state and operations for querying resource availability calendars,
 * maintenance blocks, and unified schedule lookups.
 *
 * @returns View model state and action dispatchers for availability inspection.
 */
export function useAvailabilityViewModel() {
  const { availabilityRepository } = getVenueContainer();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendar, setCalendar] = useState<AvailabilityCalendar | null>(null);
  const [blocks, setBlocks] = useState<ResourceBlock[]>([]);
  const [searchResult, setSearchResult] = useState<AvailabilitySearchResult | null>(null);

  const fetchCalendar = useCallback(
    async (resourceId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await availabilityRepository.getCurrentCalendar(resourceId);
        setCalendar(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load availability calendar");
      } finally {
        setLoading(false);
      }
    },
    [availabilityRepository]
  );

  const fetchBlocks = useCallback(
    async (kind: ResourceBlockKind, resourceId: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await availabilityRepository.getBlocks(kind, resourceId);
        setBlocks(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load resource blocks");
      } finally {
        setLoading(false);
      }
    },
    [availabilityRepository]
  );

  const searchAvailability = useCallback(
    async (input: AvailabilitySearchInput) => {
      setLoading(true);
      setError(null);
      try {
        const result = await availabilityRepository.search(input);
        setSearchResult(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search availability");
      } finally {
        setLoading(false);
      }
    },
    [availabilityRepository]
  );

  return {
    loading,
    error,
    calendar,
    blocks,
    searchResult,
    fetchCalendar,
    fetchBlocks,
    searchAvailability,
  };
}
