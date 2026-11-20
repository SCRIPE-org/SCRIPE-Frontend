/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../hover-card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../context-menu";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "../menubar";
import { CreatableCombobox } from "../creatable-combobox";
import { DatePicker } from "../date-picker";
import { NotificationBell } from "../notification/NotificationBell";

let mockDirection: "ltr" | "rtl" = "ltr";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      (params?.defaultValue as string) ?? key,
    language: mockDirection === "rtl" ? "ar" : "en",
    direction: mockDirection,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    inputStyle: "default",
    buttonStyle: "default",
    borderRadius: "default",
    calendarStyle: "default",
    datePickerStyle: "default",
    animationLevel: "moderate",
  }),
}));

vi.mock("../notification/useNotificationViewModel", () => ({
  useNotificationViewModel: () => ({
    notifications: [],
    unreadCount: 2,
    isLoading: false,
    isError: false,
    isOpen: true,
    toggleOpen: vi.fn(),
    close: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    refresh: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  mockDirection = "ltr";
});

function expectCommonOverlayMotion(
  el: HTMLElement,
  expectedOriginClass: string,
  options: { hasOpenStateVariant?: boolean } = {}
) {
  const { hasOpenStateVariant = true } = options;
  expect(el.className).toContain(expectedOriginClass);
  expect(el.className).toContain("transition-none");
  expect(el.className).toContain("duration-nx-micro");
  if (hasOpenStateVariant) {
    expect(el.className).toContain("data-[state=open]:duration-nx-micro");
  }
  expect(el.className).toContain("data-[state=closed]:duration-nx-micro");
  expect(el.className).toContain("ease-nx-enter");
  expect(el.className).toContain("data-[state=closed]:ease-nx-exit");
  expect(el.className).toContain("animate-in");
  expect(el.className).toContain("animate-out");
  expect(el.className).toContain("fade-in-0");
  expect(el.className).toContain("fade-out-0");
  expect(el.className).toContain("zoom-in-95");
  expect(el.className).toContain("zoom-out-95");
}

describe("Floating overlay trigger-origin motion & positioning invariants", () => {
  it("renders DropdownMenuContent and DropdownMenuSubContent directly inside popper wrappers with explicit var() origin and 2px side slides", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <button type="button">Account</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>Workspace</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Venue</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const menus = screen.getAllByRole("menu");
    expect(menus).toHaveLength(2);

    for (const menu of menus) {
      expectCommonOverlayMotion(menu, "origin-[var(--radix-dropdown-menu-content-transform-origin)]");
      expect(menu.className).toContain("motion-safe:data-[side=bottom]:slide-in-from-top-0.5");
      expect(menu.className).toContain("motion-safe:data-[side=top]:slide-in-from-bottom-0.5");
      expect(menu).toHaveAttribute("dir", "ltr");
      // No intervening <div dir> wrapper between Popper wrapper and menu content
      expect(menu.parentElement?.hasAttribute("data-radix-popper-content-wrapper")).toBe(true);
    }
  });

  it("renders TooltipContent with explicit tooltip origin, zoom-in-95/zoom-out-95, and animate-in/animate-out", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button type="button">Help</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip body</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const content = document.body.querySelector(
      "[data-radix-popper-content-wrapper] [data-side]"
    ) as HTMLElement;
    expect(content).not.toBeNull();
    expectCommonOverlayMotion(content, "origin-[var(--radix-tooltip-content-transform-origin)]", {
      hasOpenStateVariant: false,
    });
    expect(content.className).toContain("motion-safe:data-[side=bottom]:slide-in-from-top-0.5");
    expect(content.className).toContain("motion-safe:data-[side=top]:slide-in-from-bottom-0.5");
  });

  it("renders SelectContent with explicit var() height & origin and no slide-in-from-* utilities", () => {
    render(
      <Select open value="a">
        <SelectTrigger aria-label="Sport">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Football</SelectItem>
        </SelectContent>
      </Select>
    );

    const listbox = screen.getByRole("listbox");
    expectCommonOverlayMotion(listbox, "origin-[var(--radix-select-content-transform-origin)]");
    expect(listbox.className).toContain("max-h-[var(--radix-select-content-available-height)]");
    expect(listbox.className).not.toContain("slide-in-from-");
    expect(listbox.className).toContain("data-[side=bottom]:translate-y-1");
  });

  it("renders PopoverContent and CreatableCombobox with explicit var() origin, zoom-in-95, and trigger width", () => {
    render(
      <>
        <Popover open>
          <PopoverTrigger asChild>
            <button type="button">Filters</button>
          </PopoverTrigger>
          <PopoverContent>Filter panel</PopoverContent>
        </Popover>
        <CreatableCombobox options={["Maadi"]} value="" onChange={vi.fn()} />
      </>
    );

    const dialog = screen.getByRole("dialog");
    expectCommonOverlayMotion(dialog, "origin-[var(--radix-popover-content-transform-origin)]");
    expect(dialog.className).toContain("motion-safe:data-[side=bottom]:slide-in-from-top-0.5");

    cleanup();

    render(<CreatableCombobox options={["Maadi"]} value="" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("combobox"));
    const comboboxDialog = screen.getByRole("dialog");
    expectCommonOverlayMotion(comboboxDialog, "origin-[var(--radix-popover-content-transform-origin)]");
    expect(comboboxDialog.className).toContain("w-[var(--radix-popover-trigger-width)]");
  });

  it("renders HoverCardContent with explicit hover-card origin and micro zoom motion", () => {
    render(
      <HoverCard open>
        <HoverCardTrigger asChild>
          <a href="#coach">Coach</a>
        </HoverCardTrigger>
        <HoverCardContent>Coach stats</HoverCardContent>
      </HoverCard>
    );

    const hoverCard = screen.getByText("Coach stats");
    expectCommonOverlayMotion(hoverCard, "origin-[var(--radix-hover-card-content-transform-origin)]");
    expect(hoverCard.className).toContain("motion-safe:data-[side=left]:slide-in-from-right-0.5");
  });

  it("renders ContextMenuContent with explicit context-menu origin and RTL propagation", () => {
    mockDirection = "rtl";
    render(
      <ContextMenu>
        <ContextMenuTrigger>Right click area</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Inspect</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );

    fireEvent.contextMenu(screen.getByText("Right click area"), { clientX: 60, clientY: 60 });
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("dir", "rtl");
    expectCommonOverlayMotion(menu, "origin-[var(--radix-context-menu-content-transform-origin)]");
    expect(menu.className).toContain("motion-safe:data-[side=right]:slide-in-from-left-0.5");
  });

  it("renders MenubarContent with explicit menubar origin and zoom-in-95/zoom-out-95", () => {
    render(
      <Menubar value="actions">
        <MenubarMenu value="actions">
          <MenubarTrigger>Actions</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Export</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    );

    const menu = screen.getByRole("menu");
    expectCommonOverlayMotion(menu, "origin-[var(--radix-menubar-content-transform-origin)]");
    expect(menu.className).toContain("motion-safe:data-[side=top]:slide-in-from-bottom-0.5");
  });

  it("locks coordinate transitions on NotificationBell and DatePicker while unfolding from trigger origin", () => {
    render(
      <>
        <NotificationBell />
        <DatePicker id="dp" value="" onChange={vi.fn()} />
      </>
    );

    const bellPanel = screen.getByRole("dialog", { name: "notifications.title" });
    expect(bellPanel).toHaveAttribute("data-dropdown-portal", "true");
    expect(bellPanel.className).toContain("transition-none");
    expect(bellPanel.className).toContain("animate-in");
    expect(bellPanel.className).toContain("fade-in-0");
    expect(bellPanel.className).toContain("motion-safe:zoom-in-95");
    expect(bellPanel.className).toContain("duration-nx-micro");
    expect(bellPanel.className).toContain("ease-nx-enter");

    fireEvent.click(screen.getByRole("combobox", { name: "common.selectDate" }));
    const dateDialog = document.body.querySelector('[data-date-picker="true"]') as HTMLElement;
    expect(dateDialog).not.toBeNull();
    expect(dateDialog.className).toContain("transition-[transform,opacity]");
    expect(dateDialog.className).toContain("duration-nx-micro");
    expect(dateDialog.className).toContain("origin-top");
    expect(dateDialog.className).toContain("motion-reduce:transition-none");
  });

  it("enforces wrapper locks and removes global `*` transition-duration and `nxExpandIn` from globals.css", () => {
    const cssPath = path.resolve(__dirname, "../../../app/globals.css");
    const css = fs.readFileSync(cssPath, "utf-8");

    expect(css).toMatch(
      /\[data-radix-popper-content-wrapper\],\s*\.recharts-tooltip-wrapper\s*\{[^}]*transition:\s*none\s*!important;[^}]*animation:\s*none\s*!important;/
    );
    expect(css).not.toContain("nxExpandIn");
    expect(css).not.toMatch(/:root\[data-animation="(?:minimal|moderate|high)"\]\s*\*/);
    expect(css).not.toMatch(/:root\[data-animation="(?:moderate|high)"\]\s*\[data-radix-menu-content\]/);
    expect(css).not.toMatch(/:root\[data-animation="(?:moderate|high)"\]\s*\[data-radix-popper-content-wrapper\]\s*>\s*div/);
    expect(css).not.toMatch(/:root\[data-animation="(?:moderate|high)"\]\s*\[role="(?:menu|tooltip)"\]/);

    // Reduced-motion & data-animation="none" wildcards stay intact
    expect(css).toMatch(/:root\[data-animation="none"\]\s*\*/);
    expect(css).toMatch(/\[data-reduced-motion="true"\]\s*\*/);

    // Token-based speed scaling replaces global * transition-duration
    expect(css).toMatch(/:root\[data-animation="minimal"\]\s*\{[^}]*--nx-t-micro:/);
    expect(css).toMatch(/:root\[data-animation="moderate"\]\s*\{[^}]*--nx-t-micro:/);
    expect(css).toMatch(/:root\[data-animation="high"\]\s*\{[^}]*--nx-t-micro:/);

    // Descendant stagger selectors exclude floating overlays and spin/pulse utilities
    expect(css).toContain('[data-radix-popper-content-wrapper] *');
    expect(css).toContain('[data-dropdown-portal="true"] *');
    expect(css).toContain('[role="menu"] *');
    expect(css).toContain('[role="listbox"] *');
    expect(css).toContain('[role="tooltip"] *');
    expect(css).toContain('.animate-spin');
    expect(css).toContain('.animate-pulse');
  });
});
