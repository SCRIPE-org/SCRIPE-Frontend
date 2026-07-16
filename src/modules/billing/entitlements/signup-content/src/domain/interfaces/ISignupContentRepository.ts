"use client";

import type { AdminSignupContent, ContentMode } from "../entities/SignupContent";

/**
 * Interface defining property specifications, keys types, and structural contract rules for update welcome params.
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
 * Interface defining property specifications, keys types, and structural contract rules for create trust mark params.
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
 * Interface defining property specifications, keys types, and structural contract rules for update trust mark params.
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
 * Interface defining property specifications, keys types, and structural contract rules for create customer logo params.
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
 * Interface defining property specifications, keys types, and structural contract rules for update customer logo params.
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
 * Repository layer implementing client request queries for i signup content.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
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
