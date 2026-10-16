import { V1 } from "@/core/config/api-endpoints/_shared";

/**
 * Documentation for module export
 */
export const EMAIL_ENDPOINTS = {
  SEARCH_RECIPIENTS: `${V1}/emails/search-recipients`,
  SEND: `${V1}/emails/send`,
  SENT_HISTORY: `${V1}/emails/sent`,
  CANCEL: (id: string) => `${V1}/emails/${id}`,
  RESEND: (id: string) => `${V1}/emails/${id}/resend`,
  UPLOAD_ATTACHMENT: `${V1}/emails/upload-attachment`,
  MESSAGE_TEMPLATES_LIST: `${V1}/message-templates`,
} as const;
