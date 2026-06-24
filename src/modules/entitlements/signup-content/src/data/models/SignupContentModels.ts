import type { ContentMode } from "../../domain/entities/SignupContent";

/**
 * Interface defining property specifications, keys types, and structural contract rules for welcome content model.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for trust mark model.
 */
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

/**
 * Interface defining property specifications, keys types, and structural contract rules for customer logo model.
 */
export interface CustomerLogoModel {
  id: string;
  key: string;
  name: string;
  assetUrl: string;
  isRealData: boolean;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for admin signup content model.
 */
export interface AdminSignupContentModel {
  contentMode: ContentMode;
  welcomeContent: WelcomeContentModel | null;
  trustMarks: TrustMarkModel[];
  customerLogos: CustomerLogoModel[];
}
