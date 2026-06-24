"use client";

import {
  ShieldCheck,
  Shield,
  Lock,
  HeartPulse,
  BadgeCheck,
  Globe,
  FileCheck,
  type LucideIcon,
} from "lucide-react";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { WelcomeTrustMark } from "../../../domain/entities/OnboardingEntities";

// ═══════════════════════════════════════════════════════════════════════════
// TrustRow — compliance marks + a "trusted by {count} teams" stat.
//
// Pure UI: receives data already resolved by the viewmodel. The "trusted by"
// stat is deliberately NOT a giant hero metric (that template is banned) — it
// reads as an inline, restrained credibility line beside the compliance marks.
// ═══════════════════════════════════════════════════════════════════════════

// Lucide names emitted by the welcome-content seeder (SignupWelcomeContentSeeder).
const TRUST_ICONS: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  shield: Shield,
  lock: Lock,
  "heart-pulse": HeartPulse,
  "badge-check": BadgeCheck,
  "file-check": FileCheck,
  globe: Globe,
};

interface TrustRowProps {
  trustMarks: WelcomeTrustMark[];
  trustedByCount: number;
  trustedByLabel: string;
}

/** Compact number formatting for the credibility stat (e.g. 4200 → 4,200). */
function formatCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  return new Intl.NumberFormat().format(Math.round(n));
}

/**
 * React presentation component representing the trust row UI element.
 */
export function TrustRow({ trustMarks, trustedByCount, trustedByLabel }: TrustRowProps) {
  const { tokens } = useSignupTheme();
  const countLabel = formatCount(trustedByCount);

  const hasStat = countLabel !== "" && trustedByLabel.trim() !== "";
  const hasMarks = trustMarks.length > 0;

  if (!hasStat && !hasMarks) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Credibility stat — inline, not a hero metric ── */}
      {hasStat && (
        <p className="text-[13px] leading-relaxed" style={{ color: tokens.inkMuted }}>
          <span className="font-semibold" style={{ color: tokens.ink }}>
            {countLabel}
          </span>{" "}
          {trustedByLabel}
        </p>
      )}

      {/* ── Compliance marks — icon + label, wrap gracefully ── */}
      {hasMarks && (
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2.5" role="list">
          {trustMarks.map((mark) => {
            const Icon = mark.iconKey ? TRUST_ICONS[mark.iconKey] : undefined;
            return (
              <li
                key={mark.key}
                className="flex items-center gap-1.5 text-[12.5px] font-medium"
                style={{ color: tokens.inkMuted }}
              >
                {Icon ? (
                  <Icon
                    size={15}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    style={{ color: tokens.accent }}
                  />
                ) : mark.assetUrl ? (
                  // Fallback for marks delivered as an asset rather than an icon.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mark.assetUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-auto"
                    style={{ opacity: 0.8 }}
                  />
                ) : null}
                <span>{mark.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default TrustRow;
