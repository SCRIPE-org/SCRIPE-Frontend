// ═══════════════════════════════════════════════════════════════════════════
// signupSchemas — Zod Validation Schemas
//
// Each wizard step that has a form gets a Zod schema.
// These schemas are consumed by react-hook-form via @hookform/resolvers/zod.
//
// Rules:
//  - Constants (PASSWORD_MIN_LENGTH, SUBDOMAIN_REGEX) come from domain/constants
//  - These schemas are the single source of truth for client-side validation
//  - Server-side FluentValidation mirrors these rules for defense-in-depth
// ═══════════════════════════════════════════════════════════════════════════

import { z } from "zod";
import {
  PASSWORD_MIN_LENGTH,
  SUBDOMAIN_REGEX,
  SUBDOMAIN_MIN_LENGTH,
} from "../../domain/constants/signupConstants";

// ─── Account step schema ──────────────────────────────────────────────────────

/**
 * Constant definition representing account schema.
 */
export const accountSchema = z.object({
  fullName: z.string().min(2, "signup.errors.fullNameMin").max(100, "signup.errors.fullNameMax"),
  email: z.string().email("signup.errors.emailInvalid").min(1, "signup.errors.emailRequired"),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, "signup.errors.passwordMinLength")
    .regex(/[A-Z]/, "signup.errors.passwordUppercase")
    .regex(/[a-z]/, "signup.errors.passwordLowercase")
    .regex(/\d/, "signup.errors.passwordNumber"),
  acceptTerms: z.literal(true, {
    message: "signup.errors.termsRequired",
  }),
  marketingOptIn: z.boolean().optional().default(false),
});

/**
 * Type declaration definition describing the schema of account form values.
 */
export type AccountFormValues = z.infer<typeof accountSchema>;

// ─── Workspace step schema ────────────────────────────────────────────────────

/**
 * Constant definition representing workspace schema.
 */
export const workspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(2, "signup.errors.workspaceNameMin")
    .max(100, "signup.errors.workspaceNameMax"),
  subdomain: z
    .string()
    .min(SUBDOMAIN_MIN_LENGTH, "signup.errors.subdomainMinLength")
    .max(63, "signup.errors.subdomainMaxLength")
    .regex(SUBDOMAIN_REGEX, "signup.errors.subdomainFormat"),
  username: z.string().max(50, "signup.errors.usernameMax").optional(),
  region: z.string().nullable().optional(),
  timezone: z.string().min(1, "signup.errors.timezoneRequired"),
});

/**
 * Type declaration definition describing the schema of workspace form values.
 */
export type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

// ─── Contact Sales step schema ────────────────────────────────────────────────

/**
 * Constant definition representing contact sales schema.
 */
export const contactSalesSchema = z.object({
  fullName: z.string().min(2, "signup.errors.fullNameMin").max(100, "signup.errors.fullNameMax"),
  email: z.string().email("signup.errors.emailInvalid").min(1, "signup.errors.emailRequired"),
  company: z.string().max(200, "signup.errors.companyMax").optional(),
  companySize: z.string().optional(),
  note: z.string().max(1000, "signup.errors.noteMax").optional(),
});

/**
 * Type declaration definition describing the schema of contact sales form values.
 */
export type ContactSalesFormValues = z.infer<typeof contactSalesSchema>;

// ─── OTP step schema ──────────────────────────────────────────────────────────

/**
 * Constant definition representing otp schema.
 */
export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "signup.verification.enterCode")
    .regex(/^\d{6}$/, "signup.verification.digitsOnly"),
});

/**
 * Type declaration definition describing the schema of otp form values.
 */
export type OtpFormValues = z.infer<typeof otpSchema>;
