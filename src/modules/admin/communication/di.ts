/**
 * Communication Module DI Container
 *
 * Provides dependency injection for communication submodules:
 * Message Composer, Send (Notification Sender), Templates
 *
 * Backend API: Identity
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { EmailService } from "./message-composer/src/data/services/EmailService";
import { NotificationSenderService } from "./send/src/data/services/NotificationSenderService";
import { MessageTemplateService } from "./templates/src/data/services/MessageTemplateService";

// Repositories
import { EmailRepository } from "./message-composer/src/data/repositories/EmailRepository";
import { NotificationSenderRepository } from "./send/src/data/repositories/NotificationSenderRepository";
import { MessageTemplateRepository } from "./templates/src/data/repositories/MessageTemplateRepository";

// Interfaces
import type { IEmailRepository } from "./message-composer/src/domain/interfaces/IEmailRepository";
import type { INotificationSenderRepository } from "./send/src/domain/interfaces/INotificationSenderRepository";
import type { IMessageTemplateRepository } from "./templates/src/domain/interfaces/IMessageTemplateRepository";

export interface CommunicationContainer {
  emailRepository: IEmailRepository;
  notificationSenderRepository: INotificationSenderRepository;
  messageTemplateRepository: IMessageTemplateRepository;
}

let _container: CommunicationContainer | null = null;

/**
 * Get the communication container (lazy initialization)
 */
export function getCommunicationContainer(): CommunicationContainer {
  if (typeof window === "undefined") {
    const dummyProxy = new Proxy({} as any, {
      get() {
        return () => Promise.resolve({});
      },
    });
    return {
      emailRepository: dummyProxy,
      notificationSenderRepository: dummyProxy,
      messageTemplateRepository: dummyProxy,
    };
  }

  if (!_container) {
    const apiService = getModuleApiService("COMMUNICATION");

    _container = {
      emailRepository: new EmailRepository(new EmailService(apiService)),
      notificationSenderRepository: new NotificationSenderRepository(
        new NotificationSenderService(apiService)
      ),
      messageTemplateRepository: new MessageTemplateRepository(
        new MessageTemplateService(apiService)
      ),
    };
  }

  return _container;
}

/**
 * Communication container accessor (for use in components)
 */
export const communicationContainer = {
  get emailRepository() {
    return getCommunicationContainer().emailRepository;
  },
  get notificationSenderRepository() {
    return getCommunicationContainer().notificationSenderRepository;
  },
  get messageTemplateRepository() {
    return getCommunicationContainer().messageTemplateRepository;
  },
};
