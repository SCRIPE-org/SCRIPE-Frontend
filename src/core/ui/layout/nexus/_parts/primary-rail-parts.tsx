"use client";

import React, { useState } from "react";
import type { MenuItem } from "@core/navigation";
import * as LucideIcons from "lucide-react";
import {
  LayoutDashboard,
  ArrowLeft,
  ArrowRight,
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@core/common/utils";

// ── Focus law ─────────────────────────────────────────────────────────────────
// Every interactive element in the nexus shell wears this instead of a bare
// `outline-none`: invisible keyboard focus is an a11y defect, not a style.
// One token — --nx-focus — draws the whole ring (a 1px inset accent edge plus a
// 3px accent-wash halo), so the rail cannot drift from the rest of the product
// the way a hand-picked outline width/offset pair already had.
export const NX_FOCUS_RING = "focus-visible:outline-none focus-visible:shadow-nx-focus";

// ── Icon resolver ─────────────────────────────────────────────────────────────
export function DynamicIcon({ name, size = 18 }: { name: string; size?: number }) {
  const PascalName = name?.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
  const Icon = (LucideIcons as Record<string, any>)[PascalName ?? ""];
  if (Icon) return <Icon width={size} height={size} strokeWidth={1.8} />;
  return <LayoutDashboard width={size} height={size} strokeWidth={1.8} />;
}

import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";

// NOTE: no TooltipProvider here — the rail mounts ONE provider at its nav
// root (~150ms delay). One provider per button meant N providers per render
// and no shared delay grouping across the rail.

// ── Root item button ──────────────────────────────────────────────────────────
export interface RootItemButtonProps {
  item: MenuItem;
  isActive: boolean;
  isRTL: boolean;
  language: string;
  onClick: (item: MenuItem) => void;
}

export function RootItemButton({ item, isActive, isRTL, language, onClick }: RootItemButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const label =
    language === "ar"
      ? item.nameAr || item.nameEn || item.name
      : item.nameEn || item.nameAr || item.name;

  // ── Token colours — theme resolves in CSS, no isDark branch ──────────────
  // Active = the lit thing: accent icon + wash; the glowing inline-start edge
  // light itself is the ActiveIndicator, which slides to this button.
  const bgColor = (() => {
    if (isActive) return "var(--nx-accent-wash)";
    if (hovered) return "var(--nx-raised)";
    return "transparent";
  })();

  const iconColor = (() => {
    if (isActive) return "var(--nx-accent)";
    if (hovered) return "var(--nx-ink)";
    return "var(--nx-ink-2)";
  })();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={btnRef}
          type="button"
          aria-label={label}
          aria-pressed={isActive}
          onClick={() => onClick(item)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            // Scoped property list. Transitioning every property also animated
            // width/height/margin, so each rail reflow became a 200ms slide.
            "group relative flex items-center justify-center transition-[color,background-color,border-color,box-shadow] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
            NX_FOCUS_RING
          )}
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: "var(--nx-radius-md)",
            cursor: "pointer",
            border: isActive
              ? "1px solid color-mix(in oklch, var(--nx-accent) 25%, transparent)"
              : "1px solid transparent",
            background: bgColor,
            color: iconColor,
            margin: "4px 0",
          }}
        >
          <DynamicIcon name={item.icon} size={20} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Back button (module mode) ─────────────────────────────────────────────────
export interface BackButtonProps {
  isRTL: boolean;
  label: string;
  onClick: () => void;
}

export function BackButton({ isRTL, label, onClick }: BackButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={btnRef}
          type="button"
          aria-label={label}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            "group relative flex items-center justify-center transition-[color,background-color,border-color,box-shadow] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
            NX_FOCUS_RING
          )}
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: "var(--nx-radius-md)",
            cursor: "pointer",
            border: "1px solid transparent",
            background: hovered ? "var(--nx-raised)" : "transparent",
            color: hovered ? "var(--nx-ink)" : "var(--nx-ink-2)",
            marginBottom: 8,
          }}
        >
          {/* The glyph used to slide toward the inline start on hover. Hover in
              this system is colour and hairline — nothing moves. */}
          {isRTL ? (
            <ArrowRight width={20} height={20} strokeWidth={2} />
          ) : (
            <ArrowLeft width={20} height={20} strokeWidth={2} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Panel Toggle Button ───────────────────────────────────────────────────────
export interface TogglePanelButtonProps {
  isRTL: boolean;
  label: string;
  isCollapsed: boolean;
  onClick: () => void;
}

export function TogglePanelButton({ isRTL, label, isCollapsed, onClick }: TogglePanelButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);

  // Determine icon based on RTL and collapsed state
  let Icon = PanelLeftClose;
  if (isRTL) {
    Icon = isCollapsed ? PanelRightOpen : PanelRightClose;
  } else {
    Icon = isCollapsed ? PanelLeftOpen : PanelLeftClose;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={btnRef}
          type="button"
          aria-label={label}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            "group relative flex items-center justify-center transition-[color,background-color,border-color,box-shadow] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
            NX_FOCUS_RING
          )}
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: "var(--nx-radius-md)",
            cursor: "pointer",
            border: "1px solid transparent",
            background: hovered ? "var(--nx-raised)" : "transparent",
            color: hovered ? "var(--nx-ink)" : "var(--nx-ink-2)",
            marginBottom: 8,
          }}
        >
          <Icon width={20} height={20} strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return (
    <div
      style={{
        width: 32,
        height: 1,
        background: "var(--nx-line)",
        margin: "12px 0",
        flexShrink: 0,
      }}
    />
  );
}

// ── Primary Rail Logo ─────────────────────────────────────────────────────────
export interface PrimaryRailLogoProps {
  tenantLogoUrl?: string | null;
  isModuleMode: boolean;
  language: string;
  onClick: () => void;
}

export function PrimaryRailLogo({
  tenantLogoUrl,
  isModuleMode,
  language,
  onClick,
}: PrimaryRailLogoProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 cursor-pointer items-center justify-center transition-[color,background-color,border-color,box-shadow] duration-nx-panel ease-nx-enter motion-reduce:transition-none",
        NX_FOCUS_RING
      )}
      style={{
        width: 48,
        height: 48,
        borderRadius: "var(--nx-radius-lg)",
        // accent (L0.68/0.46) into accent-fill (L0.50) — a token gradient that
        // deepens naturally in both themes instead of a hardcoded indigo pair
        background: tenantLogoUrl
          ? "transparent"
          : "linear-gradient(135deg, var(--nx-accent) 0%, var(--nx-accent-fill) 100%)",
        marginBottom: isModuleMode ? 12 : 20,
        // No resting shadow. The hand-rolled `0 6px 20px accent` bloom read as a
        // second glow next to the ActiveIndicator (the screen gets one), and as
        // an inline style it also out-specified the focus ring, so the mark was
        // unfocusable-looking under the keyboard.
        overflow: "hidden",
        flexShrink: 0,
      }}
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        // role="link" on a div is invisible to the keyboard without this
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={language === "ar" ? "الصفحة الرئيسية" : "Go to Home"}
    >
      {tenantLogoUrl ? (
        <img
          src={tenantLogoUrl}
          alt="Logo"
          style={{
            width: 48,
            height: 48,
            objectFit: "contain",
            borderRadius: "var(--nx-radius-lg)",
          }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "var(--nx-on-fill)",
            lineHeight: 1,
            userSelect: "none",
            letterSpacing: "-0.5px",
          }}
        >
          N
        </span>
      )}
    </div>
  );
}

// ── Active Indicator ──────────────────────────────────────────────────────────
// The accent inline-start edge light. Its --nx-glow is THE one glow on
// screen — nothing else in the shell may wear one while it is visible.
export interface ActiveIndicatorProps {
  indicatorTop: number;
  indicatorColor: string;
  indicatorVisible: boolean;
  isRTL: boolean;
}

export function ActiveIndicator({
  indicatorTop,
  indicatorColor,
  indicatorVisible,
}: ActiveIndicatorProps) {
  return (
    <div
      // Scoped to the three properties this element actually moves. Animating
      // every property also interpolated its width, height and background on
      // each workspace accent change.
      className="z-raised transition-[top,opacity,transform] duration-nx-panel ease-nx-enter motion-reduce:transition-none"
      style={{
        position: "absolute",
        insetInlineStart: 0,
        top: indicatorTop, // aligned with container's own 4px top-padding — no extra offset needed
        width: 4,
        height: 44,
        background: indicatorColor,
        borderStartStartRadius: 0,
        borderEndStartRadius: 0,
        borderStartEndRadius: "var(--nx-radius-sm)",
        borderEndEndRadius: "var(--nx-radius-sm)",
        opacity: indicatorVisible ? 1 : 0,
        transform: indicatorVisible ? "scaleY(1)" : "scaleY(0.3)",
        boxShadow: "var(--nx-glow)",
      }}
    />
  );
}
