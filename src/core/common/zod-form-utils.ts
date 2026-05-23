/**
 * Zod Form Utilities — Shared schema builders for form validation
 *
 * Import these in every schema file to keep validation DRY and i18n-ready.
 * All schemas should use these builders for consistency.
 */

import { z } from "zod";

// ─── Field Builders ───────────────────────────────────────────────────────────

/**
 * Required non-empty string with optional min/max length.
 * @example requiredString({ min: 2, max: 200 })
 */
export const requiredStr = ({
  min = 1,
  max,
  label = "Field",
}: { min?: number; max?: number; label?: string } = {}) => {
  let s = z.string().min(min, `${label} must be at least ${min} character${min === 1 ? "" : "s"}`);
  if (max) s = s.max(max, `${label} must be at most ${max} characters`);
  return s;
};

/** Optional string — null/undefined allowed */
export const optStr = (max?: number) => {
  let s = z.string().optional();
  if (max) s = z.string().max(max).optional();
  return s;
};

/** Email field with standard validation */
export const emailField = () =>
  z.string().min(1, "Email is required").email("Please enter a valid email address");

/** Optional email */
export const optEmailField = () =>
  z.string().email("Please enter a valid email address").optional().or(z.literal(""));

/** URL field */
export const urlField = () =>
  z.string().url("Please enter a valid URL (must start with https://)");

/** Optional URL */
export const optUrlField = () =>
  z.string().url("Please enter a valid URL").optional().or(z.literal(""));

/** Phone number — basic format */
export const phoneField = () =>
  z.string().regex(/^\+?[\d\s\-().]{7,20}$/, "Please enter a valid phone number").optional().or(z.literal(""));

/** Strong password — min 8 chars, requires uppercase, lowercase, number */
export const strongPassword = () =>
  z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one number");

/** Password confirmation — use with `.superRefine` to check match */
export const passwordMatch = (passwordField: string, confirmField: string) =>
  (data: Record<string, string>, ctx: z.RefinementCtx) => {
    if (data[passwordField] && data[confirmField] && data[passwordField] !== data[confirmField]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: [confirmField],
      });
    }
  };

/** Cron expression field */
export const cronField = () =>
  z.string().regex(
    /^(\*|[0-9,\-*/]+)\s(\*|[0-9,\-*/]+)\s(\*|[0-9,\-*/]+)\s(\*|[0-9,\-*/]+)\s(\*|[0-9,\-*/]+)$/,
    "Please enter a valid cron expression (e.g. 0 9 * * 1)"
  );

/** Positive number */
export const positiveNumber = () =>
  z.number().positive("Must be a positive number");

/** Non-negative integer */
export const nonNegativeInt = () =>
  z.number().int().min(0, "Must be 0 or greater");

/** Color hex code */
export const colorField = () =>
  z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color (e.g. #FF5733)").optional();
