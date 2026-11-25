"use client";

import { Fragment, useState, type ReactNode } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import Image from "next/image";

const BIDI_ARABIC_SEGMENT_RE =
  /(\([^)]*[\u0600-\u06FF][^)]*\)|[\u0600-\u06FF]+(?:\s+[\u0600-\u06FF]+)*)/g;

/**
 * Isolates parenthetical or inline Arabic segments inside `<bdi>` so bilingual
 * tenant titles (e.g. `Arab Contractors FC (نادي المقاولون العرب)`) never split
 * parentheses across lines on narrow viewports.
 */
export function formatBidiCompanyName(companyName: string): ReactNode {
  if (!/[\u0600-\u06FF]/.test(companyName)) {
    return companyName;
  }

  const parts = companyName.split(BIDI_ARABIC_SEGMENT_RE);
  return parts.map((part, index) => {
    if (!part) return null;
    if (/[\u0600-\u06FF]/.test(part)) {
      return (
        <bdi key={index} className="inline-block" dir="auto">
          {part}
        </bdi>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** Reusable logo image — falls back to the canonical SCRIPE mark if a
 * tenant-configured logo URL 404s, rather than leaving a layout gap. */
export function LogoImg({
  logoSrc,
  logoAlt,
  className = "h-full w-full object-cover",
}: {
  logoSrc: string;
  logoAlt: string;
  className?: string;
}) {
  const [errored, setErrored] = useState(false);
  return (
    <Image
      src={errored ? "/brand/app-logo.svg" : logoSrc}
      alt={`${logoAlt} Logo`}
      width={96}
      height={96}
      priority
      unoptimized
      className={className}
      onError={() => setErrored(true)}
    />
  );
}

/** Mobile-only logo block shown above form on small screens in split layouts */
export function MobileLogo({
  logoSrc,
  logoAlt,
  companyName,
}: {
  logoSrc: string;
  logoAlt: string;
  companyName: string;
}) {
  return (
    <div
      className="flex flex-col items-center gap-4 lg:hidden"
      style={{ marginBottom: "var(--login-logo-margin, 48px)" }}
    >
      <div
        className="flex items-center justify-center overflow-hidden border border-nx-line bg-nx-surface"
        style={{
          borderRadius: "var(--login-radius-card, 24px)",
          width: "var(--login-logo-size, 96px)",
          height: "var(--login-logo-size, 96px)",
        }}
      >
        <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
      </div>
      <h1
        className="login-heading text-center tracking-tight text-[var(--login-text,var(--nx-ink))]"
        style={{ fontSize: "var(--login-size-headline, 24px)" }}
      >
        {formatBidiCompanyName(companyName)}
      </h1>
    </div>
  );
}

/** Desktop heading shown on split layouts when on credentials step */
export function DesktopHeading({ companyName }: { companyName: string }) {
  const { t } = useI18n();
  return (
    <div
      className="mb-10 hidden w-full text-center lg:block lg:text-start"
      style={{ maxWidth: "var(--login-form-width, 380px)" }}
    >
      <h1
        className="login-heading tracking-tight text-[var(--login-text,var(--nx-ink))]"
        style={{ fontSize: "var(--login-size-headline, 30px)" }}
      >
        {formatBidiCompanyName(companyName)}
      </h1>
      <p
        className="mt-2 text-[var(--login-text-muted,var(--nx-ink-2))]"
        style={{ fontSize: "var(--login-size-subtitle, 0.9375rem)" }}
      >
        {t("auth.pleaseLogin")}
      </p>
    </div>
  );
}

/** Centered logo+name+subtitle header used in card-based centered layouts */
export function CenteredLogoHeader({
  logoSrc,
  logoAlt,
  companyName,
  subtitle,
  logoSize = "h-16 w-16",
}: {
  logoSrc: string;
  logoAlt: string;
  companyName: string;
  subtitle?: string;
  logoSize?: string;
}) {
  return (
    <div className="mb-8 flex flex-col items-center gap-3 text-center">
      <div
        className={`flex ${logoSize} items-center justify-center overflow-hidden rounded-xl border border-nx-line bg-nx-surface`}
      >
        <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
      </div>
      <h1
        className="login-heading tracking-tight text-[var(--login-text,var(--nx-ink))]"
        style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
      >
        {formatBidiCompanyName(companyName)}
      </h1>
      {subtitle && (
        <p
          className="text-[var(--login-text-muted,var(--nx-ink-2))]"
          style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Absolute overlay div for branded-full / overlay / etc. layouts */
export function OverlayDiv() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: "var(--login-overlay-color, var(--scripe-void))",
        opacity: "var(--login-overlay-opacity, 0.5)",
        backdropFilter: "blur(var(--login-overlay-blur, 0px))",
      }}
    />
  );
}
