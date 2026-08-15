"use client";

import { useSignupTheme } from "@core/providers/signup-theme";
import type { WelcomeCustomerLogo } from "../../../domain/entities/OnboardingEntities";
import Image from "next/image";

// ═══════════════════════════════════════════════════════════════════════════
// LogoMarquee — a restrained customer-logo row.
//
// Despite the name, this is a calm, static (wrapping) row rather than an
// auto-scrolling ticker: a marquee animation reads as decorative noise and
// fights the Linear/Stripe-grade tone. The logos are monochrome currentColor
// wordmarks served as SVG <img>; since <img> can't inherit page `color`, we
// tint them toward the muted ink with a CSS filter (and invert in dark mode so
// the dark-ink wordmarks remain legible on the dark surface).
// ═══════════════════════════════════════════════════════════════════════════

interface LogoMarqueeProps {
  logos: WelcomeCustomerLogo[];
  /** Optional section caption (already localized by the caller). */
  caption?: string;
}

/**
 * Presentation UI component rendering the logo marquee.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function LogoMarquee({ logos, caption }: LogoMarqueeProps) {
  const { tokens, theme } = useSignupTheme();

  // Only render logos that carry a real asset URL — never ship a broken <img>.
  const renderable = logos.filter((l) => l.assetUrl.trim() !== "");
  if (renderable.length === 0) return null;

  // The seeded SVGs paint with currentColor (dark ink). Desaturate fully, then:
  //   • dark theme → invert to light + dim, so wordmarks read on dark surface
  //   • light theme → keep dark + dim toward inkMuted
  const logoFilter =
    theme === "dark"
      ? "grayscale(1) brightness(0) invert(1) opacity(0.55)"
      : "grayscale(1) brightness(0) opacity(0.42)";

  return (
    <div className="flex flex-col gap-4">
      {caption && (
        <p
          className="text-[12px] font-medium uppercase tracking-wide"
          style={{ color: tokens.inkFaint }}
        >
          {caption}
        </p>
      )}
      <ul className="flex flex-wrap items-center gap-x-8 gap-y-5" role="list">
        {logos.map((logo) => (
          <li key={logo.key} className="flex items-center">
            <Image
              src={logo.assetUrl}
              alt={logo.name}
              width={120}
              height={24}
              unoptimized
              className="h-5 w-auto select-none sm:h-6"
              style={{ filter: logoFilter }}
              loading="lazy"
              draggable={false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LogoMarquee;
