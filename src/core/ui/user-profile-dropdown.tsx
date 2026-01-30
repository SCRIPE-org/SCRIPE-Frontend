"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { ChevronDown, Settings, User, LogOut } from "lucide-react";
import { useAppStore } from "@core/store/useAppStore";
import { useAuthLogout } from "@modules/auth/hooks/useAuthLogout";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { appLogger } from "@core/common/logger";

interface UserProfileDropdownProps {
  variant?:
  | "default"
  | "compact"
  | "minimal"
  | "elegant"
  | "floating"
  | "navigation";
  showName?: boolean;
  className?: string;
}

export function UserProfileDropdown({
  variant = "default",
  showName = true,
  className,
}: UserProfileDropdownProps) {
  const user = useAppStore((state) => state.user);
  const { logout } = useAuthLogout();
  const { t } = useI18n();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettings();

  if (!user || !settings.showUserAvatar) return null;

  const getInitials = () => {
    // Safe handling of user name
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const firstInitial = firstName.charAt(0)?.toUpperCase() || "";
    const lastInitial = lastName.charAt(0)?.toUpperCase() || "";
    return `${firstInitial}${lastInitial}` || "U";
  };

  const getDisplayName = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName} ${lastName}`.trim() || user.username || "User";
  };

  const handleProfileClick = () => {
    router.push("/profile");
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    router.push("/settings");
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      appLogger.error("Logout failed:", error);
      // Keep dropdown open if logout fails so user can try again
      // You could also show a toast notification here
    }
  };

  const getAvatarSize = () => {
    switch (variant) {
      case "compact":
        return "h-8 w-8";
      case "minimal":
        return "h-7 w-7";
      case "floating":
        return "h-9 w-9";
      case "navigation":
        return "h-8 w-8";
      default:
        return "h-9 w-9";
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case "compact":
        return "text-xs";
      case "minimal":
        return "text-xs";
      case "floating":
        return "text-sm";
      case "navigation":
        return "text-sm";
      default:
        return "text-sm";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 p-2 hover:bg-accent/50 transition-colors h-10",
            variant === "navigation" && "h-9",
            variant === "floating" && "rounded-full",
            className
          )}
        >
          <Avatar className={cn(getAvatarSize(), "border-2 border-primary/20")}>
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {showName && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-right rtl:text-left min-w-0">
                <p
                  className={cn(
                    "font-medium truncate max-w-[120px]",
                    getTextSize()
                  )}
                >
                  {getDisplayName()}
                </p>
                <p
                  className={cn(
                    "text-muted-foreground truncate max-w-[120px]",
                    variant === "navigation" ? "text-xs" : "text-xs"
                  )}
                >
                  {user.adminTypeName || (user as any).role || t("common.user")}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "transition-transform duration-200 flex-shrink-0",
                  isOpen && "rotate-180",
                  variant === "compact" ? "h-3 w-3" : "h-4 w-4"
                )}
              />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-2"
        side={variant === "navigation" ? "bottom" : "bottom"}
      >
        <div className="flex items-center gap-3 p-2 mb-2">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="text-right rtl:text-left min-w-0">
            <p className="font-medium text-sm truncate">{getDisplayName()}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.adminTypeName || (user as any).role || t("common.user")}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleProfileClick}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 rounded-md"
        >
          <User className="h-4 w-4" />
          <span>{t("nav.profile")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50 rounded-md"
        >
          <Settings className="h-4 w-4" />
          <span>{t("nav.settings")}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-destructive/10 text-destructive rounded-md"
        >
          <LogOut className="h-4 w-4" />
          <span>{t("nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
