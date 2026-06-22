import { V1 } from "./_shared";

export const MESSAGING_ENDPOINTS = {
  MESSAGE_TEMPLATES: {
    LIST: `${V1}/message-templates`,
    BY_ID: (id: string) => `${V1}/message-templates/${id}`,
    CREATE: `${V1}/message-templates`,
    UPDATE: (id: string) => `${V1}/message-templates/${id}`,
    DELETE: (id: string) => `${V1}/message-templates/${id}`,
    PREVIEW: `${V1}/message-templates/preview`,
    CLONE: (id: string) => `${V1}/message-templates/${id}/clone`,
  },

  EMAILS: {
    SEND: `${V1}/emails/send`,
    SEND_BULK: `${V1}/emails/send-bulk`,
    SEARCH_RECIPIENTS: `${V1}/emails/search-recipients`,
    SENT_HISTORY: `${V1}/emails/sent`,
    STATISTICS: `${V1}/emails/statistics`,
    CANCEL: (id: string) => `${V1}/emails/${id}`,
    RESEND: (id: string) => `${V1}/emails/${id}/resend`,
    TEMPLATES_LIST: `${V1}/emails/templates`,
    UPLOAD_ATTACHMENT: `${V1}/emails/upload-attachment`,
  },

  NOTIFICATIONS: {
    LIST: `${V1}/Notifications`,
    UNREAD_COUNT: `${V1}/Notifications/unread-count`,
    MARK_READ: (id: string) => `${V1}/Notifications/${id}/read`,
    MARK_ALL_READ: `${V1}/Notifications/read-all`,
    DELETE: (id: string) => `${V1}/Notifications/${id}`,
    PREFERENCES: `${V1}/Notifications/preferences`,
  },

  NOTIFICATIONS_SENDER: {
    SEARCH_TARGETS: `${V1}/Notifications/search-targets`,
    SEND: `${V1}/Notifications/send`,
  },
};
