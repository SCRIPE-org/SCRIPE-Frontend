/**
 * Template Form Types and Utilities
 *
 * Types, entity keys, defaults, and parsing utilities for the message template editor form.
 */
import type { MessageChannel, TemplateCategory } from "../../domain/entities/MessageTemplate";
import type { PlaceholderField } from "../components/PlaceholderSchemaBuilder";
import type { DesignVariables } from "../components/DesignVariablesPanel";
import { DEFAULT_DESIGN } from "../components/DesignVariablesPanel";

/**
 * Registered entity type key in the backend's CommunicationEntityTypeCatalog.
 * Used for binding custom fields to message templates.
 */
export const MESSAGE_TEMPLATE_ENTITY_TYPE_KEY = "communication.message-template";

/** Operating mode for the template form (creating new vs editing existing). */
export type TemplateFormMode = "create" | "edit";

/**
 * Form state model capturing all editable attributes of a message template.
 */
export interface TemplateFormValues {
  /** System-unique template identifier key (e.g., "auth.welcome_email"). */
  key: string;
  /** Primary delivery channel (Email, SMS, Push). */
  channel: MessageChannel;
  /** Target BCP-47 language code (e.g., "en", "ar"). */
  language: string;
  /** Email subject line or notification title. */
  subject: string;
  /** Main message body template markup. */
  body: string;
  /** Internal operator notes describing purpose. */
  description: string;
  /** Whether this template is active for delivery. */
  isActive: boolean;
  /** Business categorization. */
  category: TemplateCategory | "";
  /** Schema list of dynamic placeholders available for interpolation. */
  placeholderSchema: PlaceholderField[];
  /** Design variables configuring layout, fonts, colors, and branding elements. */
  designVariables: DesignVariables;
}

/**
 * Merges current design variables with raw persisted design variables for saving.
 * Only writes back the keys the record already had plus the ones modified during this session.
 *
 * @param current - Current in-memory design variables state.
 * @param originalRaw - Raw un-backfilled design object from the backend, or null for new records.
 * @param initial - Fully-defaulted design object loaded when editing began.
 * @returns Partial or complete design object suitable for persistence.
 */
export function mergeDesignForSave(
  current: DesignVariables,
  originalRaw: Partial<DesignVariables> | null,
  initial: DesignVariables | null
): DesignVariables | Partial<DesignVariables> {
  if (originalRaw === null) return current;
  const merged: Partial<DesignVariables> = { ...originalRaw };
  (Object.keys(current) as (keyof DesignVariables)[]).forEach((key) => {
    if (!initial || current[key] !== initial[key]) {
      merged[key] = current[key];
    }
  });
  return merged;
}

/**
 * Parses and sanitizes a raw placeholder schema payload from JSON or object formats.
 *
 * @param raw - The raw schema data received from the backend entity.
 * @returns An array of normalized placeholder fields with guaranteed unique IDs.
 */
export function parseTemplateSchema(raw: unknown): PlaceholderField[] {
  let parsedSchema: PlaceholderField[] = [];
  if (raw) {
    try {
      if (typeof raw === "string") {
        parsedSchema = JSON.parse(raw);
      } else if (Array.isArray(raw)) {
        parsedSchema = raw as unknown as PlaceholderField[];
      }
    } catch {
      parsedSchema = [];
    }
  }
  return parsedSchema.map((f, i) => ({
    ...f,
    id: f.id || `ph-${i}`,
  }));
}

/**
 * Parses raw design variables, returning both the defaulted working copy and the raw stored subset.
 *
 * @param raw - The raw design variables received from the backend entity.
 * @returns Object containing the merged form design and the raw stored subset.
 */
export function parseTemplateDesign(raw: unknown): {
  parsedDesign: DesignVariables;
  rawDesign: Partial<DesignVariables>;
} {
  let parsedDesign: DesignVariables = { ...DEFAULT_DESIGN };
  let rawDesign: Partial<DesignVariables> = {};
  if (raw) {
    try {
      if (typeof raw === "string") {
        rawDesign = JSON.parse(raw);
      } else if (typeof raw === "object") {
        rawDesign = raw as unknown as Partial<DesignVariables>;
      }
      parsedDesign = { ...DEFAULT_DESIGN, ...rawDesign };
    } catch {
      parsedDesign = { ...DEFAULT_DESIGN };
      rawDesign = {};
    }
  }
  return { parsedDesign, rawDesign };
}

/** Predefined selection options for template communication channels. */
export const TEMPLATE_CHANNEL_OPTIONS = [
  { value: "Email", label: "Email" },
  { value: "SMS", label: "SMS" },
  { value: "Push", label: "Push" },
] as const;

/** Predefined selection options for template localization languages. */
export const TEMPLATE_LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
] as const;

/** Predefined selection options for template business categories. */
export const TEMPLATE_CATEGORY_OPTIONS = [
  { value: "transactional", label: "Transactional" },
  { value: "marketing", label: "Marketing" },
  { value: "notification", label: "Notification" },
  { value: "onboarding", label: "Onboarding" },
  { value: "security", label: "Security" },
  { value: "billing", label: "Billing" },
  { value: "custom", label: "Custom" },
] as const;
