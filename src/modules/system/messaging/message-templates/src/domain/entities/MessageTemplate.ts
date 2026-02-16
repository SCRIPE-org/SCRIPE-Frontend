/**
 * MessageTemplate entity
 */

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
}

export interface UpdateMessageTemplateRequest {
      subject?: string;
      body: string;
      isActive: boolean;
      description?: string;
      placeholderSchema?: string;
      designVariables?: string;
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
