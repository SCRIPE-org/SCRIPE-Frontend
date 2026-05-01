/**
 * MessageTemplate Entity — Domain types for the message template module.
 *
 * Class with getters and domain logic.
 * Request payloads are in MessageTemplateRequests.ts.
 *
 * @module message-templates/domain
 */

export type TemplateCategory =
  | "transactional"
  | "marketing"
  | "notification"
  | "onboarding"
  | "security"
  | "billing"
  | "custom";

export type PlaceholderType = "text" | "number" | "date" | "boolean" | "list" | "object";

export interface PlaceholderDefinition {
  key: string;
  type: PlaceholderType;
  required: boolean;
  sample: string;
}

export type MessageChannel = "Email" | "SMS" | "Push";

// ─── Entity Data ────────────────────────────────────────────────

export interface MessageTemplateData {
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
  category?: TemplateCategory;
  tags?: string[];
  usageCount?: number;
  lastUsedAt?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Message Template Entity
 */
export class MessageTemplate {
  constructor(private readonly data: MessageTemplateData) {}

  get id(): string {
    return this.data.id;
  }
  get key(): string {
    return this.data.key;
  }
  get channel(): MessageChannel {
    return this.data.channel;
  }
  get subject(): string | null {
    return this.data.subject;
  }
  get body(): string {
    return this.data.body;
  }
  get language(): string {
    return this.data.language;
  }
  get isActive(): boolean {
    return this.data.isActive;
  }
  get tenantId(): string | null {
    return this.data.tenantId;
  }
  get description(): string | null {
    return this.data.description;
  }
  get placeholderSchema(): PlaceholderDefinition[] {
    return this.data.placeholderSchema;
  }
  get designVariables(): Record<string, string> | null {
    return this.data.designVariables;
  }
  get version(): number {
    return this.data.version;
  }
  get createdAt(): string {
    return this.data.createdAt;
  }
  get modifiedAt(): string | null {
    return this.data.modifiedAt;
  }
  get category(): TemplateCategory | undefined {
    return this.data.category;
  }
  get tags(): string[] | undefined {
    return this.data.tags;
  }
  get usageCount(): number | undefined {
    return this.data.usageCount;
  }
  get lastUsedAt(): string | null | undefined {
    return this.data.lastUsedAt;
  }
  get metadata(): Record<string, unknown> | undefined {
    return this.data.metadata;
  }

  // ===== Domain Logic =====

  /** Whether this template has placeholders */
  get hasPlaceholders(): boolean {
    return this.placeholderSchema.length > 0;
  }

  /** Whether this is an email template */
  get isEmail(): boolean {
    return this.channel === "Email";
  }

  /** Display name: key with language */
  get displayName(): string {
    return `${this.key} (${this.language})`;
  }
}

// ─── Exported Template (for import/export) ─────────────────────

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
