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
import { ApiKeyDetailService } from "./apikeys/src/data/services/ApiKeyDetailService";

// Repositories
import { WebhookRepository } from "./webhooks/src/data/repositories/WebhookRepository";
import { ApiKeyRepository } from "./apikeys/src/data/repositories/ApiKeyRepository";
import { ApiKeyDetailRepository } from "./apikeys/src/data/repositories/ApiKeyDetailRepository";

// Interfaces
import type { IWebhookRepository } from "./webhooks/src/domain/interfaces/IWebhookRepository";
import type { IApiKeyRepository } from "./apikeys/src/domain/interfaces/IApiKeyRepository";

export interface IntegrationsContainer {
  webhookRepository: IWebhookRepository;
  apiKeyRepository: IApiKeyRepository;
  apiKeyDetailRepository: ApiKeyDetailRepository;
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
      apiKeyDetailRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("INTEGRATIONS");

    _container = {
      webhookRepository: new WebhookRepository(new WebhookService(apiService)),
      apiKeyRepository: new ApiKeyRepository(new ApiKeyService(apiService)),
      apiKeyDetailRepository: new ApiKeyDetailRepository(new ApiKeyDetailService(apiService)),
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
  get apiKeyDetailRepository() {
    return getIntegrationsContainer().apiKeyDetailRepository;
  },
};
