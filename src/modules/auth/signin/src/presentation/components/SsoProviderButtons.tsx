/**
 * SsoProviderButtons — Dynamic SSO provider chips below the credentials form.
 * Reads provider list from the backend (GET /auth/oidc/providers/admin or /user).
 * Uses Vault surface tokens for glass chip styling — no hardcoded colors.
 *
 * Design spec: 3 equal-width buttons in a horizontal row with "OR CONTINUE WITH"
 * divider above. Each button has flex:1 for equal sizing.
 */
"use client";

import { useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { SsoProvider } from "@modules/auth/core/domain/entities/SsoProvider";
import { resolveFileUrl } from "@core/common/utils";
import Image from "next/image";

interface SsoProviderButtonsProps {
  providers: SsoProvider[];
  isLoading: boolean;
  error: string | null;
  onProviderClick: (providerId: string, protocol?: string) => void;
}

/** Protocol → fallback SVG icon component (no emojis) */
/** Protocol → fallback SVG icon component (no emojis) */
const ProtocolIcon = ({ protocol }: { protocol: string }) => {
  if (protocol === "saml") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    );
  }
  if (protocol === "oauth2") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    );
  }
  // oidc default — globe/lock
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
};

/** Brand logo SVG renderer */
const BrandIcon = ({ slug, name, protocol }: { slug: string; name: string; protocol: string }) => {
  const lowerName = name.toLowerCase();
  const lowerSlug = slug.toLowerCase();

  if (lowerName.includes("google") || lowerSlug.includes("google")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-[18px] w-[18px] shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  if (
    lowerName.includes("microsoft") ||
    lowerName.includes("entra") ||
    lowerName.includes("azure") ||
    lowerSlug.includes("microsoft") ||
    lowerSlug.includes("entra") ||
    lowerSlug.includes("azure")
  ) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px] shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    );
  }

  if (lowerName.includes("apple") || lowerSlug.includes("apple")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[18px] w-[18px] shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.1.09 2.23-.58 2.94-1.39z" />
      </svg>
    );
  }

  if (lowerName.includes("github") || lowerSlug.includes("github")) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[18px] w-[18px] shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }

  return <ProtocolIcon protocol={protocol} />;
};

const SsoButton = ({
  provider,
  onProviderClick,
}: {
  provider: SsoProvider;
  onProviderClick: (providerId: string, protocol?: string) => void;
}) => {
  const [hover, setHover] = useState(false);
  
  const label = (() => {
    const lowerName = provider.name.toLowerCase();
    const lowerSlug = provider.slug.toLowerCase();
    
    if (lowerName.includes("google") || lowerSlug.includes("google")) {
      return "Google";
    }
    if (
      lowerName.includes("microsoft") ||
      lowerName.includes("entra") ||
      lowerName.includes("azure") ||
      lowerSlug.includes("microsoft") ||
      lowerSlug.includes("entra") ||
      lowerSlug.includes("azure")
    ) {
      return "Microsoft";
    }
    if (lowerName.includes("apple") || lowerSlug.includes("apple")) {
      return "Apple";
    }
    if (lowerName.includes("github") || lowerSlug.includes("github")) {
      return "GitHub";
    }
    return provider.name;
  })();

  return (
    <Button
      type="button"
      variant="outline"
      className="group flex flex-1 items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium shadow-none transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        height: 44,
        padding: "11px 12px",
        background: hover
          ? "var(--sx-field-bg-focus, rgba(124,58,237,0.06))"
          : "var(--sx-chip-bg, rgba(255,255,255,.03))",
        borderColor: hover
          ? "var(--sx-field-border-focus, rgba(168,85,247,0.55))"
          : "var(--sx-chip-border, rgba(255,255,255,.08))",
        color: "var(--sx-text, hsl(var(--foreground)))",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onProviderClick(provider.id, provider.protocol)}
    >
      {provider.iconUrl ? (
        <Image
          src={resolveFileUrl(provider.iconUrl)}
          alt=""
          width={18}
          height={18}
          className="object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <BrandIcon slug={provider.slug} name={provider.name} protocol={provider.protocol} />
      )}
      <span>{label}</span>
    </Button>
  );
};

export function SsoProviderButtons({
  providers,
  isLoading,
  error,
  onProviderClick,
}: SsoProviderButtonsProps) {
  const { t } = useI18n();

  if (!isLoading && providers.length === 0) return null;

  return (
    <div className="mt-1">
      {/* ── Divider — "OR CONTINUE WITH" ─────────────── */}
      <div className="my-1 flex items-center gap-3" style={{ margin: "4px 0" }}>
        <div
          className="h-px flex-1"
          style={{ background: "var(--sx-divider, hsl(var(--border)))" }}
        />
        <span
          className="shrink-0 text-[11px] font-medium uppercase tracking-[0.15em]"
          style={{
            color: "var(--sx-text-faint, hsl(var(--muted-foreground)/0.5))",
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
        >
          {t("auth.sso.orContinueWith")}
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "var(--sx-divider, hsl(var(--border)))" }}
        />
      </div>

      {/* ── SSO error ───────────────────────────────────── */}
      {error && (
        <div
          className="mb-3 rounded-xl px-4 py-3"
          style={{
            background: "rgba(248,113,113,.10)",
            border: "1px solid rgba(248,113,113,.30)",
          }}
        >
          <p className="text-center text-[13px] font-medium" style={{ color: "#FCA5A5" }}>
            {error.startsWith("auth.") ? t(error as string) : error}
          </p>
        </div>
      )}

      {/* ── Loading skeletons ───────────────────────────── */}
      {isLoading && (
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[44px] flex-1 animate-pulse rounded-[10px]"
              style={{ background: "var(--sx-chip-bg, hsl(var(--muted)/0.5))" }}
            />
          ))}
        </div>
      )}

      {/* ── Provider buttons — horizontal equal-width row ─ */}
      {!isLoading && providers.length > 0 && (
        <div className="mt-3 flex gap-2">
          {providers.map((provider) => (
            <SsoButton
              key={provider.id}
              provider={provider}
              onProviderClick={onProviderClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
