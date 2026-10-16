/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Notification Bell — DI Container
 *
 * Wires the notification bell data layer:
 *   IApiService → NotificationBellService → NotificationBellRepository
 *
 * Since the notification bell is a cross-cutting core concern,
 * it lives in @core/notification/ and uses the IDENTITY module API.
 */
import { getModuleApiService } from "@core/services/api-factory";
import { NotificationBellService } from "./services/NotificationBellService";
import { NotificationBellRepository } from "./repositories/NotificationBellRepository";
import type { INotificationBellRepository } from "./interfaces/INotificationBellRepository";

export interface NotificationBellContainer {
  notificationBellRepository: INotificationBellRepository;
}

let _container: NotificationBellContainer | null = null;

export function getNotificationBellContainer(): NotificationBellContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      notificationBellRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");
    const service = new NotificationBellService(apiService);

    _container = {
      notificationBellRepository: new NotificationBellRepository(service),
    };
  }
  return _container;
}

/**
 * Lazy accessor for use in hooks / components.
 */
export const notificationBellContainer = {
  get notificationBellRepository() {
    return getNotificationBellContainer().notificationBellRepository;
  },
};
