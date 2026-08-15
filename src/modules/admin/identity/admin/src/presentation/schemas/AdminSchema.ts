/**
 * Admin Form Schema
 *
 * Zod validation schema for admin forms.
 */
import { z } from "zod";

/**
 * Create admin form schema
 *
 * Supports two modes:
 * 1. sendSetupEmail=true (default): Email invitation — password not required, email required
 * 2. sendSetupEmail=false: Manual password — password required, mustChangePassword optional
 */
export const createAdminSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(100, "Username must be at most 100 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z
      .string()
      .max(100, "Password must be at most 100 characters")
      .optional()
      .or(z.literal("")),
    firstName: z.string().max(100, "First name must be at most 100 characters").optional(),
    lastName: z.string().max(100, "Last name must be at most 100 characters").optional(),
    phoneNumber: z
      .string()
      .max(20, "Phone number must be at most 20 characters")
      .regex(/^[\d\s+\-()]*$/, "Invalid phone number format")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email("Invalid email format")
      .max(256, "Email must be at most 256 characters")
      .optional()
      .or(z.literal("")),
    notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
    /** true = email invitation (default), false = manual password */
    sendSetupEmail: z.boolean().optional().default(true),
    /** Only used when sendSetupEmail=false */
    mustChangePassword: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    // When NOT sending setup email (manual password mode), password is required
    if (!data.sendSetupEmail) {
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 6 characters",
          path: ["password"],
        });
      }
    }
    // When sending setup email, email is required
    if (data.sendSetupEmail) {
      if (!data.email || data.email.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email is required for email invitation",
          path: ["email"],
        });
      }
    }
  });

/**
 * Update admin form schema
 */
export const updateAdminSchema = z.object({
  firstName: z.string().max(100, "First name must be at most 100 characters").optional(),
  lastName: z.string().max(100, "Last name must be at most 100 characters").optional(),
  phoneNumber: z
    .string()
    .max(20, "Phone number must be at most 20 characters")
    .regex(/^[\d\s+\-()]*$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Invalid email format")
    .max(256, "Email must be at most 256 characters")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500, "Notes must be at most 500 characters").optional(),
  isActive: z.boolean().optional(),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password must be at most 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Assign role schema
 */
export const assignRoleSchema = z.object({
  roleId: z.string().min(1, "Role is required"),
  tenantId: z.string().optional(),
  inheritToChildren: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

/**
 * Exported type defining parameters and fields for create admin form data configurations.
 */
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
/**
 * Exported type defining parameters and fields for update admin form data configurations.
 */
export type UpdateAdminFormData = z.infer<typeof updateAdminSchema>;
/**
 * Exported type defining parameters and fields for reset password form data configurations.
 */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
/**
 * Exported type defining parameters and fields for assign role form data configurations.
 */
export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;
