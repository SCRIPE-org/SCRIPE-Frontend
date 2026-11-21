import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NexusSecondaryRail } from "./nexus-secondary-rail";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/venue/resources",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

const mockActiveWorkspace = {
  workspaceKey: "venue",
  workspaceNameEn: "Venue",
  workspaceNameAr: "المنشآت والملاعب",
  getLocalizedName: (lang: string) => (lang === "ar" ? "المنشآت والملاعب" : "Venue"),
};

const makeMockItem = (
  id: string,
  nameEn: string,
  href: string,
  children: MenuItem[] = []
): MenuItem =>
  new MenuItem({
    id,
    slug: id,
    name: nameEn,
    nameEn,
    nameAr: nameEn,
    href,
    icon: "LayoutGrid",
    order: 0,
    resource: null,
    actions: null,
    children,
  });

const operationsGroup = makeMockItem("venue-group-operations", "Operations & Bookings", "", [
  makeMockItem("venue-dashboard", "Operations Dashboard", "/venue"),
  makeMockItem("venue-calendar", "Calendar Grid", "/venue/calendar"),
  makeMockItem("venue-booking-create", "New Booking", "/venue/bookings/new"),
  makeMockItem("venue-attention", "Attention Queue", "/venue/attention"),
  makeMockItem("venue-customers", "Customers & Guests", "/venue/customers"),
]);

const spacesGroup = makeMockItem("venue-group-spaces", "Courts & Facilities", "", [
  makeMockItem("venue-resources", "Courts & Spaces", "/venue/resources"),
  makeMockItem("venue-facilities", "Facilities & Complexes", "/venue/facilities"),
  makeMockItem("venue-availability", "Operating Hours & Schedules", "/venue/availability"),
  makeMockItem("venue-resource-profiles", "Resource Profiles", "/venue/resource-profiles"),
  makeMockItem("venue-resource-builder", "Resource Builder", "/venue/resource-builder"),
]);

const mockRootMenuItems = [operationsGroup, spacesGroup];

let mockActiveRootItem: MenuItem | null = spacesGroup;

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    activeWorkspace: mockActiveWorkspace,
    activeRootItem: mockActiveRootItem,
    isModuleMode: true,
    rootMenuItems: mockRootMenuItems,
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr",
    t: (k: string) => k,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
  }),
}));

vi.mock("./nexus-transition", () => ({
  useNexusReducedMotion: () => false,
}));

vi.mock("./nexus-layout", () => ({
  useWorkspaceTransitionContext: () => ({
    switchWorkspace: vi.fn(),
    goBackWorkspace: vi.fn(),
  }),
}));

describe("NexusSecondaryRail — Generic Multi-Group Workspace Secondary Rail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveRootItem = spacesGroup;
  });

  it("1. Displays the active root group title and context label", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByText("Courts & Facilities")).toBeInTheDocument();
    expect(screen.getByText(/venue/i)).toBeInTheDocument();
  });

  it("2. Displays children of active group with proper links", () => {
    render(<NexusSecondaryRail />);

    expect(screen.getByRole("link", { name: /courts & spaces/i })).toHaveAttribute("href", "/venue/resources");
    expect(screen.getByRole("link", { name: /facilities & complexes/i })).toHaveAttribute("href", "/venue/facilities");
    expect(screen.getByRole("link", { name: /operating hours & schedules/i })).toHaveAttribute("href", "/venue/availability");
    expect(screen.getByRole("link", { name: /resource profiles/i })).toHaveAttribute("href", "/venue/resource-profiles");
    expect(screen.getByRole("link", { name: /resource builder/i })).toHaveAttribute("href", "/venue/resource-builder");
  });

  it("3. Displays Operations & Bookings children when active root item switches", () => {
    mockActiveRootItem = operationsGroup;
    render(<NexusSecondaryRail />);

    expect(screen.getByText("Operations & Bookings")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /operations dashboard/i })).toHaveAttribute("href", "/venue");
    expect(screen.getByRole("link", { name: /calendar grid/i })).toHaveAttribute("href", "/venue/calendar");
    expect(screen.getByRole("link", { name: /new booking/i })).toHaveAttribute("href", "/venue/bookings/new");
  });

  it("4. Opens mobile drawer cleanly when mobileOpen is true even when desktop isCollapsed is true", () => {
    const onMobileClose = vi.fn();
    render(
      <NexusSecondaryRail
        mobileOpen={true}
        isCollapsed={true}
        onMobileClose={onMobileClose}
      />
    );

    const dialog = screen.getByRole("dialog", { name: /courts & facilities/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveStyle({ width: "240px" });
    expect(screen.getByRole("button", { name: "common.close" })).toBeInTheDocument();
  });

  it("5. Closes mobile drawer on Escape (respecting defaultPrevented), traps Tab focus, and restores focus to returnFocusRef", () => {
    const onMobileClose = vi.fn();
    const openerBtn = document.createElement("button");
    openerBtn.textContent = "Toggle Panel";
    document.body.appendChild(openerBtn);
    openerBtn.focus();
    const returnFocusRef = { current: openerBtn };

    const { rerender } = render(
      <NexusSecondaryRail
        mobileOpen={true}
        isCollapsed={true}
        onMobileClose={onMobileClose}
        returnFocusRef={returnFocusRef}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);

    // Pre-cancelled Escape must NOT close the drawer
    const preventedEscape = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    preventedEscape.preventDefault();
    document.dispatchEvent(preventedEscape);
    expect(onMobileClose).not.toHaveBeenCalled();

    // Tabbing from last focusable wraps back to first focusable inside drawer
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
    expect(focusable.length).toBeGreaterThan(1);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    // Clicking blank dialog padding focuses container; Shift+Tab still wraps to last
    dialog.focus();
    expect(document.activeElement).toBe(dialog);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    // Uncancelled Escape closes drawer and rerender(mobileOpen=false) restores focus
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onMobileClose).toHaveBeenCalledTimes(1);

    rerender(
      <NexusSecondaryRail
        mobileOpen={false}
        isCollapsed={true}
        onMobileClose={onMobileClose}
        returnFocusRef={returnFocusRef}
      />
    );
    expect(document.activeElement).toBe(openerBtn);
    openerBtn.remove();
  });

  it("6. Renders collapsible sub-groups using native <button type='button'> with aria-expanded", () => {
    const nestedGroup = makeMockItem("venue-nested-group", "Facility Settings", "", [
      makeMockItem("venue-rules", "Booking Rules", "/venue/rules"),
    ]);
    const sectionGroup = makeMockItem("venue-section-config", "Configuration", "", [nestedGroup]);
    mockActiveRootItem = makeMockItem("venue-root-nested", "Settings Root", "", [sectionGroup]);

    const { container } = render(<NexusSecondaryRail />);

    const groupBtn = screen.getByRole("button", { name: /facility settings/i });
    expect(groupBtn.tagName).toBe("BUTTON");
    expect(groupBtn).toHaveAttribute("type", "button");
    expect(groupBtn).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector('div[role="button"]')).toBeNull();

    // Collapsed submenu items must stay hidden from accessibility tree & Tab order
    expect(screen.queryByRole("link", { name: /booking rules/i })).toBeNull();
    const hiddenLink = container.querySelector('a[href="/venue/rules"]');
    expect(hiddenLink).not.toBeNull();
    const submenuWrapper = hiddenLink!.closest("[aria-hidden='true']");
    expect(submenuWrapper).not.toBeNull();
    expect(submenuWrapper).toHaveAttribute("inert");
    expect(submenuWrapper!.className).toContain("invisible");

    fireEvent.click(groupBtn);
    expect(groupBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /booking rules/i })).toBeInTheDocument();
  });

  it("7. Opens mobile drawer even without submenu when mobileOpen is true and exposes App Launcher, Hub navigation, and mobileFooter", () => {
    mockActiveRootItem = makeMockItem("leaf-only", "Overview", "/overview", []);
    const onOpenAppLauncher = vi.fn();
    const onMobileClose = vi.fn();

    render(
      <NexusSecondaryRail
        mobileOpen={true}
        onMobileClose={onMobileClose}
        onOpenAppLauncher={onOpenAppLauncher}
        mobileFooter={<div data-testid="mobile-drawer-footer">Account</div>}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "shell.launcher.title" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "chrome.goToHome" })).toBeInTheDocument();
    expect(screen.getByTestId("mobile-drawer-footer")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "shell.launcher.title" }));
    expect(onMobileClose).toHaveBeenCalledTimes(1);
    expect(onOpenAppLauncher).toHaveBeenCalledTimes(1);
  });
});
