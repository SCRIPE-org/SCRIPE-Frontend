import { z } from "zod";
import type { useI18n } from "@core/providers/i18n-provider";
import { CONTENT_MODES } from "../../domain/entities/SignupContent";

// Data schemas (used by mapper)
/**
 * Exported constant defining parameters and fields for welcome content dto schema configurations.
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
 * Exported constant defining parameters and fields for trust mark dto schema configurations.
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
 * Exported constant defining parameters and fields for customer logo dto schema configurations.
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
 * Exported constant defining parameters and fields for admin signup content dto schema configurations.
 */
export const AdminSignupContentDtoSchema = z.object({
  contentMode: z.enum(CONTENT_MODES).default("Seeded"),
  welcomeContent: WelcomeContentDtoSchema.nullable().optional(),
  trustMarks: z.array(TrustMarkDtoSchema).optional().default([]),
  customerLogos: z.array(CustomerLogoDtoSchema).optional().default([]),
});

// Form schemas
//
// These are built at render time from the active translator rather than
// exported as static objects, so the validation copy a screen reader
// announces (and the text FormMessage renders) ships in the admin's own
// language instead of a hardcoded English literal baked into this module.
// The field shapes themselves are unchanged — only the message strings
// route through t().
type TranslateFn = ReturnType<typeof useI18n>["t"];

/**
 * Builds the localized welcome-content form schema for the given translator.
 */
export function createWelcomeContentFormSchema(t: TranslateFn) {
  const required = (field: string) => t("signupContent.validation.required", { field });

  return z.object({
    headlineEn: z.string().min(1, required(t("signupContent.welcome.headlineEn"))),
    headlineAr: z.string().min(1, required(t("signupContent.welcome.headlineAr"))),
    subcopyEn: z.string().min(1, required(t("signupContent.welcome.subcopyEn"))),
    subcopyAr: z.string().min(1, required(t("signupContent.welcome.subcopyAr"))),
    ctaLabelEn: z.string().min(1, required(t("signupContent.welcome.ctaEn"))),
    ctaLabelAr: z.string().min(1, required(t("signupContent.welcome.ctaAr"))),
    trustedByCount: z.number().nonnegative(
      t("signupContent.validation.nonNegative", {
        field: t("signupContent.welcome.trustedByCount"),
      })
    ),
    trustedByLabelEn: z.string().min(1, required(t("signupContent.welcome.trustedByLabelEn"))),
    trustedByLabelAr: z.string().min(1, required(t("signupContent.welcome.trustedByLabelAr"))),
  });
}

/**
 * Builds the localized trust-mark form schema for the given translator.
 */
export function createTrustMarkFormSchema(t: TranslateFn) {
  const required = (field: string) => t("signupContent.validation.required", { field });

  return z.object({
    key: z.string().min(1, required(t("signupContent.trustMarks.key"))),
    kind: z.string().min(1, required(t("signupContent.trustMarks.kind"))),
    labelEn: z.string().min(1, required(t("signupContent.trustMarks.labelEn"))),
    labelAr: z.string().min(1, required(t("signupContent.trustMarks.labelAr"))),
    iconKey: z.string().optional(),
    assetUrl: z.string().optional(),
    isRealData: z.boolean(),
    sortOrder: z.number(),
    isActive: z.boolean(),
  });
}

/**
 * Builds the localized customer-logo form schema for the given translator.
 */
export function createCustomerLogoFormSchema(t: TranslateFn) {
  const required = (field: string) => t("signupContent.validation.required", { field });

  return z.object({
    key: z.string().min(1, required(t("signupContent.customerLogos.key"))),
    name: z.string().min(1, required(t("signupContent.customerLogos.name"))),
    assetUrl: z.string().url(
      t("signupContent.validation.invalidUrl", {
        field: t("signupContent.customerLogos.assetUrl"),
      })
    ),
    isRealData: z.boolean(),
    sortOrder: z.number(),
    isActive: z.boolean(),
  });
}
