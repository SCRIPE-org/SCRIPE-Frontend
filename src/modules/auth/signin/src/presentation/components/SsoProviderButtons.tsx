/**
 * SsoProviderButtons — Dynamic SSO provider chips below the credentials form.
 * Reads provider list from the backend (GET /auth/oidc/providers/admin or /user).
 * Uses Vault surface tokens for glass chip styling — no hardcoded colors.
 *
 * Design spec: 3 equal-width buttons in a horizontal row with "OR CONTINUE WITH"
 * divider above. Each button has flex:1 for equal sizing.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import type { SsoProvider } from "@modules/auth/core/domain/entities/SsoProvider";
import { resolveFileUrl } from "@core/common/utils";

interface SsoProviderButtonsProps {
  providers: SsoProvider[];
  isLoading: boolean;
  error: string | null;
  onProviderClick: (providerId: string, protocol?: string) => void;
}

/** Protocol → fallback SVG icon component (no emojis) */
const ProtocolIcon = ({ protocol }: { protocol: string }) => {
  if (protocol === "saml") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    );
  }
  if (protocol === "oauth2") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    );
  }
  // oidc default — globe/lock
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
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
            {error}
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
          {providers.map((provider) => {
            const label = provider.buttonLabel || provider.name;

            return (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className="group flex flex-1 items-center justify-center gap-2 rounded-[10px] border text-[13px] font-medium shadow-none transition-all duration-150 active:scale-[0.98]"
                style={{
                  height: 44,
                  padding: "11px 14px",
                  background: "var(--sx-chip-bg, rgba(255,255,255,.03))",
                  borderColor: "var(--sx-chip-border, rgba(255,255,255,.08))",
                  color: "var(--sx-text, hsl(var(--foreground)))",
                }}
                onClick={() => onProviderClick(provider.id, provider.protocol)}
              >
                {/* Icon */}
                {provider.iconUrl ? (
                  <img
                    src={resolveFileUrl(provider.iconUrl)}
                    alt=""
                    className="h-[18px] w-[18px] object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <ProtocolIcon protocol={provider.protocol} />
                )}

                {/* Label */}
                <span>{label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
