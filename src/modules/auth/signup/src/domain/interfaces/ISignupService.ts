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
} from "../../data/models/SignupModels";
import type { RegisterPayload, ContactSalesPayload } from "./ISignupRepository";
import type { SignupRecommendationRequest } from "../entities/OnboardingEntities";

export interface ISignupService {
  getPricingContext(): Promise<PricingContextDto>;
  getCategories(currency: string | undefined, lang: string): Promise<PublicCategoryDto[]>;
  getEditions(
    categoryKey: string | null,
    currency: string | undefined,
    lang: string
  ): Promise<PublicEditionDto[]>;
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
  getStatus(ref: string): Promise<SignupStatusDto>;
  getCheckoutStatus(sessionId: string): Promise<SignupCheckoutStatusDto>;
  completeSession(signupRef: string): Promise<CompleteSessionDto>;
  abandon(signupRef: string): Promise<void>;
  resume(signupRef: string): Promise<ResumeSessionDto | null>;
  changePlan(payload: {
    signupRef: string;
    newEditionId: string;
    billingCycle: string;
    currency: string;
  }): Promise<ChangePlanResultDto>;
  getOnboardingFlow(params: { category?: string; lang?: string }): Promise<OnboardingFlowDto>;
  getWelcomeContent(lang: string): Promise<SignupWelcomeContentDto>;
  getAdaptiveRecommendation(
    request: SignupRecommendationRequest
  ): Promise<OnboardingRecommendationDto>;
  getOnboardingRecommendation(params: {
    category: string;
    answers: string;
    lang: string;
  }): Promise<OnboardingRecommendationDto>;
  submitOnboardingAnswer(params: {
    sessionRef: string;
    questionKey: string;
    values: string[];
  }): Promise<void>;
}
