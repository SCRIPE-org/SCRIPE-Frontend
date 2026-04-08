/**
 * MessageTemplate Mapper
 *
 * Converts between Models (DTOs) and Entities (Domain).
 * Handles JSON string parsing for placeholderSchema and designVariables.
 *
 * @module message-templates/data
 */
import {
      MessageTemplate,
      type PlaceholderDefinition,
      type MessageTemplateData,
} from "../../domain/entities/MessageTemplate";
import type {
      CreateMessageTemplateRequest,
      UpdateMessageTemplateRequest,
      PreviewTemplateRequest,
} from "../../domain/entities/MessageTemplateRequests";
import type {
      MessageTemplateJson,
      CreateMessageTemplateJson,
      UpdateMessageTemplateJson,
      PreviewTemplateJson,
} from "../models/MessageTemplateModel";

export class MessageTemplateMapper {
      /**
       * Convert MessageTemplateJson → MessageTemplate Entity
       */
      static toEntity(json: MessageTemplateJson): MessageTemplate {
            let placeholderSchema: PlaceholderDefinition[] = [];
            if (json.placeholderSchema) {
                  try {
                        placeholderSchema = JSON.parse(json.placeholderSchema);
                  } catch {
                        placeholderSchema = [];
                  }
            }

            let designVariables: Record<string, string> | null = null;
            if (json.designVariables) {
                  try {
                        designVariables = JSON.parse(json.designVariables);
                  } catch {
                        designVariables = null;
                  }
            }

            let tags: string[] | undefined;
            if (json.tags) {
                  try {
                        tags = JSON.parse(json.tags);
                  } catch {
                        tags = json.tags.split(",").map((t) => t.trim()).filter(Boolean);
                  }
            }

            const data: MessageTemplateData = {
                  id: json.id,
                  key: json.key,
                  channel: json.channel as MessageTemplate["channel"],
                  subject: json.subject,
                  body: json.body,
                  language: json.language,
                  isActive: json.isActive,
                  tenantId: json.tenantId,
                  description: json.description,
                  placeholderSchema,
                  designVariables,
                  version: json.version,
                  createdAt: json.createdAt,
                  modifiedAt: json.modifiedAt,
                  category: json.category as MessageTemplateData["category"],
                  tags,
                  usageCount: json.usageCount,
                  lastUsedAt: json.lastUsedAt,
            };
            return new MessageTemplate(data);
      }

      /**
       * Convert CreateMessageTemplateRequest → CreateMessageTemplateJson
       */
      static toCreateJson(request: CreateMessageTemplateRequest): CreateMessageTemplateJson {
            return {
                  key: request.key,
                  channel: request.channel,
                  subject: request.subject,
                  body: request.body,
                  language: request.language,
                  isActive: request.isActive,
                  tenantId: request.tenantId,
                  description: request.description,
                  placeholderSchema: request.placeholderSchema,
                  designVariables: request.designVariables,
                  category: request.category,
                  tags: request.tags,
            };
      }

      /**
       * Convert UpdateMessageTemplateRequest → UpdateMessageTemplateJson
       */
      static toUpdateJson(request: UpdateMessageTemplateRequest): UpdateMessageTemplateJson {
            return {
                  subject: request.subject,
                  body: request.body,
                  isActive: request.isActive,
                  description: request.description,
                  placeholderSchema: request.placeholderSchema,
                  designVariables: request.designVariables,
                  category: request.category,
                  tags: request.tags,
            };
      }

      /**
       * Convert PreviewTemplateRequest → PreviewTemplateJson
       */
      static toPreviewJson(request: PreviewTemplateRequest): PreviewTemplateJson {
            return {
                  subject: request.subject,
                  body: request.body,
                  sampleData: request.sampleData,
            };
      }
}
