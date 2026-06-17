"use client";

export const CONTENT_MODES = ["Seeded", "Live"] as const;
export type ContentMode = (typeof CONTENT_MODES)[number];

export interface WelcomeContentData {
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

export class WelcomeContent {
  constructor(private readonly data: WelcomeContentData) {}

  get id() {
    return this.data.id;
  }
  get headlineEn() {
    return this.data.headlineEn;
  }
  get headlineAr() {
    return this.data.headlineAr;
  }
  get subcopyEn() {
    return this.data.subcopyEn;
  }
  get subcopyAr() {
    return this.data.subcopyAr;
  }
  get ctaLabelEn() {
    return this.data.ctaLabelEn;
  }
  get ctaLabelAr() {
    return this.data.ctaLabelAr;
  }
  get trustedByCount() {
    return this.data.trustedByCount;
  }
  get trustedByLabelEn() {
    return this.data.trustedByLabelEn;
  }
  get trustedByLabelAr() {
    return this.data.trustedByLabelAr;
  }

  copyWith(updates: Partial<WelcomeContentData>): WelcomeContent {
    return new WelcomeContent({ ...this.data, ...updates });
  }
}

export interface TrustMarkData {
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

export class TrustMark {
  constructor(private readonly data: TrustMarkData) {}

  get id() {
    return this.data.id;
  }
  get key() {
    return this.data.key;
  }
  get kind() {
    return this.data.kind;
  }
  get labelEn() {
    return this.data.labelEn;
  }
  get labelAr() {
    return this.data.labelAr;
  }
  get iconKey() {
    return this.data.iconKey;
  }
  get assetUrl() {
    return this.data.assetUrl;
  }
  get isRealData() {
    return this.data.isRealData;
  }
  get sortOrder() {
    return this.data.sortOrder;
  }
  get isActive() {
    return this.data.isActive;
  }

  copyWith(updates: Partial<TrustMarkData>): TrustMark {
    return new TrustMark({ ...this.data, ...updates });
  }
}

export interface CustomerLogoData {
  id: string;
  key: string;
  name: string;
  assetUrl: string;
  isRealData: boolean;
  sortOrder: number;
  isActive: boolean;
}

export class CustomerLogo {
  constructor(private readonly data: CustomerLogoData) {}

  get id() {
    return this.data.id;
  }
  get key() {
    return this.data.key;
  }
  get name() {
    return this.data.name;
  }
  get assetUrl() {
    return this.data.assetUrl;
  }
  get isRealData() {
    return this.data.isRealData;
  }
  get sortOrder() {
    return this.data.sortOrder;
  }
  get isActive() {
    return this.data.isActive;
  }

  copyWith(updates: Partial<CustomerLogoData>): CustomerLogo {
    return new CustomerLogo({ ...this.data, ...updates });
  }
}

export interface AdminSignupContentData {
  contentMode: ContentMode;
  welcomeContent: WelcomeContent | null;
  trustMarks: TrustMark[];
  customerLogos: CustomerLogo[];
}

export class AdminSignupContent {
  constructor(private readonly data: AdminSignupContentData) {}

  get contentMode() {
    return this.data.contentMode;
  }
  get welcomeContent() {
    return this.data.welcomeContent;
  }
  get trustMarks() {
    return this.data.trustMarks;
  }
  get customerLogos() {
    return this.data.customerLogos;
  }

  copyWith(updates: Partial<AdminSignupContentData>): AdminSignupContent {
    return new AdminSignupContent({ ...this.data, ...updates });
  }
}
