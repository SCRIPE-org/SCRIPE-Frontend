import { getModuleApiService } from "@core/services/api-factory";
import { HubActivityService } from "./hub/src/data/services/HubActivityService";
import { HubActivityRepository } from "./hub/src/data/repositories/HubActivityRepository";
import type { IHubActivityRepository } from "./hub/src/domain/interfaces/IHubActivityRepository";

export interface HomeContainer {
  hubActivityRepository: IHubActivityRepository;
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
      hubActivityRepository: dummyProxy,
    };
  }

  const apiService = getModuleApiService("IDENTITY");
  const activityService = new HubActivityService(apiService);

  _container = {
    hubActivityRepository: new HubActivityRepository(activityService),
  };

  return _container;
}

export const homeContainer = {
  get hubActivityRepository() {
    return getHomeContainer().hubActivityRepository;
  },
};
