/**
 * Integrations Module DI Container
 *
 * Provides dependency injection for integrations submodules:
 * Webhooks, ApiKeys
 *
 * Backend API: Integrations
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { WebhookService } from "./webhooks/src/data/services/WebhookService";

// Repositories
import { WebhookRepository } from "./webhooks/src/data/repositories/WebhookRepository";

// Interfaces
import type { IWebhookRepository } from "./webhooks/src/domain/interfaces/IWebhookRepository";

export interface IntegrationsContainer {
  webhookRepository: IWebhookRepository;
}

let _container: IntegrationsContainer | null = null;

/**
 * Get the integrations container (lazy initialization)
 */
export function getIntegrationsContainer(): IntegrationsContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      webhookRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("INTEGRATIONS");

    _container = {
      webhookRepository: new WebhookRepository(new WebhookService(apiService)),
    };
  }

  return _container;
}

/**
 * Integrations container accessor (for use in components)
 */
export const integrationsContainer = {
  get webhookRepository() {
    return getIntegrationsContainer().webhookRepository;
  },
};
