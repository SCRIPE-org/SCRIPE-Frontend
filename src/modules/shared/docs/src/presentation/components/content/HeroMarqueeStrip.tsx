/**
 * HeroMarqueeStrip — Infinite horizontal technology and certification ticker.
 * Highlights core architectural stack components and compliance badges.
 */

import React from "react";

/**
 * Architectural stack components and standards displayed in the ticker ribbon.
 */
export const MARQUEE_ITEMS = [
  ".NET 10",
  "Next.js 16",
  "Multi-Tenant",
  "CQRS",
  "Clean Architecture",
  "99.9% SLA",
  "SOC 2 Type II",
  "GDPR",
  "Redis",
  "Hangfire",
  "Entity Framework",
  "Stripe",
  "OpenTelemetry",
  "Docker",
  "PostgreSQL",
] as const;

/**
 * Infinite marquee banner showcasing the platform's core infrastructure highlights.
 *
 * @returns Animated horizontal ticker ribbon.
 */
export const HeroMarqueeStrip: React.FC = () => {
  return (
    <div className="com-marquee-section" aria-hidden="true">
      <div className="com-marquee-track">
        {MARQUEE_ITEMS.map((item, i) => (
          <div key={`${item}-${i}`} className="com-marquee-item">
            <span className="com-marquee-dot" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};
