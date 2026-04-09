/**
 * Messaging Module DI Container
 *
 * Provides dependency injection for messaging submodules:
 * Email Composer, Notification Sender, Message Templates, Webhooks
 *
 * Backend API: Identity
 */
import { getModuleApiService } from "@core/services/api-factory";

// Services
import { EmailService } from "./email-composer/src/data/services/EmailService";
import { NotificationSenderService } from "./notification-sender/src/data/services/NotificationSenderService";
import { MessageTemplateService } from "./message-templates/src/data/services/MessageTemplateService";
import { WebhookService } from "./webhooks/src/data/services/WebhookService";

// Repositories
import { EmailRepository } from "./email-composer/src/data/repositories/EmailRepository";
import { NotificationSenderRepository } from "./notification-sender/src/data/repositories/NotificationSenderRepository";
import { MessageTemplateRepository } from "./message-templates/src/data/repositories/MessageTemplateRepository";
import { WebhookRepository } from "./webhooks/src/data/repositories/WebhookRepository";

// Interfaces
import type { IEmailRepository } from "./email-composer/src/domain/interfaces/IEmailRepository";
import type { INotificationSenderRepository } from "./notification-sender/src/domain/interfaces/INotificationSenderRepository";
import type { IMessageTemplateRepository } from "./message-templates/src/domain/interfaces/IMessageTemplateRepository";
import type { IWebhookRepository } from "./webhooks/src/domain/interfaces/IWebhookRepository";

export interface MessagingContainer {
  emailRepository: IEmailRepository;
  notificationSenderRepository: INotificationSenderRepository;
  messageTemplateRepository: IMessageTemplateRepository;
  webhookRepository: IWebhookRepository;
}

let _container: MessagingContainer | null = null;

/**
 * Get the messaging container (lazy initialization)
 * Uses IDENTITY API service — messaging controllers live in the Identity backend
 */
export function getMessagingContainer(): MessagingContainer {
  if (!_container) {
    const apiService = getModuleApiService("IDENTITY");

    _container = {
      emailRepository: new EmailRepository(new EmailService(apiService)),
      notificationSenderRepository: new NotificationSenderRepository(new NotificationSenderService(apiService)),
      messageTemplateRepository: new MessageTemplateRepository(new MessageTemplateService(apiService)),
      webhookRepository: new WebhookRepository(new WebhookService(apiService)),
    };
  }

  return _container;
}

/**
 * Messaging container accessor (for use in components)
 */
export const messagingContainer = {
  get emailRepository() {
    return getMessagingContainer().emailRepository;
  },
  get notificationSenderRepository() {
    return getMessagingContainer().notificationSenderRepository;
  },
  get messageTemplateRepository() {
    return getMessagingContainer().messageTemplateRepository;
  },
  get webhookRepository() {
    return getMessagingContainer().webhookRepository;
  },
};
