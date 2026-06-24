"use client";

import type { AdminSignupContent, ContentMode } from "../entities/SignupContent";

/**
 * Interface structure detailing the properties and attributes of Update Welcome Params.
 */
export interface UpdateWelcomeParams {
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
 * Interface structure detailing the properties and attributes of Create Trust Mark Params.
 */
export interface CreateTrustMarkParams {
  key: string;
  kind: string;
  labelEn: string;
  labelAr: string;
  iconKey?: string;
  assetUrl?: string;
  isRealData: boolean;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Update Trust Mark Params.
 */
export interface UpdateTrustMarkParams {
  key?: string;
  kind?: string;
  labelEn?: string;
  labelAr?: string;
  iconKey?: string | null;
  assetUrl?: string | null;
  isRealData?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Create Customer Logo Params.
 */
export interface CreateCustomerLogoParams {
  key: string;
  name: string;
  assetUrl: string;
  isRealData: boolean;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Update Customer Logo Params.
 */
export interface UpdateCustomerLogoParams {
  key?: string;
  name?: string;
  assetUrl?: string;
  isRealData?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * Interface defining repository methods for managing SignupContent data access.
 */
export interface ISignupContentRepository {
  getAdminContent(): Promise<AdminSignupContent>;
  setMode(mode: ContentMode): Promise<void>;
  updateWelcome(data: UpdateWelcomeParams): Promise<void>;
  createTrustMark(data: CreateTrustMarkParams): Promise<string>;
  updateTrustMark(id: string, data: UpdateTrustMarkParams): Promise<void>;
  deleteTrustMark(id: string): Promise<void>;
  reorderTrustMarks(orderedIds: string[]): Promise<void>;
  createCustomerLogo(data: CreateCustomerLogoParams): Promise<string>;
  updateCustomerLogo(id: string, data: UpdateCustomerLogoParams): Promise<void>;
  deleteCustomerLogo(id: string): Promise<void>;
  reorderCustomerLogos(orderedIds: string[]): Promise<void>;
}
