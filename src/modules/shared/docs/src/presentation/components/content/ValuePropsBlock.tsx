/**
 * ValuePropsBlock — High-impact bento grid showcasing architecture proof points,
 * performance metrics, clean code snippets, and operational strengths.
 */

"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ValuePropsBlockSection } from "../../../domain/entities/DocSection";
import { ICONS, ICON_COLORS, ICON_BG_COLORS, BAR_DATA, CELL_SIZES } from "./ValuePropsIcons";
import { ValuePropsCodeSnippet } from "./ValuePropsCodeSnippet";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Props for individual bento cell cards.
 */
interface BentoCellProps {
  titleKey: string;
  descKey: string;
  index: number;
  isCodeCell: boolean;
}

/**
 * Single bento grid card featuring icon accent, index numbering, localized text, and interactive visual.
 *
 * @param props Bento card configuration and data indices.
 * @returns Rendered bento card article element.
 */
function BentoCell({ titleKey, descKey, index, isCodeCell }: BentoCellProps) {
  const { t } = useDocsI18n();
  const size = CELL_SIZES[index] ?? "w2";
  const bars = BAR_DATA[index] ?? BAR_DATA[0];

  return (
    <motion.article
      className={`com-bento-cell com-bento-cell--${size} com-reveal`}
      style={{ "--i": index } as CSSProperties}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay: (index % 3) * 0.07, ease: EASE }}
    >
      {/* Icon */}
      <div
        className="com-bento-cell-icon"
        style={{
          background: ICON_BG_COLORS[index] ?? ICON_BG_COLORS[0],
          color: ICON_COLORS[index] ?? ICON_COLORS[0],
        }}
        aria-hidden="true"
      >
        {ICONS[index] ?? ICONS[0]}
      </div>

      {/* Number accent */}
      <div className="com-bento-cell-num" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>

      <h3 className="com-bento-cell-title">{t(titleKey)}</h3>
      <p className="com-bento-cell-desc">{t(descKey)}</p>

      {/* Show code block on wide code cell, bar chart otherwise */}
      {isCodeCell ? (
        <ValuePropsCodeSnippet />
      ) : (
        <div className="com-bento-bars" aria-hidden="true">
          {bars.map((h, bi) => (
            <div key={bi} className="com-bento-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      )}
    </motion.article>
  );
}

/**
 * Platform value propositions block rendering a responsive bento grid of capabilities.
 *
 * @param props Section properties containing localized title and proposition items.
 * @returns Rendered value propositions section.
 */
export function ValuePropsBlock({ section }: { section: ValuePropsBlockSection }) {
  const { t } = useDocsI18n();

  return (
    <section className="com-values" aria-labelledby="commercial-values-title">
      {/* Section header */}
      <div className="com-values-head com-reveal">
        <span className="com-values-head-eyebrow" aria-hidden="true">
          Platform proof
        </span>
        <h2 id="commercial-values-title" className="com-values-head-title">
          {t(section.titleKey)
            .split(" ")
            .map((word, i, arr) =>
              i >= arr.length - 2 ? (
                <mark key={i}>
                  {word}
                  {i < arr.length - 1 ? " " : ""}
                </mark>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
        </h2>
      </div>

      {/* Bento grid */}
      <div className="com-bento" role="list">
        {section.props.map((v, idx) => (
          <BentoCell
            key={v.titleKey}
            titleKey={v.titleKey}
            descKey={v.descKey}
            index={idx}
            isCodeCell={idx === 3}
          />
        ))}
      </div>
    </section>
  );
}
