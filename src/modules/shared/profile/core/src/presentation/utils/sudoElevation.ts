/**
 * Sudo Step-Up Elevation Helper
 *
 * Ensures the user has an active elevated Sudo session before initiating
 * step-up-protected operations and resolves the X-Sudo-Token header when present.
 */
import { useSudoStore } from "@core/store/useSudoStore";

/**
 * Verifies Sudo elevation (prompting the step-up dialog if inactive/expired)
 * and returns the valid `X-Sudo-Token` string when available.
 */
export async function ensureSudoElevation(): Promise<string | undefined> {
  const sudoStore = useSudoStore.getState();
  if (sudoStore.isSessionElevated()) {
    return sudoStore.getValidSudoToken() ?? undefined;
  }
  const token = await sudoStore.requestElevation();
  return token && token.trim().length > 0 ? token.trim() : undefined;
}

/**
 * Returns true when an error resulted from the user cancelling or locking
 * the Sudo step-up modal before completing verification.
 */
export function isSudoCancelledError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /sudo verification was cancelled|sudo session (locked|reset)/i.test(error.message);
}
