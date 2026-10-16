/**
 * useWebhookEvents — Hook orchestrating available event discovery, category aggregation, and multi-selection.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { integrationsContainer } from "@modules/integrations/di";
import { webhookKeys } from "./useWebhooksViewModel";
import type { WebhookEventType } from "../../domain/entities/Webhook";

/**
 * Manages webhook event querying, categorizing, filtering, and selection toggles.
 *
 * @param selectedEvents Currently selected event key strings.
 * @param setSelectedEvents State setter dispatch for selected event keys.
 * @returns Filtered categories, loading state, search controls, and selection mutators.
 */
export function useWebhookEvents(
  selectedEvents: string[],
  setSelectedEvents: React.Dispatch<React.SetStateAction<string[]>>
) {
  const { webhookRepository } = integrationsContainer;

  const { data: availableEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: webhookKeys.events,
    queryFn: () => webhookRepository.getAvailableEvents(),
    staleTime: 10 * 60 * 1000,
  });

  const [eventSearchTerm, setEventSearchTerm] = useState("");

  const allEventsByCategory = (availableEvents ?? []).reduce(
    (acc, evt) => {
      if (!acc[evt.category]) acc[evt.category] = [];
      acc[evt.category].push(evt);
      return acc;
    },
    {} as Record<string, WebhookEventType[]>
  );

  const eventsByCategory = eventSearchTerm.trim()
    ? Object.entries(allEventsByCategory).reduce(
        (acc, [category, events]) => {
          const term = eventSearchTerm.trim().toLowerCase();
          const filtered = events.filter(
            (e) =>
              e.key.toLowerCase().includes(term) ||
              (e.description?.toLowerCase().includes(term) ?? false)
          );
          if (filtered.length > 0) acc[category] = filtered;
          return acc;
        },
        {} as Record<string, WebhookEventType[]>
      )
    : allEventsByCategory;

  const toggleEvent = (eventKey: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventKey) ? prev.filter((k) => k !== eventKey) : [...prev, eventKey]
    );
  };

  const selectAllInCategory = (category: string) => {
    const categoryKeys = eventsByCategory[category]?.map((e) => e.key) ?? [];
    setSelectedEvents((prev) => {
      const withoutCategory = prev.filter((e) => !categoryKeys.includes(e));
      const allSelected = categoryKeys.every((k) => prev.includes(k));
      return allSelected ? withoutCategory : [...withoutCategory, ...categoryKeys];
    });
  };

  const selectAll = () => {
    const allKeys = (availableEvents ?? []).map((e) => e.key);
    setSelectedEvents((prev) => (prev.length === allKeys.length ? [] : allKeys));
  };

  return {
    availableEvents,
    isLoadingEvents,
    eventSearchTerm,
    setEventSearchTerm,
    allEventsByCategory,
    eventsByCategory,
    toggleEvent,
    selectAllInCategory,
    selectAll,
  };
}
