/**
 * Email Composer entities
 */

export interface EmailRecipient {
      id: string;
      email: string;
      name: string;
      type: "admin" | "user";
}

export interface SendEmailRequest {
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
      templateKey?: string;
      templatePlaceholders?: Record<string, unknown>;
}

export interface SentEmail {
      id: string;
      to: string;
      subject: string;
      body: string;
      sentAt: string;
      status: "sent" | "failed" | "pending";
      errorMessage: string | null;
}
