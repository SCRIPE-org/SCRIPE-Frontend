"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";

type Persona = "investor" | "cofounder" | "partner";

const PERSONAS: Persona[] = ["investor", "cofounder", "partner"];

const PERSONA_ICONS: Record<Persona, string> = {
  investor: "📈",
  cofounder: "⚡",
  partner: "🤝",
};

const PERSONA_COLORS: Record<Persona, string> = {
  investor: "var(--com-cyan)",
  cofounder: "var(--com-violet)",
  partner: "var(--com-emerald)",
};

const personaKeys: Record<
  Persona,
  { title: string; desc: string; benefits: string[]; label: string; href: string }
> = {
  investor: {
    label: "Capital thesis",
    title: "commercial.investorOverview.personaSelectorInvestor",
    desc: "commercial.investorOverview.personaSelectorInvestorDesc",
    href: "/commercial/investor-overview",
    benefits: [
      "commercial.investorOverview.personaSelectorInvestorBenefit1",
      "commercial.investorOverview.personaSelectorInvestorBenefit2",
      "commercial.investorOverview.personaSelectorInvestorBenefit3",
    ],
  },
  cofounder: {
    label: "Build thesis",
    title: "commercial.investorOverview.personaSelectorCofounder",
    desc: "commercial.investorOverview.personaSelectorCofounderDesc",
    href: "/commercial/co-founder-journey",
    benefits: [
      "commercial.investorOverview.personaSelectorCofounderBenefit1",
      "commercial.investorOverview.personaSelectorCofounderBenefit2",
      "commercial.investorOverview.personaSelectorCofounderBenefit3",
    ],
  },
  partner: {
    label: "Channel thesis",
    title: "commercial.investorOverview.personaSelectorPartner",
    desc: "commercial.investorOverview.personaSelectorPartnerDesc",
    href: "/commercial/partner-journey",
    benefits: [
      "commercial.investorOverview.personaSelectorPartnerBenefit1",
      "commercial.investorOverview.personaSelectorPartnerBenefit2",
      "commercial.investorOverview.personaSelectorPartnerBenefit3",
    ],
  },
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function PersonaSelector() {
  const { t } = useDocsI18n();
  const [selected, setSelected] = useState<Persona>("investor");
  const current = personaKeys[selected];

  return (
    <section className="com-landing-persona" aria-labelledby="commercial-persona-title">
      {/* Section header */}
      <motion.div
        className="com-landing-section-head"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <p>Decision paths</p>
        <h2 id="commercial-persona-title">
          {t("commercial.investorOverview.personaSelectorQuestion")}
        </h2>
      </motion.div>

      {/* Theatre — left tabs + right panel */}
      <motion.div
        className="com-persona-theatre"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
      >
        {/* Left: tab list */}
        <div className="com-persona-tabs" role="tablist" aria-label="Commercial audience paths">
          {PERSONAS.map((persona, idx) => {
            const content = personaKeys[persona];
            const isSelected = selected === persona;
            return (
              <button
                key={persona}
                type="button"
                className="com-persona-tab"
                data-active={isSelected}
                aria-selected={isSelected}
                role="tab"
                onClick={() => setSelected(persona)}
                style={{ "--accent": PERSONA_COLORS[persona] } as CSSProperties}
              >
                <span
                  className="com-persona-tab-icon"
                  aria-hidden="true"
                  style={{ "--accent": PERSONA_COLORS[persona] } as CSSProperties}
                >
                  {PERSONA_ICONS[persona]}
                </span>
                <span className="com-persona-tab-body">
                  <strong>{t(content.title)}</strong>
                  <small>{content.label}</small>
                </span>
                <span className="com-persona-tab-num">{String(idx + 1).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>

        {/* Right: content panel */}
        <AnimatePresence mode="wait">
          <motion.article
            key={selected}
            className="com-persona-panel"
            role="tabpanel"
            initial={{ opacity: 0, x: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {/* Label badge */}
            <p
              className="com-persona-panel-label"
              style={{ "--accent": PERSONA_COLORS[selected] } as CSSProperties}
            >
              {current.label}
            </p>

            {/* Title */}
            <h3 className="com-persona-panel-title">{t(current.title)}</h3>

            {/* Description */}
            <p className="com-persona-panel-desc">{t(current.desc)}</p>

            {/* Benefits list */}
            <div className="com-persona-benefits">
              {current.benefits.map((benefit, idx) => (
                <motion.div
                  key={benefit}
                  className="com-persona-benefit"
                  style={{ "--i": idx } as CSSProperties}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.36, delay: idx * 0.06, ease: EASE }}
                >
                  <span
                    className="com-persona-benefit-num"
                    style={{ color: PERSONA_COLORS[selected] }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <p>{t(benefit)}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="com-persona-panel-actions">
              <a
                href={current.href}
                className="com-btn com-btn--primary"
                style={{ "--accent": PERSONA_COLORS[selected] } as CSSProperties}
              >
                {t("commercial.investorOverview.personaSelectorLearnMore")}
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
              </a>
            </div>
          </motion.article>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
