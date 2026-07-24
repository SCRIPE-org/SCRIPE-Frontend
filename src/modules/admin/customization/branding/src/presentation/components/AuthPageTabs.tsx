/**
 * AuthPageTabs — Horizontal tab strip for selecting the auth page to customize.
 *
 * Displays 6 tabs: Login, Forgot Password, Reset Password, Register, Verify Email, MFA.
 * Each page shares global tokens (colors, fonts, spacing) but can have its own
 * layout, headline, and subtitle.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { LogIn, KeyRound, RotateCcw, UserPlus, MailCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/core/common/utils";
import { AUTH_PAGES, type AuthPageId } from "../../domain/entities/StudioDraft";
import { useI18n } from "@core/providers/i18n-provider";

const ICON_MAP: Record<string, React.ElementType> = {
  LogIn,
  KeyRound,
  RotateCcw,
  UserPlus,
  MailCheck,
  ShieldCheck,
};

interface AuthPageTabsProps {
  activePageId: AuthPageId;
  onPageChange: (pageId: AuthPageId) => void;
}

/**
 * Presentation UI component rendering the auth page tabs.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function AuthPageTabs({ activePageId, onPageChange }: AuthPageTabsProps) {
  const { t } = useI18n();
  return (
    <div className="scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-nx-line bg-nx-raised px-4 py-1.5">
      <span className="me-2 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
        {t("studio.pages.label")}
      </span>
      {AUTH_PAGES.map((page) => {
        const Icon = ICON_MAP[page.icon];
        const isActive = activePageId === page.id;
        return (
          <button
            key={page.id}
            type="button"
            onClick={() => onPageChange(page.id)}
            aria-pressed={isActive}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap rounded-nx-control px-3 py-1.5 text-xs font-medium transition-[color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              isActive
                ? "bg-nx-accent-fill text-nx-on-fill"
                : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
            <span>{t(page.labelKey) || page.id}</span>
          </button>
        );
      })}
    </div>
  );
}
