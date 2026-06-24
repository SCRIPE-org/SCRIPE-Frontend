import type { ContentMode } from "../../domain/entities/SignupContent";

/**
 * Interface structure detailing the properties and attributes of Welcome Content Model.
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
 * Interface structure detailing the properties and attributes of Trust Mark Model.
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
 * Interface structure detailing the properties and attributes of Customer Logo Model.
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
 * Interface structure detailing the properties and attributes of Admin Signup Content Model.
 */
export interface AdminSignupContentModel {
  contentMode: ContentMode;
  welcomeContent: WelcomeContentModel | null;
  trustMarks: TrustMarkModel[];
  customerLogos: CustomerLogoModel[];
}
