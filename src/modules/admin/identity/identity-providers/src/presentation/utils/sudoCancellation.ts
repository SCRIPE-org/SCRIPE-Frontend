/**
 * Sudo Cancellation Error Classifier
 *
 * Identifies rejections raised when an operator cancels or resets the Sudo
 * step-up modal mid-challenge so ViewModels can leave state intact without
 * flashing spurious error toasts.
 */

/**
 * Returns true when `error` originated from user cancellation or lock/reset
 * of the interactive Sudo verification dialog.
 */
export function isSudoCancelledError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /sudo verification was cancelled|sudo session (locked|reset)/i.test(error.message);
}
