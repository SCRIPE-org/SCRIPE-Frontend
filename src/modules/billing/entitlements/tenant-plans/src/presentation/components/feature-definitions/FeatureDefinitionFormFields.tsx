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

/**
 * Presentation UI component rendering the feature definition form fields.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FeatureDefinitionFormFields({ form, mode, t }: FeatureDefinitionFormFieldsProps) {
  const valueTypeOptions: GenericSelectOption[] = [
    { value: "Boolean", label: t("entitlements.featureDefinitions.typeBoolean") },
    { value: "Numeric", label: t("entitlements.featureDefinitions.typeNumeric") },
    { value: "String", label: t("entitlements.featureDefinitions.typeString") },
  ];

  const valueType = String(form.getValue("valueType") ?? "Boolean");
  const defaultValuePlaceholder =
    valueType === "Boolean"
      ? t("entitlements.featureDefinitions.defaultValuePlaceholderBoolean")
      : valueType === "Numeric"
        ? t("entitlements.featureDefinitions.defaultValuePlaceholderNumeric")
        : t("entitlements.featureDefinitions.defaultValuePlaceholderString");

  return (
    <div className="space-y-4">
      {/* ── Key ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-key">{t("entitlements.featureDefinitions.key")}</Label>
        <Input
          id="fd-key"
          value={String(form.getValue("key") ?? "")}
          onChange={(e) => form.setValue("key", e.target.value)}
          placeholder={t("entitlements.featureDefinitions.keyPlaceholder")}
          disabled={mode === "edit"}
        />
        <p className="text-xs leading-relaxed text-nx-ink-3">
          {t("entitlements.featureDefinitions.keyHint")}
        </p>
      </div>

      {/* ── Display Names ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fd-name-en">{t("entitlements.featureDefinitions.displayNameEn")}</Label>
          <Input
            id="fd-name-en"
            value={String(form.getValue("displayNameEn") ?? "")}
            onChange={(e) => form.setValue("displayNameEn", e.target.value)}
            placeholder={t("entitlements.featureDefinitions.displayNameEnPlaceholder")}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fd-name-ar" dir="rtl" className="text-start">
            {t("entitlements.featureDefinitions.displayNameAr")}
          </Label>
          <Input
            id="fd-name-ar"
            dir="rtl"
            value={String(form.getValue("displayNameAr") ?? "")}
            onChange={(e) => form.setValue("displayNameAr", e.target.value)}
            placeholder={t("entitlements.featureDefinitions.displayNameArPlaceholder")}
          />
        </div>
      </div>

      {/* ── Value Type ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-value-type">{t("entitlements.featureDefinitions.valueType")}</Label>
        <GenericSelect
          type="single"
          options={valueTypeOptions}
          value={valueType}
          onValueChange={(v: string | string[]) =>
            form.setValue("valueType", typeof v === "string" ? v : v[0])
          }
          placeholder={t("entitlements.featureDefinitions.selectType")}
          disabled={mode === "edit"}
        />
        <p className="text-xs leading-relaxed text-nx-ink-3">
          {t("entitlements.featureDefinitions.valueTypeHint")}
        </p>
      </div>

      {/* ── Default Value ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-default">{t("entitlements.featureDefinitions.defaultValue")}</Label>
        <Input
          id="fd-default"
          value={String(form.getValue("defaultValue") ?? "")}
          onChange={(e) => form.setValue("defaultValue", e.target.value)}
          placeholder={defaultValuePlaceholder}
        />
      </div>

      {/* ── Category ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-category">{t("entitlements.featureDefinitions.category")}</Label>
        <Input
          id="fd-category"
          value={String(form.getValue("category") ?? "")}
          onChange={(e) => form.setValue("category", e.target.value)}
          placeholder={t("entitlements.featureDefinitions.categoryPlaceholder")}
        />
      </div>

      {/* ── Description ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-desc">{t("entitlements.featureDefinitions.descriptionLabel")}</Label>
        <Textarea
          id="fd-desc"
          value={String(form.getValue("description") ?? "")}
          onChange={(e) => form.setValue("description", e.target.value)}
          placeholder={t("entitlements.featureDefinitions.descriptionPlaceholder")}
          rows={2}
        />
      </div>

      {/* ── Sort Order ── */}
      <div className="space-y-1.5">
        <Label htmlFor="fd-sort">{t("entitlements.featureDefinitions.sortOrder")}</Label>
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
