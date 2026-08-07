"use client";

import { useI18n } from "@core/providers/i18n-provider";
import Image from "next/image";

/** Reusable logo image with error-hiding fallback */
export function LogoImg({
  logoSrc,
  logoAlt,
  className = "h-full w-full object-cover",
}: {
  logoSrc: string;
  logoAlt: string;
  className?: string;
}) {
  return (
    <Image
      src={logoSrc}
      alt={`${logoAlt} Logo`}
      width={96}
      height={96}
      unoptimized
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
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
        className="flex items-center justify-center overflow-hidden border border-border bg-background shadow-sm"
        style={{
          borderRadius: "var(--login-radius-card, 24px)",
          width: "var(--login-logo-size, 96px)",
          height: "var(--login-logo-size, 96px)",
        }}
      >
        <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
      </div>
      <h1
        className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
        style={{ fontSize: "var(--login-size-headline, 24px)" }}
      >
        {companyName}
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
      <h2
        className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
        style={{ fontSize: "var(--login-size-headline, 30px)" }}
      >
        {companyName}
      </h2>
      <p
        className="mt-2 text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
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
        className={`flex ${logoSize} items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm`}
      >
        <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
      </div>
      <h1
        className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
        style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
      >
        {companyName}
      </h1>
      {subtitle && (
        <p
          className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
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
        backgroundColor: "var(--login-overlay-color, #000000)",
        opacity: "var(--login-overlay-opacity, 0.5)",
        backdropFilter: "blur(var(--login-overlay-blur, 0px))",
      }}
    />
  );
}
