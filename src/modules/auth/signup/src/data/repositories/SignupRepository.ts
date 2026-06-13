// ═══════════════════════════════════════════════════════════════════════════
// SignupRepository — Domain Entity Layer
//
// Calls the service (DTOs) and uses SignupMapper to produce domain entities.
// This is the only layer that the presentation (ViewModels) interacts with.
//
// Rule: Repositories return domain entities. Never expose DTOs upward.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  ISignupRepository,
  RegisterPayload,
  ContactSalesPayload,
  ChangePlanPayload,
} from "../../domain/interfaces/ISignupRepository";
import type { ISignupService } from "../interfaces/ISignupService";
import { SignupMapper } from "../mappers/SignupMapper";
import type {
  SignupOtpResult,
  SignupVerificationResult,
  SubdomainCheckResult,
  SignupResult,
  SignupStatusResult,
  SignupCompleteResult,
  PublicEdition,
  PublicCategory,
  PricingContext,
  ResumeSessionResult,
  ChangePlanResult,
  SignupRecommendationResult,
} from "../../domain/entities";

export class SignupRepository implements ISignupRepository {
  constructor(private readonly service: ISignupService) {}

  async getPricingContext(): Promise<PricingContext> {
    const dto = await this.service.getPricingContext();
    return SignupMapper.toPricingContext(dto);
  }

  async getCategories(currency: string, lang: string): Promise<PublicCategory[]> {
    const dtos = await this.service.getCategories(currency, lang);
    return dtos.map(SignupMapper.toCategory);
  }

  async getEditions(
    categoryKey: string | null,
    currency: string,
    lang: string
  ): Promise<PublicEdition[]> {
    const dtos = await this.service.getEditions(categoryKey, currency, lang);
    return dtos.map(SignupMapper.toEdition);
  }

  async sendOtp(email: string): Promise<SignupOtpResult> {
    const dto = await this.service.sendOtp(email);
    return SignupMapper.toOtpResult(dto);
  }

  async verifyOtp(email: string, code: string): Promise<SignupVerificationResult> {
    const dto = await this.service.verifyOtp(email, code);
    return SignupMapper.toVerifyOtpResult(dto);
  }

  async checkSubdomain(subdomain: string): Promise<SubdomainCheckResult> {
    const dto = await this.service.checkSubdomain(subdomain);
    return SignupMapper.toSubdomainResult(dto);
  }

  async submitContactSales(data: ContactSalesPayload): Promise<void> {
    return this.service.submitContactSales(data);
  }

  async register(data: RegisterPayload): Promise<SignupResult> {
    const dto = await this.service.register(data);
    return SignupMapper.toRegisterResult(dto);
  }

  async getStatus(ref: string): Promise<SignupStatusResult> {
    const dto = await this.service.getStatus(ref);
    return SignupMapper.toStatusResult(dto);
  }

  async completeSession(signupRef: string): Promise<SignupCompleteResult> {
    const dto = await this.service.completeSession(signupRef);
    return SignupMapper.toCompleteResult(dto);
  }

  async abandon(signupRef: string): Promise<void> {
    return this.service.abandon(signupRef);
  }

  async resume(signupRef: string): Promise<ResumeSessionResult | null> {
    const dto = await this.service.resume(signupRef);
    if (!dto) return null;
    return {
      status: dto.status,
      editionId: dto.editionId,
      billingCycle: dto.billingCycle,
      currency: dto.currency,
      expiresAt: dto.expiresAt,
    };
  }

  async changePlan(payload: ChangePlanPayload): Promise<ChangePlanResult> {
    const dto = await this.service.changePlan(payload);
    return { checkoutUrl: dto.checkoutUrl };
  }

  async getRecommendation(params: {
    vertical?: string | null;
    teamSize?: string | null;
    priorities?: string | null;
    currency?: string;
    lang?: string;
  }): Promise<SignupRecommendationResult> {
    // Service call — backend scores against live edition catalog
    const dto = await this.service.getRecommendation(params);
    // Mapping is 1:1 — DTO and entity shapes are identical
    return {
      recommendedTier: dto.recommendedTier,
      recommendedEditionName: dto.recommendedEditionName,
      score: dto.score,
      reason: dto.reason,
      reasons: dto.reasons ?? [],
    };
  }
}
