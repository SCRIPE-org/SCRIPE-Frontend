// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
/**
 * FeatureDefinitionFormView — Premium Create/Edit Page
 *
 * Full-page form for creating or editing a Tenant Feature Definition.
 * Grouped into logical sections with rich UI/UX:
 *   - Identity (key, display names)
 *   - Value Configuration (type, default value)
 *   - Organization (category, sort order, description)
 *   - Status (active toggle)
 */
"use client";

import Link from "next/link";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import {
  useFeatureDefinitionFormViewModel,
  TENANT_FEATURE_DEFINITION_ENTITY_TYPE_KEY,
} from "../viewmodels/useFeatureDefinitionFormViewModel";

import { cn } from "@core/common/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Switch } from "@core/ui/switch";
import { Badge } from "@core/ui/badge";
import { PageHeader } from "@core/ui/page-header";
import { CustomFieldsSection } from "@core/components/custom-fields";
import {
  ArrowLeft,
  Save,
  Type,
  Hash,
  ToggleRight,
  Tag,
  FolderOpen,
  SortAsc,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Layers,
} from "lucide-react";

interface FeatureDefinitionFormViewProps {
  /** If provided, we're in edit mode; otherwise create mode. */
  featureId?: string;
  /** If true, the form is read-only. */
  isViewMode?: boolean;
}

/**
 * Presentation UI component rendering the feature definition form view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FeatureDefinitionFormView({
  featureId,
  isViewMode,
}: FeatureDefinitionFormViewProps) {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const {
    form,
    errors,
    isValid,
    isEditMode,
    isLoadingFeature,
    isSaving,
    updateField,
    handleSubmit,
    t,
    customFieldConfigs,
    customFieldsLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields,
  } = useFeatureDefinitionFormViewModel(featureId);

  // ── Loading state for edit ──
  if (isEditMode && isLoadingFeature) {
    return <LoadingSpinner size="lg" className="py-24" />;
  }

  // ── Value Type visual config ──
  const valueTypeOptions = [
    {
      value: "Boolean",
      label: t("entitlements.featureDefinitions.typeBoolean"),
      icon: <ToggleRight className="h-4 w-4" aria-hidden="true" />,
      desc: t("entitlements.featureDefinitions.typeBooleanDesc"),
      hint: t("entitlements.featureDefinitions.typeBooleanHint"),
    },
    {
      value: "Numeric",
      label: t("entitlements.featureDefinitions.typeNumeric"),
      icon: <Hash className="h-4 w-4" aria-hidden="true" />,
      desc: t("entitlements.featureDefinitions.typeNumericDesc"),
      hint: t("entitlements.featureDefinitions.typeNumericHint"),
    },
    {
      value: "String",
      label: t("entitlements.featureDefinitions.typeString"),
      icon: <Type className="h-4 w-4" aria-hidden="true" />,
      desc: t("entitlements.featureDefinitions.typeStringDesc"),
      hint: t("entitlements.featureDefinitions.typeStringHint"),
    },
  ];

  const selectedTypeConfig = valueTypeOptions.find((o) => o.value === form.valueType);

  const backHref = "/entitlements/tenant-feature-definitions";
  const pageTitle = isViewMode
    ? t("entitlements.featureDefinitions.view")
    : isEditMode
      ? t("entitlements.featureDefinitions.edit")
      : t("entitlements.featureDefinitions.create");
  const pageDescription = isViewMode
    ? t("entitlements.featureDefinitions.viewDesc")
    : isEditMode
      ? t("entitlements.featureDefinitions.editDesc")
      : t("entitlements.featureDefinitions.createDesc");

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* ─────── HEADER ─────── */}
      <PageHeader
        eyebrow={
          <Link href={backHref}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t("common.back")}</span>
            </Button>
          </Link>
        }
        icon={KeyRound}
        title={pageTitle}
        badges={
          <Badge variant="outline" className="text-xs">
            {t("entitlements.featureDefinitions.tier2Badge")}
          </Badge>
        }
        description={pageDescription}
        actions={
          <>
            <Link href={backHref}>
              <Button variant="outline">
                {isViewMode ? t("common.back") : t("common.cancel")}
              </Button>
            </Link>
            {!isViewMode && (
              <Button onClick={handleSubmit} disabled={!isValid} loading={isSaving}>
                {!isSaving && <Save className="me-2 h-4 w-4" aria-hidden="true" />}
                {isEditMode ? t("common.save") : t("common.create")}
              </Button>
            )}
          </>
        }
      />

      {/* ═══════ SECTION 1: IDENTITY ═══════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-nx-control bg-nx-accent-wash"
              aria-hidden="true"
            >
              <KeyRound className="h-4 w-4 text-nx-accent" />
            </div>
            {t("entitlements.featureDefinitions.sectionIdentity")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.featureDefinitions.sectionIdentityDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Feature Key */}
          <div className="space-y-2">
            <Label htmlFor="fd-key" className="flex items-center gap-1.5">
              {t("entitlements.featureDefinitions.key")}
              <span aria-hidden="true" className="text-nx-danger">
                *
              </span>
            </Label>
            <Input
              id="fd-key"
              value={form.key}
              onChange={(e) => updateField("key", e.target.value)}
              placeholder={t("entitlements.featureDefinitions.keyPlaceholder")}
              disabled={isEditMode || isViewMode}
              aria-invalid={!!errors.key}
            />
            <p className="text-xs leading-relaxed text-nx-ink-3">
              {t("entitlements.featureDefinitions.keyHint")}
            </p>
            {errors.key && (
              <p className="flex items-center gap-1 text-xs font-medium leading-relaxed text-nx-danger">
                <AlertCircle className="h-3 w-3" aria-hidden="true" /> {errors.key}
              </p>
            )}
          </div>

          {/* Display Names — EN / AR side by side */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fd-name-en">
                {t("entitlements.featureDefinitions.displayNameEn")}
              </Label>
              <Input
                id="fd-name-en"
                value={form.displayNameEn}
                onChange={(e) => updateField("displayNameEn", e.target.value)}
                placeholder={t("entitlements.featureDefinitions.displayNameEnPlaceholder")}
                disabled={isViewMode}
              />
            </div>
            <div className="space-y-2">
              {/* This field's content is always Arabic script regardless of the
                  active UI language, so both the label and the input pin their
                  own `dir` instead of following the ambient page direction —
                  `text-start` inside that fixed `dir="rtl"` is what keeps it on
                  the right in both an English and an Arabic build. */}
              <Label htmlFor="fd-name-ar" dir="rtl" className="text-start">
                {t("entitlements.featureDefinitions.displayNameAr")}
              </Label>
              <Input
                id="fd-name-ar"
                value={form.displayNameAr}
                onChange={(e) => updateField("displayNameAr", e.target.value)}
                placeholder={t("entitlements.featureDefinitions.displayNameArPlaceholder")}
                disabled={isViewMode}
                dir="rtl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════ SECTION 2: VALUE CONFIGURATION ═══════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-nx-control bg-nx-accent-wash"
              aria-hidden="true"
            >
              <Sparkles className="h-4 w-4 text-nx-accent" />
            </div>
            {t("entitlements.featureDefinitions.sectionConfig")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.featureDefinitions.sectionConfigDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Value Type — Card Selector. Read-only mode relies solely on each
              button's own `disabled` — a pointer-only overlay here would let a
              keyboard user tab past it into controls that still fire on
              Enter/Space, which is exactly the kind of gap `disabled` closes
              for both input modalities at once. */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              {t("entitlements.featureDefinitions.valueType")}
              <span aria-hidden="true" className="text-nx-danger">
                *
              </span>
            </Label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {valueTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={isViewMode}
                  aria-pressed={form.valueType === option.value}
                  onClick={() => updateField("valueType", option.value)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-nx-md border-2 p-4 text-start",
                    "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:shadow-nx-focus focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    !isViewMode && "hover:bg-nx-hover",
                    form.valueType === option.value
                      ? "border-nx-accent bg-nx-accent-wash"
                      : "border-nx-line hover:border-nx-line-hi"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-nx-control",
                        form.valueType === option.value
                          ? "bg-nx-accent-wash text-nx-accent"
                          : "bg-nx-raised text-nx-ink-3"
                      )}
                      aria-hidden="true"
                    >
                      {option.icon}
                    </div>
                    <span className="text-sm font-medium text-nx-ink">{option.label}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-nx-ink-3">{option.desc}</p>
                  {form.valueType === option.value && (
                    <div className="absolute end-2 top-2">
                      <CheckCircle2 className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {errors.valueType && (
              <p className="flex items-center gap-1 text-xs font-medium leading-relaxed text-nx-danger">
                <AlertCircle className="h-3 w-3" aria-hidden="true" /> {errors.valueType}
              </p>
            )}
          </div>

          {/* Default Value */}
          <div className="space-y-2">
            <Label htmlFor="fd-default">{t("entitlements.featureDefinitions.defaultValue")}</Label>
            <Input
              id="fd-default"
              value={form.defaultValue}
              onChange={(e) => updateField("defaultValue", e.target.value)}
              placeholder={selectedTypeConfig?.hint}
              disabled={isViewMode}
            />
            {selectedTypeConfig && (
              <p className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.featureDefinitions.valueTypeHint")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════ SECTION 3: ORGANIZATION ═══════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-nx-control bg-warning/10"
              aria-hidden="true"
            >
              <FolderOpen className="h-4 w-4 text-warning" />
            </div>
            {t("entitlements.featureDefinitions.sectionOrganization")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.featureDefinitions.sectionOrganizationDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="fd-category" className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                {t("entitlements.featureDefinitions.category")}
              </Label>
              <Input
                id="fd-category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder={t("entitlements.featureDefinitions.categoryPlaceholder")}
                disabled={isViewMode}
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="fd-sort" className="flex items-center gap-1.5">
                <SortAsc className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                {t("entitlements.featureDefinitions.sortOrder")}
              </Label>
              <Input
                id="fd-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateField("sortOrder", Number(e.target.value))}
                min={0}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="fd-description" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
              {t("entitlements.featureDefinitions.descriptionLabel")}
            </Label>
            <Textarea
              id="fd-description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder={t("entitlements.featureDefinitions.descriptionPlaceholder")}
              disabled={isViewMode}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ═══════ SECTION 4: STATUS ═══════ */}
      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-nx-control bg-success/10"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div>
              <Label htmlFor="fd-active" className="text-sm font-medium text-nx-ink">
                {t("common.active")}
              </Label>
              <p className="text-xs leading-relaxed text-nx-ink-3">
                {t("entitlements.featureDefinitions.activeHint")}
              </p>
            </div>
          </div>
          <Switch
            id="fd-active"
            checked={form.isActive}
            onCheckedChange={(checked) => updateField("isActive", checked)}
            readOnly={isViewMode}
          />
        </CardContent>
      </Card>

      {/* ═══════ SECTION 5: CUSTOM FIELDS ═══════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-nx-control bg-nx-accent-wash"
              aria-hidden="true"
            >
              <Layers className="h-4 w-4 text-nx-accent" />
            </div>
            {t("entitlements.featureDefinitions.sectionCustomFields")}
          </CardTitle>
          <CardDescription>
            {t("entitlements.featureDefinitions.sectionCustomFieldsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <CustomFieldsSection
            configs={customFieldConfigs}
            values={customFieldValues}
            onChange={updateCustomFieldValue}
            isLoading={customFieldsLoading}
            emptyMessage={t("entitlements.featureDefinitions.noCustomFields")}
            entityTypeKey={TENANT_FEATURE_DEFINITION_ENTITY_TYPE_KEY}
            entityDisplayName={t("entitlements.featureDefinitions.title")}
            onFieldCreated={() => void refetchCustomFields()}
            isViewMode={isViewMode}
            className="space-y-5"
          />
        </CardContent>
      </Card>

      {/* ─────── FOOTER ACTIONS ─────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href={backHref}>
          <Button variant="outline" size="lg">
            {isViewMode ? t("common.back") : t("common.cancel")}
          </Button>
        </Link>
        {!isViewMode && (
          <Button size="lg" onClick={handleSubmit} disabled={!isValid} loading={isSaving}>
            {!isSaving && <Save className="me-2 h-4 w-4" aria-hidden="true" />}
            {isEditMode ? t("common.saveChanges") : t("common.create")}
          </Button>
        )}
      </div>
    </div>
  );
}
