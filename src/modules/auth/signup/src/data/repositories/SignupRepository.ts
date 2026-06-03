import type { ISignupRepository } from "../../domain/interfaces/ISignupRepository";
import type { SignupService } from "../services/SignupService";
import type {
  SignupOtpResult,
  SignupVerificationResult,
  SubdomainCheckResult,
  SignupResult,
  PublicEdition,
} from "../../domain/entities";

export class SignupRepository implements ISignupRepository {
  constructor(private readonly service: SignupService) {}

  async getEditions(): Promise<PublicEdition[]> {
    return this.service.getEditions();
  }
  async sendOtp(email: string): Promise<SignupOtpResult> {
    return this.service.sendOtp(email);
  }

  async verifyOtp(email: string, code: string): Promise<SignupVerificationResult> {
    return this.service.verifyOtp(email, code);
  }

  async checkSubdomain(subdomain: string): Promise<SubdomainCheckResult> {
    return this.service.checkSubdomain(subdomain);
  }

  async register(data: {
    editionId?: string | null;
    billingCycle?: string | null;
    currency?: string | null;
    promoCode?: string | null;
    fullName: string;
    email: string;
    password: string;
    acceptTerms: boolean;
    marketingOptIn: boolean;
    emailVerificationToken: string;
    workspaceName: string;
    subdomain: string;
    region?: string | null;
    defaultLocale?: string | null;
    timezone?: string | null;
  }): Promise<SignupResult> {
    return this.service.register(data);
  }
}
