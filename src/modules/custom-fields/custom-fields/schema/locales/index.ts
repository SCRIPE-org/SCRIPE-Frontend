/**
 * Merges the export-side and import-side dictionaries into one chunk.
 *
 * Both `SchemaExportButton` and `SchemaImportButton` load from this same path (with their own,
 * independent `moduleKey`s -- see `useModuleLocales`), so the chunk has to carry both halves
 * regardless of which button mounts first. Top-level keys (`schemaExport`, `schemaImport`) don't
 * collide, so a plain object spread is enough -- no deep merge needed.
 *
 * Loaded lazily via: import("./locales") in useModuleLocales()
 */
import { en as schemaExportEn } from "./schema-export.en";
import { ar as schemaExportAr } from "./schema-export.ar";
import { en as schemaImportEn } from "./schema-import.en";
import { ar as schemaImportAr } from "./schema-import.ar";

export const en = { ...schemaExportEn, ...schemaImportEn };
export const ar = { ...schemaExportAr, ...schemaImportAr };
