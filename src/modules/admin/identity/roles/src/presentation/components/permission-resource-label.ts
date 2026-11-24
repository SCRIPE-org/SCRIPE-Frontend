/**
 * Helpers for resolving canonical permission resource keys and human-readable
 * localized resource labels for dotted (`crm.opportunities`) and hyphenated
 * (`payment-allocations`) capability resources.
 *
 * @module roles/presentation/components
 */
import { extractPermissionResource } from "@core/common/types/permissions";

const KNOWN_ACRONYMS = new Set([
  "api",
  "crm",
  "dsar",
  "gdpr",
  "hr",
  "hrms",
  "ip",
  "mfa",
  "pbac",
  "pii",
  "rbac",
  "sso",
  "ui",
  "vat",
]);

function toCamelCase(segment: string): string {
  return segment.replace(/[-_]+([a-zA-Z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

function humanizeSegment(segment: string): string {
  const words = segment
    .split(/[-_]+/)
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length === 0) return segment;
  return words
    .map((word) => {
      const lower = word.toLowerCase();
      if (KNOWN_ACRONYMS.has(lower)) {
        return lower.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function translateIfPresent(t: (key: string) => string, key: string): string | null {
  const translated = t(key);
  return translated && translated !== key ? translated : null;
}

/**
 * Resolves the canonical permission resource, preferring the explicit
 * backend `permission.resource` field and falling back to dotted/known-action
 * extraction from `permission.code`.
 */
export function resolvePermissionResource(
  code: string,
  explicitResource?: string | null
): string {
  const trimmed = explicitResource?.trim();
  if (trimmed) return trimmed;
  return extractPermissionResource(code);
}

/**
 * Formats a canonical resource identifier (including multi-segment dotted
 * resources such as `crm.opportunities` or `finance.payment-allocations`)
 * into a concise localized label for matrix rows.
 */
export function formatResourceLabel(
  resource: string,
  category: string,
  t: (key: string) => string
): string {
  const normalized = resource.trim();
  if (!normalized) return category;

  const segments = normalized.split(".").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? normalized;
  const camelLast = toCamelCase(lastSegment);

  const translated =
    translateIfPresent(t, `nav.${normalized}`) ??
    translateIfPresent(t, `nav.routeSegments.${lastSegment}`) ??
    translateIfPresent(t, `nav.routeSegments.${camelLast}`);

  if (translated) {
    if (segments.length > 1) {
      const parent = humanizeSegment(segments[0]);
      const categoryIncludesParent = category.toLowerCase().includes(parent.toLowerCase());
      return categoryIncludesParent ? translated : `${parent} · ${translated}`;
    }
    return translated;
  }

  const formattedSegments = segments.map(humanizeSegment);
  if (formattedSegments.length <= 1) {
    return formattedSegments[0] ?? normalized;
  }

  const lastFormatted = formattedSegments[formattedSegments.length - 1];
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes(lastFormatted.toLowerCase())) {
    return lastFormatted;
  }

  const parentFormatted = formattedSegments[0];
  if (categoryLower.includes(parentFormatted.toLowerCase())) {
    return formattedSegments.slice(1).join(" · ");
  }

  return formattedSegments.join(" · ");
}
