/**
 * Optional browser session metadata. This is presentation/diagnostic data, not
 * an authentication factor; collection failure must never block sign-in.
 *
 * Identity.RefreshToken.DeviceInfo has a 500-character storage limit.
 */
export const MAX_SESSION_DEVICE_INFO_LENGTH = 500;

export interface BrowserDeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screen: string;
  timezone: string;
}

/**
 * Preserve a complete JSON document while fitting the existing backend field.
 * Prefer retaining platform, locale, screen and timezone; shrink only the
 * potentially unbounded user agent. Return undefined if even the base data
 * cannot fit rather than sending malformed/truncated JSON.
 */
export function serializeBrowserDeviceInfo(info: BrowserDeviceInfo): string | undefined {
  const serialize = (userAgent: string) => JSON.stringify({ ...info, userAgent });

  const full = serialize(info.userAgent);
  if (full.length <= MAX_SESSION_DEVICE_INFO_LENGTH) return full;

  let low = 0;
  let high = info.userAgent.length;
  let best: string | undefined;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = serialize(info.userAgent.slice(0, mid));
    if (candidate.length <= MAX_SESSION_DEVICE_INFO_LENGTH) {
      best = candidate;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

export function getBrowserDeviceInfo(): string | undefined {
  if (typeof window === "undefined" || typeof navigator === "undefined") return undefined;

  try {
    return serializeBrowserDeviceInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  } catch {
    // Diagnostic metadata is best effort; never turn browser API failure into login failure.
    return undefined;
  }
}
