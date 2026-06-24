// UI-EXCEPTION: compact studio layout
"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { BRAND } from "@core/config/branding";

// ═══════════════════════════════════════════════════════════════════════════
// SignupShell — the chrome / shell for the new (Elevate) signup wizard.
//
// Responsibilities (pure UI — no business logic, no data layer):
//   • Sticky header: logo + wordmark, theme toggle, "Already have an account?".
//   • Animated progress-band slot below the header (collapses to zero height
//     when no progress node is supplied — wired up in later phases).
//   • Ambient background per the "Elevate" bar: a single restrained accent
//     wash over the page gradient. NO heavy purple-glow orbs.
//   • Footer with copyright.
//
// `backdrop-blur` is used ONLY on the sticky header (and its progress band),
// per DESIGN.md — never on cards/panels. Semantic z-index: header(40) >
// progress-band(30) > content.
// ═══════════════════════════════════════════════════════════════════════════

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Height-collapse for the progress band. Reduced-motion → instant.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BAND_VARIANTS: Record<string, any> = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

/**
 * Interface structure detailing the properties and attributes of Signup Shell Props.
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
 * React presentation component representing the signup shell UI element.
 */
export function SignupShell({ children, progressSlot, phaseLabel }: SignupShellProps) {
  const { tokens, theme, toggleTheme } = useSignupTheme();
  const { t, direction } = useI18n();

  const isDark = theme === "dark";

  const headerSurface = isDark ? "rgba(10, 8, 22, 0.72)" : "rgba(248, 247, 255, 0.82)";
  const bandSurface = isDark ? "rgba(10, 8, 22, 0.6)" : "rgba(248, 247, 255, 0.75)";

  const themeLabel = useMemo(
    () => (isDark ? t("signup.shell.themeToLight") : t("signup.shell.themeToDark")),
    [isDark, t]
  );

  return (
    <div
      className="signup-shell relative flex min-h-[100dvh] flex-col"
      dir={direction}
      style={{ background: tokens.gradientPage }}
    >
      {/* ═══ Ambient background — restrained accent wash (NOT a glow orb).
          Two faint, fixed, non-interactive layers that read as depth, not
          decoration. Opacity is intentionally tiny so the page stays calm. ═══ */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background: `radial-gradient(60% 50% at 80% 0%, ${tokens.accent}0f 0%, transparent 60%),
                       radial-gradient(50% 45% at 0% 100%, ${tokens.cyan}0a 0%, transparent 55%)`,
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════
          HEADER — sticky, fixed 56px height. Logo + wordmark on the leading
          edge; theme toggle + "Already have an account? Sign in" on the
          trailing edge. backdrop-blur is allowed here (and only here).
      ════════════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-5 sm:px-8"
        style={{
          background: headerSurface,
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        {/* ── Logo + wordmark ── */}
        <Link
          href="/"
          aria-label={BRAND.name}
          className="flex select-none items-center gap-2.5 transition-opacity hover:opacity-75"
        >
          <Image
            src="/app-logo.png"
            alt={BRAND.name}
            className="h-7 w-auto"
            width={28}
            height={28}
            priority
          />
          <span className="text-[15px] font-semibold tracking-tight" style={{ color: tokens.ink }}>
            {BRAND.name}
          </span>
        </Link>

        {/* ── Trailing: theme toggle + sign-in ── */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="rounded-full p-2 transition-all duration-200 hover:opacity-80"
            style={{
              background: tokens.surfaceRaised,
              border: tokens.borderCard,
              color: tokens.inkMuted,
            }}
          >
            {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
          </button>

          <div className="flex items-center gap-1.5 text-[13px]" style={{ color: tokens.inkFaint }}>
            <span className="hidden sm:inline">{t("signup.header.haveAccount")}</span>
            <Link
              href="/login"
              className="font-semibold transition-colors hover:opacity-80"
              style={{ color: tokens.accent }}
            >
              {t("signup.header.signIn")}{" "}
              <span
                aria-hidden
                className="inline-block"
                style={{ transform: direction === "rtl" ? "scaleX(-1)" : "none" }}
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          PROGRESS BAND — sticky beneath the header, animated height collapse.
          Renders only when a progressSlot is supplied (later phases).
      ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence initial={false}>
        {progressSlot && (
          <motion.div
            key="signup-progress-band"
            variants={BAND_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="region"
            aria-label={phaseLabel ?? t("signup.stepper.label")}
            className="sticky top-14 z-30 overflow-hidden"
            style={{
              background: bandSurface,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderBottom: `1px solid ${tokens.border}`,
            }}
          >
            {progressSlot}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Stage ═══ */}
      <main className="relative z-0 flex flex-1 flex-col">{children}</main>

      {/* ═══ Footer ═══ */}
      <footer
        className="relative z-0 py-6 text-center text-[11px]"
        style={{ color: tokens.inkGhost }}
      >
        © {new Date().getFullYear()} {BRAND.name} — {t("signup.copyright")}
      </footer>
    </div>
  );
}

export default SignupShell;
