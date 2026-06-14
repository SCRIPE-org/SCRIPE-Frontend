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
  ChangePlanPayload,
  SignupRecommendationResult,
} from "../entities";
import type {
  OnboardingFlow,
  OnboardingRecommendation,
  SignupRecommendationRequest,
  WelcomeContent,
} from "../entities/OnboardingEntities";

export type { ChangePlanPayload };

/** Register payload — promo codes are entered ONLY on the Stripe page, never here. */
export interface RegisterPayload {
  editionId?: string | null;
  billingCycle?: string | null;
  currency?: string | null;
  fullName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  marketingOptIn: boolean;
  emailVerificationToken: string;
  workspaceName: string;
  subdomain: string;
  username?: string;
  region?: string | null;
  defaultLocale?: string | null;
  timezone?: string | null;
  // Discovery Intelligence (optional — sent to CRM, never affects pricing)
  businessType?: string | null;
  teamSize?: string | null;
  primaryPriority?: string | null;
}

export interface ContactSalesPayload {
  fullName: string;
  email: string;
  company?: string | null;
  companySize?: string | null;
  phone?: string | null;
  editionId?: string | null;
  note?: string | null;
  // Discovery Intelligence (optional)
  businessType?: string | null;
  teamSize?: string | null;
  primaryPriority?: string | null;
}

export interface ISignupRepository {
  /** Detect visitor country and return recommended currency + all FX rates. */
  getPricingContext(): Promise<PricingContext>;
  getCategories(currency: string, lang: string): Promise<PublicCategory[]>;
  getEditions(categoryKey: string | null, currency: string, lang: string): Promise<PublicEdition[]>;
  sendOtp(email: string): Promise<SignupOtpResult>;
  verifyOtp(email: string, code: string): Promise<SignupVerificationResult>;
  checkSubdomain(subdomain: string): Promise<SubdomainCheckResult>;
  submitContactSales(data: ContactSalesPayload): Promise<void>;
  register(data: RegisterPayload): Promise<SignupResult>;
  /** Finalize-page polling (3s → 10s cadence). */
  getStatus(ref: string): Promise<SignupStatusResult>;
  /** Atomic single-use consumption — issues JWTs once the webhook activated the signup. */
  completeSession(signupRef: string): Promise<SignupCompleteResult>;
  /** "Start fresh" — abandons the pending signup and releases the subdomain. */
  abandon(signupRef: string): Promise<void>;

  /** Validate a signupRef and return plan snapshot for the resume modal. Null = unknown/terminal ref. */
  resume(signupRef: string): Promise<ResumeSessionResult | null>;

  /** Cancel the current checkout and create a new one with a different plan. */
  changePlan(payload: ChangePlanPayload): Promise<ChangePlanResult>;

  /**
   * Server-side recommendation scorer.
   * Returns recommended tier + edition name based on Discovery Q1/Q2/Q3 answers.
   * Throws on network failure — callers should fall back to computeRecommendedTier().
   */
  getRecommendation(params: {
    vertical?: string | null;
    teamSize?: string | null;
    priorities?: string | null;
    currency?: string;
    lang?: string;
  }): Promise<SignupRecommendationResult>;

  /**
   * Onboarding Intelligence Engine — returns the dynamic Q&A flow.
   * With no categoryKey the backend returns the COMPLETE active graph (full=true):
   * every vertical's questions + options + conditions in a single payload.
   */
  getOnboardingFlow(categoryKey?: string, lang?: string): Promise<OnboardingFlow>;

  /** Onboarding Intelligence Engine — localized welcome + trust content for the welcome screen. */
  getWelcomeContent(lang: string): Promise<WelcomeContent>;

  /**
   * Adaptive recommendation — scores the collected answer map (E1 request form)
   * against the live edition catalog and returns the recommended edition.
   * The vertical is derived server-side from the `business_type` answer; the
   * optional categoryId is passed through but ignored by the scorer.
   */
  getAdaptiveRecommendation(
    request: SignupRecommendationRequest
  ): Promise<OnboardingRecommendation>;

  /** Onboarding Intelligence Engine — scores collected answers and returns recommended edition. */
  getOnboardingRecommendation(
    categoryKey: string,
    answersJson: string,
    lang: string
  ): Promise<OnboardingRecommendation>;

  /** Onboarding Intelligence Engine — records a single answer against the session. */
  submitOnboardingAnswer(sessionRef: string, questionKey: string, values: string[]): Promise<void>;
}
