import { V1 } from "@/core/config/api-endpoints/_shared";

export const MESSAGE_TEMPLATE_ENDPOINTS = {
  LIST: `${V1}/message-templates`,
  BY_ID: (id: string) => `${V1}/message-templates/${id}`,
  CREATE: `${V1}/message-templates`,
  UPDATE: (id: string) => `${V1}/message-templates/${id}`,
  DELETE: (id: string) => `${V1}/message-templates/${id}`,
  PREVIEW: `${V1}/message-templates/preview`,
  CLONE: (id: string) => `${V1}/message-templates/${id}/clone`,
  RESET_DESIGN: (id: string) => `${V1}/message-templates/${id}/reset-design`,
} as const;
