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
 * Interface structure detailing the properties and attributes of Message Template List Response.
 */
export interface MessageTemplateListResponse {
  items: MessageTemplateJson[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ===== Create/Update JSON DTOs =====

/**
 * Interface structure detailing the properties and attributes of Create Message Template Json.
 */
export interface CreateMessageTemplateJson {
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
 * Interface structure detailing the properties and attributes of Update Message Template Json.
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
 * Interface structure detailing the properties and attributes of Preview Template Json.
 */
export interface PreviewTemplateJson {
  subject?: string;
  body: string;
  sampleData?: Record<string, unknown>;
}

/**
 * Interface structure detailing the properties and attributes of Preview Template Response Json.
 */
export interface PreviewTemplateResponseJson {
  subject: string | null;
  body: string;
}
