import type { ContentMode } from "../entities/SignupContent";
import type {
  CreateCustomerLogoParams,
  CreateTrustMarkParams,
  UpdateCustomerLogoParams,
  UpdateTrustMarkParams,
  UpdateWelcomeParams,
} from "./ISignupContentRepository";

export interface ISignupContentService {
  getAdminContent(): Promise<unknown>;
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
