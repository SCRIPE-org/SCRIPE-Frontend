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
      entityKey?: string | null;
      displayNameEn?: string | null;
      displayNameAr?: string | null;
      descriptor?: {
        entityKey?: string | null;
        displayNameEn?: string | null;
        displayNameAr?: string | null;
      } | null;
    }
  | null
  | undefined;

export interface CachedEntityName {
  displayNameEn: string;
  displayNameAr: string;
}

const entityDisplayNameRegistry = new Map<string, CachedEntityName>();

/** Registers a single entity's localized display names in the runtime catalog cache. */
export function registerEntityDisplayName(
  entityKeyOrSource: string | EntityNameSource,
  displayNameEn?: string | null,
  displayNameAr?: string | null
): void {
  if (!entityKeyOrSource) return;

  if (typeof entityKeyOrSource === "string") {
    const key = entityKeyOrSource.trim().toLowerCase();
    if (!key) return;
    entityDisplayNameRegistry.set(key, {
      displayNameEn: displayNameEn?.trim() || key,
      displayNameAr: displayNameAr?.trim() || displayNameEn?.trim() || key,
    });
    return;
  }

  const rawObj = entityKeyOrSource as Record<string, unknown>;
  const descriptorObj =
    rawObj.descriptor && typeof rawObj.descriptor === "object"
      ? (rawObj.descriptor as Record<string, unknown>)
      : undefined;
  const key =
    (typeof descriptorObj?.entityKey === "string" ? descriptorObj.entityKey : undefined) ||
    (typeof rawObj.entityKey === "string" ? rawObj.entityKey : undefined);

  if (typeof key === "string" && key.trim().length > 0) {
    const targetObj = descriptorObj ?? rawObj;
    const enName = typeof targetObj.displayNameEn === "string" ? targetObj.displayNameEn.trim() : undefined;
    const arName = typeof targetObj.displayNameAr === "string" ? targetObj.displayNameAr.trim() : undefined;
    if (enName || arName) {
      entityDisplayNameRegistry.set(key.trim().toLowerCase(), {
        displayNameEn: enName || arName || key,
        displayNameAr: arName || enName || key,
      });
    }
  }
}

/** Registers an array of entity summaries or descriptors in the runtime catalog cache. */
export function registerEntityDisplayNames(
  entities: Array<
    | DataExchangeEntitySummaryDto
    | DataExchangeEntityDescriptor
    | DataExchangeDescriptorResponseDto
    | { entityKey: string; displayNameEn?: string | null; displayNameAr?: string | null }
  >
): void {
  if (!Array.isArray(entities)) return;
  for (const entity of entities) {
    registerEntityDisplayName(entity);
  }
}

/** Clears all registered runtime entity display names (e.g., during tenant switch or tests). */
export function clearEntityDisplayNameCache(): void {
  entityDisplayNameRegistry.clear();
}

/**
 * Resolves a human-friendly localized entity name for Data Exchange UI, toasts, and summaries.
 * Accepts optional dynamic backend descriptor or entitySummary (displayNameEn/displayNameAr)
 * as the primary source of truth, consulting runtime catalog cache, falling back to t(...) keys,
 * and finally humanized entityKey formatting.
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
      registerEntityDisplayName(entityKey, nameEn, nameAr);
      return dynamicName.trim();
    }
  }

  // Check runtime catalog metadata registry
  const cached = entityDisplayNameRegistry.get(entityKey.trim().toLowerCase());
  if (cached) {
    const cachedName = isAr ? cached.displayNameAr : cached.displayNameEn;
    if (typeof cachedName === "string" && cachedName.trim().length > 0) {
      return cachedName.trim();
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
