import type {
  DataExchangeDescriptorResponseDto,
  DataExchangeEntityDescriptor,
  DataExchangeEntitySummaryDto,
} from "../../domain/types";

export type EntityTranslateFn = (
  key: string,
  params?: Record<string, string | number>
) => string;

/** Any dynamic backend descriptor or entity summary providing localized display names. */
export type EntityNameSource =
  | DataExchangeDescriptorResponseDto
  | DataExchangeEntityDescriptor
  | DataExchangeEntitySummaryDto
  | {
      displayNameEn?: string | null;
      displayNameAr?: string | null;
      descriptor?: {
        displayNameEn?: string | null;
        displayNameAr?: string | null;
      } | null;
    }
  | null
  | undefined;

const KNOWN_ENTITY_NAMES_EN: Record<string, string> = {
  "crm.lead": "CRM Leads",
  "crm.opportunity": "CRM Opportunities & Deals",
  "crm.account": "CRM Accounts",
  "crm.contact": "CRM Contacts",
  "crm.activity": "CRM Activities",
  "party.person": "Party Persons",
  "party.organization": "Party Organizations",
  "party.relationship": "Party Relationships",
  "party.contact-point": "Contact Points",
  "identity.user": "Identity Users",
  "identity.admin": "Platform Admins",
};

const KNOWN_ENTITY_NAMES_AR: Record<string, string> = {
  "crm.lead": "العملاء المحتملون (CRM)",
  "crm.opportunity": "الفرص والصفقات (CRM)",
  "crm.account": "حسابات الشركات (CRM)",
  "crm.contact": "جهات الاتصال (CRM)",
  "crm.activity": "الأنشطة والمهام (CRM)",
  "party.person": "الأفراد (سجل الأطراف)",
  "party.organization": "المؤسسات والمنظمات (سجل الأطراف)",
  "party.relationship": "العلاقات (سجل الأطراف)",
  "party.contact-point": "نقاط الاتصال",
  "identity.user": "مستخدمو الهوية",
  "identity.admin": "مسؤولو المنصة",
};

/**
 * Resolves a human-friendly localized entity name for Data Exchange UI, toasts, and summaries.
 * Accepts optional dynamic backend descriptor or entitySummary (displayNameEn/displayNameAr)
 * as the primary source of truth, falling back to t(...) keys and KNOWN_ENTITY_NAMES.
 * Supports both `(entityKey, descriptor/summary, isAr, t)` and `(entityKey, t, isAr, descriptor/summary)` signatures.
 */
export function getEntityDisplayName(
  entityKey: string,
  arg2?: EntityNameSource | EntityTranslateFn | null,
  arg3: boolean = false,
  arg4?: EntityTranslateFn | EntityNameSource | null
): string {
  if (!entityKey) return "";

  const tFn: EntityTranslateFn | undefined =
    typeof arg2 === "function"
      ? (arg2 as EntityTranslateFn)
      : typeof arg4 === "function"
        ? (arg4 as EntityTranslateFn)
        : undefined;

  const source: EntityNameSource =
    arg2 && typeof arg2 === "object"
      ? (arg2 as EntityNameSource)
      : arg4 && typeof arg4 === "object"
        ? (arg4 as EntityNameSource)
        : null;

  const isAr = Boolean(arg3);

  if (source && typeof source === "object") {
    let nameEn: string | null | undefined;
    let nameAr: string | null | undefined;

    if ("descriptor" in source && source.descriptor) {
      nameEn = source.descriptor.displayNameEn;
      nameAr = source.descriptor.displayNameAr;
    } else if ("displayNameEn" in source || "displayNameAr" in source) {
      nameEn = (source as { displayNameEn?: string | null }).displayNameEn;
      nameAr = (source as { displayNameAr?: string | null }).displayNameAr;
    }

    const dynamicName = isAr ? nameAr : nameEn;
    if (typeof dynamicName === "string" && dynamicName.trim().length > 0) {
      return dynamicName.trim();
    }
  }

  if (tFn) {
    const dottedKey = `dataExchange.entities.${entityKey}`;
    const dottedTranslated = tFn(dottedKey);
    if (dottedTranslated && dottedTranslated !== dottedKey) {
      return dottedTranslated;
    }
    const safeKey = entityKey.replace(/[^a-zA-Z0-9]/g, "_");
    const underscoreKey = `dataExchange.entities.${safeKey}`;
    const underscoreTranslated = tFn(underscoreKey);
    if (underscoreTranslated && underscoreTranslated !== underscoreKey) {
      return underscoreTranslated;
    }
  }

  const fallbackMap = isAr ? KNOWN_ENTITY_NAMES_AR : KNOWN_ENTITY_NAMES_EN;
  if (fallbackMap[entityKey]) {
    return fallbackMap[entityKey];
  }

  const parts = entityKey.split(".");
  const lastPart = parts[parts.length - 1] || entityKey;
  return lastPart
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Canonical alias for resolving entity display names. */
export const resolveEntityDisplayName = getEntityDisplayName;

/** Canonical alias for formatting entity labels. */
export const formatEntityLabel = getEntityDisplayName;

/** Canonical alias for formatting Data Exchange entity names. */
export const formatDataExchangeEntityName = getEntityDisplayName;
