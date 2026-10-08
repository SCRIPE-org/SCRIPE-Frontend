/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * UserProfileDropdown — the identity cluster's anchor.
 *
 * Wave I2 elevation. What changed, and why:
 *
 *  • COLOUR: every literal is gone. The panel used to branch on
 *    `resolvedTheme === "dark"` for its surface, border, shadow and every
 *    separator (`#0d1117`, `bg-white/[0.03]`, `border-white/20`…), which meant
 *    the menu had its own private theme instead of the shell's. It now reads
 *    --nx-* tokens only, so light/dark resolve in CSS and there is no isDark
 *    ternary left in this file.
 *  • ACCENT: the avatar gradient concatenated a workspace accent string with a
 *    hardcoded indigo second stop per theme. --nx-accent/--nx-accent-fill are
 *    derived from --workspace-hue/--workspace-chroma in CSS, so the SAME
 *    workspace-accent data path now paints it, correctly, in both themes.
 *  • IDENTITY: the header shows avatar + name + email (the account's actual
 *    address), with the admin type as a quiet chip instead of a second grey
 *    line indistinguishable from the name.
 *  • HIERARCHY: navigation items are one semantic group; sign-out is separated
 *    and destructive-tinted so it can never be mistaken for a nav row.
 *  • FOCUS: the highlighted row wears the lit inline-start edge (the same
 *    2px accent bar the checkbox/radio items use) — light collects on the
 *    focused thing. Trigger focus rides the shared Button --nx-focus ring.
 *  • MOTION: 140ms (--nx-t-micro) on the chevron and row crossfades, with a
 *    reduced-motion path; the panel's own enter/exit belongs to the primitive.
 *
 * Every prop, handler and data path is unchanged: variants, showName, side,
 * align, className, the showUserAvatar gate, profile/settings navigation and
 * the logout call all behave exactly as before.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { ChevronDown, Settings, User, LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAppStore } from "@core/store/useAppStore";
import { useAuthLogout } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogout";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { useResolvedFileUrl } from "@core/hooks/use-resolved-file-url";
import { useSettings } from "@core/providers/settings-provider";
import { appLogger } from "@core/common/logger";

interface UserProfileDropdownProps {
  variant?: "default" | "compact" | "minimal" | "elegant" | "floating" | "navigation";
  showName?: boolean;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

/**
 * One menu row. `shortcut` is rendered only when a REAL binding exists —
 * nothing in this menu is bound today (the only global chord in the shell is
 * ⌘K for the search palette, which is not a row here), so no hint is invented.
 * Wire a binding and set the field; the hint renders itself.
 */
interface ProfileMenuRow {
  key: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  shortcut?: string;
}

// The avatar mark: accent (L0.68 dark / L0.46 light) into accent-fill (L0.50).
// Both track --workspace-hue, so the mark carries the active workspace's
// identity and stays legible against --nx-on-fill in either theme.
const AVATAR_MARK = "linear-gradient(135deg, var(--nx-accent) 0%, var(--nx-accent-fill) 100%)";

// Shared row shape. The lit inline-start edge appears only on the highlighted
// row (Radix sets data-highlighted for both pointer and keyboard focus).
const ROW_BASE = cn(
  "group relative flex cursor-pointer select-none items-center gap-2.5 px-2.5 py-2 text-sm font-medium",
  "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
  "before:absolute before:inset-y-1.5 before:start-0 before:w-0.5 before:rounded-full before:bg-transparent before:transition-colors before:duration-nx-micro motion-reduce:before:transition-none"
);

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
  // Hooks must run unconditionally — called before the early return below.
  const resolvedAvatarUrl = useResolvedFileUrl(user?.profileImageUrl);

  if (!user || !settings.showUserAvatar) return null;

  const avatarUrl = resolvedAvatarUrl || undefined;

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

  const displayName = getDisplayName();
  const roleLabel = user.adminTypeName || (user as any).role || t("common.user");
  // The account's address is the header's second line; username is the fallback
  // when the account carries no email. Never repeat the display name.
  const emailLine = (user.email || user.username || "").trim();
  const showEmailLine = emailLine.length > 0 && emailLine !== displayName;

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

  const navRows: ProfileMenuRow[] = [
    { key: "profile", icon: User, label: t("nav.profile"), onClick: handleProfileClick },
    { key: "settings", icon: Settings, label: t("nav.settings"), onClick: handleSettingsClick },
  ];

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
          // Icon-only variants (rail, mobile) render no visible label, so the
          // trigger carries one. When the name IS visible the label would only
          // duplicate — and risk contradicting — the rendered text.
          aria-label={showName ? undefined : displayName}
          className={cn(
            "flex h-10 items-center gap-2 p-2 text-nx-ink hover:bg-nx-hover",
            variant === "navigation" && "h-9",
            variant === "floating" && "rounded-full",
            className
          )}
        >
          <Avatar className={cn(getAvatarSize(), "shadow-nx-sm")}>
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback
              delayMs={600}
              style={{ background: AVATAR_MARK }}
              className="text-sm font-semibold text-nx-on-fill"
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {showName && (
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 text-start">
                <p className={cn("max-w-[120px] truncate font-medium text-nx-ink", getTextSize())}>
                  {displayName}
                </p>
                <p className="max-w-[120px] truncate text-xs text-nx-ink-2">{roleLabel}</p>
              </div>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "flex-shrink-0 text-nx-ink-3 transition-transform duration-nx-micro ease-nx-enter motion-reduce:transition-none",
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
        className="w-64 p-1.5"
        side={side || "bottom"}
        sideOffset={8}
      >
        {/* ── Identity header ──────────────────────────────────────────────
            A sunken slab: --nx-ground sits below --nx-popover in BOTH themes
            (dark #0C0B12 under #1B1926, light #F7F6FB under #FFFFFF), so the
            header reads as its own plane without a per-theme branch. */}
        <div className="mb-1 flex items-center gap-3 rounded-nx-control border border-nx-line bg-nx-ground p-2.5">
          <Avatar className="h-10 w-10 shrink-0 shadow-nx-sm">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback
              delayMs={600}
              style={{ background: AVATAR_MARK }}
              className="text-sm font-semibold text-nx-on-fill"
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-start">
            <p className="truncate text-sm font-semibold leading-tight text-nx-ink">
              {displayName}
            </p>
            {showEmailLine && (
              <p className="mt-0.5 truncate text-xs leading-tight text-nx-ink-2" title={emailLine}>
                {emailLine}
              </p>
            )}
            <span className="mt-1.5 inline-flex max-w-full truncate rounded-nx-sm border border-nx-line bg-nx-surface px-1.5 py-0.5 text-[10px] font-medium leading-4 text-nx-ink-2">
              {roleLabel}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* ── Navigation group ─────────────────────────────────────────── */}
        <DropdownMenuGroup>
          {navRows.map(({ key, icon: Icon, label, onClick, shortcut }) => (
            <DropdownMenuItem
              key={key}
              onClick={onClick}
              className={cn(
                ROW_BASE,
                "text-nx-ink focus:bg-nx-hover focus:text-nx-ink data-[highlighted]:before:bg-nx-accent"
              )}
            >
              <Icon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-nx-ink-3 transition-colors duration-nx-micro group-data-[highlighted]:text-nx-accent motion-reduce:transition-none"
              />
              <span className="truncate">{label}</span>
              {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ── Destructive: sign out ────────────────────────────────────── */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className={cn(
            ROW_BASE,
            "text-destructive focus:bg-destructive/10 focus:text-destructive data-[highlighted]:before:bg-destructive"
          )}
        >
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate">{t("nav.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
