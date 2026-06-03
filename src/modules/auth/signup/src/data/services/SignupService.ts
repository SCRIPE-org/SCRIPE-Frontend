import type { IPublicApiService } from "@core/interfaces/public-api.interface";
import { AUTH_ENDPOINTS } from "@core/config/api-endpoints";
import { buildUrl } from "@core/config/api-endpoints";
import type {
  SignupOtpResult,
  SignupVerificationResult,
  SubdomainCheckResult,
  SignupResult,
  PublicEdition,
} from "../../domain/entities";

export class SignupService {
  constructor(private readonly api: IPublicApiService) {}

  async getEditions(): Promise<PublicEdition[]> {
    return this.api.get<PublicEdition[]>(AUTH_ENDPOINTS.AUTH.SIGNUP.GET_EDITIONS);
  }

  async sendOtp(email: string): Promise<SignupOtpResult> {
    return this.api.post<SignupOtpResult>(AUTH_ENDPOINTS.AUTH.SIGNUP.SEND_OTP, { email });
  }

  async verifyOtp(email: string, code: string): Promise<SignupVerificationResult> {
    return this.api.post<SignupVerificationResult>(AUTH_ENDPOINTS.AUTH.SIGNUP.VERIFY_OTP, {
      email,
      code,
    });
  }

  async checkSubdomain(subdomain: string): Promise<SubdomainCheckResult> {
    const url = buildUrl(AUTH_ENDPOINTS.AUTH.SIGNUP.CHECK_SUBDOMAIN, { subdomain });
    return this.api.get<SubdomainCheckResult>(url);
  }

  async register(data: Record<string, unknown>): Promise<SignupResult> {
    return this.api.post<SignupResult>(AUTH_ENDPOINTS.AUTH.SIGNUP.REGISTER, data);
  }
}
