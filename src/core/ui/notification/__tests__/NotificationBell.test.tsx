import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { NotificationItem } from "@core/notification/entities/NotificationItem";
import type { NotificationViewModel } from "../useNotificationViewModel";
import { resolveSafeActionHref } from "@core/ui/sileo-toast/sileo-toast";

const mockUseNotificationViewModel = vi.fn<() => NotificationViewModel>();

vi.mock("../useNotificationViewModel", () => ({
  useNotificationViewModel: () => mockUseNotificationViewModel(),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr" as const,
  }),
}));

import { NotificationBell } from "../NotificationBell";

function makeNotification(overrides: Partial<NotificationItem>): NotificationItem {
  return {
    id: "notif-default",
    title: "Notification",
    body: "Details",
    type: "info",
    category: "system",
    isRead: false,
    readAt: null,
    actionUrl: null,
    metadataJson: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeViewModel(overrides: Partial<NotificationViewModel> = {}): NotificationViewModel {
  return {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isError: false,
    isOpen: true,
    toggleOpen: vi.fn(),
    close: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    refresh: vi.fn(),
    ...overrides,
  };
}

describe("NotificationBell", () => {
  const originalLocation = window.location;
  const mockLocation = {
    origin: "https://app.scripe.test",
    href: "https://app.scripe.test/dashboard",
  };

  beforeEach(() => {
    mockLocation.href = "https://app.scripe.test/dashboard";
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
    });
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    vi.clearAllMocks();
  });

  it("renders error state with semantic text-nx-danger token instead of legacy text-destructive", () => {
    mockUseNotificationViewModel.mockReturnValue(
      makeViewModel({
        isOpen: true,
        isError: true,
      })
    );

    render(<NotificationBell />);

    const dialog = screen.getByRole("dialog", { name: "notifications.title" });
    expect(screen.getByText("notifications.loadError")).toBeInTheDocument();
    expect(dialog.querySelector(".text-nx-danger")).not.toBeNull();
    expect(dialog.querySelector(".text-destructive")).toBeNull();
  });

  it("blocks malicious or cross-origin actionUrl targets and suppresses the link icon", () => {
    const vm = makeViewModel({
      isOpen: true,
      unreadCount: 5,
      notifications: [
        makeNotification({ id: "n-js", title: "JS Payload", actionUrl: "javascript:alert(1)" }),
        makeNotification({
          id: "n-data",
          title: "Data Payload",
          actionUrl: "data:text/html,<script>alert(1)</script>",
        }),
        makeNotification({
          id: "n-vb",
          title: "VBScript Payload",
          actionUrl: "vbscript:msgbox(1)",
        }),
        makeNotification({
          id: "n-proto",
          title: "Protocol Relative",
          actionUrl: "//evil.example/phish",
        }),
        makeNotification({
          id: "n-ext",
          title: "External Origin",
          actionUrl: "https://evil.example/phish",
        }),
        makeNotification({
          id: "n-scheme",
          title: "Scheme No Slashes",
          actionUrl: "http:evil.example",
        }),
      ],
    });
    mockUseNotificationViewModel.mockReturnValue(vm);

    render(<NotificationBell />);

    const blockedTitles = [
      ["n-js", "JS Payload"],
      ["n-data", "Data Payload"],
      ["n-vb", "VBScript Payload"],
      ["n-proto", "Protocol Relative"],
      ["n-ext", "External Origin"],
      ["n-scheme", "Scheme No Slashes"],
    ] as const;

    for (const [id, title] of blockedTitles) {
      const button = screen.getByRole("button", { name: new RegExp(title) });
      expect(button.querySelector("svg")).toBeNull();

      fireEvent.click(button);

      expect(vm.markAsRead).toHaveBeenCalledWith(id);
      expect(vm.close).toHaveBeenCalled();
      expect(mockLocation.href).toBe("https://app.scripe.test/dashboard");
    }
  });

  it("navigates and shows ExternalLink icon for valid internal routes and same-origin URLs", () => {
    const vm = makeViewModel({
      isOpen: true,
      unreadCount: 2,
      notifications: [
        makeNotification({
          id: "n-rel",
          title: "Internal Route",
          actionUrl: "/venue/bookings?id=42",
        }),
        makeNotification({
          id: "n-same",
          title: "Same Origin URL",
          actionUrl: "https://app.scripe.test/academy/students#roster",
        }),
      ],
    });
    mockUseNotificationViewModel.mockReturnValue(vm);

    render(<NotificationBell />);

    const internalButton = screen.getByRole("button", { name: /Internal Route/ });
    expect(internalButton.querySelector("svg")).not.toBeNull();
    fireEvent.click(internalButton);
    expect(vm.markAsRead).toHaveBeenCalledWith("n-rel");
    expect(vm.close).toHaveBeenCalled();
    expect(mockLocation.href).toBe("https://app.scripe.test/venue/bookings?id=42");

    mockLocation.href = "https://app.scripe.test/dashboard";

    const sameOriginButton = screen.getByRole("button", { name: /Same Origin URL/ });
    expect(sameOriginButton.querySelector("svg")).not.toBeNull();
    fireEvent.click(sameOriginButton);
    expect(vm.markAsRead).toHaveBeenCalledWith("n-same");
    expect(mockLocation.href).toBe("https://app.scripe.test/academy/students#roster");
  });

  it("resolveSafeActionHref rejects scheme-without-slashes, backslashes, and control characters", () => {
    expect(resolveSafeActionHref("http:evil.example")).toBeNull();
    expect(resolveSafeActionHref("https:evil.example")).toBeNull();
    expect(resolveSafeActionHref("\\\\evil.example\\share")).toBeNull();
    expect(resolveSafeActionHref("/ok\n/path")).toBeNull();
    expect(resolveSafeActionHref("/venue/courts?page=2#top")).toBe(
      "https://app.scripe.test/venue/courts?page=2#top"
    );
  });
});
