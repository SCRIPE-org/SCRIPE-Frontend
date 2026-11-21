import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { StartupPreferencesSection } from "../sections/preferences/StartupPreferencesSection";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    direction: "ltr" as const,
    language: "en" as const,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    inputStyle: "default",
  }),
}));

const t = (key: string, params?: Record<string, string | number>) => {
  if (params?.role) return `${key}:${params.role}`;
  if (params?.reason) return `${key}:${params.reason}`;
  return key;
};

const sampleWorkspaces = [
  new WorkspaceGroup({
    workspaceId: "ws-venue",
    workspaceKey: "venue",
    workspaceNameEn: "Venue Operations",
    workspaceNameAr: "عمليات المنشآت",
    workspaceIcon: "Building2",
    workspaceSortOrder: 1,
    colorHue: 145,
    colorChroma: 0.14,
    workspaceType: "Module",
    menuItems: [],
    isLocked: false,
    homeRoute: "/venue",
    platformHomeRoute: null,
    effectiveHomeRoute: "/venue",
    isPinned: false,
    pinSortOrder: null,
    accessibleItemCount: 2,
  }),
];

describe("StartupPreferencesSection — startup selector, role lock, fallback notice & impersonation guard", () => {
  it("displays activeContextKey and allows resetting a saved custom startup target", () => {
    const onReset = vi.fn();
    render(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="workspace:venue"
        activeContextKey="tenant:ahly"
        isImpersonating={false}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={onReset}
      />
    );

    expect(screen.getByTestId("startup-active-context-badge")).toHaveTextContent("tenant:ahly");
    const resetBtn = screen.getByTestId("startup-reset-btn");
    expect(resetBtn).toBeEnabled();
    fireEvent.click(resetBtn);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("disables controls and renders impersonation alert while impersonating", () => {
    render(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="workspace:venue"
        activeContextKey="tenant:ahly"
        isImpersonating={true}
        isEnforcedByRole={false}
        fallbackActive={false}
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={vi.fn()}
      />
    );

    expect(screen.getByTestId("startup-impersonation-alert")).toBeInTheDocument();
    expect(screen.getByTestId("startup-target-select")).toBeDisabled();
    expect(screen.getByTestId("startup-reset-btn")).toBeDisabled();
  });

  it("disables controls when enforced by role and renders fallback alert when active", () => {
    render(
      <StartupPreferencesSection
        t={t}
        language="en"
        startupTarget="overview"
        activeContextKey="platform"
        isImpersonating={false}
        isEnforcedByRole={true}
        enforcingRoleName="Venue Operations Role"
        fallbackActive={true}
        fallbackReason="permission_revoked"
        workspaceGroups={sampleWorkspaces}
        onStartupTargetChange={vi.fn()}
        onResetStartupTarget={vi.fn()}
      />
    );

    expect(screen.getByTestId("startup-enforced-alert")).toHaveTextContent("Venue Operations Role");
    expect(screen.getByTestId("startup-fallback-alert")).toHaveTextContent("permission_revoked");
    expect(screen.getByTestId("startup-target-select")).toBeDisabled();
    expect(screen.getByTestId("startup-reset-btn")).toBeDisabled();
  });
});
