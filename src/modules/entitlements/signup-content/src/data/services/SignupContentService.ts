"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  UpdateWelcomeParams,
  CreateTrustMarkParams,
  UpdateTrustMarkParams,
  CreateCustomerLogoParams,
  UpdateCustomerLogoParams,
} from "../../domain/interfaces/ISignupContentRepository";
import type { ISignupContentService } from "../../domain/interfaces/ISignupContentService";
import type { ContentMode } from "../../domain/entities/SignupContent";

export class SignupContentService implements ISignupContentService {
  constructor(private readonly api: IApiService) {}

  async getAdminContent(): Promise<unknown> {
    return this.api.get<unknown>(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.GET);
  }

  async setMode(mode: ContentMode): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.SET_MODE, { mode });
  }

  async updateWelcome(data: UpdateWelcomeParams): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.UPDATE_WELCOME, data);
  }

  async createTrustMark(data: CreateTrustMarkParams): Promise<string> {
    const result = await this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.CREATE_TRUST_MARK,
      data
    );
    return result.id;
  }

  async updateTrustMark(id: string, data: UpdateTrustMarkParams): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.UPDATE_TRUST_MARK(id), data);
  }

  async deleteTrustMark(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.DELETE_TRUST_MARK(id));
  }

  async reorderTrustMarks(orderedIds: string[]): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.REORDER_TRUST_MARKS, {
      orderedIds,
    });
  }

  async createCustomerLogo(data: CreateCustomerLogoParams): Promise<string> {
    const result = await this.api.post<{ id: string }>(
      API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.CREATE_CUSTOMER_LOGO,
      data
    );
    return result.id;
  }

  async updateCustomerLogo(id: string, data: UpdateCustomerLogoParams): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.UPDATE_CUSTOMER_LOGO(id), data);
  }

  async deleteCustomerLogo(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.DELETE_CUSTOMER_LOGO(id));
  }

  async reorderCustomerLogos(orderedIds: string[]): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.SIGNUP_CONTENT.REORDER_CUSTOMER_LOGOS, {
      orderedIds,
    });
  }
}
