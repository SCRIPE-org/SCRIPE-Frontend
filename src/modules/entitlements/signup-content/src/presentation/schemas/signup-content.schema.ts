import { z } from "zod";
import { CONTENT_MODES } from "../../domain/entities/SignupContent";

// Data schemas (used by mapper)
/**
 * Constant definition representing welcome content dto schema.
 */
export const WelcomeContentDtoSchema = z.object({
  id: z.string(),
  headlineEn: z.string().default(""),
  headlineAr: z.string().default(""),
  subcopyEn: z.string().default(""),
  subcopyAr: z.string().default(""),
  ctaLabelEn: z.string().default(""),
  ctaLabelAr: z.string().default(""),
  trustedByCount: z.number().default(0),
  trustedByLabelEn: z.string().default(""),
  trustedByLabelAr: z.string().default(""),
});

/**
 * Constant definition representing trust mark dto schema.
 */
export const TrustMarkDtoSchema = z.object({
  id: z.string(),
  key: z.string().default(""),
  kind: z.string().default(""),
  labelEn: z.string().default(""),
  labelAr: z.string().default(""),
  iconKey: z.string().nullable().optional(),
  assetUrl: z.string().nullable().optional(),
  isRealData: z.boolean().default(false),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

/**
 * Constant definition representing customer logo dto schema.
 */
export const CustomerLogoDtoSchema = z.object({
  id: z.string(),
  key: z.string().default(""),
  name: z.string().default(""),
  assetUrl: z.string().default(""),
  isRealData: z.boolean().default(false),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

/**
 * Constant definition representing admin signup content dto schema.
 */
export const AdminSignupContentDtoSchema = z.object({
  contentMode: z.enum(CONTENT_MODES).default("Seeded"),
  welcomeContent: WelcomeContentDtoSchema.nullable().optional(),
  trustMarks: z.array(TrustMarkDtoSchema).optional().default([]),
  customerLogos: z.array(CustomerLogoDtoSchema).optional().default([]),
});

// Form schemas
/**
 * Constant definition representing welcome content form schema.
 */
export const WelcomeContentFormSchema = z.object({
  headlineEn: z.string().min(1, "Headline (EN) is required"),
  headlineAr: z.string().min(1, "Headline (AR) is required"),
  subcopyEn: z.string().min(1, "Subcopy (EN) is required"),
  subcopyAr: z.string().min(1, "Subcopy (AR) is required"),
  ctaLabelEn: z.string().min(1, "CTA Label (EN) is required"),
  ctaLabelAr: z.string().min(1, "CTA Label (AR) is required"),
  trustedByCount: z.number().nonnegative("Must be non-negative"),
  trustedByLabelEn: z.string().min(1, "Label (EN) is required"),
  trustedByLabelAr: z.string().min(1, "Label (AR) is required"),
});

/**
 * Constant definition representing trust mark form schema.
 */
export const TrustMarkFormSchema = z.object({
  key: z.string().min(1, "Key is required"),
  kind: z.string().min(1, "Kind is required"),
  labelEn: z.string().min(1, "Label (EN) is required"),
  labelAr: z.string().min(1, "Label (AR) is required"),
  iconKey: z.string().optional(),
  assetUrl: z.string().optional(),
  isRealData: z.boolean(),
  sortOrder: z.number(),
  isActive: z.boolean(),
});

/**
 * Constant definition representing customer logo form schema.
 */
export const CustomerLogoFormSchema = z.object({
  key: z.string().min(1, "Key is required"),
  name: z.string().min(1, "Name is required"),
  assetUrl: z.string().url("Must be a valid URL"),
  isRealData: z.boolean(),
  sortOrder: z.number(),
  isActive: z.boolean(),
});
