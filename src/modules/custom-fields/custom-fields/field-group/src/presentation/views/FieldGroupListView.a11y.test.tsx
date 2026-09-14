/**
 * FieldGroupListView -- entity-type picker accessible name (Wave 5 row 5.2)
 *
 * GenericSelect's trigger is a `role="combobox"` DIV. HTML restricts `<label
 * for>` association to labelable elements, so the visible `<Label htmlFor>`
 * beside it computes NO accessible name -- `aria-label` is opt-in on that
 * component and must be passed explicitly at every new call site.
 *
 * This file therefore does NOT stub GenericSelect (its sibling
 * FieldGroupListView.reorder.test.tsx does, to drive selection), and asserts
 * the name through `getByRole`, never `getByLabelText`: the latter passes
 * against a control with no accessible name at all, which is exactly the bug
 * class this guards.
 *
 * Confirmed by hand that deleting the `aria-label` prop on that GenericSelect
 * (leaving the `<Label htmlFor>` and matching `id` in place) fails this test.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
    setLanguage: () => {},
    registerBothLanguages: () => {},
    markModuleLoaded: () => {},
    isModuleLoaded: () => true,
  }),
}));
vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({ isSuperAdmin: false }),
}));
vi.mock("@core/providers/tenant-context-provider", () => ({
  useTenantContext: () => ({ isInTenantWorld: true }),
}));
vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({ operationSuccess: vi.fn(), operationError: vi.fn() }),
  toast: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));
vi.mock("../../../../di", () => ({
  getCustomFieldsContainer: () => ({
    fieldGroupRepository: { getByEntityType: vi.fn().mockResolvedValue([]) },
    customFieldRepository: { getEntityTypes: vi.fn().mockResolvedValue([]) },
  }),
}));

import { FieldGroupListView } from "./FieldGroupListView";

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("FieldGroupListView — entity-type picker accessibility", () => {
  it("exposes the entity-type select through getByRole with a real accessible name", () => {
    render(<FieldGroupListView />, { wrapper });

    expect(
      screen.getByRole("combobox", { name: "fieldGroup.fields.entityTypeKey" })
    ).toBeInTheDocument();
  });

  it("prompts for an entity type before showing any group list — the read endpoint has no 'all groups' mode", () => {
    render(<FieldGroupListView />, { wrapper });

    expect(screen.getByText("fieldGroup.selectEntityType.title")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
