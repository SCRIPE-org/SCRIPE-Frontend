"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@core/common/utils";
import type { NavigationItem } from "@core/config/navigation";
import { isNavigationItemActive } from "@core/config/navigation";

interface MinimalDropdownProps {
  item: NavigationItem;
  onNavigate?: () => void;
}

/**
 * Minimal Dropdown — Animated dropdown menu for topbar items.
 *
 * Opens on click, closes on click-outside or navigation.
 * Shows child items in a floating panel below the trigger.
 * Supports nested children (indented).
 */
export function MinimalDropdown({ item, onNavigate }: MinimalDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = isNavigationItemActive(item, pathname);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleNavigate = () => {
    setOpen(false);
    onNavigate?.();
  };

  const renderItem = (child: NavigationItem, depth: number = 0) => {
    const childActive = child.href ? pathname === child.href : false;
    const Icon = child.icon;

    return (
      <div key={child.name}>
        {child.href ? (
          <Link
            href={child.href}
            onClick={handleNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              childActive
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            style={{ paddingInlineStart: `${12 + depth * 16}px` }}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="truncate">{child.name}</span>
          </Link>
        ) : (
          <div
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60"
            style={{ paddingInlineStart: `${12 + depth * 16}px` }}
          >
            {child.name}
          </div>
        )}
        {child.children?.map((grandChild) => renderItem(grandChild, depth + 1))}
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/5 text-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        {item.icon && <item.icon className="h-4 w-4" />}
        <span>{item.name}</span>
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute top-full mt-1 w-56 rounded-xl py-1.5",
            "border border-border/50 bg-popover shadow-lg",
            "duration-150 animate-in fade-in-0 zoom-in-95",
            "z-50"
          )}
        >
          {item.children?.map((child) => renderItem(child))}
        </div>
      )}
    </div>
  );
}
