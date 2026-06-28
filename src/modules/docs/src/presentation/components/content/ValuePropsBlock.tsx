"use client";

import type { CSSProperties, RefObject } from "react";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { ValuePropsBlockSection } from "../../../domain/entities/DocSection";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Icons ────────────────────────────────────────────────────────────── */
const ICONS = [
  <svg key="mod" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
  </svg>,
  <svg key="shield" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>,
  <svg key="rocket" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
  </svg>,
  <svg key="globe" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
    <path d="M2 12h20"/>
  </svg>,
  <svg key="chart" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
  </svg>,
  <svg key="users" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>,
];

const ICON_COLORS = [
  "var(--com-violet)",
  "var(--com-cyan)",
  "var(--com-emerald)",
  "var(--com-amber)",
  "var(--com-violet)",
  "var(--com-cyan)",
];

const ICON_BG_COLORS = [
  "oklch(0.72 0.22 296 / 0.14)",
  "oklch(0.84 0.155 213 / 0.12)",
  "oklch(0.79 0.17 160 / 0.12)",
  "oklch(0.82 0.155 80 / 0.12)",
  "oklch(0.72 0.22 296 / 0.14)",
  "oklch(0.84 0.155 213 / 0.12)",
];

/* Mini bar chart data per cell */
const BAR_DATA = [
  [62, 78, 54, 88, 72, 95, 80],
  [82, 66, 90, 74, 58, 86, 92],
  [72, 86, 80, 92, 70, 68, 88],
  [54, 72, 88, 80, 96, 76, 84],
  [76, 82, 64, 90, 84, 78, 66],
  [68, 84, 88, 76, 92, 62, 80],
];

/* Code snippet for wide code cell */
const CODE_LINES = [
  { ln: "1", parts: [{ type: "keyword", text: "public sealed class " }, { type: "fn", text: "CreateTenantHandler" }] },
  { ln: "2", parts: [{ type: "comment", text: "  // IAutoRegisteredJob + Clean Arch" }] },
  { ln: "3", parts: [{ type: "keyword", text: "  public async " }, { type: "type", text: "Task" }, { type: "normal", text: "<" }, { type: "type", text: "Result" }, { type: "normal", text: "<" }, { type: "type", text: "Guid" }, { type: "normal", text: ">>" }] },
  { ln: "4", parts: [{ type: "fn", text: "  Handle" }, { type: "normal", text: "(" }, { type: "type", text: "CreateTenantCommand" }, { type: "normal", text: " cmd)" }] },
  { ln: "5", parts: [{ type: "keyword", text: "  {" }] },
  { ln: "6", parts: [{ type: "keyword", text: "    var " }, { type: "normal", text: "tenant = " }, { type: "fn", text: "Tenant.Create" }, { type: "normal", text: "(cmd.Name);" }] },
  { ln: "7", parts: [{ type: "keyword", text: "    await " }, { type: "normal", text: "_repo." }, { type: "fn", text: "AddAsync" }, { type: "normal", text: "(tenant);" }] },
  { ln: "8", parts: [{ type: "keyword", text: "    await " }, { type: "normal", text: "_uow." }, { type: "fn", text: "SaveChangesAsync" }, { type: "normal", text: "();" }] },
  { ln: "9", parts: [{ type: "keyword", text: "    return " }, { type: "type", text: "Result" }, { type: "normal", text: "<" }, { type: "type", text: "Guid" }, { type: "normal", text: ">.Success(tenant.Id);" }] },
  { ln:"10", parts: [{ type: "keyword", text: "  }" }] },
];

/* Size layout:
   Cells [0,3] → wide (3 cols of 6)
   Cells [1,2,4,5] → narrow (2 cols of 6 → but in a 6-col grid)
   Layout: [wide=3, sq=3, sq=3] | [sq=3, wide=3, sq=3] | ...
   We'll use: 0=w3, 1=w2, 2=w2, 3=w3, 4=w2, 5=w2 (total=14 in 6-col? No)
   Better: 0=w4, 1=w2, 2=w2, 3=w4, 4=w2, 5=w6 (full width last)
*/
const CELL_SIZES: string[] = ["w3", "w3", "w2", "w2", "w2", "w4"];

/* Tilt hook */
function useTilt(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 6).toFixed(2)}deg`);
    };

    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    el.addEventListener("mousemove", onMove as EventListener);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove as EventListener);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref]);
}

/* ── Single bento cell ────────────────────────────────────────────────── */
function BentoCell({
  titleKey,
  descKey,
  index,
  isCodeCell,
}: {
  titleKey: string;
  descKey: string;
  index: number;
  isCodeCell: boolean;
}) {
  const { t } = useDocsI18n();
  const ref = useRef<HTMLElement>(null);
  useTilt(ref);
  const size = CELL_SIZES[index] ?? "w2";
  const bars = BAR_DATA[index] ?? BAR_DATA[0];

  return (
    <motion.article
      ref={ref}
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
        <div className="com-bento-code" aria-hidden="true">
          {CODE_LINES.map((line) => (
            <div key={line.ln} className="com-bento-code-line">
              <span className="com-bento-code-ln">{line.ln}</span>
              <span>
                {line.parts.map((part, pi) => (
                  <span key={pi} className={`com-bento-code-${part.type}`}>
                    {part.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="com-bento-bars" aria-hidden="true">
          {bars.map((h, bi) => (
            <div
              key={bi}
              className="com-bento-bar"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      )}
    </motion.article>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export function ValuePropsBlock({ section }: { section: ValuePropsBlockSection }) {
  const { t } = useDocsI18n();

  return (
    <section className="com-values" aria-labelledby="commercial-values-title">
      {/* Section header */}
      <div className="com-values-head com-reveal">
        <span className="com-values-head-eyebrow" aria-hidden="true">Platform proof</span>
        <h2 id="commercial-values-title" className="com-values-head-title">
          {t(section.titleKey).split(" ").map((word, i, arr) =>
            i >= arr.length - 2 ? (
              <mark key={i}>{word}{i < arr.length - 1 ? " " : ""}</mark>
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
