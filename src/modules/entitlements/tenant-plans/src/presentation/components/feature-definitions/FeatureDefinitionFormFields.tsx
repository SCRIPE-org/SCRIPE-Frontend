/**
 * FeatureDefinitionFormFields — Create/Edit form fields for feature definitions.
 *
 * Uses @core/ui components + GenericSelect for the valueType dropdown.
 */
"use client";

import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import GenericSelect from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";

interface FeatureDefinitionFormFieldsProps {
  form: {
    getValue: (field: string) => string | number | boolean | undefined;
    setValue: (field: string, value: string | number | boolean) => void;
  };
  mode: "create" | "edit";
  t: (key: string) => string;
  language: string;
}

const VALUE_TYPE_OPTIONS: GenericSelectOption[] = [
  { value: "Boolean", label: "Boolean" },
  { value: "Numeric", label: "Numeric" },
  { value: "String", label: "String" },
];

/**
 * React presentation component representing the feature definition form fields UI element.
 */
export function FeatureDefinitionFormFields({
  form,
  mode,
  t,
  language,
}: FeatureDefinitionFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* ── Key ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-key">{t("entitlements.featureDefinitions.key") || "Feature Key"}</Label>
        <Input
          id="fd-key"
          value={String(form.getValue("key") ?? "")}
          onChange={(e) => form.setValue("key", e.target.value)}
          placeholder={
            t("entitlements.featureDefinitions.keyPlaceholder") || "e.g. max_projects, api_access"
          }
          disabled={mode === "edit"}
        />
        <p className="text-xs text-muted-foreground">
          {t("entitlements.featureDefinitions.keyHint") ||
            "Unique identifier. Cannot be changed after creation."}
        </p>
      </div>

      {/* ── Display Names ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fd-name-en">
            {t("entitlements.featureDefinitions.displayNameEn") || "Display Name (EN)"}
          </Label>
          <Input
            id="fd-name-en"
            value={String(form.getValue("displayNameEn") ?? "")}
            onChange={(e) => form.setValue("displayNameEn", e.target.value)}
            placeholder={
              t("entitlements.featureDefinitions.displayNameEnPlaceholder") ||
              "e.g. Maximum Projects"
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fd-name-ar">
            {t("entitlements.featureDefinitions.displayNameAr") || "Display Name (AR)"}
          </Label>
          <Input
            id="fd-name-ar"
            dir="rtl"
            value={String(form.getValue("displayNameAr") ?? "")}
            onChange={(e) => form.setValue("displayNameAr", e.target.value)}
            placeholder={
              t("entitlements.featureDefinitions.displayNameArPlaceholder") ||
              "الحد الأقصى للمشاريع"
            }
          />
        </div>
      </div>

      {/* ── Value Type ── */}
      <div className="space-y-1.5">
        <Label>{t("entitlements.featureDefinitions.valueType") || "Value Type"}</Label>
        <GenericSelect
          type="single"
          options={VALUE_TYPE_OPTIONS}
          value={String(form.getValue("valueType") ?? "Boolean")}
          onValueChange={(v: string | string[]) =>
            form.setValue("valueType", typeof v === "string" ? v : v[0])
          }
          placeholder={t("entitlements.featureDefinitions.selectType") || "Select type..."}
          disabled={mode === "edit"}
        />
        <p className="text-xs text-muted-foreground">
          {t("entitlements.featureDefinitions.valueTypeHint") ||
            "Boolean = on/off, Numeric = quota/limit, String = text value."}
        </p>
      </div>

      {/* ── Default Value ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-default">
          {t("entitlements.featureDefinitions.defaultValue") || "Default Value"}
        </Label>
        <Input
          id="fd-default"
          value={String(form.getValue("defaultValue") ?? "")}
          onChange={(e) => form.setValue("defaultValue", e.target.value)}
          placeholder={
            String(form.getValue("valueType") ?? "Boolean") === "Boolean"
              ? "true / false"
              : String(form.getValue("valueType") ?? "") === "Numeric"
                ? "0"
                : "Enter default value..."
          }
        />
      </div>

      {/* ── Category ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-category">
          {t("entitlements.featureDefinitions.category") || "Category"}
        </Label>
        <Input
          id="fd-category"
          value={String(form.getValue("category") ?? "")}
          onChange={(e) => form.setValue("category", e.target.value)}
          placeholder={
            t("entitlements.featureDefinitions.categoryPlaceholder") ||
            "e.g. Limits, Access, Branding"
          }
        />
      </div>

      {/* ── Description ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-desc">
          {t("entitlements.featureDefinitions.descriptionLabel") || "Description"}
        </Label>
        <Textarea
          id="fd-desc"
          value={String(form.getValue("description") ?? "")}
          onChange={(e) => form.setValue("description", e.target.value)}
          placeholder={
            t("entitlements.featureDefinitions.descriptionPlaceholder") ||
            "What this feature controls..."
          }
          rows={2}
        />
      </div>

      {/* ── Sort Order ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-sort">
          {t("entitlements.featureDefinitions.sortOrder") || "Sort Order"}
        </Label>
        <Input
          id="fd-sort"
          type="number"
          value={String(form.getValue("sortOrder") ?? "0")}
          onChange={(e) => form.setValue("sortOrder", parseInt(e.target.value) || 0)}
          min={0}
          className="w-24"
        />
      </div>
    </div>
  );
}
