"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@core/ui/button";
import { useDocsI18n } from "../providers/DocsI18nProvider";

type Persona = "investor" | "cofounder" | "partner";

const PERSONA_DATA: Record<
  Persona,
  {
    emoji: string;
    tabKey: string;
    titleKey: string;
    subtitleKey: string;
    metrics: Array<{ value: string; labelKey: string }>;
    bullets: string[];
    ctaLabel: string;
    ctaHref: string;
    color: string;
  }
> = {
  investor: {
    emoji: "💼",
    tabKey: "commercial.investorOverview.personaSelectorInvestor",
    titleKey: "commercial.investorOverview.personaSelectorInvestor",
    subtitleKey: "commercial.investorOverview.personaSelectorInvestorDesc",
    metrics: [
      { value: "$307B", labelKey: "commercial.investorOverview.marketTam" },
      { value: "18.7%", labelKey: "commercial.investorOverview.marketTiming" },
      { value: "$6.8B", labelKey: "commercial.investorOverview.marketMENA" },
    ],
    bullets: [
      "commercial.investorOverview.personaSelectorInvestorBenefit1",
      "commercial.investorOverview.personaSelectorInvestorBenefit2",
      "commercial.investorOverview.personaSelectorInvestorBenefit3",
    ],
    ctaLabel: "commercial.investorOverview.personaSelectorLearnMore",
    ctaHref: "mailto:investors@scripe.dev",
    color: "var(--com-violet)",
  },
  cofounder: {
    emoji: "🚀",
    tabKey: "commercial.investorOverview.personaSelectorCofounder",
    titleKey: "commercial.investorOverview.personaSelectorCofounder",
    subtitleKey: "commercial.investorOverview.personaSelectorCofounderDesc",
    metrics: [
      { value: "Equity", labelKey: "commercial.coFounderJourney.featEquity" },
      { value: "Vision", labelKey: "commercial.coFounderJourney.featVision" },
      { value: "Growth", labelKey: "commercial.coFounderJourney.featGrowth" },
    ],
    bullets: [
      "commercial.investorOverview.personaSelectorCofounderBenefit1",
      "commercial.investorOverview.personaSelectorCofounderBenefit2",
      "commercial.investorOverview.personaSelectorCofounderBenefit3",
    ],
    ctaLabel: "commercial.investorOverview.personaSelectorLearnMore",
    ctaHref: "mailto:founders@scripe.dev",
    color: "var(--com-amber)",
  },
  partner: {
    emoji: "🤝",
    tabKey: "commercial.investorOverview.personaSelectorPartner",
    titleKey: "commercial.investorOverview.personaSelectorPartner",
    subtitleKey: "commercial.investorOverview.personaSelectorPartnerDesc",
    metrics: [
      { value: "30%", labelKey: "commercial.partnerJourney.typeResellerTitle" },
      { value: "White-label", labelKey: "commercial.partnerJourney.typeWhiteLabelTitle" },
      { value: "Marketplace", labelKey: "commercial.partnerJourney.typeTechTitle" },
    ],
    bullets: [
      "commercial.investorOverview.personaSelectorPartnerBenefit1",
      "commercial.investorOverview.personaSelectorPartnerBenefit2",
      "commercial.investorOverview.personaSelectorPartnerBenefit3",
    ],
    ctaLabel: "commercial.investorOverview.personaSelectorLearnMore",
    ctaHref: "mailto:partners@scripe.com",
    color: "var(--com-emerald)",
  },
};

/**
 * Documentation for module export
 */
export function InvestorLandingView() {
  const { t } = useDocsI18n();
  const [persona, setPersona] = useState<Persona>("investor");
  const data = PERSONA_DATA[persona];

  return (
    <div className="inv-page">
      {/* Background glow */}
      <div className="inv-bg" aria-hidden="true">
        <div className="inv-bg-orb" style={{ background: data.color }} />
      </div>

      {/* Intro Header */}
      <div className="inv-intro">
        <h1 className="inv-main-title">{t("commercial.investorOverview.title")}</h1>
        <p className="inv-main-sub">{t("commercial.investorOverview.intro")}</p>
      </div>

      {/* Persona Selector Tabs */}
      <div className="inv-picker">
        {(["investor", "cofounder", "partner"] as Persona[]).map((p) => (
          <Button
            key={p}
            type="button"
            variant="ghost"
            className={`inv-picker-btn h-auto ${persona === p ? "inv-picker-btn--active" : ""}`}
            onClick={() => setPersona(p)}
            style={
              persona === p
                ? ({ "--btn-color": PERSONA_DATA[p].color } as React.CSSProperties)
                : undefined
            }
          >
            <span className="me-1">{PERSONA_DATA[p].emoji}</span>
            <span>{t(PERSONA_DATA[p].tabKey)}</span>
          </Button>
        ))}
      </div>

      {/* Persona Detail Panel */}
      <div
        className="inv-panel"
        key={persona}
        style={{ "--panel-color": data.color } as React.CSSProperties}
      >
        <div className="inv-panel-left">
          <h2 className="inv-panel-title">{t(data.titleKey)}</h2>
          <p className="inv-panel-sub">{t(data.subtitleKey)}</p>

          <div className="inv-metrics">
            {data.metrics.map((m) => (
              <div key={m.value} className="inv-metric">
                <span className="inv-metric-value">{m.value}</span>
                <span className="inv-metric-label">{t(m.labelKey)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="inv-panel-right">
          <ul className="inv-bullets">
            {data.bullets.map((bk) => (
              <li key={bk} className="inv-bullet">
                <span className="inv-bullet-dot" aria-hidden="true" />
                <span>{t(bk)}</span>
              </li>
            ))}
          </ul>

          <Link href={data.ctaHref} prefetch={false} className="inv-cta-btn">
            <span>{t(data.ctaLabel)}</span>
            <span className="ms-1" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
