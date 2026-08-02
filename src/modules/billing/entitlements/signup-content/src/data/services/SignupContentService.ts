"use client";

import type { IApiService } from "@core/interfaces/api.interface";
import type {
  UpdateWelcomeParams,
  CreateTrustMarkParams,
  UpdateTrustMarkParams,
  CreateCustomerLogoParams,
  UpdateCustomerLogoParams,
} from "../../domain/interfaces/ISignupContentRepository";
import type { ISignupContentService } from "../../domain/interfaces/ISignupContentService";
import type { ContentMode } from "../../domain/entities/SignupContent";
import { SIGNUP_CONTENT_ENDPOINTS } from "./signup-content.endpoints";

/**
 * Http API network service for signup content.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class SignupContentService implements ISignupContentService {
  constructor(private readonly api: IApiService) {}

  async getAdminContent(): Promise<unknown> {
    return this.api.get<unknown>(SIGNUP_CONTENT_ENDPOINTS.GET);
  }

  async setMode(mode: ContentMode): Promise<void> {
    await this.api.put(SIGNUP_CONTENT_ENDPOINTS.SET_MODE, { mode });
  }

  async updateWelcome(data: UpdateWelcomeParams): Promise<void> {
    await this.api.put(SIGNUP_CONTENT_ENDPOINTS.UPDATE_WELCOME, data);
  }

  async createTrustMark(data: CreateTrustMarkParams): Promise<string> {
    const result = await this.api.post<{ id: string }>(
      SIGNUP_CONTENT_ENDPOINTS.CREATE_TRUST_MARK,
      data
    );
    return result.id;
  }

  async updateTrustMark(id: string, data: UpdateTrustMarkParams): Promise<void> {
    await this.api.put(SIGNUP_CONTENT_ENDPOINTS.UPDATE_TRUST_MARK(id), data);
  }

  async deleteTrustMark(id: string): Promise<void> {
    await this.api.delete(SIGNUP_CONTENT_ENDPOINTS.DELETE_TRUST_MARK(id));
  }

  async reorderTrustMarks(orderedIds: string[]): Promise<void> {
    await this.api.put(SIGNUP_CONTENT_ENDPOINTS.REORDER_TRUST_MARKS, {
      orderedIds,
    });
  }

  async createCustomerLogo(data: CreateCustomerLogoParams): Promise<string> {
    const result = await this.api.post<{ id: string }>(
      SIGNUP_CONTENT_ENDPOINTS.CREATE_CUSTOMER_LOGO,
      data
    );
    return result.id;
  }

  async updateCustomerLogo(id: string, data: UpdateCustomerLogoParams): Promise<void> {
    await this.api.put(SIGNUP_CONTENT_ENDPOINTS.UPDATE_CUSTOMER_LOGO(id), data);
  }

  async deleteCustomerLogo(id: string): Promise<void> {
    await this.api.delete(SIGNUP_CONTENT_ENDPOINTS.DELETE_CUSTOMER_LOGO(id));
  }

  async reorderCustomerLogos(orderedIds: string[]): Promise<void> {
    await this.api.put(SIGNUP_CONTENT_ENDPOINTS.REORDER_CUSTOMER_LOGOS, {
      orderedIds,
    });
  }
}
