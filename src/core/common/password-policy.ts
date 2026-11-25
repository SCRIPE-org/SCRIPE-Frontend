/**
 * Password Policy Domain Contract, Mapping & Evaluation
 *
 * Single source of truth for interpreting backend `PasswordPolicyDto` payloads across
 * all SCRIPE auth, onboarding, profile security, and admin management surfaces.
 *
 * Never falls back to weak hardcoded password lengths (6/8) when a backend policy
 * fails to load — callers must render explicit loading/error/retry states.
 */
import { z } from "zod";

/** Default maximum password length aligned with backend PasswordPolicyDto & NIST/ASVS 128-char cap. */
export const DEFAULT_PASSWORD_MAX_LENGTH = 128;

/** Backend API DTO shape returned by password-policy, resolve branding, recovery, setup, and account security endpoints. */
export interface PasswordPolicyDto {
  minLength: number;
  maxLength?: number | null;
  requireUppercase: boolean;
  requireLowercase?: boolean;
  /** Authoritative backend PasswordPolicyDto property name (System.Text.Json for RequireDigit). */
  requireDigit?: boolean;
  /** Legacy alias supported on TenantPasswordPolicyDto / TenantSettingsDto. */
  requireNumber?: boolean;
  requireSpecial: boolean;
  historyCount?: number | null;
  checkBreachedPasswords?: boolean;
  expiryDays?: number | null;
}

/** Legacy flat setup/settings payload containing password policy columns. */
export interface LegacyPasswordPolicyFields {
  passwordPolicy?: PasswordPolicyDto | null;
  passwordMinLength?: number;
  passwordMaxLength?: number | null;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireDigit?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSpecial?: boolean;
  passwordHistoryCount?: number | null;
  checkBreachedPasswords?: boolean;
  passwordExpiryDays?: number | null;
}

/** Canonical frontend domain representation of a tenant's effective password policy. */
export interface PasswordPolicyModel {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  historyCount: number;
  checkBreachedPasswords: boolean;
  expiryDays: number | null;
}

/** Individual checklist rule keys evaluated against a candidate password. */
export type PasswordPolicyRuleKey =
  | "minLength"
  | "maxLength"
  | "uppercase"
  | "lowercase"
  | "number"
  | "special";

/** Evaluated state for one active policy requirement. */
export interface PasswordPolicyRuleItem {
  key: PasswordPolicyRuleKey;
  met: boolean;
  required: boolean;
  params?: Record<string, number>;
}

/** Strength tier derived strictly from the active rules defined in `PasswordPolicyModel`. */
export type PasswordStrengthTier = "empty" | "weak" | "fair" | "strong";

/** Complete live evaluation result for a password candidate against `PasswordPolicyModel`. */
export interface PasswordPolicyEvaluation {
  rules: PasswordPolicyRuleItem[];
  allMet: boolean;
  passedCount: number;
  totalCount: number;
  strengthPercent: number;
  strengthTier: PasswordStrengthTier;
  withinMaxLength: boolean;
}

/** Translation callback compatible with I18nProvider `t(key, params)`. */
export type TranslatePasswordPolicyFn = (
  key: string,
  params?: Record<string, string | number>
) => string;

const UPPERCASE_PATTERN = /\p{Lu}/u;
const LOWERCASE_PATTERN = /\p{Ll}/u;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_PATTERN = /[^\p{L}\p{N}]/u;

/**
 * Maps a backend `PasswordPolicyDto` to `PasswordPolicyModel`.
 */
export function mapPasswordPolicyDto(dto: PasswordPolicyDto): PasswordPolicyModel {
  const minLength = Math.max(1, Math.floor(dto.minLength));
  const rawMax = typeof dto.maxLength === "number" && dto.maxLength > 0 ? Math.floor(dto.maxLength) : DEFAULT_PASSWORD_MAX_LENGTH;
  const maxLength = Math.max(minLength, rawMax);
  const rawHistory = typeof dto.historyCount === "number" && dto.historyCount > 0 ? Math.floor(dto.historyCount) : 0;

  return {
    minLength,
    maxLength,
    requireUppercase: Boolean(dto.requireUppercase),
    requireLowercase: Boolean(dto.requireLowercase),
    requireNumber: Boolean(dto.requireDigit ?? dto.requireNumber),
    requireSpecial: Boolean(dto.requireSpecial),
    historyCount: rawHistory,
    checkBreachedPasswords: Boolean(dto.checkBreachedPasswords),
    expiryDays:
      typeof dto.expiryDays === "number" && dto.expiryDays > 0 ? Math.floor(dto.expiryDays) : null,
  };
}

/**
 * Resolves `PasswordPolicyModel` from a payload that embeds `passwordPolicy` or exposes legacy
 * flat `password*` columns. Preserves `requireSpecial ?? false` and `requireLowercase ?? false`
 * (never hardcoding hidden requirements). Returns `null` when no policy fields exist.
 */
export function mapLegacySetupPolicy(
  payload: LegacyPasswordPolicyFields | null | undefined
): PasswordPolicyModel | null {
  if (!payload) return null;
  if (payload.passwordPolicy) {
    return mapPasswordPolicyDto(payload.passwordPolicy);
  }
  if (typeof payload.passwordMinLength !== "number") {
    return null;
  }

  return mapPasswordPolicyDto({
    minLength: payload.passwordMinLength,
    maxLength: payload.passwordMaxLength ?? DEFAULT_PASSWORD_MAX_LENGTH,
    requireUppercase: payload.passwordRequireUppercase ?? false,
    requireLowercase: payload.passwordRequireLowercase ?? false,
    requireDigit: payload.passwordRequireDigit ?? payload.passwordRequireNumber ?? false,
    requireSpecial: payload.passwordRequireSpecial ?? false,
    historyCount: payload.passwordHistoryCount ?? 0,
    checkBreachedPasswords: payload.checkBreachedPasswords ?? false,
    expiryDays: payload.passwordExpiryDays ?? null,
  });
}

/**
 * Evaluates a candidate password against every rule enabled in `policy`.
 * Never imposes hard-coded character classes not present in `policy`.
 */
export function evaluatePasswordPolicy(
  password: string,
  policy: PasswordPolicyModel | null | undefined
): PasswordPolicyEvaluation {
  if (!policy) {
    return {
      rules: [],
      allMet: false,
      passedCount: 0,
      totalCount: 0,
      strengthPercent: 0,
      strengthTier: "empty",
      withinMaxLength: false,
    };
  }

  const rules: PasswordPolicyRuleItem[] = [
    {
      key: "minLength",
      met: password.length >= policy.minLength,
      required: true,
      params: { min: policy.minLength },
    },
  ];

  const withinMaxLength = password.length <= policy.maxLength;
  if (!withinMaxLength) {
    rules.push({
      key: "maxLength",
      met: false,
      required: true,
      params: { max: policy.maxLength },
    });
  }

  if (policy.requireUppercase) {
    rules.push({
      key: "uppercase",
      met: UPPERCASE_PATTERN.test(password),
      required: true,
    });
  }

  if (policy.requireLowercase) {
    rules.push({
      key: "lowercase",
      met: LOWERCASE_PATTERN.test(password),
      required: true,
    });
  }

  if (policy.requireNumber) {
    rules.push({
      key: "number",
      met: DIGIT_PATTERN.test(password),
      required: true,
    });
  }

  if (policy.requireSpecial) {
    rules.push({
      key: "special",
      met: SPECIAL_PATTERN.test(password),
      required: true,
    });
  }

  const totalCount = rules.length;
  const passedCount = rules.filter((r) => r.met).length;
  const allMet = password.length > 0 && withinMaxLength && passedCount === totalCount;
  const strengthPercent =
    password.length === 0 || totalCount === 0 ? 0 : Math.round((passedCount / totalCount) * 100);

  let strengthTier: PasswordStrengthTier = "empty";
  if (password.length > 0) {
    if (allMet) {
      strengthTier = "strong";
    } else if (strengthPercent >= 50) {
      strengthTier = "fair";
    } else {
      strengthTier = "weak";
    }
  }

  return {
    rules,
    allMet,
    passedCount,
    totalCount,
    strengthPercent,
    strengthTier,
    withinMaxLength,
  };
}

/**
 * Returns the first policy violation descriptor `{ key, params }` if `password` fails `policy`,
 * or `null` when compliant.
 */
export function findFirstPolicyViolation(
  password: string,
  policy: PasswordPolicyModel
): { key: string; params?: Record<string, number> } | null {
  const evaluation = evaluatePasswordPolicy(password, policy);
  const failed = evaluation.rules.find((rule) => !rule.met);
  if (!failed) return null;

  switch (failed.key) {
    case "minLength":
      return { key: "common.passwordPolicy.minLength", params: { min: policy.minLength } };
    case "maxLength":
      return { key: "common.passwordPolicy.maxLengthExceeded", params: { max: policy.maxLength } };
    case "uppercase":
      return { key: "common.passwordPolicy.uppercase" };
    case "lowercase":
      return { key: "common.passwordPolicy.lowercase" };
    case "number":
      return { key: "common.passwordPolicy.number" };
    case "special":
      return { key: "common.passwordPolicy.special" };
  }
}

/**
 * Builds a Zod string schema driven strictly by `policy`.
 * Fails closed with an explicit policy error when `policy` is unavailable.
 */
export function createPolicyPasswordSchema(
  policy: PasswordPolicyModel | null | undefined,
  t: TranslatePasswordPolicyFn
) {
  return z.string().superRefine((val, ctx) => {
    if (!policy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("common.passwordPolicy.loadFailed"),
      });
      return;
    }

    const violation = findFirstPolicyViolation(val, policy);
    if (violation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t(violation.key, violation.params),
      });
    }
  });
}
