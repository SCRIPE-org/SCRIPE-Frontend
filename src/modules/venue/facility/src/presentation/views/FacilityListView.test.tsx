import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params?.defaultValue ? String(params.defaultValue) : key,
    language: "en" as const,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

vi.mock("@core/crud/components/generic-crud-view", () => ({
  GenericCrudView: () => <div data-testid="generic-crud-view" />,
}));

vi.mock("@modules/venue", () => ({
  VenueResourceNav: () => <nav data-testid="venue-resource-nav" />,
  VenueProfileQuickCreateDialog: () => null,
  SiteListView: () => <div data-testid="site-list-view" />,
}));

vi.mock("../viewmodels/useFacilityViewModel", () => ({
  useFacilityViewModel: () => ({
    vm: {
      items: [],
      isLoading: false,
      setIsCreateModalOpen: vi.fn(),
      refresh: vi.fn(),
    },
    searchVenueProfiles: vi.fn().mockResolvedValue([]),
    venueProfileNameById: {},
  }),
}));

import { FacilityListView } from "./FacilityListView";

describe("FacilityListView mobile tab accessibility", () => {
  it("keeps TabsList horizontally scrollable and triggers shrink-0 so Campuses & Branches never clips at 390px", () => {
    render(<FacilityListView />);

    const tabList = screen.getByRole("tablist");
    expect(tabList.className).toContain("overflow-x-auto");
    expect(tabList.className).toContain("max-w-full");
    expect(tabList.className).toContain("w-full");

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    for (const tab of tabs) {
      expect(tab.className).toContain("shrink-0");
    }
  });
});
