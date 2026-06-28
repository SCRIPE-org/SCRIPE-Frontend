"use client";

import type { CSSProperties } from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { StatsStripBlockSection } from "../../../domain/entities/DocSection";

/* ── Testimonials (hardcoded, representative) ────────────────────────── */
const TESTIMONIALS = [
  {
    text: "Went from zero to paid subscriptions in 3 weeks. The entitlements engine alone saved us 6 months of dev work.",
    name: "Priya Mehta",
    role: "CTO, FlowBase",
    initials: "PM",
    color: "oklch(0.72 0.22 296)",
  },
  {
    text: "Multi-tenancy out of the box. We launched an enterprise tier in 2 days — audit logs, RBAC, the works.",
    name: "David Sousa",
    role: "Engineering Lead, OrbitSaaS",
    initials: "DS",
    color: "oklch(0.84 0.155 213)",
  },
  {
    text: "The clean architecture meant our team ramped up in hours, not weeks. Every layer is exactly where you'd expect it.",
    name: "Lena Hofmann",
    role: "Lead Architect, Stackform",
    initials: "LH",
    color: "oklch(0.79 0.17 160)",
  },
  {
    text: "We swapped our provider from SQL Server to PostgreSQL in one config line. No code changes. Unbelievable.",
    name: "James Okonkwo",
    role: "Backend Engineer, Prismatic",
    initials: "JO",
    color: "oklch(0.82 0.155 80)",
  },
  {
    text: "SCRIPE's marketplace module let us launch a plugin ecosystem in a week. Our revenue per seat jumped 40%.",
    name: "Aisha Tremblay",
    role: "Product, VaultApp",
    initials: "AT",
    color: "oklch(0.65 0.22 20)",
  },
  {
    text: "Background jobs, caching, webhooks — everything composable, everything typed. This is what a platform should be.",
    name: "Rin Nakamura",
    role: "Founder, Aether",
    initials: "RN",
    color: "oklch(0.72 0.22 296)",
  },
  // Duplicate set for seamless marquee
  {
    text: "Went from zero to paid subscriptions in 3 weeks. The entitlements engine alone saved us 6 months of dev work.",
    name: "Priya Mehta",
    role: "CTO, FlowBase",
    initials: "PM",
    color: "oklch(0.72 0.22 296)",
  },
  {
    text: "Multi-tenancy out of the box. We launched an enterprise tier in 2 days — audit logs, RBAC, the works.",
    name: "David Sousa",
    role: "Engineering Lead, OrbitSaaS",
    initials: "DS",
    color: "oklch(0.84 0.155 213)",
  },
  {
    text: "The clean architecture meant our team ramped up in hours, not weeks. Every layer is exactly where you'd expect it.",
    name: "Lena Hofmann",
    role: "Lead Architect, Stackform",
    initials: "LH",
    color: "oklch(0.79 0.17 160)",
  },
  {
    text: "We swapped our provider from SQL Server to PostgreSQL in one config line. No code changes. Unbelievable.",
    name: "James Okonkwo",
    role: "Backend Engineer, Prismatic",
    initials: "JO",
    color: "oklch(0.82 0.155 80)",
  },
  {
    text: "SCRIPE's marketplace module let us launch a plugin ecosystem in a week. Our revenue per seat jumped 40%.",
    name: "Aisha Tremblay",
    role: "Product, VaultApp",
    initials: "AT",
    color: "oklch(0.65 0.22 20)",
  },
  {
    text: "Background jobs, caching, webhooks — everything composable, everything typed. This is what a platform should be.",
    name: "Rin Nakamura",
    role: "Founder, Aether",
    initials: "RN",
    color: "oklch(0.72 0.22 296)",
  },
];

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
          const formatted = isFloat
            ? current.toFixed(1)
            : Math.floor(current).toLocaleString();
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
function StatCard({
  value,
  labelKey,
  index,
}: {
  value: string;
  labelKey: string;
  index: number;
}) {
  const { t } = useDocsI18n();
  const { display, ref } = useCountUp(value, 1800 + index * 150);

  return (
    <article
      className="com-stat-card com-reveal"
      style={{ "--i": index } as CSSProperties}
    >
      <span className="com-stat-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="com-stat-value" ref={ref}>{display}</span>
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

      {/* Testimonial marquee */}
      <div className="com-testimonials-strip" aria-label="Customer testimonials">
        <div className="com-testimonials-track">
          {TESTIMONIALS.map((t, i) => (
            <blockquote key={`t-${i}`} className="com-testimonial-card">
              <p className="com-testimonial-text">"{t.text}"</p>
              <div className="com-testimonial-author">
                <div
                  className="com-testimonial-avatar"
                  style={{ background: t.color }}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div className="com-testimonial-meta">
                  <span className="com-testimonial-name">{t.name}</span>
                  <span className="com-testimonial-role">{t.role}</span>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
