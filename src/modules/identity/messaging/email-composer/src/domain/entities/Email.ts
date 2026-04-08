/**
 * Email Composer Entities — Domain types for the email management module.
 *
 * Classes with getters and domain logic.
 * Request payloads are in EmailRequests.ts.
 *
 * @module email-composer/domain
 */

// ─── Email Recipient ───────────────────────────────────────────

export interface EmailRecipientData {
      id: string;
      email: string;
      name: string;
      type: "admin" | "user" | "custom";
}

/**
 * Email Recipient Entity
 */
export class EmailRecipient {
      constructor(private readonly data: EmailRecipientData) { }

      get id(): string { return this.data.id; }
      get email(): string { return this.data.email; }
      get name(): string { return this.data.name; }
      get type(): "admin" | "user" | "custom" { return this.data.type; }

      /** Display label: name with email */
      get displayLabel(): string {
            return this.name ? `${this.name} <${this.email}>` : this.email;
      }
}

// ─── Sent Email ────────────────────────────────────────────────

export type SentEmailStatus = "Sent" | "Failed" | "Pending" | "Cancelled";

export interface SentEmailData {
      id: string;
      to: string;
      subject: string;
      body: string;
      status: SentEmailStatus;
      createdAt: string;
      sentAt: string | null;
      scheduledAt: string;
      errorMessage: string | null;
      sentByAdminId: string;
      templateKey: string | null;
      recipientType: string;
      recipientId: string | null;
      cc: string | null;
      bcc: string | null;
      retryCount: number;
      attachments: string | null;
}

/**
 * Sent Email Entity
 */
export class SentEmail {
      constructor(private readonly data: SentEmailData) { }

      get id(): string { return this.data.id; }
      get to(): string { return this.data.to; }
      get subject(): string { return this.data.subject; }
      get body(): string { return this.data.body; }
      get status(): SentEmailStatus { return this.data.status; }
      get createdAt(): string { return this.data.createdAt; }
      get sentAt(): string | null { return this.data.sentAt; }
      get scheduledAt(): string { return this.data.scheduledAt; }
      get errorMessage(): string | null { return this.data.errorMessage; }
      get sentByAdminId(): string { return this.data.sentByAdminId; }
      get templateKey(): string | null { return this.data.templateKey; }
      get recipientType(): string { return this.data.recipientType; }
      get recipientId(): string | null { return this.data.recipientId; }
      get cc(): string | null { return this.data.cc; }
      get bcc(): string | null { return this.data.bcc; }
      get retryCount(): number { return this.data.retryCount; }
      get attachments(): string | null { return this.data.attachments; }

      // ===== Domain Logic =====

      get isPending(): boolean { return this.status === "Pending"; }
      get isSent(): boolean { return this.status === "Sent"; }
      get isFailed(): boolean { return this.status === "Failed"; }
      get isCancelled(): boolean { return this.status === "Cancelled"; }

      /** Can cancel only if pending */
      get canCancel(): boolean { return this.isPending; }

      /** Can resend if failed */
      get canResend(): boolean { return this.isFailed; }

      /** Parse attachment URLs from comma-separated string */
      get attachmentList(): string[] {
            return this.attachments ? this.attachments.split(",").map(s => s.trim()).filter(Boolean) : [];
      }

      /** Parse CC addresses from comma-separated string */
      get ccList(): string[] {
            return this.cc ? this.cc.split(",").map(s => s.trim()).filter(Boolean) : [];
      }

      /** Parse BCC addresses from comma-separated string */
      get bccList(): string[] {
            return this.bcc ? this.bcc.split(",").map(s => s.trim()).filter(Boolean) : [];
      }
}

// ─── Email Template ────────────────────────────────────────────

export interface EmailTemplateData {
      id: string;
      key: string;
      channel: string;
      language: string;
      subject: string | null;
      body: string;
      isActive: boolean;
      description: string | null;
      placeholderSchema: string | null;
      designVariables: string | null;
      category: string | null;
      tags: string | null;
      usageCount: number;
      lastUsedAt: string | null;
}

/**
 * Email Template Entity (lightweight for picker)
 */
export class EmailTemplate {
      constructor(private readonly data: EmailTemplateData) { }

      get id(): string { return this.data.id; }
      get key(): string { return this.data.key; }
      get channel(): string { return this.data.channel; }
      get language(): string { return this.data.language; }
      get subject(): string | null { return this.data.subject; }
      get body(): string { return this.data.body; }
      get isActive(): boolean { return this.data.isActive; }
      get description(): string | null { return this.data.description; }
      get placeholderSchema(): string | null { return this.data.placeholderSchema; }
      get designVariables(): string | null { return this.data.designVariables; }
      get category(): string | null { return this.data.category; }
      get tags(): string | null { return this.data.tags; }
      get usageCount(): number { return this.data.usageCount; }
      get lastUsedAt(): string | null { return this.data.lastUsedAt; }
}

// ─── List Response ─────────────────────────────────────────────

export interface EmailTemplateListResponse {
      items: EmailTemplate[];
      totalCount: number;
}
