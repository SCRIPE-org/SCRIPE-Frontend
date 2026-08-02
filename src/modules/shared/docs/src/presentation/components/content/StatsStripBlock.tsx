"use client";

import type { CSSProperties } from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { StatsStripBlockSection } from "../../../domain/entities/DocSection";

/* ── Count-up hook ───────────────────────────────────────────────────── */
function useCountUp(target: string, duration = 1800) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  // Parse the numeric part and suffix (e.g. "99.9%" → 99.9, "%")
  const parseTarget = useCallback((raw: string) => {
    const match = raw.match(/^([0-9.,]+)\s*(.*)$/);
    if (!match) return { num: 0, suffix: raw, prefix: "" };
    const num = parseFloat(match[1].replace(",", ""));
    return { num, suffix: match[2], prefix: "" };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { num, suffix } = parseTarget(target);
    const isFloat = target.includes(".");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutExpo
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = num * eased;
          const formatted = isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString();
          setDisplay(`${formatted}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, parseTarget]);

  return { display, ref };
}

/* ── Stat card subcomponent ──────────────────────────────────────────── */
function StatCard({ value, labelKey, index }: { value: string; labelKey: string; index: number }) {
  const { t } = useDocsI18n();
  const { display, ref } = useCountUp(value, 1800 + index * 150);

  return (
    <article className="com-stat-card com-reveal" style={{ "--i": index } as CSSProperties}>
      <span className="com-stat-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="com-stat-value" ref={ref}>
        {display}
      </span>
      <p className="com-stat-label">{t(labelKey)}</p>
    </article>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
export function StatsStripBlock({ section }: { section: StatsStripBlockSection }) {
  return (
    <section className="com-stats" aria-label="Platform statistics">
      {/* Count-up stat cards */}
      <div className="com-stats-inner">
        {section.stats.map((s, idx) => (
          <StatCard key={`stat-${idx}`} value={s.value} labelKey={s.labelKey} index={idx} />
        ))}
      </div>
    </section>
  );
}
