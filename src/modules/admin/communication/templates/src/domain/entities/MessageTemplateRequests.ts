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
  description?: string;
  placeholderSchema?: string;
  designVariables?: string;
  category?: string;
  tags?: string;
}

/**
 * Domain model representing a Update Message Template Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Preview Template Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface PreviewTemplateRequest {
  subject?: string;
  body: string;
  sampleData?: Record<string, unknown>;
}

/**
 * Domain model representing a Preview Template Response structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface PreviewTemplateResponse {
  subject: string | null;
  body: string;
}

/**
 * Domain model representing a Import Template Payload structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
