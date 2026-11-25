/**
 * Password policy domain contract re-exported cleanly for the Auth module.
 * Single canonical source lives in `@core/common/password-policy`.
 */
export {
  DEFAULT_PASSWORD_MAX_LENGTH,
  evaluatePasswordPolicy,
  findFirstPolicyViolation,
  mapLegacySetupPolicy,
  mapPasswordPolicyDto,
  type PasswordPolicyDto,
  type PasswordPolicyEvaluation,
  type PasswordPolicyModel,
  type PasswordPolicyRuleItem,
  type PasswordPolicyRuleKey,
  type PasswordStrengthTier,
} from "@core/common/password-policy";
