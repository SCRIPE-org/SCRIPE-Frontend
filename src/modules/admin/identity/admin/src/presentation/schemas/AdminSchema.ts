/**
 * Admin Form Schema
 *
 * Zod validation schema for admin forms.
 */
import { z } from "zod";
import {
  DEFAULT_PASSWORD_MAX_LENGTH,
  createPolicyPasswordSchema,
  type PasswordPolicyModel,
  type TranslatePasswordPolicyFn,
} from "@core/common/password-policy";
import { isValidPhoneNumber } from "@core/ui/phone-input";

/**
 * Builds the create-admin Zod schema with localized messages and dynamic tenant password policy.
 * Supports two modes:
 * 1. sendSetupEmail=true (default): Email invitation — password not required, email required
 * 2. sendSetupEmail=false: Manual password — password required matching backend PasswordPolicyModel
 */
export function buildCreateAdminSchema(
  t: TranslatePasswordPolicyFn,
  policy: PasswordPolicyModel | null | undefined
) {
  const maxPasswordLength = policy?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH;
  const policySchema = createPolicyPasswordSchema(policy, t);

  return z
    .object({
      username: z
        .string()
        .min(3, t("admin.validation.usernameMin"))
        .max(100, t("admin.validation.usernameMax"))
        .regex(/^[a-zA-Z0-9_]+$/, t("admin.validation.usernameFormat")),
      password: z
        .string()
        .max(maxPasswordLength, t("common.passwordPolicy.maxLengthExceeded", { max: maxPasswordLength }))
        .optional()
        .or(z.literal("")),
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
        .max(256, t("admin.validation.emailMax"))
        .optional()
        .or(z.literal("")),
      notes: z.string().max(500, t("admin.validation.notesMax")).optional(),
      /** true = email invitation (default), false = manual password */
      sendSetupEmail: z.boolean().optional().default(true),
      /** Only used when sendSetupEmail=false */
      mustChangePassword: z.boolean().optional().default(false),
    })
    .superRefine((data, ctx) => {
      if (!data.sendSetupEmail) {
        if (!data.password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("admin.passwordRequired"),
            path: ["password"],
          });
        } else {
          const parsed = policySchema.safeParse(data.password);
          if (!parsed.success) {
            for (const issue of parsed.error.issues) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: issue.message,
                path: ["password"],
              });
            }
          }
        }
      }
      if (data.sendSetupEmail && (!data.email || data.email.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("admin.validation.emailRequiredForInvite"),
          path: ["email"],
        });
      }
    });
}

/**
 * Builds the update-admin Zod schema with localized validation messages.
 */
export function buildUpdateAdminSchema(t: TranslatePasswordPolicyFn) {
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
      .max(256, t("admin.validation.emailMax"))
      .optional()
      .or(z.literal("")),
    notes: z.string().max(500, t("admin.validation.notesMax")).optional(),
    isActive: z.boolean().optional(),
  });
}

/**
 * Builds the reset-password Zod schema driven strictly by `policy`.
 */
export function buildResetPasswordSchema(
  t: TranslatePasswordPolicyFn,
  policy: PasswordPolicyModel | null | undefined
) {
  const maxPasswordLength = policy?.maxLength ?? DEFAULT_PASSWORD_MAX_LENGTH;
  return z
    .object({
      newPassword: createPolicyPasswordSchema(policy, t).pipe(
        z.string().max(
          maxPasswordLength,
          t("common.passwordPolicy.maxLengthExceeded", { max: maxPasswordLength })
        )
      ),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("admin.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });
}

/**
 * Builds the assign-role Zod schema with localized messages.
 */
export function buildAssignRoleSchema(t: TranslatePasswordPolicyFn) {
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
export type AssignRoleFormData = z.infer<ReturnType<typeof buildAssignRoleSchema>>;
