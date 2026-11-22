import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { RoleInfoCard } from "./RoleInfoCard";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en" as const,
  }),
}));

describe("RoleInfoCard — human-readable landing target formatting", () => {
  beforeEach(() => {
    useNavigationStore.getState().reset();
  });

  it("maps raw defaultLandingTarget tokens like workspace:contacts into readable labels instead of raw tokens", () => {
    const { rerender } = render(
      <RoleInfoCard
        role={
          {
            getLocalizedName: () => "Receptionist",
            code: "RECEPTIONIST",
            getLocalizedDescription: () => "Front desk team",
            priority: 10,
            defaultLandingTarget: "workspace:contacts",
            isLandingEnforced: true,
            hasGroups: false,
            getLocalizedGroups: () => [],
          } as never
        }
        isLoading={false}
        selectedCount={5}
        totalCount={20}
      />
    );

    expect(screen.queryByText("workspace:contacts")).not.toBeInTheDocument();
    expect(screen.getByText("roles.landingTargetWorkspacePrefix Contacts")).toBeInTheDocument();

    useNavigationStore.setState({
      workspaceGroups: [
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
          isPinned: false,
          pinSortOrder: null,
          contextScope: "TenantOnly",
          accessibleItemCount: 3,
        }),
      ],
    });

    rerender(
      <RoleInfoCard
        role={
          {
            getLocalizedName: () => "Venue Lead",
            code: "VENUE_LEAD",
            getLocalizedDescription: () => "",
            priority: 5,
            defaultLandingTarget: "workspace:venue",
            isLandingEnforced: false,
            hasGroups: false,
            getLocalizedGroups: () => [],
          } as never
        }
        isLoading={false}
        selectedCount={10}
        totalCount={20}
      />
    );

    expect(
      screen.getByText("roles.landingTargetWorkspacePrefix Venue Operations")
    ).toBeInTheDocument();

    rerender(
      <RoleInfoCard
        role={
          {
            getLocalizedName: () => "Legacy Sales",
            code: "LEGACY_SALES",
            getLocalizedDescription: () => "",
            priority: 15,
            defaultLandingTarget: "menu:retired-slug",
            isLandingEnforced: false,
            hasGroups: false,
            getLocalizedGroups: () => [],
          } as never
        }
        isLoading={false}
        selectedCount={3}
        totalCount={20}
      />
    );

    expect(screen.queryByText("menu:retired-slug")).not.toBeInTheDocument();
    expect(screen.getByText("roles.landingTargetUnavailablePage")).toBeInTheDocument();
  });
});
