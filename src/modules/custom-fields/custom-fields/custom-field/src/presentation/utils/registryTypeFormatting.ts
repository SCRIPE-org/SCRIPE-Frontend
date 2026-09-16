/**
 * Wire data formatting and safety helpers for backend entity type registry shapes.
 *
 * Both the definition's own entity type (via `useCustomFieldViewModel`) and the reference target
 * pin's candidate list (via `useEntityLookupAvailableTypes`) declare key/owningModule/displayNameEn/
 * displayNameAr as non-optional string, but wire data at runtime may lack translations or names.
 * These pure functions protect against unchecked wire strings and ensure robust display fallbacks.
 */

import { resolveIntlLocale } from "@core/common/utils";

/**
 * The key/owningModule/displayNameEn/displayNameAr quartet carried by registry-sourced wire shapes.
 */
export interface RegistryNamedType {
  key: string;
  owningModule: string;
  displayNameEn: string;
  displayNameAr: string;
}

/**
 * Returns value when it is a non-empty string, undefined otherwise.
 * Defends against blank or whitespace-only wire values.
 */
export function readWireString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return value.trim() === "" ? undefined : value;
}

/**
 * Resolves the display name to show for one registry type, with active language preference
 * and automatic fallback to the alternative language before giving up.
 */
export function resolveRegistryTypeName(
  type: RegistryNamedType,
  language: string
): string | undefined {
  const active = language === "ar" ? type?.displayNameAr : type?.displayNameEn;
  const other = language === "ar" ? type?.displayNameEn : type?.displayNameAr;
  return readWireString(active) ?? readWireString(other);
}

/**
 * Formats an option label for a registry type: "Name (key)", or the bare key when no name arrived.
 */
export function formatRegistryTypeOptionLabel(type: RegistryNamedType, language: string): string {
  const name = resolveRegistryTypeName(type, language);
  const key = readWireString(type?.key);
  if (name === undefined) return key ?? "";
  return key === undefined ? name : `${name} (${key})`;
}

/**
 * Sort order comparator for registry types: owningModule -> displayed name -> key.
 */
export function compareRegistryTypes(
  a: RegistryNamedType,
  b: RegistryNamedType,
  language: string
): number {
  const moduleOf = (type: RegistryNamedType) => readWireString(type?.owningModule) ?? "";
  const keyOf = (type: RegistryNamedType) => readWireString(type?.key) ?? "";
  const shownNameOf = (type: RegistryNamedType) =>
    resolveRegistryTypeName(type, language) ?? keyOf(type);

  return (
    moduleOf(a).localeCompare(moduleOf(b)) ||
    shownNameOf(a).localeCompare(shownNameOf(b), resolveIntlLocale(language)) ||
    keyOf(a).localeCompare(keyOf(b))
  );
}
