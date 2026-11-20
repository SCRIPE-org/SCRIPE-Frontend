/**
 * Pure IPv4 / IPv6 CIDR parsing, validation, and serialization utilities
 * used by the Trusted IP Perimeter Allowlist manager.
 */

/** Represents a parsed trusted CIDR subnet entry with an optional label. */
export interface SubnetEntry {
  /** Normalized CIDR block (e.g. `192.0.2.1/32` or `2001:db8::/32`). */
  cidr: string;
  /** Optional operator-assigned label for the subnet. */
  label?: string;
}

/** Validation failure reason returned by {@link normalizeAndValidateCidr}. */
export type CidrValidationReason = "empty" | "format" | "duplicate";

/** Result of normalizing and validating a candidate CIDR string. */
export type CidrValidationResult =
  | { ok: true; cidr: string }
  | { ok: false; reason: CidrValidationReason };

const IPV4_CIDR_REGEX =
  /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

const IPV6_CIDR_REGEX =
  /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;

/**
 * Parses persisted `"CIDR"` or `"CIDR#Label"` strings into {@link SubnetEntry} items.
 */
export function parseInitialCidrs(cidrs: string[]): SubnetEntry[] {
  return cidrs.map((item) => {
    const trimmed = item.trim();
    if (trimmed.includes("#")) {
      const [cidr, label] = trimmed.split("#");
      return { cidr: cidr.trim(), label: label.trim() };
    }
    return { cidr: trimmed };
  });
}

/**
 * Serializes {@link SubnetEntry} items back into `"CIDR"` or `"CIDR#Label"` policy tokens.
 */
export function serializeCidrs(subnets: SubnetEntry[]): string[] {
  return subnets.map((s) => (s.label ? `${s.cidr}#${s.label}` : s.cidr));
}

/**
 * Normalizes a single IPv4/IPv6 client IP into an explicit host CIDR (`/32` or `/128`).
 */
export function formatCurrentIpAsCidr(rawIp: string): string {
  const detectedIp = rawIp.trim();
  if (detectedIp.includes("/")) return detectedIp;
  return detectedIp.includes(":") ? `${detectedIp}/128` : `${detectedIp}/32`;
}

/**
 * Normalizes a candidate IPv4/IPv6 CIDR block and validates format and uniqueness.
 */
export function normalizeAndValidateCidr(
  rawInput: string,
  existingSubnets: SubnetEntry[]
): CidrValidationResult {
  let clean = rawInput.trim();
  if (!clean) {
    return { ok: false, reason: "empty" };
  }

  // Auto-append /32 if user inputs single IPv4 without mask
  if (!clean.includes("/") && !clean.includes(":")) {
    clean = `${clean}/32`;
  }

  const isIpv4 = IPV4_CIDR_REGEX.test(clean);
  const isIpv6 = IPV6_CIDR_REGEX.test(clean);
  if (!isIpv4 && !isIpv6) {
    return { ok: false, reason: "format" };
  }

  if (existingSubnets.some((s) => s.cidr.toLowerCase() === clean.toLowerCase())) {
    return { ok: false, reason: "duplicate" };
  }

  return { ok: true, cidr: clean };
}
