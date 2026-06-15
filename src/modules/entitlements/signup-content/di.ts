import type { IApiService } from "@core/interfaces/api.interface";
import { SignupContentService } from "./src/data/services/SignupContentService";
import { SignupContentRepository } from "./src/data/repositories/SignupContentRepository";
import type { ISignupContentRepository } from "./src/domain/interfaces/ISignupContentRepository";

export function createSignupContentRepository(apiService: IApiService): ISignupContentRepository {
  return new SignupContentRepository(new SignupContentService(apiService));
}
