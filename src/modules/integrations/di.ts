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
import { ApiKeyService } from "./apikeys/src/data/services/ApiKeyService";

// Repositories
import { WebhookRepository } from "./webhooks/src/data/repositories/WebhookRepository";
import { ApiKeyRepository } from "./apikeys/src/data/repositories/ApiKeyRepository";

// Interfaces
import type { IWebhookRepository } from "./webhooks/src/domain/interfaces/IWebhookRepository";
import type { IApiKeyRepository } from "./apikeys/src/domain/interfaces/IApiKeyRepository";

export interface IntegrationsContainer {
  webhookRepository: IWebhookRepository;
  apiKeyRepository: IApiKeyRepository;
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
      apiKeyRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("INTEGRATIONS");

    _container = {
      webhookRepository: new WebhookRepository(new WebhookService(apiService)),
      apiKeyRepository: new ApiKeyRepository(new ApiKeyService(apiService)),
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
  get apiKeyRepository() {
    return getIntegrationsContainer().apiKeyRepository;
  },
};
