import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en" as const,
    direction: "ltr" as const,
  }),
}));

vi.mock("@core/ui/page-breadcrumbs", () => ({
  PageBreadcrumbs: () => <nav data-testid="page-breadcrumbs" />,
}));

vi.mock("@core/ui/currency-display-toggle", () => ({
  CurrencyDisplayToggle: () => <button type="button" data-testid="currency-display-toggle" />,
}));

vi.mock("../components/TenantHeader", () => ({
  TenantHeader: () => <section data-testid="tenant-header" />,
}));

vi.mock("../components/TenantStats", () => ({
  TenantStats: () => <section data-testid="tenant-stats" />,
}));

vi.mock("../components/TenantTabs", () => ({
  TenantTabs: () => <section data-testid="tenant-tabs" />,
}));

vi.mock("../viewmodels/useTenantDetailViewModel", () => ({
  useTenantDetailViewModel: () => ({
    tenant: {
      id: "t-1",
      name: "SCRIPE",
      code: "SCRIPE",
      isInternal: true,
    },
    loading: false,
    error: null,
    direction: "ltr" as const,
    handleBack: vi.fn(),
    handleUpdate: vi.fn(),
    handleEnter: vi.fn(),
    breadcrumbSegments: [{ label: "Tenants", href: "/tenants" }, { label: "SCRIPE" }],
  }),
}));

import { TenantDetailPage } from "./TenantDetailPage";

describe("TenantDetailPage CurrencyDisplayToggle placement", () => {
  it("renders CurrencyDisplayToggle outside the top-right breadcrumbs row so toasts never overlap it", () => {
    render(<TenantDetailPage tenantId="t-1" />);

    const breadcrumbs = screen.getByTestId("page-breadcrumbs");
    const toggle = screen.getByTestId("currency-display-toggle");
    expect(breadcrumbs.parentElement).not.toContainElement(toggle);
  });
});
