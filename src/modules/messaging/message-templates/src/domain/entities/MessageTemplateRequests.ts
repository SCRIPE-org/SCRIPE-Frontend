/**
 * Message Template Request Payloads
 *
 * Domain-layer request types for message template mutation operations.
 * Separated from entity definitions per clean architecture rules.
 *
 * @module message-templates/domain
 */
import type { TemplateCategory } from "./MessageTemplate";

export interface CreateMessageTemplateRequest {
  key: string;
  channel: string;
  subject?: string;
  body: string;
  language: string;
  isActive: boolean;
  tenantId?: string;
  description?: string;
  placeholderSchema?: string;
  designVariables?: string;
  category?: string;
  tags?: string;
}

/**
 * Interface structure detailing the properties and attributes of Update Message Template Request.
 */
export interface UpdateMessageTemplateRequest {
  subject?: string;
  body: string;
  isActive: boolean;
  description?: string;
  placeholderSchema?: string;
  designVariables?: string;
  category?: string;
  tags?: string;
}

/**
 * Interface structure detailing the properties and attributes of Preview Template Request.
 */
export interface PreviewTemplateRequest {
  subject?: string;
  body: string;
  sampleData?: Record<string, unknown>;
}

/**
 * Interface structure detailing the properties and attributes of Preview Template Response.
 */
export interface PreviewTemplateResponse {
  subject: string | null;
  body: string;
}

/**
 * Interface structure detailing the properties and attributes of Import Template Payload.
 */
export interface ImportTemplatePayload {
  key: string;
  channel: string;
  subject?: string;
  body: string;
  language: string;
  isActive: boolean;
  description?: string;
  placeholderSchema?: string;
  designVariables?: string;
  category?: TemplateCategory;
  tags?: string[];
}
