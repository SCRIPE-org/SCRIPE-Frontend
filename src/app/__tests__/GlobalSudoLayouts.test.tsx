import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@core/ui/layout/dashboard-layout", () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock("@core/ui/layout/modules-loading-skeleton", () => ({
  ModulesLoadingSkeleton: () => <div data-testid="modules-skeleton" />,
}));

vi.mock("@core/ui/layout/shared", () => ({
  AuthenticatedShellFrame: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-shell-frame">{children}</div>
  ),
}));

vi.mock("../(hub)/hub/hub-launchpad-fallback", () => ({
  HubLaunchpadFallback: () => <div data-testid="hub-fallback" />,
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  TenantBrandingProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tenant-branding-provider">{children}</div>
  ),
}));

vi.mock("@modules/profile/core/src/presentation/components/SudoVerificationModal", () => ({
  SudoVerificationModal: () => <div data-testid="global-sudo-verification-modal" />,
}));

import ModulesLayout from "../(modules)/layout";
import HubLaunchpadLayout from "../(hub)/hub/layout";
import StudioLayout from "../(studio)/layout";

describe("Authenticated App Router layouts SudoVerificationModal wiring (SUDO-02)", () => {
  it("mounts SudoVerificationModal exactly once inside (modules)/layout", () => {
    const { unmount } = render(
      <ModulesLayout>
        <div data-testid="modules-child">Modules Content</div>
      </ModulesLayout>
    );

    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
    expect(screen.getByTestId("modules-child")).toBeInTheDocument();
    expect(screen.getAllByTestId("global-sudo-verification-modal")).toHaveLength(1);
    unmount();
  });

  it("mounts SudoVerificationModal exactly once inside (hub)/hub/layout", () => {
    const { unmount } = render(
      <HubLaunchpadLayout>
        <div data-testid="hub-child">Hub Content</div>
      </HubLaunchpadLayout>
    );

    expect(screen.getByTestId("auth-shell-frame")).toBeInTheDocument();
    expect(screen.getByTestId("hub-child")).toBeInTheDocument();
    expect(screen.getAllByTestId("global-sudo-verification-modal")).toHaveLength(1);
    unmount();
  });

  it("mounts SudoVerificationModal exactly once inside (studio)/layout", () => {
    const { unmount } = render(
      <StudioLayout>
        <div data-testid="studio-child">Studio Content</div>
      </StudioLayout>
    );

    expect(screen.getByTestId("tenant-branding-provider")).toBeInTheDocument();
    expect(screen.getByTestId("studio-child")).toBeInTheDocument();
    expect(screen.getAllByTestId("global-sudo-verification-modal")).toHaveLength(1);
    unmount();
  });
});
