import { z } from "zod";
import { safeParseApiResponse } from "@core/common/zod-utils";
import {
  AdminSignupContent,
  WelcomeContent,
  TrustMark,
  CustomerLogo,
} from "../../domain/entities/SignupContent";
import type { ContentMode } from "../../domain/entities/SignupContent";

import {
  AdminSignupContentDtoSchema,
  WelcomeContentDtoSchema,
  TrustMarkDtoSchema,
  CustomerLogoDtoSchema,
} from "../../presentation/schemas/signup-content.schema";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class SignupContentMapper {
  static toEntity(model: unknown): AdminSignupContent {
    const parsed = safeParseApiResponse(AdminSignupContentDtoSchema, model, "AdminSignupContent");

    return new AdminSignupContent({
      contentMode: parsed.contentMode as ContentMode,
      welcomeContent: parsed.welcomeContent ? this.toWelcomeContent(parsed.welcomeContent) : null,
      trustMarks: parsed.trustMarks.map(this.toTrustMark),
      customerLogos: parsed.customerLogos.map(this.toCustomerLogo),
    });
  }

  private static toWelcomeContent(model: z.infer<typeof WelcomeContentDtoSchema>): WelcomeContent {
    return new WelcomeContent({
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
    });
  }

  private static toTrustMark(model: z.infer<typeof TrustMarkDtoSchema>): TrustMark {
    return new TrustMark({
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
    });
  }

  private static toCustomerLogo(model: z.infer<typeof CustomerLogoDtoSchema>): CustomerLogo {
    return new CustomerLogo({
      id: model.id,
      key: model.key,
      name: model.name,
      assetUrl: model.assetUrl,
      isRealData: model.isRealData,
      sortOrder: model.sortOrder,
      isActive: model.isActive,
    });
  }
}
