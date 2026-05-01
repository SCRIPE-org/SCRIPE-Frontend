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

export interface PreviewTemplateRequest {
  subject?: string;
  body: string;
  sampleData?: Record<string, unknown>;
}

export interface PreviewTemplateResponse {
  subject: string | null;
  body: string;
}

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
