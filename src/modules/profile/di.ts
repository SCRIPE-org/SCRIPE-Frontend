/**
 * Profile Module DI Container
 *
 * Profile is part of the Identity backend module.
 * Uses NEXT_PUBLIC_IDENTITY_API_URL with fallback to NEXT_PUBLIC_API_URL.
 */
import { getModuleApiService } from "@core/services/api-factory";
import { ProfileRepository } from "./core/src/data/repositories/ProfileRepository";
import type { IProfileRepository } from "./core/src/domain/interfaces/IProfileRepository";

interface ProfileContainer {
  profileRepository: IProfileRepository;
}

let _instance: ProfileContainer | null = null;

function createContainer(): ProfileContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      profileRepository: dummyProxy,
    };
  }
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
