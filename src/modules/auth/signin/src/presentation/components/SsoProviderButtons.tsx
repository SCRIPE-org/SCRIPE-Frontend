/**
 * SsoProviderButtons — Enterprise SSO Login Buttons
 *
 * Renders available SSO identity provider buttons below the credentials form.
 * Shows a premium divider ("or continue with") and provider buttons with
 * configurable colors and labels from the backend.
 *
 * @module auth/signin/components
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

/** Protocol → default icon map */
const PROTOCOL_ICONS: Record<string, string> = {
  oidc: "🔐",
  oauth2: "🔑",
  saml: "🛡️",
};

export function SsoProviderButtons({
  providers,
  isLoading,
  error,
  onProviderClick,
}: SsoProviderButtonsProps) {
  const { t } = useI18n();
  // Don't render anything if no providers and not loading
  if (!isLoading && providers.length === 0) return null;

  return (
    <div className="mt-6">
      {/* ── Divider ── */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 font-medium tracking-widest text-muted-foreground">
            {t("auth.sso.orContinueWith")}
          </span>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      )}

      {/* ── Provider Buttons ── */}
      {!isLoading && providers.length > 0 && (
        <div className="space-y-3">
          {providers.map((provider) => {
            const hasCustomColor = !!provider.buttonColor;
            const label = provider.buttonLabel || `${t("auth.sso.signInWith")} ${provider.name}`;
            const icon = provider.iconUrl ? null : PROTOCOL_ICONS[provider.protocol] || "🔐";

            return (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className="group relative flex h-12 w-full items-center justify-center gap-3 rounded-xl border-border bg-background text-[15px] font-medium text-foreground shadow-sm transition-all hover:bg-muted/50 hover:shadow-md active:scale-[0.98]"
                style={
                  hasCustomColor
                    ? {
                        borderColor: provider.buttonColor!,
                        color: provider.buttonColor!,
                      }
                    : undefined
                }
                onClick={() => onProviderClick(provider.id, provider.protocol)}
              >
                {/* Icon */}
                {provider.iconUrl ? (
                  <img
                    src={resolveFileUrl(provider.iconUrl)}
                    alt=""
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-lg">{icon}</span>
                )}

                {/* Label */}
                <span>{label}</span>

                {/* Hover glow */}
                {hasCustomColor && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-10"
                    style={{ backgroundColor: provider.buttonColor! }}
                  />
                )}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
