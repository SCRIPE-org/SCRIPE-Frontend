/**
 * LandingHeroBlock — Commercial documentation landing hero banner with parallax visuals,
 * animated typography, CTA triggers, and live platform telemetry.
 */

"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@core/ui/button";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { usePublicPlatformStats } from "../../hooks/usePublicPlatformStats";
import type { LandingHeroBlockSection } from "../../../domain/entities/DocSection";
import { ArrowIcon, CheckIcon, PlayIcon } from "./HeroIcons";
import { HeroMarqueeStrip } from "./HeroMarqueeStrip";
import { HeroProductCard } from "./HeroProductCard";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(7px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
};

/**
 * Splits headline text into individual animated word tokens or gradient lines.
 *
 * @param props Text string and gradient toggle flag.
 * @returns Animated or gradient-clipped word fragments.
 */
function SplitWords({ text, gradient }: { text: string; gradient?: boolean }) {
  if (gradient) {
    return (
      <span className="com-hero-gradient-line" aria-label={text}>
        {text}
      </span>
    );
  }

  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="com-hero-word"
          variants={fadeUp}
          style={{ "--i": i } as CSSProperties}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

/**
 * Main landing hero block component orchestrating copy, interactive cards, and marquee ribbons.
 *
 * @param props Section model containing headline keys, subtitle keys, and CTA URLs.
 * @returns Rendered landing hero block with scroll parallax effects.
 */
export function LandingHeroBlock({ section }: { section: LandingHeroBlockSection }) {
  const { t } = useDocsI18n();
  const { stats } = usePublicPlatformStats();
  const heroRef = useRef<HTMLElement>(null);

  /* Scroll-driven parallax */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <>
      <section className="com-hero" ref={heroRef} aria-labelledby="commercial-hero-title">
        {/* Background layers */}
        <motion.div className="com-hero-bg" style={{ y: bgY }} aria-hidden="true" />
        <div className="com-hero-grid" aria-hidden="true" />
        <div className="com-hero-noise" aria-hidden="true" />

        {/* Orbital rings */}
        <div className="com-hero-orb-ring com-hero-orb-ring--1" aria-hidden="true" />
        <div className="com-hero-orb-ring com-hero-orb-ring--2" aria-hidden="true" />

        <div className="com-hero-inner">
          {/* Left: Copy */}
          <motion.div
            className="com-hero-copy"
            style={{ y: copyY }}
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            {/* Kicker badge */}
            <motion.div className="com-hero-badge" variants={fadeUp} aria-label="Live platform">
              <span className="com-hero-badge-dot" aria-hidden="true" />
              {section.kickerKey ? t(section.kickerKey) : "The B2B2C SaaS Platform"}
            </motion.div>

            {/* Main headline */}
            <motion.h1 id="commercial-hero-title" className="com-hero-title" variants={stagger}>
              <SplitWords text={t(section.title1Key)} gradient={false} />
              {section.title2Key && (
                <>
                  {" "}
                  <SplitWords text={t(section.title2Key)} gradient />
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p className="com-hero-subtitle" variants={fadeUp}>
              {t(section.subtitleKey)}
            </motion.p>

            {/* CTAs */}
            <motion.div className="com-hero-ctas" variants={fadeUp}>
              <Link
                href={section.primaryCtaHref}
                prefetch={false}
                className="com-btn com-btn--primary com-btn--hero"
              >
                {t(section.primaryCtaKey)}
                <ArrowIcon />
              </Link>
              <Button type="button" variant="ghost" className="com-btn com-btn--play">
                <span className="com-btn-play-ring">
                  <PlayIcon />
                </span>
                Watch demo
              </Button>
            </motion.div>

            {/* Trust strip */}
            <motion.div className="com-hero-trust" variants={fadeUp} aria-label="Certifications">
              {["SOC 2 Type II", "GDPR Compliant", "99.9% SLA"].map((item) => (
                <span key={item} className="com-hero-trust-item">
                  <CheckIcon />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Product card */}
          <HeroProductCard cardY={cardY} stats={stats} />
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="com-hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          aria-hidden="true"
        >
          <div className="com-hero-scroll-line" />
        </motion.div>
      </section>

      {/* Marquee strip */}
      <HeroMarqueeStrip />
    </>
  );
}
