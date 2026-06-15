"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { WelcomeContent } from "../../../domain/entities/OnboardingEntities";
import { TrustRow } from "./TrustRow";
import { LogoMarquee } from "./LogoMarquee";

// ═══════════════════════════════════════════════════════════════════════════
// WelcomeScreen — the branded entry to the new (Elevate) signup flow.
//
// Pure UI. The viewmodel owns the fetch and passes content + states + the CTA
// handler in. Layout is an ASYMMETRIC two-column split on desktop (editorial
// lede on the leading column, trust content on the trailing column), collapsing
// to a single column on mobile — never a centered hero.
//
// Honors "Elevate": solid-ink editorial headline (no gradient text), accent
// reserved for the single primary action, depth shadow (no purple glow), one
// font family, restrained staggered entrance with a reduced-motion fallback.
// ═══════════════════════════════════════════════════════════════════════════

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Restrained staggered entrance. Reduced-motion → everything instant + visible.
const container = {
  hidden: {},
  show: {
    transition: prefersReducedMotion ? {} : { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};
const item = prefersReducedMotion
  ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
  : {
      hidden: { opacity: 0, y: 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
      },
    };

interface WelcomeScreenProps {
  content: WelcomeContent | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  /** Primary CTA → enter the flow (viewmodel.goToDiscovery). */
  onGetStarted: () => void;
}

export function WelcomeScreen({
  content,
  isLoading,
  isError,
  onRetry,
  onGetStarted,
}: WelcomeScreenProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  // Resolve copy: live content first, localized fallbacks so the screen never
  // blanks out and the empty state is still a confident headline.
  const headline = content?.headline?.trim() || t("signup.welcome.headlineFallback");
  const subcopy = content?.subcopy?.trim() || t("signup.welcome.subcopyFallback");
  const ctaLabel = content?.ctaLabel?.trim() || t("signup.welcome.ctaFallback");

  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  const hasTrustContent = useMemo(
    () =>
      !!content &&
      ((content.trustMarks?.length ?? 0) > 0 ||
        (content.customerLogos?.length ?? 0) > 0 ||
        (content.trustedByCount > 0 && content.trustedByLabel.trim() !== "")),
    [content]
  );

  if (isLoading) {
    return <WelcomeSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16"
      >
        {/* ── Leading column: editorial lede + primary action ── */}
        <div className="flex flex-col gap-7">
          <motion.h1
            variants={item}
            className="text-balance font-semibold"
            style={{
              color: tokens.ink,
              fontSize: "clamp(2.1rem, 1.4rem + 3.2vw, 3rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            {headline}
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-[46ch] text-pretty"
            style={{
              color: tokens.inkMuted,
              fontSize: "clamp(1rem, 0.95rem + 0.3vw, 1.15rem)",
              lineHeight: 1.6,
            }}
          >
            {subcopy}
          </motion.p>

          <motion.div variants={item} className="flex flex-col gap-3.5 pt-1">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
                style={{
                  background: tokens.gradientCta,
                  color: tokens.accentContrast,
                  boxShadow: tokens.shadowCard,
                }}
              >
                {ctaLabel}
                <ArrowIcon
                  size={18}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  style={{ transform: direction === "rtl" ? "scaleX(-1)" : undefined }}
                />
              </button>

              {/* Inline error recovery — never replaces the whole screen. */}
              {isError && (
                <span className="inline-flex items-center gap-2 text-[13px]">
                  <span style={{ color: tokens.inkFaint }}>{t("signup.welcome.loadError")}</span>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="font-semibold underline-offset-2 hover:underline"
                    style={{ color: tokens.accent }}
                  >
                    {t("signup.welcome.retry")}
                  </button>
                </span>
              )}
            </div>

            <p className="text-[13px]" style={{ color: tokens.inkFaint }}>
              {t("signup.welcome.reassurance")}
            </p>
          </motion.div>
        </div>

        {/* ── Trailing column: trust panel (only when there's content to show) ── */}
        {hasTrustContent && content && (
          <motion.aside
            variants={item}
            className="flex flex-col gap-7 rounded-2xl p-7 sm:p-8"
            style={{
              background: tokens.surfaceCard,
              border: tokens.borderCard,
              boxShadow: tokens.shadowCard,
            }}
          >
            <div className="flex flex-col gap-5">
              <h2 className="text-[15px] font-semibold leading-snug" style={{ color: tokens.ink }}>
                {t("signup.welcome.proofTitle")}
              </h2>
              <TrustRow
                trustMarks={content.trustMarks}
                trustedByCount={content.trustedByCount}
                trustedByLabel={content.trustedByLabel}
              />
            </div>

            {content.customerLogos.length > 0 && (
              <div className="border-t pt-6" style={{ borderColor: tokens.border }}>
                <LogoMarquee
                  logos={content.customerLogos}
                  caption={t("signup.welcome.logosTitle")}
                />
              </div>
            )}
          </motion.aside>
        )}
      </motion.div>
    </div>
  );
}

// ─── Skeleton — calm loading state (not a spinner) ──────────────────────────

function WelcomeSkeleton() {
  const { tokens } = useSignupTheme();
  const block = (cls: string, opacity = 1) => (
    <div
      className={`animate-pulse rounded-lg motion-reduce:animate-none ${cls}`}
      style={{ background: tokens.surfaceRaised, opacity }}
    />
  );

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <div className="flex flex-col gap-7">
          <div className="space-y-3">
            {block("h-10 w-11/12")}
            {block("h-10 w-3/4")}
          </div>
          <div className="space-y-2.5">
            {block("h-4 w-full", 0.6)}
            {block("h-4 w-5/6", 0.6)}
          </div>
          {block("h-12 w-44", 0.8)}
        </div>
        <div
          className="flex flex-col gap-6 rounded-2xl p-7 sm:p-8"
          style={{ background: tokens.surfaceCard, border: tokens.borderCard }}
        >
          {block("h-4 w-2/3", 0.5)}
          <div className="flex flex-wrap gap-4">
            {block("h-4 w-24", 0.45)}
            {block("h-4 w-20", 0.45)}
            {block("h-4 w-16", 0.45)}
          </div>
          <div
            className="flex flex-wrap gap-6 border-t pt-6"
            style={{ borderColor: tokens.border }}
          >
            {block("h-5 w-20", 0.4)}
            {block("h-5 w-24", 0.4)}
            {block("h-5 w-16", 0.4)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
