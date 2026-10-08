/* eslint-disable @typescript-eslint/no-require-imports, unused-imports/no-unused-vars */

const fs = require("fs");
const path = require("path");

const extPath = "src/core/crud/customFieldsExtension.tsx";
let extContent = fs.readFileSync(extPath, "utf-8");

const validationCode = `
export const MULTI_SELECT_MAX_SELECTIONS = 100;
export const RICH_TEXT_MAX_CHARACTERS = 100000;

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function validateSelectCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type === "multi-select") {
    return validateMultiSelectCustomFieldValue(fc, value, t);
  }
  if (fc.type !== "select") return null;
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  if (text === "") return null;

  const allowedLabels = fc.options?.map((opt) => opt.label) ?? [];

  if (!allowedLabels.includes(text)) {
    return t("customField.values.selectInvalidOption", {
      value: text,
      field: fc.label ?? fc.name,
    });
  }

  return null;
}

function validateMultiSelectCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (value === undefined || value === null) return null;
  if (!Array.isArray(value) || value.length === 0) return null;

  if (value.length > MULTI_SELECT_MAX_SELECTIONS) {
    return t("customField.values.multiSelectTooManySelections", {
      field: fc.label ?? fc.name,
      max: MULTI_SELECT_MAX_SELECTIONS,
    });
  }

  const allowedLabels = fc.options?.map((opt) => opt.label) ?? [];
  const seen = new Set<string>();

  for (const raw of value) {
    const text = String(raw).trim();

    if (!allowedLabels.includes(text)) {
      return t("customField.values.selectInvalidOption", {
        value: text,
        field: fc.label ?? fc.name,
      });
    }

    if (seen.has(text)) {
      return t("customField.values.multiSelectDuplicateOption", {
        value: text,
        field: fc.label ?? fc.name,
      });
    }
    seen.add(text);
  }

  return null;
}

export function validateCurrencyCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "currency") return null;
  if (value === undefined || value === null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;

  const { amount, currencyCode } = value as { amount?: unknown; currencyCode?: unknown };
  const amountMissing = amount === undefined || amount === null || amount === "";
  const codeMissing = typeof currencyCode !== "string" || currencyCode.trim() === "";

  if (amountMissing && codeMissing) return null;

  if (amountMissing || codeMissing) {
    return t("customField.values.currencyIncomplete", { field: fc.label ?? fc.name });
  }

  return null;
}

export function validateEntityReferenceCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "entity-reference") return null;

  const candidate =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as { entityTypeKey?: unknown; entityId?: unknown })
      : null;
  const typeKey = typeof candidate?.entityTypeKey === "string" ? candidate.entityTypeKey.trim() : "";
  const entityId = typeof candidate?.entityId === "string" ? candidate.entityId.trim() : "";

  if (typeKey === "" && entityId === "") {
    return fc.required ? t("validation.required") : null;
  }

  if (typeKey === "" || entityId === "") {
    return t("customField.entityReference.invalid");
  }

  return null;
}

export function validateMediaReferenceCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "media-file" && fc.type !== "media-image") return null;

  const candidate =
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as { entityTypeKey?: unknown; entityId?: unknown })
      : null;
  const typeKey = typeof candidate?.entityTypeKey === "string" ? candidate.entityTypeKey.trim() : "";
  const entityId = typeof candidate?.entityId === "string" ? candidate.entityId.trim() : "";

  if (typeKey === "" && entityId === "") {
    return fc.required ? t("validation.required") : null;
  }

  if (typeKey === "" || entityId === "") {
    return t("customField.values.mediaReferenceIncomplete", { field: fc.label ?? fc.name });
  }

  return null;
}

export function validateRichTextCustomFieldValue(
  fc: FieldConfig,
  value: unknown,
  t: TranslateFn
): string | null {
  if (fc.type !== "rich-text") return null;

  if (value === null || value === undefined) {
    return fc.required ? t("validation.required") : null;
  }

  const html =
    typeof value === "object" && !Array.isArray(value)
      ? (value as { html?: unknown }).html
      : undefined;

  if (typeof html !== "string") {
    return t("customField.values.richTextInvalidShape", { field: fc.label ?? fc.name });
  }

  if (html.trim() === "") {
    return fc.required ? t("validation.required") : null;
  }

  if (html.length > RICH_TEXT_MAX_CHARACTERS) {
    return t("customField.values.richTextTooLong", {
      field: fc.label ?? fc.name,
      max: RICH_TEXT_MAX_CHARACTERS,
    });
  }

  return null;
}

export function assertSelectCustomFieldValuesValid(
  fieldConfigs: FieldConfig[],
  values: Record<string, unknown>,
  t: TranslateFn
): void {
  for (const fc of fieldConfigs) {
    if (fc.type === "currency") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateCurrencyCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type === "entity-reference") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateEntityReferenceCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type === "media-file" || fc.type === "media-image") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateMediaReferenceCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type === "rich-text") {
      const raw = values[fc.name] ?? fc.defaultValue ?? null;
      const error = validateRichTextCustomFieldValue(fc, raw, t);
      if (error) {
        throw new CustomFieldValidationError(error);
      }
      continue;
    }

    if (fc.type !== "select" && fc.type !== "multi-select") continue;
    const raw = values[fc.name] ?? fc.defaultValue ?? "";
    const error = validateSelectCustomFieldValue(fc, raw, t);
    if (error) {
      throw new CustomFieldValidationError(error);
    }
  }
}
`;

extContent = extContent + "\n" + validationCode;
fs.writeFileSync(extPath, extContent, "utf-8");

// now replace import in useCreateTenantViewModel.ts
let tenantVMPath = "src/modules/admin/identity/tenants/src/presentation/viewmodels/useCreateTenantViewModel.ts";
let tenantVM = fs.readFileSync(tenantVMPath, "utf-8");
tenantVM = tenantVM.replace(
  `import { assertSelectCustomFieldValuesValid } from "@modules/custom-fields";`,
  `// import moved`
);
tenantVM = tenantVM.replace(
  `useCustomFieldsFormFields,`,
  `useCustomFieldsFormFields,\n  assertSelectCustomFieldValuesValid,`
);
fs.writeFileSync(tenantVMPath, tenantVM, "utf-8");

console.log("Done");

