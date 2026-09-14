/**
 * Typed `CustomField` fixture factory for tests.
 *
 * WHY THIS EXISTS
 * ---------------
 * `CustomField` is a CLASS whose every accessor reads from a private `data` payload, not a plain
 * interface. A test that writes `const f: CustomField = { id, key, labelEn }` therefore does not
 * merely omit properties — it produces a value that has no `data` at all, so every getter the
 * component under test calls would return `undefined` at runtime. Vitest transpiles without
 * typechecking, so those fixtures ran green while asserting against a shape the production type
 * never had; `tsc --noEmit` is what surfaced it.
 *
 * Constructing through the real class instead of hand-rolling an object literal keeps the fixture
 * honest: it exercises the same accessors production does, and adding a required column to
 * `CustomFieldData` breaks this one file rather than silently leaving twenty call sites building an
 * entity that cannot exist.
 *
 * Overrides are `Partial<CustomFieldData>` — the constructor payload — rather than
 * `Partial<CustomField>`: the class side is all readonly getters, so it cannot be spread into a
 * constructor call and would not typecheck as an override bag.
 */

import { CustomField, type CustomFieldData } from "../domain/entities/CustomField";

/**
 * A complete, realistic, deliberately unremarkable definition.
 *
 * Every optional column is spelled out rather than left off so a fixture reads as a fetched DETAIL
 * row. The detail-only columns (`validatorKind`, `validatorParam`, `fieldGroupId`,
 * `referenceTargetEntityTypeKey`) are explicit `null` — meaning "fetched, and unset" — because
 * `undefined` on those means "not fetched", which is a genuinely different state that the entity's
 * own doc comments call load-bearing. A test wanting the list-row state should override to
 * `undefined` on purpose.
 */
const BASE_CUSTOM_FIELD_DATA: CustomFieldData = {
  id: "cf-fixture-1",
  entityTypeKey: "party.person",
  key: "fixture_field",
  labelEn: "Fixture Field",
  labelAr: "حقل تجريبي",
  placeholderEn: null,
  placeholderAr: null,
  valueType: "Text",
  isRequired: false,
  options: null,
  optionsAr: null,
  sensitivity: "None",
  isExportable: true,
  sortOrder: 0,
  isActive: true,
  createdAt: "2026-08-01T00:00:00Z",
  modifiedAt: null,
  isGlobal: false,
  validatorKind: null,
  validatorParam: null,
  fieldGroupId: null,
  referenceTargetEntityTypeKey: null,
};

/**
 * Builds a real `CustomField` entity for use as a test fixture.
 *
 * @param overrides Columns to change on top of {@link BASE_CUSTOM_FIELD_DATA}. Name only what the
 *   test is actually about — the defaults cover the rest with valid values.
 * @returns A `CustomField` instance whose getters behave exactly as they do in production.
 */
export function makeCustomField(overrides: Partial<CustomFieldData> = {}): CustomField {
  return new CustomField({ ...BASE_CUSTOM_FIELD_DATA, ...overrides });
}
