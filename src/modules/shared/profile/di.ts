/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Profile Module DI Container
 *
 * Profile is part of the Identity backend module.
 * Uses NEXT_PUBLIC_IDENTITY_API_URL with fallback to NEXT_PUBLIC_API_URL.
 */
import { getModuleApiService } from "@core/services/api-factory";
import { ProfileRepository } from "./core/src/data/repositories/ProfileRepository";
import { SecurityRepository } from "./core/src/data/repositories/SecurityRepository";
import { SovereignAccountRepository } from "./core/src/data/repositories/SovereignAccountRepository";
import type { IProfileRepository } from "./core/src/domain/interfaces/IProfileRepository";
import type { ISecurityRepository } from "./core/src/domain/interfaces/ISecurityRepository";
import type { ISovereignAccountRepository } from "./core/src/domain/interfaces/ISovereignAccountRepository";

interface ProfileContainer {
  profileRepository: IProfileRepository;
  securityRepository: ISecurityRepository;
  sovereignAccountRepository: ISovereignAccountRepository;
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
      securityRepository: dummyProxy,
      sovereignAccountRepository: dummyProxy,
    };
  }
  const api = getModuleApiService("IDENTITY");
  const profileRepository = new ProfileRepository(api);
  const securityRepository = new SecurityRepository(api);
  const sovereignAccountRepository = new SovereignAccountRepository(api);
  return { profileRepository, securityRepository, sovereignAccountRepository };
}

export const container: ProfileContainer = new Proxy({} as ProfileContainer, {
  get(_target, prop: keyof ProfileContainer) {
    if (!_instance) {
      _instance = createContainer();
    }
    return _instance[prop];
  },
});
