/**
 * Pure validation, password scoring, entropy calculation, and API error helpers
 * for the Account Setup ViewModel.
 *
 * @module auth/account-setup/presentation/utils
 */

import type { SetupCustomField } from "../../domain/entities";

/** Password complexity policy flags resolved from token metadata. */
export interface AccountSetupPasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
}

/** Boolean evaluation results for each password policy constraint. */
export interface AccountSetupPasswordChecks {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  matches: boolean;
}

/** Localized validation messages used when summarizing unmet password rules. */
export interface AccountSetupPasswordMessages {
  minLength: string;
  hasUpper: string;
  hasLower: string;
  hasNumber: string;
  hasSpecial: string;
  matches: string;
}

/**
 * Evaluates password and confirmation inputs against the tenant password policy.
 */
export function evaluateAccountSetupPasswordChecks(
  password: string,
  confirmPassword: string,
  policy: AccountSetupPasswordPolicy
): AccountSetupPasswordChecks {
  return {
    minLength: password.length >= policy.minLength,
    hasUpper: policy.requireUppercase ? /[A-Z]/.test(password) : true,
    hasLower: /[a-z]/.test(password),
    hasNumber: policy.requireNumber ? /\d/.test(password) : true,
    hasSpecial: policy.requireSpecial ? /[^A-Za-z0-9]/.test(password) : true,
    matches: password === confirmPassword && confirmPassword.length > 0,
  };
}

/**
 * Computes a 0-100 percentage score reflecting satisfied active policy rules.
 */
export function computeAccountSetupPasswordScore(
  checks: AccountSetupPasswordChecks,
  policy: AccountSetupPasswordPolicy
): number {
  let passed = 0;
  let total = 0;

  total++;
  if (checks.minLength) passed++;
  total++;
  if (checks.hasLower) passed++;

  if (policy.requireUppercase) {
    total++;
    if (checks.hasUpper) passed++;
  }
  if (policy.requireNumber) {
    total++;
    if (checks.hasNumber) passed++;
  }
  if (policy.requireSpecial) {
    total++;
    if (checks.hasSpecial) passed++;
  }

  total++;
  if (checks.matches) passed++;

  return Math.round((passed / total) * 100);
}

/**
 * Estimates character-set entropy (in bits) for the candidate password.
 */
export function computeAccountSetupPasswordEntropy(password: string): number {
  if (!password) return 0;
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/\d/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;
  if (pool === 0) return 0;
  return password.length * Math.log2(pool);
}

/**
 * Collects localized error strings for any unsatisfied password rules.
 */
export function collectPasswordValidationErrors(
  checks: AccountSetupPasswordChecks,
  minLength: number,
  messages: AccountSetupPasswordMessages
): string[] {
  const errors: string[] = [];
  if (!checks.minLength) {
    errors.push(messages.minLength.replace("{{min}}", String(minLength)));
  }
  if (!checks.hasUpper) errors.push(messages.hasUpper);
  if (!checks.hasLower) errors.push(messages.hasLower);
  if (!checks.hasNumber) errors.push(messages.hasNumber);
  if (!checks.hasSpecial) errors.push(messages.hasSpecial);
  if (!checks.matches) errors.push(messages.matches);
  return errors;
}

/**
 * Validates required dynamic compliance custom fields and returns a field-key error map.
 */
export function validateAccountSetupCustomFields(
  customFields: SetupCustomField[],
  customFieldValues: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of customFields) {
    if (field.isRequired) {
      const val = customFieldValues[field.key];
      const isEmpty =
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "") ||
        (Array.isArray(val) && val.length === 0);

      if (isEmpty) {
        errors[field.key] = "This field is required";
      }
    }
  }
  return errors;
}

/**
 * Extracts a displayable error message from an unknown API error shape.
 */
export function extractAccountSetupApiError(err: unknown, fallback: string): string {
  const details = (
    err as { details?: { error?: string; message?: string; errorMessage?: string } }
  )?.details;
  return details?.error || details?.errorMessage || details?.message || fallback;
}
