/**
 * Profile Module DI Container
 *
 * Provides singleton instances of profile-related services.
 * Uses lazy initialization: repository is created on first access.
 */
import { getCoreContainer } from "@core/di";
import { ProfileRepository } from "./src/data/repositories/ProfileRepository";
import type { IProfileRepository } from "./src/domain/interfaces/IProfileRepository";

interface ProfileContainer {
  profileRepository: IProfileRepository;
}

let _instance: ProfileContainer | null = null;

function createContainer(): ProfileContainer {
  const profileRepository = new ProfileRepository(getCoreContainer().apiService);
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
