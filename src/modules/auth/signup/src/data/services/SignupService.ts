// ═══════════════════════════════════════════════════════════════════════════
// SignupService — HTTP Layer
//
// Makes the actual API calls and returns raw DTOs (never domain entities).
// The repository calls this service and uses SignupMapper to produce entities.
//
// Rule: Services work with DTOs only. No domain entity imports.
// ═══════════════════════════════════════════════════════════════════════════

import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import { AUTH_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { ISignupService } from "../interfaces/ISignupService";
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
  ContactSalesRequestDto,
} from "../models/SignupModels";
import type {
  RegisterPayload,
  ContactSalesPayload,
} from "../../domain/interfaces/ISignupRepository";

export class SignupService implements ISignupService {
  constructor(private readonly api: IPublicApiService) {}

  /**
   * Detects the visitor's country (via Cloudflare/proxy headers on the backend)
   * and returns the recommended display currency + all supported currencies with
   * live USD exchange rates (cached 24h via open.er-api.com).
   *
   * Cached 10 min client-side by TanStack Query in the orchestrator ViewModel.
   */
  async getPricingContext(): Promise<PricingContextDto> {
    return this.api.get<PricingContextDto>(AUTH_ENDPOINTS.AUTH.SIGNUP.PRICING_CONTEXT);
  }

  async getCategories(currency: string, lang: string): Promise<PublicCategoryDto[]> {
    const url = buildUrl(AUTH_ENDPOINTS.AUTH.SIGNUP.GET_CATEGORIES, { currency, lang });
    return this.api.get<PublicCategoryDto[]>(url);
  }

  async getEditions(
    categoryKey: string | null,
    currency: string,
    lang: string
  ): Promise<PublicEditionDto[]> {
    const params: Record<string, string> = { currency, lang };
    if (categoryKey) params.categoryId = categoryKey;
    const url = buildUrl(AUTH_ENDPOINTS.AUTH.SIGNUP.GET_EDITIONS, params);
    return this.api.get<PublicEditionDto[]>(url);
  }

  async sendOtp(email: string): Promise<SendOtpDto> {
    return this.api.post<SendOtpDto>(AUTH_ENDPOINTS.AUTH.SIGNUP.SEND_OTP, { email });
  }

  async verifyOtp(email: string, code: string): Promise<VerifyOtpDto> {
    return this.api.post<VerifyOtpDto>(AUTH_ENDPOINTS.AUTH.SIGNUP.VERIFY_OTP, { email, code });
  }

  async checkSubdomain(subdomain: string): Promise<SubdomainCheckDto> {
    const url = buildUrl(AUTH_ENDPOINTS.AUTH.SIGNUP.CHECK_SUBDOMAIN, { subdomain });
    return this.api.get<SubdomainCheckDto>(url);
  }

  async submitContactSales(data: ContactSalesPayload): Promise<void> {
    const body: ContactSalesRequestDto = {
      contactName: data.fullName,
      email: data.email,
      companyName: data.company ?? data.email.split("@")[1] ?? "Unknown",
      phone: null,
      editionKey: data.editionId,
      message: data.note,
      businessType: data.businessType,
      teamSize: data.teamSize,
      primaryPriority: data.primaryPriority,
    };
    return this.api.post<void>(
      AUTH_ENDPOINTS.AUTH.SIGNUP.CONTACT_SALES,
      body as unknown as Record<string, unknown>
    );
  }

  async register(data: RegisterPayload): Promise<RegisterDto> {
    return this.api.post<RegisterDto>(
      AUTH_ENDPOINTS.AUTH.SIGNUP.REGISTER,
      data as unknown as Record<string, unknown>
    );
  }

  async getStatus(ref: string): Promise<SignupStatusDto> {
    const url = buildUrl(AUTH_ENDPOINTS.AUTH.SIGNUP.STATUS, { ref });
    return this.api.get<SignupStatusDto>(url);
  }

  async completeSession(signupRef: string): Promise<CompleteSessionDto> {
    return this.api.post<CompleteSessionDto>(AUTH_ENDPOINTS.AUTH.SIGNUP.COMPLETE_SESSION, {
      signupRef,
    });
  }

  async abandon(signupRef: string): Promise<void> {
    return this.api.post<void>(AUTH_ENDPOINTS.AUTH.SIGNUP.ABANDON, { signupRef });
  }

  async resume(signupRef: string): Promise<import("../models/SignupModels").ResumeSessionDto | null> {
    try {
      return await this.api.post<import("../models/SignupModels").ResumeSessionDto>(
        AUTH_ENDPOINTS.AUTH.SIGNUP.RESUME,
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
      AUTH_ENDPOINTS.AUTH.SIGNUP.CHANGE_PLAN,
      {
        signupRef: payload.signupRef,
        newEditionId: payload.newEditionId,
        billingCycle: payload.billingCycle,
        currency: payload.currency,
      }
    );
  }
}
