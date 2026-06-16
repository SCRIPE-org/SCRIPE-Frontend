import type { ContentMode } from "../../domain/entities/SignupContent";

export interface WelcomeContentModel {
  id: string;
  headlineEn: string;
  headlineAr: string;
  subcopyEn: string;
  subcopyAr: string;
  ctaLabelEn: string;
  ctaLabelAr: string;
  trustedByCount: number;
  trustedByLabelEn: string;
  trustedByLabelAr: string;
}

export interface TrustMarkModel {
  id: string;
  key: string;
  kind: string;
  labelEn: string;
  labelAr: string;
  iconKey: string | null;
  assetUrl: string | null;
  isRealData: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface CustomerLogoModel {
  id: string;
  key: string;
  name: string;
  assetUrl: string;
  isRealData: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminSignupContentModel {
  contentMode: ContentMode;
  welcomeContent: WelcomeContentModel | null;
  trustMarks: TrustMarkModel[];
  customerLogos: CustomerLogoModel[];
}
