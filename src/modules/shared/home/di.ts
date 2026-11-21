/* eslint-disable @typescript-eslint/no-explicit-any */
import { getModuleApiService } from "@core/services/api-factory";
import { HubPersonalFeedService } from "./hub/src/data/services/HubPersonalFeedService";
import { HubPersonalFeedRepository } from "./hub/src/data/repositories/HubPersonalFeedRepository";
import type { IHubPersonalFeedRepository } from "./hub/src/domain/interfaces/IHubPersonalFeedRepository";

export interface HomeContainer {
  hubPersonalFeedRepository: IHubPersonalFeedRepository;
}

let _container: HomeContainer | null = null;

function getHomeContainer(): HomeContainer {
  if (_container) return _container;

  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      hubPersonalFeedRepository: dummyProxy,
    };
  }

  const apiService = getModuleApiService("IDENTITY");
  const personalFeedService = new HubPersonalFeedService(apiService);

  _container = {
    hubPersonalFeedRepository: new HubPersonalFeedRepository(personalFeedService),
  };

  return _container;
}

export const homeContainer = {
  get hubPersonalFeedRepository() {
    return getHomeContainer().hubPersonalFeedRepository;
  },
};
