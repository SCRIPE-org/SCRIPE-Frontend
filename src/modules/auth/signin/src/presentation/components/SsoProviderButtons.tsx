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
import { BrandIcon } from "@core/ui/brand-icons";

interface SsoProviderButtonsProps {
  providers: SsoProvider[];
  isLoading: boolean;
  error: string | null;
  onProviderClick: (providerId: string, protocol?: string) => void;
}

const SsoButton = ({
  provider,
  onProviderClick,
}: {
  provider: SsoProvider;
  onProviderClick: (providerId: string, protocol?: string) => void;
}) => {
  const [hover, setHover] = useState(false);

  const label =
    provider.buttonLabel ||
    (() => {
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
      if (lowerName.includes("facebook") || lowerSlug.includes("facebook")) {
        return "Facebook";
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
        width: "100%",
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

      {/* ── Provider buttons — dynamic responsive layout ── */}
      {!isLoading && providers.length > 0 && (
        <div
          className="mt-3"
          style={{
            display: "grid",
            gridTemplateColumns:
              providers.length > 3 ? "repeat(2, 1fr)" : `repeat(${providers.length}, 1fr)`,
            gap: "8px",
          }}
        >
          {providers.map((provider, index) => {
            const isLastOdd =
              providers.length > 3 && providers.length % 2 !== 0 && index === providers.length - 1;
            return (
              <div
                key={provider.id}
                style={isLastOdd ? { gridColumn: "span 2" } : undefined}
                className="flex"
              >
                <SsoButton provider={provider} onProviderClick={onProviderClick} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
