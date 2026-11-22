import type { SudoFactorMethod } from "@core/store/useSudoStore";

const FACTOR_PRIORITY: SudoFactorMethod[] = ["passkey", "totp", "password"];

/**
 * Computes ordered, policy-compliant authentication factors permitted for a sudo challenge.
 */
export function computeAllowedFactors(
  policy: string,
  availableMethods: SudoFactorMethod[],
  allowsPasswordFallback: boolean
): SudoFactorMethod[] {
  let base: SudoFactorMethod[] = [];
  if (policy === "PasskeyRequired") {
    base = availableMethods.includes("passkey") ? ["passkey"] : [];
  } else if (policy === "TwoFactorRequired") {
    base = availableMethods.filter((m) => m === "passkey" || m === "totp");
  } else {
    base = [...availableMethods];
    if ((allowsPasswordFallback || base.length === 0) && !base.includes("password")) {
      base.push("password");
    }
  }
  return FACTOR_PRIORITY.filter((m) => base.includes(m));
}

/**
 * Resolves a localized user-facing error message for a failed sudo verification attempt.
 */
export function resolveSudoErrorMessage(err: unknown, t: (key: string) => string): string {
  const details = (err as { details?: { errorCode?: string; message?: string } })?.details;
  const code = details?.errorCode;
  if (code === "Identity.SudoPolicyDowngradeRefused") {
    return t("profile.sudo.downgradeBlocked");
  }
  if (code === "Identity.SudoBruteForceLocked") {
    return t("profile.sudo.bruteForceLocked");
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return details?.message || t("profile.common.error");
}
