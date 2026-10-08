/**
 * Documentation for module export
 */
export function remainingHoldSeconds(expiresAtUtc: string, nowMs = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(expiresAtUtc) - nowMs) / 1000));
}
