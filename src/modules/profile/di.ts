/**
 * Profile Module DI Container
 *
 * Profile is part of the Identity backend module.
 * Uses NEXT_PUBLIC_IDENTITY_API_URL with fallback to NEXT_PUBLIC_API_URL.
 */
import { getModuleApiService } from "@core/services/api-factory";
import { ProfileRepository } from "./src/data/repositories/ProfileRepository";
import type { IProfileRepository } from "./src/domain/interfaces/IProfileRepository";

interface ProfileContainer {
  profileRepository: IProfileRepository;
}

let _instance: ProfileContainer | null = null;

function createContainer(): ProfileContainer {
  const profileRepository = new ProfileRepository(getModuleApiService("IDENTITY"));
  return { profileRepository };
}

export const container: ProfileContainer = new Proxy({} as ProfileContainer, {
  get(_target, prop: keyof ProfileContainer) {
    if (!_instance) {
      _instance = createContainer();
    }
    return _instance[prop];
  },
});
