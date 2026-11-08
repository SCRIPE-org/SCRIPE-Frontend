"use client";

/**
 * Sovereign Account Console Layout
 *
 * Standalone, focused account & security layout for SCRIPE Sovereign Account World v3.0.
 * Completely decoupled from the operational dashboard: NO sidebars, NO workspace rails, and NO module navigation.
 * Hosts the global ⌘K / Ctrl+K <SovereignCommandBar>, Alt+P Broadcast Privacy Mode toggle,
 * back-to-workspace return link, theme/language controls, and the persistent account console viewport.
 */
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Search,
  EyeOff,
  Eye,
} from "lucide-react";
import { SovereignCommandBar } from "@modules/profile/core/src/presentation/components/SovereignCommandBar";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { t, direction } = useI18n();
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [privacyBlur, setPrivacyBlur] = useState(false);

  const isRtl = direction === "rtl";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPrivacyBlur((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = () => {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username
    : "Capt. Seif El-Din Kamel";

  const userInitials = user
    ? `${(user.firstName?.[0] ?? "").toUpperCase()}${(user.lastName?.[0] ?? "").toUpperCase()}` || "SK"
    : "SK";

  return (
    <div
      data-sovereign-privacy-blur={privacyBlur ? "true" : "false"}
      className="min-h-screen flex flex-col bg-nx-ground text-nx-ink selection:bg-nx-accent/20 selection:text-nx-accent"
    >
      {/* ── Top Standalone Sovereign Header ───────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-nx-line bg-nx-surface/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Leading: Return to Dashboard Action + Brand Identity */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/overview")}
              className="gap-2 text-xs sm:text-sm font-medium text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised transition-colors"
            >
              <BackArrow className="h-4 w-4 shrink-0" />
              <span>{t("profile.accountPortal.backToDashboard")}</span>
            </Button>

            <div className="h-5 w-px bg-nx-line hidden sm:block" />

            <Link
              href="/overview"
              style={{ opacity: 1, animation: "none" }}
              className="hidden sm:flex items-center gap-2.5 group text-nx-ink"
            >
              <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-nx-line bg-nx-raised text-nx-ink flex items-center justify-center p-1.5 shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 404 303"
                  className="h-full w-full"
                  aria-label="SCRIPE Logo"
                >
                  <path
                    fill="var(--nx-ink-2)"
                    d="M 316.00,147.00 L 312.00,143.00 L 309.00,142.00 L 260.00,142.00 L 260.00,151.00 L 258.00,154.00 L 196.00,219.00 L 173.00,245.00 L 167.00,250.00 L 163.00,251.00 L 141.00,251.00 L 138.00,249.00 L 138.00,241.00 L 167.00,211.00 L 167.00,207.00 L 165.00,205.00 L 165.00,196.00 L 116.00,196.00 L 116.00,205.00 L 111.00,208.00 L 69.00,253.00 L 67.00,257.00 L 67.00,266.00 L 70.00,273.00 L 73.00,276.00 L 80.00,279.00 L 213.00,279.00 L 220.00,276.00 L 237.00,259.00 L 259.00,234.00 L 262.00,233.00 L 262.00,231.00 L 258.00,231.00 L 256.00,229.00 L 256.00,220.00 L 314.00,158.00 L 316.00,155.00 Z"
                  />
                  <path
                    fill="var(--nx-accent)"
                    d="M 295.00,29.00 L 293.00,29.00 L 291.00,27.00 L 291.00,25.00 L 173.00,25.00 L 166.00,24.00 L 161.00,26.00 L 150.00,36.00 L 27.00,164.00 L 24.00,174.00 L 27.00,185.00 L 34.00,192.00 L 41.00,195.00 L 190.00,195.00 L 195.00,193.00 L 222.00,165.00 L 224.00,158.00 L 220.00,153.00 L 218.00,152.00 L 139.00,152.00 L 138.00,151.00 L 138.00,142.00 L 204.00,73.00 L 207.00,72.00 L 249.00,72.00 L 250.00,73.00 L 263.00,72.00 L 294.00,41.00 L 296.00,37.00 Z"
                  />
                  <path
                    fill="currentColor"
                    d="M 173.00,138.00 L 174.00,140.00 L 176.00,141.00 L 309.00,141.00 L 312.00,142.00 L 317.00,147.00 L 317.00,155.00 L 315.00,158.00 L 257.00,220.00 L 256.00,222.00 L 256.00,228.00 L 260.00,231.00 L 264.00,231.00 L 267.00,230.00 L 309.00,185.00 L 377.00,115.00 L 380.00,108.00 L 380.00,98.00 L 376.00,90.00 L 370.00,85.00 L 365.00,83.00 L 224.00,83.00 L 219.00,85.00 L 176.00,130.00 L 173.00,134.00 Z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-semibold tracking-tight text-nx-ink group-hover:text-nx-accent transition-colors leading-tight">
                  {t("profile.accountPortal.brandTitle")}
                </span>
                <span className="text-[11px] font-medium text-nx-ink-2 font-mono leading-tight mt-0.5">
                  {t("profile.accountPortal.brandSubtitle")}
                </span>
              </div>
            </Link>
          </div>

          {/* Center / Trailing: ⌘K Command Bar, Alt+P Privacy Blur, Theme, Language, User Menu */}
          <div className="flex items-center gap-2">
            {/* ⌘K Sovereign Command Bar Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandBarOpen(true)}
              className="h-8 gap-2 border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink text-xs px-2.5"
              data-testid="sovereign-command-bar-trigger"
            >
              <Search className="h-3.5 w-3.5 text-nx-accent" />
              <span className="hidden md:inline">{t("profile.commandBar.triggerLabel")}</span>
              <Badge variant="outline" className="text-[10px] font-mono border-nx-line text-nx-ink-3 px-1 py-0">
                ⌘K
              </Badge>
            </Button>

            {/* Alt+P Broadcast Privacy Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPrivacyBlur((prev) => !prev)}
              className={
                privacyBlur
                  ? "h-8 gap-1.5 border-nx-accent bg-nx-accent-wash text-nx-accent text-xs px-2.5 font-semibold"
                  : "h-8 gap-1.5 border-nx-line bg-nx-raised text-nx-ink-2 hover:text-nx-ink text-xs px-2.5"
              }
              data-testid="sovereign-privacy-blur-toggle"
            >
              {privacyBlur ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden lg:inline">
                {privacyBlur ? t("profile.privacyBlur.active") : t("profile.privacyBlur.toggle")}
              </span>
            </Button>

            <ThemeSwitcher />
            <LanguageSwitcher />

            <div className="h-5 w-px bg-nx-line mx-1" />

            {/* User Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full p-0.5 hover:ring-2 hover:ring-nx-accent/30 focus:outline-hidden transition-all h-8 w-8"
                  aria-label={t("profile.accountPortal.userAccountMenu")}
                >
                  <Avatar className="h-8 w-8 border border-nx-line">
                    {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} alt={displayName} />}
                    <AvatarFallback className="bg-nx-accent-wash text-nx-accent text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRtl ? "start" : "end"}
                className="w-56 mt-1 border-nx-line bg-nx-surface text-nx-ink"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-nx-ink truncate">
                      {displayName}
                    </p>
                    <p className="text-xs leading-none text-nx-ink-3 font-mono truncate">
                      @{user?.username ?? "seif.kamel"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-nx-line" />
                <DropdownMenuItem
                  onClick={() => router.push("/overview")}
                  className="text-nx-ink hover:bg-nx-raised cursor-pointer"
                >
                  <LayoutDashboard className="me-2 h-4 w-4 text-nx-ink-3" />
                  <span>{t("profile.accountPortal.mainDashboard")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-nx-line" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="me-2 h-4 w-4" />
                  <span>{t("profile.accountPortal.signOut")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Broadcast Privacy Blur Active Banner */}
      {privacyBlur && (
        <div className="w-full border-b border-nx-accent/30 bg-nx-accent-wash px-4 py-1.5 text-center text-xs font-medium text-nx-accent">
          {t("profile.privacyBlur.bannerNotice")}
        </div>
      )}

      {/* ── Main Sovereign Viewport (NO sidebars, clean width) ─────────────── */}
      <main
        className={
          privacyBlur
            ? "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 [&_code]:blur-xs [&_.font-mono]:blur-[3px]"
            : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8"
        }
      >
        {children}
      </main>

      {/* ── Clean Security & Compliance Footer ─────────────────────────────── */}
      <footer className="border-t border-nx-line py-5 text-center text-xs text-nx-ink-3 bg-nx-ground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-medium text-nx-ink-2">
            <ShieldCheck className="h-4 w-4 text-nx-accent shrink-0" />
            <span>{t("profile.accountPortal.footerOrg")}</span>
          </div>
          <div className="text-[11px] text-nx-ink-3 font-mono">
            {t("profile.accountPortal.cryptoStandard")}
          </div>
        </div>
      </footer>

      <SovereignCommandBar
        open={commandBarOpen}
        onOpenChange={setCommandBarOpen}
        onTogglePrivacyBlur={() => setPrivacyBlur((prev) => !prev)}
      />
    </div>
  );
}
