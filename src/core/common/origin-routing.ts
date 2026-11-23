import { BRAND } from "@core/config/branding";

const DEV_BARE_DOMAINS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]"]);
const SINGLE_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

function stripPort(hostOrHostname?: string | null): string {
  if (!hostOrHostname || typeof hostOrHostname !== "string") return "";
  const trimmed = hostOrHostname.toLowerCase().trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("[")) {
    const closingBracket = trimmed.indexOf("]");
    return closingBracket >= 0 ? trimmed.slice(0, closingBracket + 1) : trimmed;
  }
  const colonIdx = trimmed.indexOf(":");
  return colonIdx >= 0 ? trimmed.slice(0, colonIdx) : trimmed;
}

export function extractOrigin(rawUrl: string | undefined | null): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || !parsed.hostname) {
      return null;
    }
    if (parsed.username || parsed.password) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function extractHostname(rawUrl: string | undefined | null): string | null {
  const origin = extractOrigin(rawUrl);
  if (!origin) return null;
  return new URL(origin).hostname.toLowerCase();
}

export function getAuthServiceBaseUrl(): string | null {
  const configuredAuth = extractOrigin(process.env.NEXT_PUBLIC_AUTH_URL);
  if (configuredAuth) return configuredAuth;
  const configuredApp = extractOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (configuredApp) return configuredApp;
  return typeof window !== "undefined" ? window.location.origin : null;
}

/**
 * Returns true when `hostname` is an exact loopback/dev host (never `*.localhost`).
 */
export function isBareLocalDevHostname(hostname: string): boolean {
  const host = stripPort(hostname);
  return DEV_BARE_DOMAINS.has(host);
}

/**
 * Returns true for any local loopback dev host, including `*.localhost` tenant subdomains.
 */
export function isLocalDevHostname(hostname: string): boolean {
  const host = stripPort(hostname);
  return DEV_BARE_DOMAINS.has(host) || host.endsWith(".localhost");
}

function getPlatformRootHostnames(): {
  exactHosts: Set<string>;
  workspaceBaseHosts: Set<string>;
} {
  const exactHosts = new Set<string>();
  const workspaceBaseHosts = new Set<string>();

  const appHost = extractHostname(process.env.NEXT_PUBLIC_APP_URL);
  const authHost = extractHostname(process.env.NEXT_PUBLIC_AUTH_URL);
  const apiHost = extractHostname(process.env.NEXT_PUBLIC_API_URL);
  const brandAdminHost = BRAND.domain.toLowerCase();

  exactHosts.add(brandAdminHost);
  workspaceBaseHosts.add(brandAdminHost);
  if (brandAdminHost.startsWith("admin.")) {
    exactHosts.add(`auth.${brandAdminHost.slice("admin.".length)}`);
  } else {
    exactHosts.add(`auth.${brandAdminHost}`);
  }

  if (appHost) {
    exactHosts.add(appHost);
    if (!DEV_BARE_DOMAINS.has(appHost)) {
      workspaceBaseHosts.add(appHost);
      if (appHost.startsWith("admin.")) {
        exactHosts.add(`auth.${appHost.slice("admin.".length)}`);
      }
    }
  }
  if (authHost) {
    exactHosts.add(authHost);
  }
  if (apiHost) {
    exactHosts.add(apiHost);
  }

  return { exactHosts, workspaceBaseHosts };
}

/**
 * Returns true when the current hostname is the platform root or central auth surface
 * (so pre-auth domain resolution does not query for a tenant workspace).
 * Workspace subdomains (`ahly.localhost`, `club.admin.scripe.org`) and custom domains return false.
 */
export function isPlatformDomain(hostname: string): boolean {
  const host = stripPort(hostname);
  if (!host) return false;
  if (isBareLocalDevHostname(host)) return true;

  const { exactHosts } = getPlatformRootHostnames();
  // Exclude API host from frontend platform domain check if apiHost happens to differ
  const apiHost = extractHostname(process.env.NEXT_PUBLIC_API_URL);
  if (apiHost && host === apiHost) return false;

  return exactHosts.has(host);
}

/**
 * Returns true when `hostname` is an official SCRIPE platform or single-label workspace origin
 * that shares first-party/same-site cookie trust with `api.scripe.org`, or is a bare local host.
 * Returns false for custom tenant domains (e.g. `portal.club.com`) and nested multi-label spoofs.
 */
export function isPlatformOrigin(hostname: string): boolean {
  const host = stripPort(hostname);
  if (!host) return false;
  if (isBareLocalDevHostname(host)) return true;

  const { exactHosts, workspaceBaseHosts } = getPlatformRootHostnames();
  if (exactHosts.has(host)) return true;

  for (const baseHost of workspaceBaseHosts) {
    const suffix = `.${baseHost}`;
    if (host.endsWith(suffix)) {
      const label = host.slice(0, host.length - suffix.length);
      if (SINGLE_LABEL_RE.test(label)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns true ONLY when the current browser runtime is hosted on an external custom domain
 * (neither a SCRIPE platform/workspace origin nor a local loopback/`*.localhost` dev host).
 */
export function isExternalCustomDomain(hostname?: string | null): boolean {
  const browserHost =
    typeof window !== "undefined"
      ? window.location?.hostname ??
        (typeof window.location?.href === "string" ? extractHostname(window.location.href) : null) ??
        ""
      : "";
  const raw = hostname ?? browserHost;
  const host = stripPort(raw);
  if (!host) return false;
  return !isPlatformOrigin(host) && !isLocalDevHostname(host);
}

/**
 * Validates whether a target HTTP(S) URL origin belongs to a trusted SCRIPE central auth,
 * platform, single-label workspace origin, or an explicit verified custom-domain allowlist.
 */
export function isAllowedCentralOrTenantOrigin(
  targetUrlOrOrigin: string | undefined | null,
  explicitAllowedOrigins?: readonly string[]
): boolean {
  if (!targetUrlOrOrigin || typeof targetUrlOrOrigin !== "string") {
    return false;
  }
  let target: URL;
  try {
    target = new URL(targetUrlOrOrigin.trim());
  } catch {
    return false;
  }

  if ((target.protocol !== "http:" && target.protocol !== "https:") || !target.hostname) {
    return false;
  }
  if (target.username || target.password) {
    return false;
  }

  const targetOrigin = target.origin;
  const targetHost = target.hostname.toLowerCase();

  // Never permit backend API hosts via frontend origin checks (even if explicitly listed)
  const apiOrigin = extractOrigin(process.env.NEXT_PUBLIC_API_URL);
  const identityOrigin = extractOrigin(process.env.NEXT_PUBLIC_IDENTITY_API_URL);
  if (
    (apiOrigin && targetOrigin === apiOrigin) ||
    (identityOrigin && targetOrigin === identityOrigin)
  ) {
    return false;
  }

  // Enforce HTTPS for ALL non-localhost targets before consulting any allowlist
  const isLoopback = isLocalDevHostname(targetHost);
  if (target.protocol !== "https:" && !isLoopback) {
    return false;
  }

  // Explicit verified custom domains passed by server state or environment config
  const extraRaw = (process.env.NEXT_PUBLIC_ALLOWED_REDIRECT_ORIGINS ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  for (const candidate of [...(explicitAllowedOrigins ?? []), ...extraRaw]) {
    const normalized = extractOrigin(candidate);
    if (normalized && normalized === targetOrigin) {
      return true;
    }
  }

  const authOrigin = extractOrigin(process.env.NEXT_PUBLIC_AUTH_URL);
  if (authOrigin && targetOrigin === authOrigin) return true;

  const appOrigin = extractOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (appOrigin && targetOrigin === appOrigin) return true;

  // Dev *.localhost single-label workspace subdomains
  if (targetHost.endsWith(".localhost")) {
    const label = targetHost.slice(0, targetHost.length - ".localhost".length);
    return SINGLE_LABEL_RE.test(label);
  }

  // When NEXT_PUBLIC_APP_URL itself enforces HTTPS, require HTTPS for remaining platform origins too
  const configuredAppProto = appOrigin ? new URL(appOrigin).protocol : "https:";
  if (configuredAppProto === "https:" && target.protocol !== "https:" && !isLoopback) {
    return false;
  }

  return isPlatformOrigin(targetHost) && !isBareLocalDevHostname(targetHost);
}

/**
 * Resolves a relative post-auth entry URL onto a verified different same-site platform origin
 * (e.g. from `https://auth.scripe.org/sso/continue` back onto `https://ahly.admin.scripe.org`).
 */
export function resolvePostAuthTargetForOrigin(
  targetPath: string,
  returnOrigin?: string | null
): string {
  if (
    !returnOrigin ||
    typeof window === "undefined" ||
    targetPath.startsWith("http://") ||
    targetPath.startsWith("https://")
  ) {
    return targetPath;
  }
  const safeOrigin = extractOrigin(returnOrigin);
  if (!safeOrigin) return targetPath;
  const parsed = new URL(safeOrigin);
  if (
    parsed.origin !== window.location.origin &&
    isAllowedCentralOrTenantOrigin(parsed.origin) &&
    isPlatformOrigin(parsed.hostname)
  ) {
    return new URL(targetPath, parsed.origin).toString();
  }
  return targetPath;
}
