"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { CtaBannerBlockSection } from "../../../domain/entities/DocSection";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.72, ease: EASE } },
};

/* ── Icons ────────────────────────────────────────────────────────────── */
const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ServerIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TRUST_BADGES = [
  { icon: <ShieldIcon />, label: "SOC 2 Type II" },
  { icon: <ShieldIcon />, label: "GDPR Ready" },
  { icon: <ServerIcon />, label: "On-Prem Ready" },
  { icon: <ClockIcon />, label: "99.9% SLA" },
];

/* ── Main component ───────────────────────────────────────────────────── */
export function CtaBannerBlock({ section }: { section: CtaBannerBlockSection }) {
  const { t } = useDocsI18n();

  // Split title at midpoint for gradient mark
  const title = t(section.titleKey);
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  const left = words.slice(0, half).join(" ");
  const right = words.slice(half).join(" ");

  return (
    <section className="com-cta" aria-labelledby="commercial-cta-title">
      <motion.div
        className="com-cta-inner"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={container}
      >
        {/* Copy */}
        <div className="com-cta-copy">
          <motion.p className="com-cta-eyebrow" variants={fadeUp} aria-hidden="true">
            Ready to launch
          </motion.p>

          <motion.h2 id="commercial-cta-title" className="com-cta-title" variants={fadeUp}>
            {left}
            {right && (
              <>
                {" "}
                <mark>{right}</mark>
              </>
            )}
          </motion.h2>

          <motion.p className="com-cta-sub" variants={fadeUp}>
            {t(section.subtitleKey)}
          </motion.p>
        </div>

        {/* Actions + trust */}
        <motion.div className="com-cta-actions" variants={fadeUp}>
          <div className="com-cta-btns">
            <Link href={section.primaryCtaHref} className="com-btn com-btn--primary">
              {t(section.primaryCtaKey)}
              <ArrowIcon />
            </Link>
            {section.secondaryCtaKey && section.secondaryCtaHref && (
              <Link href={section.secondaryCtaHref} className="com-btn com-btn--ghost">
                {t(section.secondaryCtaKey)}
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="com-trust-badges" aria-label="Compliance certifications">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="com-trust-badge">
                {b.icon}
                {b.label}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
