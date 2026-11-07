import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";
import { CRM_PERMISSIONS } from "@modules/crm";
import { CrmOverviewView } from "./CrmOverviewView";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

describe("CrmOverviewView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the CRM Command Center and Overview Shell", async () => {
    render(<CrmOverviewView />);

    // Check that title or shell renders
    expect(screen.getByText("crm.title")).toBeDefined();
    expect(screen.getByText("crm.tabs.overview")).toBeDefined();
  });

  it("enforces OVERVIEW_READ permission in PAGE_PERMISSIONS for /crm workspace root", () => {
    expect(PAGE_PERMISSIONS["/crm"]).toEqual([CRM_PERMISSIONS.OVERVIEW_READ]);
  });
});
