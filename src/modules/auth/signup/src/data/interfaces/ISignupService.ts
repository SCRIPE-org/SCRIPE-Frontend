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
  CompleteSessionDto,
  PricingContextDto,
  ResumeSessionDto,
  ChangePlanResultDto,
} from "../models/SignupModels";
import type {
  RegisterPayload,
  ContactSalesPayload,
} from "../../domain/interfaces/ISignupRepository";

export interface ISignupService {
  /** Detect visitor country → recommended currency + live FX rates. */
  getPricingContext(): Promise<PricingContextDto>;

  getCategories(currency: string, lang: string): Promise<PublicCategoryDto[]>;

  getEditions(
    categoryKey: string | null,
    currency: string,
    lang: string
  ): Promise<PublicEditionDto[]>;

  sendOtp(email: string): Promise<SendOtpDto>;

  verifyOtp(email: string, code: string): Promise<VerifyOtpDto>;

  checkSubdomain(subdomain: string): Promise<SubdomainCheckDto>;

  submitContactSales(data: ContactSalesPayload): Promise<void>;

  register(data: RegisterPayload): Promise<RegisterDto>;

  /** Finalize-page polling. */
  getStatus(ref: string): Promise<SignupStatusDto>;

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
}
