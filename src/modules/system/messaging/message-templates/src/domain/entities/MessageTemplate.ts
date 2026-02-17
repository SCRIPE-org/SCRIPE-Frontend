/**
 * MessageTemplate entity
 */

export type TemplateCategory = "transactional" | "marketing" | "notification" | "onboarding" | "security" | "billing" | "custom";

export type PlaceholderType = "text" | "number" | "date" | "boolean" | "list" | "object";

export interface PlaceholderDefinition {
      key: string;
      type: PlaceholderType;
      required: boolean;
      sample: string;
}

export type MessageChannel = "Email" | "SMS" | "Push";

export interface MessageTemplate {
      id: string;
      key: string;
      channel: MessageChannel;
      subject: string | null;
      body: string;
      language: string;
      isActive: boolean;
      tenantId: string | null;
      description: string | null;
      placeholderSchema: PlaceholderDefinition[];
      designVariables: Record<string, string> | null;
      version: number;
      createdAt: string;
      modifiedAt: string | null;
      // New Phase 5 fields (optional for backwards compat)
      category?: TemplateCategory;
      tags?: string[];
      usageCount?: number;
      lastUsedAt?: string | null;
      metadata?: Record<string, unknown>;
}

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

export interface ExportedTemplate {
      key: string;
      channel: string;
      subject: string | null;
      body: string;
      language: string;
      description: string | null;
      placeholderSchema: PlaceholderDefinition[];
      designVariables: Record<string, string> | null;
      category?: TemplateCategory;
      tags?: string[];
      exportedAt: string;
      version: number;
}
