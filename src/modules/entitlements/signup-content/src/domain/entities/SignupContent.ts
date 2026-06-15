"use client";

export const CONTENT_MODES = ["Seeded", "Live"] as const;
export type ContentMode = (typeof CONTENT_MODES)[number];

export interface WelcomeContent {
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

export interface TrustMark {
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

export interface CustomerLogo {
  id: string;
  key: string;
  name: string;
  assetUrl: string;
  isRealData: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface AdminSignupContent {
  contentMode: ContentMode;
  welcomeContent: WelcomeContent | null;
  trustMarks: TrustMark[];
  customerLogos: CustomerLogo[];
}
