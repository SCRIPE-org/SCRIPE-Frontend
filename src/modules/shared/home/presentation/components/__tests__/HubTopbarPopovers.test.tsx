import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { HubActivityPopover } from "../HubActivityPopover";
import { HubNotificationsPopover } from "../HubNotificationsPopover";
import { HubTopbar } from "../HubTopbar";

const mockPush = vi.fn();
let mockPermissions: string[] = [];
let mockIsPlatform = false;
let mockActiveTenantName: string | null = "Al-Ahly Sporting Club";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    unoptimized: _unoptimized,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={rest.alt ?? ""} {...rest} />
  ),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.count !== undefined) return `${key}:${params.count}`;
      if (params?.name !== undefined) return `${key}:${params.name}`;
      return key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    cardStyle: "default",
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    badgeStyle: "default",
  }),
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  useTenantBranding: () => ({
    logoUrl: "/brand/app-logo-1024.png",
    appName: "SCRIPE",
    isTenantContext: false,
  }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    activeTenantName: mockActiveTenantName,
    isPlatform: mockIsPlatform,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasPermission: (perm: string) => mockPermissions.includes(perm),
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { firstName: "Seif", lastName: "Moustafa", tenantName: null } }),
}));

vi.mock("@core/ui/layout/common", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
  NxThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock("@core/ui/user-profile-dropdown", () => ({
  UserProfileDropdown: () => <div data-testid="user-profile-dropdown" />,
}));

vi.mock("@core/ui/routing-progress-bar", () => ({
  startRoutingProgress: vi.fn(),
}));

describe("HubNotificationsPopover — All/Unread tabs, unread chip contrast, mark-read & impersonation guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders static bg-nx-accent-fill text-nx-on-fill unread chip, All/Unread tabs, and mark-read actions", () => {
    const onMarkAsRead = vi.fn();
    const onMarkAllAsRead = vi.fn();

    render(
      <HubNotificationsPopover
        isImpersonating={false}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        notifications={{
          unreadCount: 1,
          items: [
            {
              id: "n-unread",
              title: "Token Expiry",
              body: "Rotate PAT soon",
              category: "Security",
              isRead: false,
              actionUrl: "/account/tokens",
              createdAt: "2026-11-22T09:00:00Z",
            },
            {
              id: "n-read",
              title: "Session Verified",
              body: "Trusted browser",
              category: "Security",
              isRead: true,
              actionUrl: null,
              createdAt: "2026-11-21T09:00:00Z",
            },
          ],
        }}
      />
    );

    const trigger = screen.getByTestId("hub-notifications-trigger");
    const chip = trigger.querySelector("span");
    expect(chip?.className).toContain("bg-nx-accent-fill");
    expect(chip?.className).toContain("text-nx-on-fill");
    expect(chip).toHaveTextContent("1");

    fireEvent.click(trigger);

    const popover = screen.getByTestId("hub-notifications-popover");
    expect(popover).toBeInTheDocument();

    const allTab = screen.getByRole("tab", { name: "workspaceHub.notifications.tabs.all" });
    const unreadTab = screen.getByRole("tab", { name: "workspaceHub.notifications.tabs.unread" });
    expect(allTab).toHaveAttribute("aria-selected", "true");
    expect(allTab.className).toContain("bg-nx-raised");
    expect(allTab.className).not.toContain("bg-nx-accent-fill");

    expect(screen.getByText("Token Expiry")).toBeInTheDocument();
    expect(screen.getByText("Session Verified")).toBeInTheDocument();

    fireEvent.click(unreadTab);
    expect(unreadTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Token Expiry")).toBeInTheDocument();
    expect(screen.queryByText("Session Verified")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /workspaceHub\.notifications\.markAllRead/i }));
    expect(onMarkAllAsRead).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Token Expiry"));
    expect(onMarkAsRead).toHaveBeenCalledWith("n-unread");
    expect(mockPush).toHaveBeenCalledWith("/account/tokens");
  });

  it("shows impersonation alert and error retry cleanly", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <HubNotificationsPopover
        open={true}
        isImpersonating={true}
        isLoading={false}
        isError={false}
        onRetry={onRetry}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );

    expect(screen.getByTestId("hub-impersonation-alert")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();

    rerender(
      <HubNotificationsPopover
        open={true}
        isImpersonating={false}
        isLoading={false}
        isError={true}
        onRetry={onRetry}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "workspaceHub.notifications.retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: /workspaceHub\.notifications\.viewAll/i })).toHaveAttribute(
      "href",
      "/account/notifications"
    );
  });
});

describe("HubActivityPopover — /api/v1/account/activity feed, outcome badges & impersonation guard", () => {
  it("renders activity entries with semantic outcome badge, <bdi dir='ltr'> metadata, and /account/activity footer link", () => {
    render(
      <HubActivityPopover
        open={true}
        isImpersonating={false}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
        activity={{
          totalCount: 2,
          entries: [
            {
              id: "act-1",
              eventType: "LoginSucceeded",
              category: "Security",
              outcome: "Success",
              endpoint: "/api/v1/auth/login",
              ipAddress: "10.0.0.15",
              timestampUtc: "2026-11-22T10:00:00Z",
            },
            {
              id: "act-2",
              eventType: "LoginBlocked",
              category: "Security",
              outcome: "Blocked",
              endpoint: "/api/v1/auth/login",
              ipAddress: null,
              timestampUtc: "2026-11-22T09:00:00Z",
            },
          ],
        }}
      />
    );

    expect(screen.getByTestId("hub-activity-popover")).toBeInTheDocument();
    expect(screen.getByText("LoginSucceeded")).toBeInTheDocument();
    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.15").closest("bdi")).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("link", { name: /workspaceHub\.signInActivity\.viewAll/i })).toHaveAttribute(
      "href",
      "/account/activity"
    );
  });

  it("renders impersonation guard and retry action on error", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <HubActivityPopover
        open={true}
        isImpersonating={true}
        isLoading={false}
        isError={false}
        onRetry={onRetry}
      />
    );

    expect(screen.getByTestId("hub-activity-impersonation-alert")).toBeInTheDocument();

    rerender(
      <HubActivityPopover
        open={true}
        isImpersonating={false}
        isLoading={false}
        isError={true}
        onRetry={onRetry}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "workspaceHub.signInActivity.retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe("HubTopbar — Return-to-Workspace pill + Esc, Context Pill & Search Trigger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPermissions = [];
    mockIsPlatform = false;
    mockActiveTenantName = "Al-Ahly Sporting Club";
  });

  it("renders conditional Return to <Workspace> pill with Esc trigger only when previousWorkspace exists and no overlay/search is open", () => {
    const onReturnToWorkspace = vi.fn();
    const onOpenSearch = vi.fn();

    const { rerender } = render(
      <HubTopbar
        previousWorkspace={null}
        onReturnToWorkspace={onReturnToWorkspace}
        onOpenSearch={onOpenSearch}
        isSearchOpen={false}
        onOpenContextSwitcher={vi.fn()}
        isImpersonating={false}
        isLoadingNotifications={false}
        isNotificationsError={false}
        onRetryNotifications={vi.fn()}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={false}
        onRetryActivity={vi.fn()}
      />
    );

    expect(screen.queryByTestId("hub-return-workspace-btn")).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onReturnToWorkspace).not.toHaveBeenCalled();

    // When search is open, Escape must NOT trigger Return-to-Workspace
    rerender(
      <HubTopbar
        previousWorkspace={{ key: "venue", name: "Venue" }}
        onReturnToWorkspace={onReturnToWorkspace}
        onOpenSearch={onOpenSearch}
        isSearchOpen={true}
        onOpenContextSwitcher={vi.fn()}
        isImpersonating={false}
        isLoadingNotifications={false}
        isNotificationsError={false}
        onRetryNotifications={vi.fn()}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={false}
        onRetryActivity={vi.fn()}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onReturnToWorkspace).not.toHaveBeenCalled();

    // When idle with previousWorkspace, both click and Escape trigger return
    rerender(
      <HubTopbar
        previousWorkspace={{ key: "venue", name: "Venue" }}
        onReturnToWorkspace={onReturnToWorkspace}
        onOpenSearch={onOpenSearch}
        isSearchOpen={false}
        onOpenContextSwitcher={vi.fn()}
        isImpersonating={false}
        isLoadingNotifications={false}
        isNotificationsError={false}
        onRetryNotifications={vi.fn()}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={false}
        onRetryActivity={vi.fn()}
      />
    );

    const returnBtn = screen.getByTestId("hub-return-workspace-btn");
    expect(returnBtn).toHaveTextContent("workspaceHub.launchpad.returnToWorkspace:Venue");
    fireEvent.click(returnBtn);
    expect(onReturnToWorkspace).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onReturnToWorkspace).toHaveBeenCalledTimes(2);
  });

  it("shows accurate platform/tenant context label and opens switcher dialog when permitted", () => {
    mockIsPlatform = true;
    mockActiveTenantName = null;
    mockPermissions = [SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN];
    const onOpenContextSwitcher = vi.fn();

    render(
      <HubTopbar
        previousWorkspace={null}
        onReturnToWorkspace={vi.fn()}
        onOpenSearch={vi.fn()}
        isSearchOpen={false}
        onOpenContextSwitcher={onOpenContextSwitcher}
        isImpersonating={false}
        isLoadingNotifications={false}
        isNotificationsError={false}
        onRetryNotifications={vi.fn()}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={false}
        onRetryActivity={vi.fn()}
      />
    );

    const switcherBtn = screen.getByTestId("topbar-tenant-switcher-trigger");
    expect(switcherBtn).toHaveTextContent("chrome.section.platform");
    fireEvent.click(switcherBtn);
    expect(onOpenContextSwitcher).toHaveBeenCalledTimes(1);
  });

  it("hides secondary utilities on <md inside hidden md:flex desktop slots and surfaces Theme, Language, and Copilot in the md:hidden mobile actions popover", () => {
    const onReturnToWorkspace = vi.fn();

    render(
      <HubTopbar
        previousWorkspace={{ key: "venue", name: "Venue" }}
        onReturnToWorkspace={onReturnToWorkspace}
        onOpenSearch={vi.fn()}
        isSearchOpen={false}
        onOpenContextSwitcher={vi.fn()}
        copilotTrigger={<button type="button" data-testid="ai-copilot-trigger">AI Copilot</button>}
        isImpersonating={false}
        isLoadingNotifications={false}
        isNotificationsError={false}
        onRetryNotifications={vi.fn()}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={false}
        onRetryActivity={vi.fn()}
      />
    );

    const header = screen.getByTestId("hub-topbar");
    expect(header.className).toContain("max-w-full");
    expect(header.className).toContain("overflow-x-clip");

    const returnBtn = screen.getByTestId("hub-return-workspace-btn");
    expect(returnBtn).toHaveAttribute(
      "aria-label",
      "workspaceHub.launchpad.returnToWorkspace:Venue"
    );
    expect(returnBtn.className).toContain("w-8");
    expect(returnBtn.className).toContain("sm:w-auto");

    const searchBtn = screen.getByTestId("hub-search-trigger");
    expect(searchBtn.className).toContain("w-8");
    expect(searchBtn.className).toContain("sm:w-auto");

    expect(screen.getByTestId("hub-notifications-trigger").className).toContain("h-8");
    expect(screen.getByTestId("hub-notifications-trigger").className).toContain("sm:h-9");
    expect(screen.getByTestId("hub-activity-trigger").className).toContain("h-8");
    expect(screen.getByTestId("hub-activity-trigger").className).toContain("sm:h-9");

    // Inline desktop utility slots carry hidden md:flex
    const desktopCopilotSlot = screen.getByTestId("hub-desktop-copilot-slot");
    expect(desktopCopilotSlot.className).toContain("hidden");
    expect(desktopCopilotSlot.className).toContain("md:flex");
    expect(within(desktopCopilotSlot).getByTestId("ai-copilot-trigger")).toBeInTheDocument();

    const desktopUtilities = screen.getByTestId("hub-desktop-utilities");
    expect(desktopUtilities.className).toContain("hidden");
    expect(desktopUtilities.className).toContain("md:flex");
    expect(within(desktopUtilities).getByTestId("theme-switcher")).toBeInTheDocument();
    expect(within(desktopUtilities).getByTestId("language-switcher")).toBeInTheDocument();

    // Mobile More Utility Popover trigger is md:hidden and opens Theme + Language + Copilot
    const mobileTrigger = screen.getByTestId("hub-mobile-actions-trigger");
    expect(mobileTrigger.className).toContain("md:hidden");
    expect(mobileTrigger).toHaveAttribute("aria-label", "workspaceHub.launchpad.moreActions");
    expect(screen.queryByTestId("hub-mobile-actions-popover")).not.toBeInTheDocument();

    fireEvent.click(mobileTrigger);

    const mobilePopover = screen.getByTestId("hub-mobile-actions-popover");
    expect(mobilePopover).toBeInTheDocument();
    expect(within(mobilePopover).getByTestId("ai-copilot-trigger")).toBeInTheDocument();
    expect(within(mobilePopover).getByTestId("theme-switcher")).toBeInTheDocument();
    expect(within(mobilePopover).getByTestId("language-switcher")).toBeInTheDocument();

    // Pressing Escape while mobile actions popover is open must NOT fire onReturnToWorkspace
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onReturnToWorkspace).not.toHaveBeenCalled();
  });

  it("renders mobile actions popover cleanly without copilotTrigger when demo mode is disabled", () => {
    render(
      <HubTopbar
        previousWorkspace={null}
        onReturnToWorkspace={vi.fn()}
        onOpenSearch={vi.fn()}
        isSearchOpen={false}
        onOpenContextSwitcher={vi.fn()}
        isImpersonating={false}
        isLoadingNotifications={false}
        isNotificationsError={false}
        onRetryNotifications={vi.fn()}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={false}
        onRetryActivity={vi.fn()}
      />
    );

    expect(screen.queryByTestId("hub-desktop-copilot-slot")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("hub-mobile-actions-trigger"));

    const mobilePopover = screen.getByTestId("hub-mobile-actions-popover");
    expect(within(mobilePopover).queryByTestId("ai-copilot-trigger")).not.toBeInTheDocument();
    expect(within(mobilePopover).getByTestId("theme-switcher")).toBeInTheDocument();
    expect(within(mobilePopover).getByTestId("language-switcher")).toBeInTheDocument();
  });
});
