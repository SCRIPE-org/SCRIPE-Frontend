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
import { z } from "zod";
import { safeParseApiResponse, uuidField, optionalString } from "@core/common/zod-utils";

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const MessageTemplateJsonSchema = z.object({
  id: uuidField(),
  key: z.string().min(1),
  channel: z.string().min(1),
  subject: optionalString(),
  body: z.string().optional().nullable(),
  language: z.string().optional().default("en"),
  isActive: z.boolean().optional().default(true),
  tenantId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  placeholderSchema: z.string().optional().nullable(),
  designVariables: z.string().optional().nullable(),
  version: z.number().int().optional().default(1),
  createdAt: z.string().optional().nullable(),
  modifiedAt: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  usageCount: z.number().int().optional().default(0),
  lastUsedAt: z.string().optional().nullable(),
});

/**
 * Bidirectional data mapper orchestrating conversion between database DTO formats and frontend domain entities, enforcing null-safe defaults.
 */
export class MessageTemplateMapper {
  /**
   * Convert MessageTemplateJson → MessageTemplate Entity
   */
  static toEntity(json: MessageTemplateJson): MessageTemplate {
    const validated = safeParseApiResponse(MessageTemplateJsonSchema, json, "MessageTemplate");

    let placeholderSchema: PlaceholderDefinition[] = [];
    if (validated.placeholderSchema) {
      try {
        placeholderSchema = JSON.parse(validated.placeholderSchema);
      } catch {
        placeholderSchema = [];
      }
    }

    let designVariables: Record<string, string> | null = null;
    if (validated.designVariables) {
      try {
        designVariables = JSON.parse(validated.designVariables);
      } catch {
        designVariables = null;
      }
    }

    let tags: string[] | undefined;
    if (validated.tags) {
      try {
        tags = JSON.parse(validated.tags);
      } catch {
        tags = validated.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    const data: MessageTemplateData = {
      id: validated.id,
      key: validated.key,
      channel: validated.channel as MessageTemplate["channel"],
      subject: validated.subject ?? null,
      body: validated.body ?? "",
      language: validated.language ?? "en",
      isActive: validated.isActive ?? true,
      tenantId: validated.tenantId ?? null,
      description: validated.description ?? null,
      placeholderSchema,
      designVariables,
      version: validated.version ?? 1,
      createdAt: validated.createdAt ?? "",
      modifiedAt: validated.modifiedAt ?? null,
      category: validated.category as MessageTemplateData["category"],
      tags,
      usageCount: validated.usageCount ?? undefined,
      lastUsedAt: validated.lastUsedAt ?? undefined,
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
