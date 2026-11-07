import { V1 } from "@core/config/api-endpoints/_shared";
import type { SessionAction } from "../../domain/entities/TrainingSession";

const BASE = V1 + "/academy/sessions";

export const SESSIONS_ENDPOINTS = {
  LIST: BASE,
  BY_ID: (id: string) => BASE + "/" + encodeURIComponent(id),
  GROUP_CONTEXT: (id: string) => BASE + "/groups/" + encodeURIComponent(id) + "/context",
  TRANSITION: (id: string, action: SessionAction) => BASE + "/" + encodeURIComponent(id) + "/" + action,
} as const;
