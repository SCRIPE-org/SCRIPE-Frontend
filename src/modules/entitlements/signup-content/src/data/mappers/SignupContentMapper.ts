import { z } from "zod";
import { safeParseApiResponse } from "@core/common/zod-utils";
import type {
  AdminSignupContent,
  ContentMode,
  CustomerLogo,
  TrustMark,
  WelcomeContent,
} from "../../domain/entities/SignupContent";
import { CONTENT_MODES } from "../../domain/entities/SignupContent";
import type { AdminSignupContentModel } from "../models/SignupContentModels";

const WelcomeContentSchema = z.object({
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

const TrustMarkSchema = z.object({
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

const CustomerLogoSchema = z.object({
  id: z.string(),
  key: z.string().default(""),
  name: z.string().default(""),
  assetUrl: z.string().default(""),
  isRealData: z.boolean().default(false),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});

const AdminSignupContentSchema = z.object({
  contentMode: z.enum(CONTENT_MODES).default("Seeded"),
  welcomeContent: WelcomeContentSchema.nullable().optional(),
  trustMarks: z.array(TrustMarkSchema).optional().default([]),
  customerLogos: z.array(CustomerLogoSchema).optional().default([]),
});

export class SignupContentMapper {
  static toEntity(model: AdminSignupContentModel): AdminSignupContent {
    const parsed = safeParseApiResponse(AdminSignupContentSchema, model, "AdminSignupContent");

    return {
      contentMode: parsed.contentMode as ContentMode,
      welcomeContent: parsed.welcomeContent ? this.toWelcomeContent(parsed.welcomeContent) : null,
      trustMarks: parsed.trustMarks.map(this.toTrustMark),
      customerLogos: parsed.customerLogos.map(this.toCustomerLogo),
    };
  }

  private static toWelcomeContent(model: z.infer<typeof WelcomeContentSchema>): WelcomeContent {
    return {
      id: model.id,
      headlineEn: model.headlineEn,
      headlineAr: model.headlineAr,
      subcopyEn: model.subcopyEn,
      subcopyAr: model.subcopyAr,
      ctaLabelEn: model.ctaLabelEn,
      ctaLabelAr: model.ctaLabelAr,
      trustedByCount: model.trustedByCount,
      trustedByLabelEn: model.trustedByLabelEn,
      trustedByLabelAr: model.trustedByLabelAr,
    };
  }

  private static toTrustMark(model: z.infer<typeof TrustMarkSchema>): TrustMark {
    return {
      id: model.id,
      key: model.key,
      kind: model.kind,
      labelEn: model.labelEn,
      labelAr: model.labelAr,
      iconKey: model.iconKey ?? null,
      assetUrl: model.assetUrl ?? null,
      isRealData: model.isRealData,
      sortOrder: model.sortOrder,
      isActive: model.isActive,
    };
  }

  private static toCustomerLogo(model: z.infer<typeof CustomerLogoSchema>): CustomerLogo {
    return {
      id: model.id,
      key: model.key,
      name: model.name,
      assetUrl: model.assetUrl,
      isRealData: model.isRealData,
      sortOrder: model.sortOrder,
      isActive: model.isActive,
    };
  }
}
