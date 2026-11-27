/**
 * Admin Form Schema
 *
 * Zod validation schema for admin forms.
 */
import { z } from "zod";
import { isValidPhoneNumber } from "@core/ui/phone-input";

export type TranslateAdminFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * Builds the create-admin Zod schema (strictly email-invitation-only).
 * Creators never assign local passwords; the invited admin sets their own credentials
 * via the single-use setup link sent to their email address.
 */
export function buildCreateAdminSchema(t: TranslateAdminFn) {
  return z.object({
    username: z
      .string()
      .min(3, t("admin.validation.usernameMin"))
      .max(100, t("admin.validation.usernameMax"))
      .regex(/^[a-zA-Z0-9_]+$/, t("admin.validation.usernameFormat")),
    firstName: z.string().max(100, t("admin.validation.firstNameMax")).optional(),
    lastName: z.string().max(100, t("admin.validation.lastNameMax")).optional(),
    phoneNumber: z
      .string()
      .max(20, t("admin.validation.phoneMax"))
      .refine((val) => !val || !val.trim() || isValidPhoneNumber(val), {
        message: t("admin.validation.invalidPhone"),
      })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .min(1, t("admin.validation.emailRequiredForInvite"))
      .email(t("admin.validation.invalidEmail"))
      .max(200, t("admin.validation.emailMax")),
    notes: z.string().max(500, t("admin.validation.notesMax")).optional(),
  });
}

/**
 * Builds the update-admin Zod schema with localized validation messages.
 */
export function buildUpdateAdminSchema(t: TranslateAdminFn) {
  return z.object({
    firstName: z.string().max(100, t("admin.validation.firstNameMax")).optional(),
    lastName: z.string().max(100, t("admin.validation.lastNameMax")).optional(),
    phoneNumber: z
      .string()
      .max(20, t("admin.validation.phoneMax"))
      .refine((val) => !val || !val.trim() || isValidPhoneNumber(val), {
        message: t("admin.validation.invalidPhone"),
      })
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email(t("admin.validation.invalidEmail"))
      .max(200, t("admin.validation.emailMax"))
      .optional()
      .or(z.literal("")),
    notes: z.string().max(500, t("admin.validation.notesMax")).optional(),
    isActive: z.boolean().optional(),
  });
}

/**
 * Builds the reset-password-link Zod schema (optional audit reason up to 500 chars).
 */
export function buildResetPasswordSchema(t: TranslateAdminFn) {
  return z.object({
    reason: z.string().max(500, t("admin.validation.reasonMax")).optional(),
  });
}

/**
 * Builds the reset-MFA Zod schema (optional audit reason + revokePasskeys toggle).
 */
export function buildResetMfaSchema(t: TranslateAdminFn) {
  return z.object({
    reason: z.string().max(500, t("admin.validation.reasonMax")).optional(),
    revokePasskeys: z.boolean().default(false),
  });
}

/**
 * Builds the assign-role Zod schema with localized messages.
 */
export function buildAssignRoleSchema(t: TranslateAdminFn) {
  return z.object({
    roleId: z.string().min(1, t("admin.validation.roleRequired")),
    tenantId: z.string().optional(),
    inheritToChildren: z.boolean().optional(),
    expiresAt: z.string().optional(),
  });
}

export type CreateAdminFormData = z.infer<ReturnType<typeof buildCreateAdminSchema>>;
export type UpdateAdminFormData = z.infer<ReturnType<typeof buildUpdateAdminSchema>>;
export type ResetPasswordFormData = z.infer<ReturnType<typeof buildResetPasswordSchema>>;
export type ResetMfaFormData = z.infer<ReturnType<typeof buildResetMfaSchema>>;
export type AssignRoleFormData = z.infer<ReturnType<typeof buildAssignRoleSchema>>;
