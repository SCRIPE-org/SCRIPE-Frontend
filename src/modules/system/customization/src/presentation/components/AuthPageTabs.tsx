/**
 * AuthPageTabs — Horizontal tab strip for selecting the auth page to customize.
 *
 * Displays 6 tabs: Login, Forgot Password, Reset Password, Register, Verify Email, MFA.
 * Each page shares global tokens (colors, fonts, spacing) but can have its own
 * layout, headline, and subtitle.
 */
"use client";

import { LogIn, KeyRound, RotateCcw, UserPlus, MailCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/core/common/utils";
import { AUTH_PAGES, type AuthPageId } from "../../domain/entities/StudioDraft";

const ICON_MAP: Record<string, React.ElementType> = {
  LogIn,
  KeyRound,
  RotateCcw,
  UserPlus,
  MailCheck,
  ShieldCheck,
};

interface AuthPageTabsProps {
  t: (key: string) => string;
  activePageId: AuthPageId;
  onPageChange: (pageId: AuthPageId) => void;
}

export function AuthPageTabs({ t, activePageId, onPageChange }: AuthPageTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-4 py-1.5 overflow-x-auto scrollbar-none">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 me-2">
        {t("studio.pages.label") || "Page"}
      </span>
      {AUTH_PAGES.map((page) => {
        const Icon = ICON_MAP[page.icon];
        const isActive = activePageId === page.id;
        return (
          <button
            key={page.id}
            onClick={() => onPageChange(page.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            title={t(page.labelKey) || page.id}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{t(page.labelKey) || page.id}</span>
          </button>
        );
      })}
    </div>
  );
}
