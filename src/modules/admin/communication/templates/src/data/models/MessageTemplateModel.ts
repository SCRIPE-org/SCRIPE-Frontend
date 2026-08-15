/**
 * MessageTemplate API Model (DTO)
 *
 * JSON shapes matching the API contract.
 * Includes create/update typed DTOs (replacing Record<string, unknown>).
 */
export interface MessageTemplateJson {
  id: string;
  key: string;
  channel: string;
  subject: string | null;
  body: string;
  language: string;
  isActive: boolean;
  tenantId: string | null;
  description: string | null;
  placeholderSchema: string | null;
  designVariables: string | null;
  category: string | null;
  tags: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  version: number;
  createdAt: string;
  modifiedAt: string | null;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for message template list response.
 */
export interface MessageTemplateListResponse {
  items: MessageTemplateJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

// ===== Create/Update JSON DTOs =====

/**
 * Interface defining property specifications, keys types, and structural contract rules for create message template json.
 */
export interface CreateMessageTemplateJson {
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
 * Interface defining property specifications, keys types, and structural contract rules for update message template json.
 */
export interface UpdateMessageTemplateJson {
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
 * Interface defining property specifications, keys types, and structural contract rules for preview template json.
 */
export interface PreviewTemplateJson {
  subject?: string;
  body: string;
  sampleData?: Record<string, unknown>;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for preview template response json.
 */
export interface PreviewTemplateResponseJson {
  subject: string | null;
  body: string;
}
