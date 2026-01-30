"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
  isNavigationItemActive,
  type NavigationItem,
} from "@core/config/navigation";
import { cn } from "@core/common/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Logo } from "@core/ui/logo";

interface NavigationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavigationSidebar({
  open,
  onOpenChange,
}: NavigationSidebarProps) {
  const pathname = usePathname();
  const { t, language, direction } = useI18n();
  const navigation = useDynamicNavigation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);


  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isNavigationItemActive(item, pathname);
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    const displayName = item.name.startsWith("nav.") ? t(item.name) : item.name;

    return (
      <div key={item.name} className="w-full">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
            level > 0 && "ml-6 pl-6 border-l border-slate-700/50",
            isActive
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "text-slate-300 hover:bg-slate-800/50 hover:text-white",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => {
            if (item.disabled) return;
            if (hasChildren) {
              toggleExpanded(item.name);
            }
          }}
        >
          {item.icon ? (
            <item.icon
              className={cn("w-5 h-5 shrink-0", isActive && "text-white")}
            />
          ) : (
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full shrink-0",
                isActive ? "bg-white" : "bg-slate-400"
              )}
            />
          )}

          {hasChildren ? (
            <span className="flex-1 text-sm font-medium truncate">
              {displayName}
            </span>
          ) : (
            <Link
              href={item.href || "#"}
              className="flex-1 text-sm font-medium truncate"
              onClick={(e) => {
                if (window.innerWidth < 1024) {
                  onOpenChange(false);
                }
              }}
            >
              {displayName}
            </Link>
          )}

          {item.badge && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-blue-600 text-white"
            >
              {item.badge}
            </Badge>
          )}

          {hasChildren && (
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "navigation-sidebar fixed inset-y-0 z-50 w-72 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
            <Logo className="w-8 h-8" />
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-lg leading-tight break-words">
                {t("app.tagline")}
              </h1>
              <p className="text-slate-400 text-sm">{t("nav.dashboard")}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
            {navigation.map((item) => renderNavigationItem(item))}
          </div>

          {/* User Section */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
              <Avatar className="w-10 h-10 ring-2 ring-slate-700">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  SM
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{t("common.user")}</p>
                <p className="text-slate-400 text-xs truncate">{t("nav.profile")}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-950" />
            </div>

            {/* Settings Button */}
            <Button
              variant="ghost"
              className="w-full mt-3 justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800/50"
              asChild
            >
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4" />
                {t("nav.settings")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
