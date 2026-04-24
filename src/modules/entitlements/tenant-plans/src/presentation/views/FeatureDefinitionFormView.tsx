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

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateFeatureDefinitionRequest,
  UpdateFeatureDefinitionRequest,
} from "../../domain/entities/TenantPlanRequests";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Badge } from "@core/ui/badge";
import {
  ArrowLeft, Save, Loader2, Type, Hash, ToggleRight,
  Tag, FolderOpen, SortAsc, FileText, CheckCircle2, AlertCircle,
  Sparkles, KeyRound,
} from "lucide-react";

interface FeatureDefinitionFormViewProps {
  /** If provided, we're in edit mode; otherwise create mode. */
  featureId?: string;
}

export function FeatureDefinitionFormView({ featureId }: FeatureDefinitionFormViewProps) {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t } = useI18n();
  const router = useRouter();
  const { success, error: showError } = useEnhancedToast();
  const { tenantPlanRepository } = entitlementsContainer;
  const queryClient = useQueryClient();
  const isEditMode = !!featureId;

  // ── Load existing feature for edit mode ──
  const { data: existingFeature, isLoading: isLoadingFeature } = useQuery({
    queryKey: ["entitlements", "tenant-feature-definitions", featureId],
    queryFn: async () => {
      if (!featureId) return null;
      const result = await tenantPlanRepository.getFeatureDefinitions({ page: 1, pageSize: 500 });
      return result.items.find((f) => f.id === featureId) ?? null;
    },
    enabled: isEditMode,
  });

  // ── Form state ──
  const [form, setForm] = useState<{
    key: string;
    displayNameEn: string;
    displayNameAr: string;
    valueType: string;
    defaultValue: string;
    category: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>({
    key: "",
    displayNameEn: "",
    displayNameAr: "",
    valueType: "",
    defaultValue: "",
    category: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });

  // Hydrate form when editing
  const [hydrated, setHydrated] = useState(false);
  if (isEditMode && existingFeature && !hydrated) {
    setForm({
      key: existingFeature.key,
      displayNameEn: existingFeature.displayNameEn || "",
      displayNameAr: existingFeature.displayNameAr || "",
      valueType: existingFeature.valueType,
      defaultValue: existingFeature.defaultValue || "",
      category: existingFeature.category || "",
      description: existingFeature.description || "",
      sortOrder: existingFeature.sortOrder,
      isActive: existingFeature.isActive,
    });
    setHydrated(true);
  }

  const updateField = useCallback(<K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Validation ──
  const errors = useMemo(() => {
    const e: Partial<Record<string, string>> = {};
    if (!form.key.trim()) e.key = t("validation.required") || "Required";
    if (!form.valueType) e.valueType = t("validation.required") || "Required";
    return e;
  }, [form.key, form.valueType, t]);

  const isValid = Object.keys(errors).length === 0;

  // ── Create mutation ──
  const createMutation = useMutation({
    mutationFn: async (data: CreateFeatureDefinitionRequest) => {
      return tenantPlanRepository.createFeatureDefinition(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-feature-definitions"] });
      success({
        title: t("entitlements.featureDefinitions.created") || "Feature Created",
        description: t("entitlements.featureDefinitions.createdDesc") || "Feature definition created successfully.",
      });
      router.push("/entitlements/tenant-feature-definitions");
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.featureDefinitions.createFailed") || "Failed to create feature.",
      });
    },
  });

  // ── Update mutation ──
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFeatureDefinitionRequest) => {
      return tenantPlanRepository.updateFeatureDefinition(featureId!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entitlements", "tenant-feature-definitions"] });
      success({
        title: t("entitlements.featureDefinitions.updated") || "Feature Updated",
        description: t("entitlements.featureDefinitions.updatedDesc") || "Feature definition updated.",
      });
      router.push("/entitlements/tenant-feature-definitions");
    },
    onError: () => {
      showError({
        title: t("common.error") || "Error",
        description: t("entitlements.featureDefinitions.updateFailed") || "Failed to update feature.",
      });
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = useCallback(() => {
    if (!isValid || isSaving) return;
    const payload = {
      key: form.key.trim(),
      displayNameEn: form.displayNameEn.trim() || undefined,
      displayNameAr: form.displayNameAr.trim() || undefined,
      valueType: form.valueType,
      defaultValue: form.defaultValue.trim() || undefined,
      category: form.category.trim() || undefined,
      description: form.description.trim() || undefined,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    };

    if (isEditMode) {
      updateMutation.mutate(payload as UpdateFeatureDefinitionRequest);
    } else {
      createMutation.mutate(payload);
    }
  }, [form, isValid, isSaving, isEditMode, createMutation, updateMutation]);

  // ── Loading state for edit ──
  if (isEditMode && isLoadingFeature) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Value Type visual config ──
  const valueTypeOptions = [
    {
      value: "Boolean",
      label: t("entitlements.featureDefinitions.typeBoolean") || "Boolean",
      icon: <ToggleRight className="h-4 w-4" />,
      desc: "On/off toggle — enables or disables a capability.",
      hint: "e.g. true",
    },
    {
      value: "Numeric",
      label: t("entitlements.featureDefinitions.typeNumeric") || "Numeric",
      icon: <Hash className="h-4 w-4" />,
      desc: "Quota or limit — defines a numeric boundary.",
      hint: "e.g. 10, 100, -1 (unlimited)",
    },
    {
      value: "String",
      label: t("entitlements.featureDefinitions.typeString") || "String",
      icon: <Type className="h-4 w-4" />,
      desc: "Text value — stores a configuration string.",
      hint: "e.g. basic, premium, enterprise",
    },
  ];

  const selectedTypeConfig = valueTypeOptions.find((o) => o.value === form.valueType);

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* ─────── HEADER ─────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/entitlements/tenant-feature-definitions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {isEditMode
                  ? (t("entitlements.featureDefinitions.edit") || "Edit Feature")
                  : (t("entitlements.featureDefinitions.create") || "Create Feature")}
              </h1>
              <Badge variant="outline" className="text-xs">
                {t("entitlements.featureDefinitions.tier2Badge") || "Tier 2"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditMode
                ? (t("entitlements.featureDefinitions.editDesc") || "Update the feature definition details below.")
                : (t("entitlements.featureDefinitions.createDesc") || "Define a reusable feature for your tenant plans.")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/entitlements/tenant-feature-definitions">
            <Button variant="outline">{t("common.cancel") || "Cancel"}</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={!isValid || isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Save className="h-4 w-4 me-2" />
            )}
            {isEditMode ? (t("common.save") || "Save") : (t("common.create") || "Create")}
          </Button>
        </div>
      </div>

      {/* ═══════ SECTION 1: IDENTITY ═══════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
              <KeyRound className="h-4 w-4 text-primary" />
            </div>
            {t("entitlements.featureDefinitions.sectionIdentity") || "Identity"}
          </CardTitle>
          <CardDescription>
            {t("entitlements.featureDefinitions.sectionIdentityDesc") || "Unique key and customer-facing display names."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Feature Key */}
          <div className="space-y-2">
            <Label htmlFor="fd-key" className="flex items-center gap-1.5">
              {t("entitlements.featureDefinitions.key") || "Feature Key"}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fd-key"
              value={form.key}
              onChange={(e) => updateField("key", e.target.value)}
              placeholder={t("entitlements.featureDefinitions.keyPlaceholder") || "e.g. max_projects"}
              disabled={isEditMode}
              className={errors.key ? "border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              {t("entitlements.featureDefinitions.keyHint") || "Unique identifier. Cannot be changed after creation."}
            </p>
            {errors.key && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.key}
              </p>
            )}
          </div>

          {/* Display Names — EN / AR side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fd-name-en">
                {t("entitlements.featureDefinitions.displayNameEn") || "Display Name (EN)"}
              </Label>
              <Input
                id="fd-name-en"
                value={form.displayNameEn}
                onChange={(e) => updateField("displayNameEn", e.target.value)}
                placeholder={t("entitlements.featureDefinitions.displayNameEnPlaceholder") || "e.g. Maximum Projects"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fd-name-ar" className="text-right block">
                {t("entitlements.featureDefinitions.displayNameAr") || "Display Name (AR)"}
              </Label>
              <Input
                id="fd-name-ar"
                value={form.displayNameAr}
                onChange={(e) => updateField("displayNameAr", e.target.value)}
                placeholder={t("entitlements.featureDefinitions.displayNameArPlaceholder") || "الحد الأقصى للمشاريع"}
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
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-500/10">
              <Sparkles className="h-4 w-4 text-violet-500" />
            </div>
            {t("entitlements.featureDefinitions.sectionConfig") || "Value Configuration"}
          </CardTitle>
          <CardDescription>
            {t("entitlements.featureDefinitions.sectionConfigDesc") || "Choose how this feature stores its value and set the default."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Value Type — Card Selector */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              {t("entitlements.featureDefinitions.valueType") || "Value Type"}
              <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {valueTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("valueType", option.value)}
                  className={`relative flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-start transition-all hover:bg-accent/50 ${
                    form.valueType === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center h-8 w-8 rounded-md ${
                      form.valueType === option.value ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {option.icon}
                    </div>
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {option.desc}
                  </p>
                  {form.valueType === option.value && (
                    <div className="absolute top-2 end-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {errors.valueType && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.valueType}
              </p>
            )}
          </div>

          {/* Default Value */}
          <div className="space-y-2">
            <Label htmlFor="fd-default">
              {t("entitlements.featureDefinitions.defaultValue") || "Default Value"}
            </Label>
            <Input
              id="fd-default"
              value={form.defaultValue}
              onChange={(e) => updateField("defaultValue", e.target.value)}
              placeholder={selectedTypeConfig?.hint || "e.g. true, 10, basic"}
            />
            {selectedTypeConfig && (
              <p className="text-xs text-muted-foreground">
                {t("entitlements.featureDefinitions.valueTypeHint") || selectedTypeConfig.desc}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══════ SECTION 3: ORGANIZATION ═══════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10">
              <FolderOpen className="h-4 w-4 text-amber-500" />
            </div>
            {t("entitlements.featureDefinitions.sectionOrganization") || "Organization"}
          </CardTitle>
          <CardDescription>
            {t("entitlements.featureDefinitions.sectionOrganizationDesc") || "Group and describe this feature for better management."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="fd-category" className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {t("entitlements.featureDefinitions.category") || "Category"}
              </Label>
              <Input
                id="fd-category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder={t("entitlements.featureDefinitions.categoryPlaceholder") || "e.g. Limits, Access"}
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="fd-sort" className="flex items-center gap-1.5">
                <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
                {t("entitlements.featureDefinitions.sortOrder") || "Sort Order"}
              </Label>
              <Input
                id="fd-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateField("sortOrder", Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="fd-description" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              {t("entitlements.featureDefinitions.descriptionLabel") || "Description"}
            </Label>
            <Textarea
              id="fd-description"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder={t("entitlements.featureDefinitions.descriptionPlaceholder") || "What this feature controls..."}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ═══════ SECTION 4: STATUS ═══════ */}
      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{t("common.active") || "Active"}</p>
              <p className="text-xs text-muted-foreground">
                {t("entitlements.featureDefinitions.activeHint") || "Inactive features won't appear in the plan feature picker."}
              </p>
            </div>
          </div>
          <Switch
            checked={form.isActive}
            onCheckedChange={(checked) => updateField("isActive", checked)}
          />
        </CardContent>
      </Card>

      {/* ─────── FOOTER ACTIONS ─────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/entitlements/tenant-feature-definitions">
          <Button variant="outline" size="lg">{t("common.cancel") || "Cancel"}</Button>
        </Link>
        <Button size="lg" onClick={handleSubmit} disabled={!isValid || isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin me-2" />
          ) : (
            <Save className="h-4 w-4 me-2" />
          )}
          {isEditMode ? (t("common.saveChanges") || "Save Changes") : (t("common.create") || "Create Feature")}
        </Button>
      </div>
    </div>
  );
}
