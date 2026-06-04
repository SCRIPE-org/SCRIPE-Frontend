import type {
  SignupOtpResult,
  SignupVerificationResult,
  SubdomainCheckResult,
  SignupResult,
  PublicEdition,
} from "../entities";

export interface ISignupRepository {
  getEditions(): Promise<PublicEdition[]>;
  sendOtp(email: string): Promise<SignupOtpResult>;
  verifyOtp(email: string, code: string): Promise<SignupVerificationResult>;
  checkSubdomain(subdomain: string): Promise<SubdomainCheckResult>;
  register(data: {
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
    username?: string;
    region?: string | null;
    defaultLocale?: string | null;
    timezone?: string | null;
  }): Promise<SignupResult>;
}
