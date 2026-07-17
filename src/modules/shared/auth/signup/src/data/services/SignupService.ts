// ═══════════════════════════════════════════════════════════════════════════
// SignupService — HTTP Layer
//
// Makes the actual API calls and returns raw DTOs (never domain entities).
// The repository calls this service and uses SignupMapper to produce entities.
//
// Rule: Services work with DTOs only. No domain entity imports.
// ═══════════════════════════════════════════════════════════════════════════

import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { ISignupService } from "../interfaces/ISignupService";
import { SIGNUP_ENDPOINTS } from "./signup.endpoints";
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
  ContactSalesRequestDto,
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

/**
 * Http API network service for signup.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class SignupService implements ISignupService {
  constructor(
    private readonly api: IPublicApiService,
    private readonly _apiService?: IApiService
  ) {}

  /**
   * Detects the visitor's country (via Cloudflare/proxy headers on the backend)
   * and returns the recommended display currency + all supported currencies with
   * live USD exchange rates (cached 24h via open.er-api.com).
   *
   * Cached 10 min client-side by TanStack Query in the orchestrator ViewModel.
   */
  async getPricingContext(): Promise<PricingContextDto> {
    return this.api.get<PricingContextDto>(SIGNUP_ENDPOINTS.PRICING_CONTEXT);
  }

  async getCategories(currency: string | undefined, lang: string): Promise<PublicCategoryDto[]> {
    const params: Record<string, string> = { lang };
    if (currency) params.currency = currency;
    const url = buildUrl(SIGNUP_ENDPOINTS.GET_CATEGORIES, params);
    return this.api.get<PublicCategoryDto[]>(url);
  }

  async getEditions(
    categoryKey: string | null,
    currency: string | undefined,
    lang: string
  ): Promise<PublicEditionDto[]> {
    const params: Record<string, string> = { lang };
    if (currency) params.currency = currency;
    if (categoryKey) params.categoryId = categoryKey;
    const url = buildUrl(SIGNUP_ENDPOINTS.GET_EDITIONS, params);
    return this.api.get<PublicEditionDto[]>(url);
  }

  async getRecommendation(params: {
    vertical?: string | null;
    teamSize?: string | null;
    priorities?: string | null;
    currency?: string;
    lang?: string;
  }): Promise<RecommendationDto> {
    const query: Record<string, string> = {};
    if (params.vertical) query.vertical = params.vertical;
    if (params.teamSize) query.teamSize = params.teamSize;
    if (params.priorities) query.priorities = params.priorities;
    if (params.currency) query.currency = params.currency;
    if (params.lang) query.lang = params.lang;
    const url = buildUrl(SIGNUP_ENDPOINTS.RECOMMENDATION, query);
    return this.api.get<RecommendationDto>(url);
  }

  async sendOtp(email: string): Promise<SendOtpDto> {
    return this.api.post<SendOtpDto>(SIGNUP_ENDPOINTS.SEND_OTP, { email });
  }

  async verifyOtp(email: string, code: string): Promise<VerifyOtpDto> {
    return this.api.post<VerifyOtpDto>(SIGNUP_ENDPOINTS.VERIFY_OTP, { email, code });
  }

  async checkSubdomain(subdomain: string): Promise<SubdomainCheckDto> {
    const url = buildUrl(SIGNUP_ENDPOINTS.CHECK_SUBDOMAIN, { subdomain });
    return this.api.get<SubdomainCheckDto>(url);
  }

  async submitContactSales(data: ContactSalesPayload): Promise<void> {
    const body: ContactSalesRequestDto = {
      contactName: data.fullName,
      email: data.email,
      companyName: data.company ?? data.email.split("@")[1] ?? "Unknown",
      phone: data.phone ?? null,
      editionKey: data.editionId,
      message: data.note,
      businessType: data.businessType,
      teamSize: data.teamSize,
      primaryPriority: data.primaryPriority,
    };
    return this.api.post<void>(
      SIGNUP_ENDPOINTS.CONTACT_SALES,
      body as unknown as Record<string, unknown>
    );
  }

  async register(data: RegisterPayload): Promise<RegisterDto> {
    return this.api.post<RegisterDto>(
      SIGNUP_ENDPOINTS.REGISTER,
      data as unknown as Record<string, unknown>
    );
  }

  async getStatus(ref: string): Promise<SignupStatusDto> {
    const url = buildUrl(SIGNUP_ENDPOINTS.STATUS, { ref });
    return this.api.get<SignupStatusDto>(url);
  }

  async getCheckoutStatus(sessionId: string): Promise<SignupCheckoutStatusDto> {
    const url = buildUrl(SIGNUP_ENDPOINTS.CHECKOUT_STATUS, { sessionId });
    return this.api.get<SignupCheckoutStatusDto>(url);
  }

  async completeSession(signupRef: string): Promise<CompleteSessionDto> {
    return this.api.post<CompleteSessionDto>(SIGNUP_ENDPOINTS.COMPLETE_SESSION, {
      signupRef,
    });
  }

  async abandon(signupRef: string): Promise<void> {
    return this.api.post<void>(SIGNUP_ENDPOINTS.ABANDON, { signupRef });
  }

  async resume(
    signupRef: string
  ): Promise<import("../models/SignupModels").ResumeSessionDto | null> {
    try {
      return await this.api.post<import("../models/SignupModels").ResumeSessionDto>(
        SIGNUP_ENDPOINTS.RESUME,
        { resumeToken: signupRef }
      );
    } catch {
      return null;
    }
  }

  async changePlan(payload: {
    signupRef: string;
    newEditionId: string;
    billingCycle: string;
    currency: string;
  }): Promise<import("../models/SignupModels").ChangePlanResultDto> {
    return this.api.post<import("../models/SignupModels").ChangePlanResultDto>(
      SIGNUP_ENDPOINTS.CHANGE_PLAN,
      {
        signupRef: payload.signupRef,
        newEditionId: payload.newEditionId,
        billingCycle: payload.billingCycle,
        currency: payload.currency,
      }
    );
  }

  async getOnboardingFlow(params: {
    category?: string;
    lang?: string;
  }): Promise<OnboardingFlowDto> {
    // Signup wizard mode: with no category, request the COMPLETE active graph
    // (every vertical's questions + options + conditions) in ONE payload so the
    // wizard evaluates all branching client-side with zero refetch.
    // A specific category overrides full-graph (admin/preview scoping).
    const query: Record<string, string | boolean> = {
      lang: params.lang ?? "en",
      full: true,
    };
    if (params.category) query.category = params.category;
    const url = buildUrl(SIGNUP_ENDPOINTS.ONBOARDING_FLOW, query);
    return this.api.get<OnboardingFlowDto>(url);
  }

  /**
   * Onboarding Intelligence Engine — localized welcome + trust content.
   * Language is also sent via the Accept-Language header by the public API
   * interceptor; the explicit ?lang= wins server-side when supplied.
   */
  async getWelcomeContent(lang: string): Promise<SignupWelcomeContentDto> {
    const url = buildUrl(SIGNUP_ENDPOINTS.ONBOARDING_WELCOME_CONTENT, { lang });
    return this.api.get<SignupWelcomeContentDto>(url);
  }

  /**
   * Adaptive recommendation — scores the collected answer map against the live
   * edition catalog. The chosen vertical is derived server-side from the
   * `business_type` answer; `categoryId` is optional (the scorer ignores it and
   * scopes editions by the business_type slug). Language travels via the
   * Accept-Language header set by the public API interceptor.
   *
   * Serialization: the answer map is flattened into repeated
   * `answers=questionKey:value1,value2` query params (one per question), which
   * `buildUrl` cannot express, so the query string is assembled here directly.
   */
  async getAdaptiveRecommendation(
    request: SignupRecommendationRequest
  ): Promise<OnboardingRecommendationDto> {
    const search = new URLSearchParams();
    if (request.categoryId) search.append("categoryId", request.categoryId);
    for (const answer of request.answers) {
      // Skip empty selections — an empty value list carries no signal.
      if (answer.selectedValues.length === 0) continue;
      search.append("answers", `${answer.questionKey}:${answer.selectedValues.join(",")}`);
    }
    const query = search.toString();
    const url = query
      ? `${SIGNUP_ENDPOINTS.ONBOARDING_RECOMMENDATION}?${query}`
      : SIGNUP_ENDPOINTS.ONBOARDING_RECOMMENDATION;
    return this.api.get<OnboardingRecommendationDto>(url);
  }

  async getOnboardingRecommendation(params: {
    category: string;
    answers: string;
    lang: string;
  }): Promise<OnboardingRecommendationDto> {
    const url = buildUrl(SIGNUP_ENDPOINTS.ONBOARDING_RECOMMENDATION, {
      category: params.category,
      answers: params.answers,
      lang: params.lang,
    });
    return this.api.get<OnboardingRecommendationDto>(url);
  }

  async submitOnboardingAnswer(params: {
    sessionRef: string;
    questionKey: string;
    values: string[];
  }): Promise<void> {
    await this.api.post<void>(SIGNUP_ENDPOINTS.ONBOARDING_ANSWER, params);
  }
}
