/**
 * Email Mapper
 *
 * Converts between Email Models (DTOs) and Entities (Domain).
 * Repository uses this to transform service responses.
 *
 * @module email-composer/data
 */
import {
  EmailRecipient,
  SentEmail,
  EmailTemplate,
  type EmailRecipientData,
  type SentEmailData,
  type EmailTemplateData,
} from "../../domain/entities/Email";
import type { EmailRecipientJson, SentEmailJson, EmailTemplateJson } from "../models/EmailModel";

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class EmailMapper {
  /**
   * Convert EmailRecipientJson → EmailRecipient Entity
   */
  static toRecipientEntity(json: EmailRecipientJson): EmailRecipient {
    const rawType = (json.type ?? "").toLowerCase();
    const normalizedType: EmailRecipientData["type"] =
      rawType === "admin" ? "admin" : rawType === "user" ? "user" : "custom";
    const email = (json.email ?? "").trim();
    const name = (json.name || json.username || email).trim();
    const data: EmailRecipientData = {
      id: json.id,
      email,
      name,
      type: normalizedType,
    };
    return new EmailRecipient(data);
  }

  /**
   * Convert SentEmailJson → SentEmail Entity
   */
  static toSentEmailEntity(json: SentEmailJson): SentEmail {
    const data: SentEmailData = {
      id: json.id,
      to: json.to,
      subject: json.subject,
      body: json.body,
      status: json.status,
      createdAt: json.createdAt,
      sentAt: json.sentAt,
      scheduledAt: json.scheduledAt,
      errorMessage: json.errorMessage,
      sentByAdminId: json.sentByAdminId,
      templateKey: json.templateKey,
      recipientType: json.recipientType,
      recipientId: json.recipientId,
      cc: json.cc,
      bcc: json.bcc,
      retryCount: json.retryCount,
      attachments: json.attachments,
    };
    return new SentEmail(data);
  }

  /**
   * Convert EmailTemplateJson → EmailTemplate Entity
   */
  static toTemplateEntity(json: EmailTemplateJson): EmailTemplate {
    const data: EmailTemplateData = {
      id: json.id,
      key: json.key,
      channel: json.channel,
      language: json.language,
      subject: json.subject,
      body: json.body,
      isActive: json.isActive,
      description: json.description,
      placeholderSchema: json.placeholderSchema,
      designVariables: json.designVariables,
      category: json.category,
      tags: json.tags,
      usageCount: json.usageCount,
      lastUsedAt: json.lastUsedAt,
    };
    return new EmailTemplate(data);
  }
}
