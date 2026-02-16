import type { MessageTemplate, PlaceholderDefinition } from "../../domain/entities/MessageTemplate";
import type { MessageTemplateJson } from "../models/MessageTemplateModel";

export class MessageTemplateMapper {
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

            return {
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
            };
      }
}
