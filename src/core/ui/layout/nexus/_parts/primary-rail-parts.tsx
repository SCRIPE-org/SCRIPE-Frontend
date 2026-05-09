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

// ── Icon resolver ─────────────────────────────────────────────────────────────
export function DynamicIcon({ name, size = 18 }: { name: string; size?: number }) {
  const PascalName = name?.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());
  const Icon = (LucideIcons as Record<string, any>)[PascalName ?? ""];
  if (Icon) return <Icon width={size} height={size} strokeWidth={1.8} />;
  return <LayoutDashboard width={size} height={size} strokeWidth={1.8} />;
}

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";

// ── Root item button ──────────────────────────────────────────────────────────
export interface RootItemButtonProps {
  item: MenuItem;
  isActive: boolean;
  isRTL: boolean;
  accentColor: string;
  isDark: boolean;
  language: string;
  onClick: (item: MenuItem) => void;
}

export function RootItemButton({
  item,
  isActive,
  isRTL,
  accentColor,
  isDark,
  language,
  onClick,
}: RootItemButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const label =
    language === "ar"
      ? item.nameAr || item.nameEn || item.name
      : item.nameEn || item.nameAr || item.name;

  // ── Light/dark aware colours ─────────────────────────────────────────────
  const bgColor = (() => {
    if (isActive) return isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    if (hovered) return isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
    return "transparent";
  })();

  const iconColor = (() => {
    if (isActive) return accentColor;
    if (hovered) return isDark ? "rgba(255,255,255,0.95)" : "rgba(30,40,60,0.9)";
    return isDark ? "rgba(255,255,255,0.6)" : "rgba(100,115,145,0.8)";
  })();

  return (
    <TooltipProvider delayDuration={50}>
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
            className="group relative flex items-center justify-center outline-none transition-all duration-200 ease-out"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              cursor: "pointer",
              border: isActive ? `1px solid ${accentColor}33` : "1px solid transparent",
              background: bgColor,
              color: iconColor,
              margin: "4px 0",
              boxShadow: isActive ? `0 4px 12px ${accentColor}15` : "none",
            }}
          >
            <span
              className={cn(
                "transition-transform duration-200",
                hovered && !isActive ? "scale-110" : "scale-100"
              )}
            >
              <DynamicIcon name={item.icon} size={20} />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Back button (module mode) ─────────────────────────────────────────────────
export interface BackButtonProps {
  isRTL: boolean;
  isDark: boolean;
  label: string;
  onClick: () => void;
}

export function BackButton({ isRTL, isDark, label, onClick }: BackButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const iconColor = hovered ? (isDark ? "#ffffff" : "#000000") : isDark ? "#8A9CC0" : "#64748B";

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={btnRef}
            type="button"
            aria-label={label}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex items-center justify-center outline-none transition-all duration-200"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              cursor: "pointer",
              border: "1px solid transparent",
              background: hovered
                ? isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)"
                : "transparent",
              color: iconColor,
              marginBottom: 8,
            }}
          >
            <span
              className={cn(
                "transition-transform duration-200",
                hovered ? (isRTL ? "translate-x-1" : "-translate-x-1") : "translate-x-0"
              )}
            >
              {isRTL ? (
                <ArrowRight width={20} height={20} strokeWidth={2} />
              ) : (
                <ArrowLeft width={20} height={20} strokeWidth={2} />
              )}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Panel Toggle Button ───────────────────────────────────────────────────────
export interface TogglePanelButtonProps {
  isRTL: boolean;
  isDark: boolean;
  label: string;
  isCollapsed: boolean;
  onClick: () => void;
}

export function TogglePanelButton({
  isRTL,
  isDark,
  label,
  isCollapsed,
  onClick,
}: TogglePanelButtonProps) {
  const [hovered, setHovered] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement>(null);
  const iconColor = hovered ? (isDark ? "#ffffff" : "#000000") : isDark ? "#8A9CC0" : "#64748B";

  // Determine icon based on RTL and collapsed state
  let Icon = PanelLeftClose;
  if (isRTL) {
    Icon = isCollapsed ? PanelRightOpen : PanelRightClose;
  } else {
    Icon = isCollapsed ? PanelLeftOpen : PanelLeftClose;
  }

  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={btnRef}
            type="button"
            aria-label={label}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex items-center justify-center outline-none transition-all duration-200"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              cursor: "pointer",
              border: "1px solid transparent",
              background: hovered
                ? isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.05)"
                : "transparent",
              color: iconColor,
              marginBottom: 8,
            }}
          >
            <span
              className={cn(
                "transition-transform duration-200",
                hovered ? "scale-110" : "scale-100"
              )}
            >
              <Icon width={20} height={20} strokeWidth={2} />
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side={isRTL ? "left" : "right"} sideOffset={16}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return (
    <div
      style={{
        width: 32,
        height: 1,
        background: "hsl(var(--border))",
        opacity: 0.6,
        borderRadius: 1,
        margin: "12px 0",
        flexShrink: 0,
      }}
    />
  );
}

// ── Primary Rail Logo ─────────────────────────────────────────────────────────
export interface PrimaryRailLogoProps {
  tenantLogoUrl?: string | null;
  accent: string;
  isDark: boolean;
  isModuleMode: boolean;
  language: string;
  onClick: () => void;
}

export function PrimaryRailLogo({
  tenantLogoUrl,
  accent,
  isDark,
  isModuleMode,
  language,
  onClick,
}: PrimaryRailLogoProps) {
  return (
    <div
      className="flex shrink-0 cursor-pointer items-center justify-center transition-all duration-300 hover:scale-105"
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: tenantLogoUrl
          ? "transparent"
          : `linear-gradient(135deg, ${accent} 0%, ${isDark ? "#3B2FA3" : "#2D2580"} 100%)`,
        marginBottom: isModuleMode ? 12 : 20,
        boxShadow: tenantLogoUrl
          ? "none"
          : `0 6px 20px ${accent}50, 0 2px 8px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.2)`,
        overflow: "hidden",
        flexShrink: 0,
      }}
      onClick={onClick}
      role="link"
      aria-label={language === "ar" ? "الصفحة الرئيسية" : "Go to Home"}
    >
      {tenantLogoUrl ? (
        <img
          src={tenantLogoUrl}
          alt="Logo"
          style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 14 }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
            userSelect: "none",
            letterSpacing: "-0.5px",
            textShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        >
          N
        </span>
      )}
    </div>
  );
}

// ── Active Indicator ──────────────────────────────────────────────────────────
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
  isRTL,
}: ActiveIndicatorProps) {
  return (
    <div
      style={{
        position: "absolute",
        [isRTL ? "right" : "left"]: 0,
        top: indicatorTop + 4, // +4px to account for the margin-top of the first item
        width: 4,
        height: 44,
        background: indicatorColor,
        borderRadius: isRTL ? "4px 0 0 4px" : "0 4px 4px 0",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: indicatorVisible ? 1 : 0,
        transform: indicatorVisible ? "scaleY(1)" : "scaleY(0.3)",
        boxShadow: `0 0 12px ${indicatorColor}80`,
        zIndex: 10,
      }}
    />
  );
}
