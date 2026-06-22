"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
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
import { useAuthLogout } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogout";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { appLogger } from "@core/common/logger";
import { useTheme } from "next-themes";
import { useWorkspace } from "@core/providers/workspace-provider";

const API_URL = process.env.NEXT_PUBLIC_File_URL || "";

/**
 * Build the full avatar URL by prepending the API base URL
 * if the path is relative (starts with /).
 * Also strips any existing ?v= cache-buster and appends a fresh one.
 */
function getAvatarUrl(profileImageUrl: string | null | undefined): string | undefined {
  if (!profileImageUrl) return undefined;
  return `${API_URL}${profileImageUrl}`;
}

interface UserProfileDropdownProps {
  variant?: "default" | "compact" | "minimal" | "elegant" | "floating" | "navigation";
  showName?: boolean;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function UserProfileDropdown({
  variant = "default",
  showName = true,
  className,
  side,
  align = "end",
}: UserProfileDropdownProps) {
  const user = useAppStore((state) => state.user);
  const { logout } = useAuthLogout();
  const { t } = useI18n();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const settings = useSettings();
  const { resolvedTheme } = useTheme();
  const { accentColor } = useWorkspace();
  const isDark = resolvedTheme === "dark";
  const accent = accentColor ?? (isDark ? "#7C6FD4" : "#6258c4");

  if (!user || !settings.showUserAvatar) return null;

  const avatarUrl = getAvatarUrl(user.profileImageUrl);

  // Avatar gradient that matches the Nexus accent colour
  const avatarGradient = `linear-gradient(135deg, ${accent}CC 0%, ${isDark ? "#3B2FA3" : "#2D2580"} 100%)`;

  const getInitials = () => {
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
            "flex h-10 items-center gap-2 p-2 transition-colors hover:bg-accent/50",
            variant === "navigation" && "h-9",
            variant === "floating" && "rounded-full",
            className
          )}
        >
          <Avatar className={cn(getAvatarSize(), "border-2 border-white/20 shadow-md")}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={getDisplayName()} />}
            <AvatarFallback
              delayMs={600}
              style={{ background: avatarGradient }}
              className="text-sm font-semibold text-white"
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {showName && (
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 text-start">
                <p className={cn("max-w-[120px] truncate font-medium", getTextSize())}>
                  {getDisplayName()}
                </p>
                <p
                  className={cn(
                    "max-w-[120px] truncate text-muted-foreground",
                    variant === "navigation" ? "text-xs" : "text-xs"
                  )}
                >
                  {user.adminTypeName || (user as any).role || t("common.user")}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180",
                  variant === "compact" ? "h-3 w-3" : "h-4 w-4"
                )}
              />
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className={cn(
          "w-60 border p-2",
          isDark
            ? "border-white/[0.08] bg-[#0d1117] shadow-2xl shadow-black/50"
            : "border-black/[0.08] bg-white shadow-xl shadow-black/10"
        )}
        side={side || (variant === "navigation" ? "bottom" : "bottom")}
        sideOffset={6}
      >
        {/* User info header */}
        <div
          className={cn(
            "mb-2 flex items-center gap-3 rounded-lg p-3",
            isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"
          )}
        >
          <Avatar className="h-10 w-10 border-2 border-white/20 shadow-md">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={getDisplayName()} />}
            <AvatarFallback
              delayMs={600}
              style={{ background: avatarGradient }}
              className="font-semibold text-white"
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-start">
            <p className="truncate text-sm font-semibold">{getDisplayName()}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.adminTypeName || (user as any).role || t("common.user")}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className={isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"} />

        <DropdownMenuItem
          onClick={handleProfileClick}
          className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent/50 focus:bg-accent/50"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{t("nav.profile")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent/50 focus:bg-accent/50"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>{t("nav.settings")}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator
          className={cn("my-1", isDark ? "bg-white/[0.06]" : "bg-black/[0.06]")}
        />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span>{t("nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
