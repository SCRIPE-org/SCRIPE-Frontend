"use client";

import type { AdminSignupContent } from "../../domain/entities/SignupContent";
import type {
  ISignupContentRepository,
  UpdateWelcomeParams,
  CreateTrustMarkParams,
  UpdateTrustMarkParams,
  CreateCustomerLogoParams,
  UpdateCustomerLogoParams,
} from "../../domain/interfaces/ISignupContentRepository";
import type { ContentMode } from "../../domain/entities/SignupContent";
import type { SignupContentService } from "../services/SignupContentService";

export class SignupContentRepository implements ISignupContentRepository {
  constructor(private readonly service: SignupContentService) {}

  async getAdminContent(): Promise<AdminSignupContent> {
    const dto = await this.service.getAdminContent();
    return {
      contentMode: dto.contentMode,
      welcomeContent: dto.welcomeContent ?? null,
      trustMarks: dto.trustMarks,
      customerLogos: dto.customerLogos,
    };
  }

  async setMode(mode: ContentMode): Promise<void> {
    await this.service.setMode(mode);
  }

  async updateWelcome(data: UpdateWelcomeParams): Promise<void> {
    await this.service.updateWelcome(data);
  }

  async createTrustMark(data: CreateTrustMarkParams): Promise<string> {
    return this.service.createTrustMark(data);
  }

  async updateTrustMark(id: string, data: UpdateTrustMarkParams): Promise<void> {
    await this.service.updateTrustMark(id, data);
  }

  async deleteTrustMark(id: string): Promise<void> {
    await this.service.deleteTrustMark(id);
  }

  async reorderTrustMarks(orderedIds: string[]): Promise<void> {
    await this.service.reorderTrustMarks(orderedIds);
  }

  async createCustomerLogo(data: CreateCustomerLogoParams): Promise<string> {
    return this.service.createCustomerLogo(data);
  }

  async updateCustomerLogo(id: string, data: UpdateCustomerLogoParams): Promise<void> {
    await this.service.updateCustomerLogo(id, data);
  }

  async deleteCustomerLogo(id: string): Promise<void> {
    await this.service.deleteCustomerLogo(id);
  }

  async reorderCustomerLogos(orderedIds: string[]): Promise<void> {
    await this.service.reorderCustomerLogos(orderedIds);
  }
}
