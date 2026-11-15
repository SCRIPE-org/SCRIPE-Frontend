"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { Button } from "@core/ui/button";
import { BRAND } from "@core/config/branding";

// ═══════════════════════════════════════════════════════════════════════════
// SignupShell — chrome shell for the Relay vNext signup wizard.
//
// `backdrop-blur` is used ONLY on the sticky header (and its progress band),
// per DESIGN.md — never on cards/panels. Semantic z-index tokens (`z-header` >
// `z-sticky` > `z-0`). Shell surface colors resolve via `--nx-*` CSS tokens
// immediately on first paint (preventing SSR Dark→Light hydration flash).
// ═══════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBandVariants(shouldReduce: boolean): Record<string, any> {
  return {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: shouldReduce ? { duration: 0 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: shouldReduce ? { duration: 0 } : { duration: 0.18, ease: [0.4, 0, 1, 1] },
    },
  };
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for signup shell props.
 */
export interface SignupShellProps {
  /** Main stage content (the current phase). */
  children: React.ReactNode;
  /**
   * Optional progress UI rendered in the sticky band beneath the header.
   * Supplied only on phases that show a stepper (account → review). When
   * omitted the band collapses to zero height. Placeholder slot for now.
   */
  progressSlot?: React.ReactNode;
  /**
   * Optional human-readable phase label, surfaced to assistive tech on the
   * progress band region. Falls back to a generic label.
   */
  phaseLabel?: string;
}

/**
 * Presentation UI component rendering the signup shell.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SignupShell({ children, progressSlot, phaseLabel }: SignupShellProps) {
  const { theme, toggleTheme, mounted } = useSignupTheme();
  const { t, direction } = useI18n();
  const shouldReduceMotion = Boolean(useReducedMotion());

  const isDark = theme === "dark";

  const themeLabel = useMemo(
    () => (isDark ? t("signup.shell.themeToLight") : t("signup.shell.themeToDark")),
    [isDark, t]
  );

  return (
    <div
      className="signup-shell relative flex min-h-[100dvh] flex-col bg-nx-ground text-nx-ink"
      dir={direction}
    >
      {/* ═══ Ambient background — CSS-token radial wash (frame-0 Light/Dark accurate). ═══ */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 50% at 80% 0%, color-mix(in srgb, var(--nx-accent) 6%, transparent) 0%, transparent 60%), radial-gradient(50% 45% at 0% 100%, color-mix(in srgb, var(--nx-info) 4%, transparent) 0%, transparent 55%)",
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          HEADER — sticky, fixed 56px height.
      ════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-header flex h-14 items-center justify-between border-b border-nx-line bg-[color:color-mix(in_srgb,var(--nx-surface)_85%,transparent)] px-5 backdrop-blur-xl sm:px-8">
        {/* ── Logo + wordmark ── */}
        <Link
          href="/"
          aria-label={BRAND.name}
          className="flex select-none items-center gap-2.5 rounded-nx-sm transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:shadow-nx-focus"
        >
          <img
            src="/brand/app-logo.svg"
            alt={BRAND.name}
            className="h-7 w-7 shrink-0"
            width={28}
            height={28}
          />
          <span className="text-[15px] font-semibold tracking-tight text-nx-ink">
            {BRAND.name}
          </span>
        </Link>

        {/* ── Trailing: theme toggle + sign-in ── */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="h-8 w-8 rounded-full border-nx-line bg-nx-raised text-nx-ink-2 hover:border-nx-line-hi hover:bg-nx-raised hover:text-nx-ink"
          >
            {mounted ? (
              isDark ? (
                <Sun size={15} aria-hidden="true" />
              ) : (
                <Moon size={15} aria-hidden="true" />
              )
            ) : (
              <span className="h-[15px] w-[15px]" aria-hidden="true" />
            )}
          </Button>

          <div className="flex items-center gap-1.5 text-[13px] text-nx-ink-3">
            <span className="hidden sm:inline">{t("signup.header.haveAccount")}</span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 rounded-nx-sm font-semibold text-nx-accent transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:shadow-nx-focus"
            >
              <span>{t("signup.header.signIn")}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          PROGRESS BAND — sticky beneath the header, animated height collapse.
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence initial={false}>
        {progressSlot && (
          <motion.div
            key="signup-progress-band"
            variants={getBandVariants(shouldReduceMotion)}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="region"
            aria-label={phaseLabel ?? t("signup.stepper.label")}
            className="sticky top-14 z-sticky overflow-hidden border-b border-nx-line bg-[color:color-mix(in_srgb,var(--nx-raised)_85%,transparent)] backdrop-blur-xl"
          >
            {progressSlot}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Stage ═══ */}
      <main id="signup-content" className="relative z-0 flex flex-1 flex-col">
        {children}
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-0 py-6 text-center text-[11px] text-nx-ink-3">
        © {new Date().getFullYear()} {BRAND.name} — {t("signup.copyright")}
      </footer>
    </div>
  );
}

export default SignupShell;
