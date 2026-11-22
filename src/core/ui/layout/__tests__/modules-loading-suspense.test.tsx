import React, { Suspense } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ModulesLayout from "../../../../app/(modules)/layout";
import ModulesLoading from "../../../../app/(modules)/loading";
import CrmLeadsLoading from "../../../../app/(modules)/(workspace-crm)/crm/leads/loading";
import CrmOpportunityDetailLoading from "../../../../app/(modules)/(workspace-crm)/crm/opportunities/[id]/loading";
import { ModulesLoadingSkeleton } from "../modules-loading-skeleton";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => (key === "common.loading" ? "Loading..." : key),
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    cardStyle: "default",
    hoverEffectType: "none",
    hoverEffectIntensity: "none",
    spacingSize: "default",
    fontSize: "default",
  }),
}));

vi.mock("@core/ui/layout/dashboard-layout", () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="persistent-dashboard-layout">
      <header data-testid="persistent-nexus-topbar">Nexus Topbar</header>
      <main data-testid="persistent-nexus-content">{children}</main>
    </div>
  ),
}));

describe("ModulesLayout Suspense & ModulesLoadingSkeleton", () => {
  it("keeps DashboardLayout mounted and renders ModulesLoadingSkeleton when an unprefetched child suspends", async () => {
    let resolveChunk!: () => void;
    let isLoaded = false;
    const chunkPromise = new Promise<void>((resolve) => {
      resolveChunk = () => {
        isLoaded = true;
        resolve();
      };
    });

    function SuspendingModulePage() {
      if (!isLoaded) {
        throw chunkPromise;
      }
      return <div data-testid="loaded-module-page">Users Directory Content</div>;
    }

    render(
      <ModulesLayout>
        <SuspendingModulePage />
      </ModulesLayout>
    );

    // Persistent DashboardLayout shell stays mounted while child suspends
    expect(screen.getByTestId("persistent-dashboard-layout")).toBeInTheDocument();
    expect(screen.getByTestId("persistent-nexus-topbar")).toBeInTheDocument();

    // DashboardLayout-compatible skeleton renders immediately (never blank or spinner)
    const skeleton = screen.getByTestId("modules-loading-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.tagName.toLowerCase()).toBe("output");
    expect(skeleton).toHaveAttribute("aria-busy", "true");
    expect(skeleton).toHaveAttribute("aria-label", "Loading...");

    // Resolve chunk and verify content replaces skeleton without unmounting DashboardLayout
    await act(async () => {
      resolveChunk();
      await chunkPromise;
    });

    expect(screen.getByTestId("persistent-dashboard-layout")).toBeInTheDocument();
    expect(screen.getByTestId("loaded-module-page")).toBeInTheDocument();
    expect(screen.queryByTestId("modules-loading-skeleton")).not.toBeInTheDocument();
  });

  it("renders accessible Nexus skeletons across ModulesLoading and CRM route loading segments", () => {
    const { unmount } = render(<ModulesLoading />);
    expect(screen.getByTestId("modules-loading-skeleton")).toHaveAttribute("data-variant", "default");
    unmount();

    const { unmount: unmountCrm } = render(<CrmLeadsLoading />);
    expect(screen.getByTestId("modules-loading-skeleton")).toHaveAttribute("data-variant", "crm");
    unmountCrm();

    const { unmount: unmountDetail } = render(<CrmOpportunityDetailLoading />);
    expect(screen.getByTestId("modules-loading-skeleton")).toHaveAttribute("data-variant", "detail");
    unmountDetail();

    const { unmount: unmountCards } = render(
      <Suspense fallback={null}>
        <ModulesLoadingSkeleton variant="cards" />
      </Suspense>
    );
    expect(screen.getByTestId("modules-loading-skeleton")).toHaveAttribute("data-variant", "cards");
    unmountCards();
  });
});
