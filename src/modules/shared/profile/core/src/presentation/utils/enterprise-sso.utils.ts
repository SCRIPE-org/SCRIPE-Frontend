/**
 * Enterprise SSO Helpers
 *
 * Pure formatting, reconciliation, and callback status helpers for live DB-backed
 * Enterprise SSO Identity Providers on /account/security.
 */
import type { AvailableSsoProvider } from "../../domain/entities/SovereignAccountEntities";
import type { ExternalLogin } from "../../domain/entities/ExternalLogin";

const PROTOCOL_LABELS: Record<string, string> = {
  oidc: "OIDC",
  oauth2: "OAuth 2.0",
  saml: "SAML 2.0",
};

const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Formats a raw backend SSO protocol slug into a user-facing badge label. */
export function formatProtocolLabel(protocol: string | undefined | null): string {
  const normalized = (protocol ?? "").trim().toLowerCase();
  if (!normalized) return "OIDC";
  return PROTOCOL_LABELS[normalized] ?? normalized.toUpperCase();
}

/** Returns true when the provider belongs to the platform-global IdP scope. */
export function isGlobalSsoScope(scope: string | undefined | null): boolean {
  return (scope ?? "").trim().toLowerCase() === "global";
}

/** Resolves a normalized icon key (`google`, `microsoft`, `okta`, `github`, `apple`, `enterprise`) from provider metadata. */
export function resolveProviderBrandKey(slug: string, name: string): string {
  const haystack = `${slug} ${name}`.toLowerCase();
  if (haystack.includes("google")) return "google";
  if (haystack.includes("microsoft") || haystack.includes("azure") || haystack.includes("entra")) {
    return "microsoft";
  }
  if (haystack.includes("okta")) return "okta";
  if (haystack.includes("github")) return "github";
  if (haystack.includes("apple")) return "apple";
  return "enterprise";
}

/** Computes WCAG relative luminance (0..1) and returns a safe background/ink style pair. */
export function resolveProviderBadgeColors(buttonColor: string | undefined | null): {
  background: string;
  color: string;
} {
  if (!buttonColor || !HEX_COLOR_RE.test(buttonColor)) {
    return { background: "var(--nx-raised)", color: "var(--nx-ink)" };
  }
  const clean = buttonColor.slice(1);
  const full =
    clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
  const ch = (offset: number) => {
    const s = parseInt(full.slice(offset, offset + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
  return {
    background: buttonColor,
    color: lum > 0.5 ? "#0B0D12" : "#FFFFFF",
  };
}

/** Formats an ISO timestamp string for UI display using the active locale. */
export function formatLinkedTimestamp(
  isoUtc: string | Date | undefined | null,
  language: string
): string | null {
  if (!isoUtc) return null;
  const date = isoUtc instanceof Date ? isoUtc : new Date(isoUtc);
  if (Number.isNaN(date.getTime())) return null;
  const locale = language === "ar" ? "ar-SA" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Finds persisted external login bindings whose identity provider is no longer present
 * in the active `availableSsoProviders` list (e.g., disabled or deleted by an admin).
 */
export function findOrphanedExternalLogins(
  availableProviders: AvailableSsoProvider[],
  externalLogins: ExternalLogin[]
): ExternalLogin[] {
  if (externalLogins.length === 0) return [];
  const activeLoginIds = new Set(
    availableProviders
      .map((p) => p.externalLoginId)
      .filter((id): id is string => Boolean(id))
  );
  const linkedProviderSlugs = new Set(
    availableProviders
      .filter((p) => p.isLinked)
      .flatMap((p) => [p.name.toLowerCase(), p.slug.toLowerCase()])
  );

  return externalLogins.filter((login) => {
    if (activeLoginIds.has(login.id)) return false;
    return !linkedProviderSlugs.has(login.providerName.toLowerCase());
  });
}

/** Maps a callback `?error=` code onto a localized translation key when recognized. */
export function resolveSsoCallbackError(
  errorCode: string,
  t: (key: string) => string
): string {
  const normalized = errorCode.trim().toLowerCase();
  const knownKeys: Record<string, string> = {
    access_denied: "profile.security.ssoErrorAccessDenied",
    cancelled: "profile.security.ssoErrorAccessDenied",
    email_mismatch: "profile.security.ssoErrorEmailMismatch",
    already_linked: "profile.security.ssoErrorAlreadyLinked",
    state_invalid: "profile.security.ssoErrorInvalidState",
    invalid_state: "profile.security.ssoErrorInvalidState",
    link_failed: "profile.security.ssoAccountLinkError",
  };
  const key = knownKeys[normalized];
  if (key) return t(key);
  return errorCode.trim() || t("profile.security.ssoAccountLinkError");
}
