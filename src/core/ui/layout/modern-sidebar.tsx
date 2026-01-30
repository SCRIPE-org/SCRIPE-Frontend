"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogOut, X, ChevronDown } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useAuthLogout } from "@modules/auth/hooks/useAuthLogout";
import { cn } from "@core/common/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@core/ui/collapsible";
import {
  isNavigationItemActive,
  type NavigationItem,
} from "@core/config/navigation";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { Logo } from "@core/ui/logo";
import { appLogger } from "@core/common/logger";

interface ModernSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onHoverChange: (hovered: boolean) => void;
  collapsible?: boolean;
}

export function ModernSidebar({
  open,
  onOpenChange,
  onHoverChange,
  collapsible = true,
}: ModernSidebarProps) {
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const user = useAppStore((state) => state.user);
  const { logout } = useAuthLogout();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      appLogger.error("Logout failed:", error);
      // You could show a toast notification here
    }
  };

  // Get navigation items with translations from dynamic navigation
  const navigation = useDynamicNavigation();

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHoverChange(false);
  };

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
    const Icon = item.icon;
    const indent = level * 16; // 16px per level
    const paddingStyle =
      direction === "rtl"
        ? { paddingRight: `${12 + indent}px` }
        : { paddingLeft: `${12 + indent}px` };

    if (hasChildren) {
      return (
        <Collapsible
          key={item.name}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.name)}
        >
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                "group flex items-center w-full rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer",
                item.disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg"
                  : "text-sidebar-foreground/70 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md",
                "px-3 py-3 space-x-3 rtl:space-x-reverse"
              )}
              style={paddingStyle}
            >
              <div
                className={cn(
                  "flex items-center flex-1 min-w-0 space-x-3 rtl:space-x-reverse"
                )}
              >
                {/* Icon - always visible */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-300 flex-shrink-0",
                    isHovered ? "w-10 h-10" : "w-8 h-8",
                    isActive
                      ? "bg-white/20 shadow-md"
                      : "bg-primary/10 group-hover:bg-primary/20"
                  )}
                >
                  {Icon ? (
                    <Icon
                      className={cn(
                        "flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                        isHovered ? "w-5 h-5" : "w-4 h-4",
                        isActive ? "text-white" : "text-primary"
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "rounded-full",
                        isHovered ? "w-2.5 h-2.5" : "w-2 h-2",
                        isActive ? "bg-white" : "bg-primary"
                      )}
                    />
                  )}
                </div>

                {/* Text content - only visible when hovered */}
                {isHovered && (
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{item.name}</span>
                  </div>
                )}

                {/* Badge - only visible when hovered */}
                {item.badge && isHovered && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs flex-shrink-0",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Chevron - only visible when hovered */}
              {isHovered && (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-all duration-300 flex-shrink-0 ml-auto",
                    isExpanded && "rotate-180",
                    isActive ? "text-white" : "text-primary"
                  )}
                />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) =>
              renderNavigationItem(child, level + 1)
            )}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href || "#"}
        className={cn(
          "group flex items-center w-full rounded-xl text-sm font-medium transition-all duration-300",
          item.disabled && "opacity-50 cursor-not-allowed pointer-events-none",
          isActive
            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg"
            : "text-sidebar-foreground/70 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md",
          "px-3 py-3 space-x-3 rtl:space-x-reverse"
        )}
        style={paddingStyle}
        onClick={() => !item.disabled && collapsible && onOpenChange(false)}
      >
        {/* Icon - always visible */}
        <div
          className={cn(
            "flex items-center justify-center rounded-full transition-all duration-300 flex-shrink-0",
            isHovered ? "w-10 h-10" : "w-8 h-8",
            isActive
              ? "bg-white/20 shadow-md"
              : "bg-primary/10 group-hover:bg-primary/20"
          )}
        >
          {Icon ? (
            <Icon
              className={cn(
                "flex-shrink-0 transition-all duration-300 group-hover:scale-110",
                isHovered ? "w-5 h-5" : "w-4 h-4",
                isActive ? "text-white" : "text-primary"
              )}
            />
          ) : (
            <div
              className={cn(
                "rounded-full",
                isHovered ? "w-2.5 h-2.5" : "w-2 h-2",
                isActive ? "bg-white" : "bg-primary"
              )}
            />
          )}
        </div>

        {/* Text content - only visible when hovered */}
        {isHovered && (
          <div className="flex-1 min-w-0">
            <span className="block truncate">{item.name}</span>
          </div>
        )}

        {/* Badge - only visible when hovered */}
        {item.badge && isHovered && (
          <Badge
            variant="secondary"
            className={cn(
              "text-xs flex-shrink-0",
              isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      <div
        className={cn(
          "sidebar fixed inset-y-0 z-50 bg-gradient-to-b from-sidebar via-sidebar/98 to-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 custom-scrollbar overflow-y-auto",
          "shadow-2xl shadow-primary/10 backdrop-blur-sm",
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full",
          isHovered ? "w-80" : "w-20"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-primary to-primary/80 shadow-lg",
                  "transition-all duration-300 hover:scale-105 hover:shadow-xl",
                  "w-12 h-12 flex-shrink-0"
                )}
              >
                <Logo size="sm" className="text-primary-foreground" />
              </div>
              {isHovered && (
                <div className="flex-1 min-w-0">
                  {/* Multi-line title with proper word wrapping */}
                  <h1 className="text-lg font-bold text-sidebar-foreground leading-tight break-words hyphens-auto">
                    {t("app.title")}
                  </h1>
                  <p className="text-xs text-sidebar-foreground/60 flex items-center mt-1 break-words">
                    <Logo
                      size="sm"
                      className="mr-1 rtl:mr-0 rtl:ml-1 flex-shrink-0"
                    />
                    <span className="break-words">{t("app.modern")}</span>
                  </p>
                </div>
              )}
            </div>

            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0",
                  "rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                )}
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b border-sidebar-border">
              <div
                className={cn(
                  "flex items-center rounded-2xl transition-all duration-300",
                  "bg-gradient-to-br from-primary/5 to-primary/2 border border-primary/10",
                  "shadow-sm hover:shadow-md",
                  isHovered
                    ? "space-x-3 rtl:space-x-reverse p-4"
                    : "justify-center p-2"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar
                    className={cn(
                      "ring-2 ring-primary/20 shadow-md transition-all duration-300 hover:scale-105",
                      isHovered ? "h-10 w-10" : "h-8 w-8"
                    )}
                  >
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                      {/*{ user.firstName.charAt(0) ?? user.username}
                      {user.lastName.charAt(0) ?? ""}*/}
                      {user.username}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div
                    className={cn(
                      "absolute rounded-full border-2 border-background shadow-sm transition-all duration-300",
                      isHovered
                        ? "bottom-0 right-0 w-3 h-3"
                        : "bottom-0 right-0 w-2 h-2"
                    )}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse" />
                  </div>
                </div>
                {isHovered && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sidebar-foreground font-medium truncate text-sm">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sidebar-foreground/60 text-xs truncate">
                      {user.adminTypeName}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2">
            {navigation.map((item) => renderNavigationItem(item))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-300",
                "rounded-xl shadow-sm hover:shadow-md hover:scale-105",
                isHovered
                  ? "px-3 py-3 space-x-3 rtl:space-x-reverse"
                  : "justify-center px-2 py-3"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-full bg-destructive/10 flex-shrink-0",
                  isHovered ? "w-10 h-10" : "w-8 h-8"
                )}
              >
                <LogOut
                  className={cn(
                    "text-destructive",
                    isHovered ? "w-5 h-5" : "w-4 h-4"
                  )}
                />
              </div>
              {isHovered && (
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{t("nav.logout")}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
