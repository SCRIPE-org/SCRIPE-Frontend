// ═══════════════════════════════════════════════════════════════════════════
// ISignupService — HTTP Service Contract
//
// Mirrors ISignupRepository but operates at the HTTP level (DTOs).
// The repository is responsible for calling the service and mapping results
// to domain entities via SignupMapper.
//
// Rule: Services work with DTOs. Repositories work with domain entities.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  PublicEditionDto,
  PublicCategoryDto,
  SendOtpDto,
  VerifyOtpDto,
  SubdomainCheckDto,
  RegisterDto,
  SignupStatusDto,
  SignupCheckoutStatusDto,
  CompleteSessionDto,
  PricingContextDto,
  ResumeSessionDto,
  ChangePlanResultDto,
  RecommendationDto,
  OnboardingFlowDto,
  OnboardingRecommendationDto,
  SignupWelcomeContentDto,
} from "../models/SignupModels";
import type {
  RegisterPayload,
  ContactSalesPayload,
} from "../../domain/interfaces/ISignupRepository";
import type { SignupRecommendationRequest } from "../../domain/entities/OnboardingEntities";

export interface ISignupService {
  /** Detect visitor country → recommended currency + live FX rates. */
  getPricingContext(): Promise<PricingContextDto>;

  getCategories(currency: string | undefined, lang: string): Promise<PublicCategoryDto[]>;

  getEditions(
    categoryKey: string | null,
    currency: string | undefined,
    lang: string
  ): Promise<PublicEditionDto[]>;

  /**
   * Server-side recommendation scorer.
   * Returns recommended tier + edition name based on Discovery Q1/Q2/Q3 answers.
   * Callers should fall back to computeRecommendedTier() if this throws.
   */
  getRecommendation(params: {
    vertical?: string | null;
    teamSize?: string | null;
    priorities?: string | null;
    currency?: string;
    lang?: string;
  }): Promise<RecommendationDto>;

  sendOtp(email: string): Promise<SendOtpDto>;

  verifyOtp(email: string, code: string): Promise<VerifyOtpDto>;

  checkSubdomain(subdomain: string): Promise<SubdomainCheckDto>;

  submitContactSales(data: ContactSalesPayload): Promise<void>;

  register(data: RegisterPayload): Promise<RegisterDto>;

  /** Finalize-page polling. */
  getStatus(ref: string): Promise<SignupStatusDto>;

  getCheckoutStatus(sessionId: string): Promise<SignupCheckoutStatusDto>;

  /** Atomic single-use token consumption — issues JWTs. */
  completeSession(signupRef: string): Promise<CompleteSessionDto>;

  /** Abandon pending signup and release the subdomain reservation. */
  abandon(signupRef: string): Promise<void>;

  /** Validate a signupRef and return plan snapshot for UI restore (resume modal). */
  resume(signupRef: string): Promise<ResumeSessionDto | null>;

  /** Cancel the current Stripe checkout and create a new one with a different plan. */
  changePlan(payload: {
    signupRef: string;
    newEditionId: string;
    billingCycle: string;
    currency: string;
  }): Promise<ChangePlanResultDto>;

  /**
   * Onboarding Intelligence Engine — returns the dynamic Q&A flow.
   * With no `category`, requests the COMPLETE active graph (full=true) so the
   * wizard gets every vertical's questions + options + conditions in one call.
   */
  getOnboardingFlow(params: { category?: string; lang?: string }): Promise<OnboardingFlowDto>;

  /** Onboarding Intelligence Engine — localized welcome + trust content for the welcome screen. */
  getWelcomeContent(lang: string): Promise<SignupWelcomeContentDto>;

  /**
   * Adaptive recommendation — scores the collected answer map (E1 request form)
   * against the live edition catalog. Answers are serialized as repeated
   * `answers=key:v1,v2` query params; the vertical is derived server-side from
   * the `business_type` answer (categoryId is optional and ignored by the scorer).
   */
  getAdaptiveRecommendation(
    request: SignupRecommendationRequest
  ): Promise<OnboardingRecommendationDto>;

  /** Onboarding Intelligence Engine — scores collected answers and returns recommended edition. */
  getOnboardingRecommendation(params: {
    category: string;
    answers: string;
    lang: string;
  }): Promise<OnboardingRecommendationDto>;

  /** Onboarding Intelligence Engine — records a single answer against the session. */
  submitOnboardingAnswer(params: {
    sessionRef: string;
    questionKey: string;
    values: string[];
  }): Promise<void>;
}
