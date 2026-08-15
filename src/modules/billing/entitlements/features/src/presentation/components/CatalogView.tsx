/**
 * Premium system-admin feature catalog.
 *
 * The view receives the complete catalog from the ViewModel, then applies local
 * module/value/enforcement filters so counts and results never describe only one
 * backend page. Mutations continue through the repository-backed CRUD ViewModel.
 */
"use client";

import { useMemo, useState } from "react";
import {
  Boxes,
  Edit3,
  Layers3,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { GenericForm, type FieldConfig } from "@core/ui/forms/generic-form";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { DetailSheet, DetailSheetHeader, DetailSheetBody } from "@core/ui/detail-sheet";
import { PageHeader } from "@core/ui/page-header";
import { StatCard } from "@core/ui/stat-card";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { Switch } from "@core/ui/switch";
import { usePermission } from "@core/hooks/use-permission";
import { ENTITLEMENTS_PERMISSIONS } from "@modules/entitlements/permission-constants";
import type { Feature, FeatureValueType } from "../../domain/entities/Feature";
import type {
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from "../../domain/entities/FeatureRequests";
import type { FeatureCatalogViewModel } from "../viewmodels/useFeaturesViewModel";

const ALL = "__all";
const CANONICAL_MODULES = [
  "Identity",
  "Entitlements",
  "Compliance",
  "Communication",
  "Integrations",
  "Media",
  "OrganizationCore",
  "PartyKernel",
  "Hrms",
  "CustomFields",
  "WorkManagement",
  "Analytics",
  "Plugins",
  "Marketplace",
];

const VALUE_TYPE_VARIANTS: Record<FeatureValueType, "default" | "secondary" | "outline"> = {
  Boolean: "default",
  Numeric: "secondary",
  String: "outline",
};

interface CatalogViewProps {
  vm: FeatureCatalogViewModel;
  t: (key: string) => string;
  language: string;
}

type EnforcementFilter = typeof ALL | "enforced" | "marketing";

function getCreateFields(t: (key: string) => string, modules: string[]): FieldConfig[] {
  return [
    {
      name: "name",
      label: t("entitlements.features.featureName"),
      type: "text",
      required: true,
      placeholder: t("entitlements.features.namePlaceholder"),
      description: t("entitlements.features.featureKeyHelp"),
    },
    {
      name: "module",
      label: t("entitlements.features.module"),
      type: "searchable-select",
      required: true,
      options: modules.map((module) => ({ value: module, label: module })),
    },
    {
      name: "valueType",
      label: t("entitlements.features.valueType"),
      type: "select",
      required: true,
      options: [
        { value: "Boolean", label: t("entitlements.features.boolean") },
        { value: "Numeric", label: t("entitlements.features.numeric") },
        { value: "String", label: t("entitlements.features.string") },
      ],
    },
    {
      name: "defaultValue",
      label: t("entitlements.features.defaultValue"),
      type: "text",
      required: true,
      placeholder: t("entitlements.features.defaultValuePlaceholder"),
      description: t("entitlements.features.defaultValueHelp"),
    },
    {
      name: "displayNameEn",
      label: t("entitlements.features.displayNameEn"),
      type: "text",
    },
    {
      name: "displayNameAr",
      label: t("entitlements.features.displayNameAr"),
      type: "text",
    },
    {
      name: "category",
      label: t("entitlements.features.category"),
      type: "text",
    },
    {
      name: "description",
      label: t("common.description"),
      type: "textarea",
    },
    {
      name: "isMarketingOnly",
      label: t("entitlements.features.marketingOnly"),
      type: "switch",
      defaultValue: false,
      description: t("entitlements.features.marketingOnlyHelp"),
    },
  ];
}

function getEditFields(t: (key: string) => string, feature: Feature): FieldConfig[] {
  return [
    {
      name: "displayNameEn",
      label: t("entitlements.features.displayNameEn"),
      type: "text",
      defaultValue: feature.displayNameEn ?? "",
    },
    {
      name: "displayNameAr",
      label: t("entitlements.features.displayNameAr"),
      type: "text",
      defaultValue: feature.displayNameAr ?? "",
    },
    {
      name: "defaultValue",
      label: t("entitlements.features.defaultValue"),
      type: "text",
      required: true,
      defaultValue: feature.defaultValue,
      description: t("entitlements.features.defaultValueHelp"),
    },
    {
      name: "category",
      label: t("entitlements.features.category"),
      type: "text",
      defaultValue: feature.category ?? "",
    },
    {
      name: "description",
      label: t("common.description"),
      type: "textarea",
      defaultValue: feature.description ?? "",
    },
    {
      name: "isMarketingOnly",
      label: t("entitlements.features.marketingOnly"),
      type: "switch",
      defaultValue: feature.isMarketingOnly,
      description: t("entitlements.features.marketingOnlyHelp"),
    },
  ];
}

export function CatalogView({ vm, t, language }: CatalogViewProps) {
  const [moduleFilter, setModuleFilter] = useState(ALL);
  const [valueTypeFilter, setValueTypeFilter] = useState(ALL);
  const [enforcementFilter, setEnforcementFilter] = useState<EnforcementFilter>(ALL);
  const [pendingDelete, setPendingDelete] = useState<Feature | null>(null);

  const hasActiveFilters =
    vm.searchValue.trim().length > 0 ||
    moduleFilter !== ALL ||
    valueTypeFilter !== ALL ||
    enforcementFilter !== ALL;

  const clearFilters = () => {
    vm.handleSearchChange("");
    setModuleFilter(ALL);
    setValueTypeFilter(ALL);
    setEnforcementFilter(ALL);
  };

  const canCreate = usePermission(ENTITLEMENTS_PERMISSIONS.FEATURES_CREATE);
  const canUpdate = usePermission(ENTITLEMENTS_PERMISSIONS.FEATURES_UPDATE);
  const canDelete = usePermission(ENTITLEMENTS_PERMISSIONS.FEATURES_DELETE);

  const modules = useMemo(
    () =>
      [...new Set([...CANONICAL_MODULES, ...vm.items.map((feature) => feature.module)])].sort(
        (left, right) => left.localeCompare(right)
      ),
    [vm.items]
  );

  const filteredFeatures = useMemo(() => {
    const search = vm.searchValue.trim().toLocaleLowerCase(language);

    return vm.items.filter((feature) => {
      const matchesSearch =
        !search ||
        feature.name.toLocaleLowerCase(language).includes(search) ||
        feature.getDisplayName(language).toLocaleLowerCase(language).includes(search) ||
        feature.description?.toLocaleLowerCase(language).includes(search);
      const matchesModule = moduleFilter === ALL || feature.module === moduleFilter;
      const matchesType = valueTypeFilter === ALL || feature.valueType === valueTypeFilter;
      const matchesEnforcement =
        enforcementFilter === ALL ||
        (enforcementFilter === "marketing" && feature.isMarketingOnly) ||
        (enforcementFilter === "enforced" && !feature.isMarketingOnly);

      return matchesSearch && matchesModule && matchesType && matchesEnforcement;
    });
  }, [enforcementFilter, language, moduleFilter, valueTypeFilter, vm.items, vm.searchValue]);

  const stats = useMemo(
    () => [
      {
        label: t("entitlements.features.totalFeatures"),
        value: vm.items.length,
        icon: Boxes,
        tone: "neutral" as const,
      },
      {
        label: t("entitlements.features.totalModules"),
        value: new Set(vm.items.map((feature) => feature.module)).size,
        icon: Layers3,
        tone: "info" as const,
      },
      {
        label: t("entitlements.features.enforcedFeatures"),
        value: vm.items.filter((feature) => !feature.isMarketingOnly).length,
        icon: ShieldCheck,
        tone: "success" as const,
      },
      {
        label: t("entitlements.features.marketingFeatures"),
        value: vm.items.filter((feature) => feature.isMarketingOnly).length,
        icon: Megaphone,
        tone: "warning" as const,
      },
    ],
    [t, vm.items]
  );

  const drawerOpen = vm.isCreateModalOpen || vm.isEditModalOpen;
  const activeFeature = vm.editingItem;
  const formFields = activeFeature ? getEditFields(t, activeFeature) : getCreateFields(t, modules);

  const closeDrawer = () => {
    vm.setIsCreateModalOpen(false);
    vm.closeEditModal();
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (activeFeature) {
      await vm.updateItem(activeFeature.id, data as UpdateFeatureRequest);
    } else {
      await vm.createItem(data as unknown as CreateFeatureRequest);
    }
  };

  const handleMarketingToggle = async (feature: Feature, checked: boolean) => {
    await vm.updateItem(feature.id, { isMarketingOnly: checked });
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        icon={Boxes}
        title={t("entitlements.features.title")}
        description={t("entitlements.features.description")}
        badges={<Badge variant="default">{t("entitlements.features.controlPanel")}</Badge>}
        actions={
          <>
            <Button
              variant="outline"
              onClick={vm.refreshItems}
              loading={vm.loading}
              className="gap-2"
            >
              {!vm.loading && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              {t("entitlements.features.refresh")}
            </Button>
            {canCreate && (
              <Button onClick={() => vm.setIsCreateModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("entitlements.features.create")}
              </Button>
            )}
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon, tone }) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            tone={tone}
            isLoading={vm.loading}
          />
        ))}
      </section>

      <Card>
        <CardHeader className="gap-4 border-b border-nx-line">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">{t("entitlements.features.catalogTitle")}</CardTitle>
              <p className="mt-1 text-sm text-nx-ink-2">
                {filteredFeatures.length} {t("entitlements.features.results")}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_180px_180px]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
                aria-hidden="true"
              />
              <Input
                value={vm.searchValue}
                onChange={(event) => vm.handleSearchChange(event.target.value)}
                placeholder={t("entitlements.features.searchPlaceholder")}
                className="ps-9"
                aria-label={t("entitlements.features.searchPlaceholder")}
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger aria-label={t("entitlements.features.filterByModule")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("entitlements.features.allModules")}</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={valueTypeFilter} onValueChange={setValueTypeFilter}>
              <SelectTrigger aria-label={t("entitlements.features.filterByType")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("entitlements.features.allTypes")}</SelectItem>
                <SelectItem value="Boolean">{t("entitlements.features.boolean")}</SelectItem>
                <SelectItem value="Numeric">{t("entitlements.features.numeric")}</SelectItem>
                <SelectItem value="String">{t("entitlements.features.string")}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={enforcementFilter}
              onValueChange={(value) => setEnforcementFilter(value as EnforcementFilter)}
            >
              <SelectTrigger aria-label={t("entitlements.features.filterByEnforcement")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t("entitlements.features.allControls")}</SelectItem>
                <SelectItem value="enforced">{t("entitlements.features.enforced")}</SelectItem>
                <SelectItem value="marketing">
                  {t("entitlements.features.marketingOnly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {vm.loading ? (
            <div
              role="status"
              aria-busy="true"
              aria-label={t("common.loading")}
              className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} shape="block" className="h-44 rounded-nx-lg" />
              ))}
            </div>
          ) : vm.error ? (
            <ErrorMessage message={vm.error} onRetry={vm.refreshItems} />
          ) : filteredFeatures.length === 0 ? (
            <EmptyState
              icon={Search}
              title={t("entitlements.features.noFeatures")}
              description={t("entitlements.features.noFeaturesHint")}
              action={
                hasActiveFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    {t("entitlements.features.clearFilters")}
                  </Button>
                ) : undefined
              }
              secondaryAction={
                canCreate ? (
                  <Button onClick={() => vm.setIsCreateModalOpen(true)}>
                    {t("entitlements.features.create")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredFeatures.map((feature) => (
                <Card key={feature.id} className="flex min-h-44 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{feature.module}</Badge>
                        <Badge variant={VALUE_TYPE_VARIANTS[feature.valueType]}>
                          {t(`entitlements.features.${feature.valueType.toLowerCase()}`)}
                        </Badge>
                        {feature.isSystem && (
                          <Badge variant="outline">{t("entitlements.features.systemBadge")}</Badge>
                        )}
                      </div>
                      <h2
                        className="truncate font-semibold text-nx-ink"
                        title={feature.getDisplayName(language)}
                      >
                        {feature.getDisplayName(language)}
                      </h2>
                      <p
                        className="mt-1 truncate font-mono text-xs text-nx-ink-2"
                        title={feature.name}
                      >
                        {feature.name}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => vm.openEditModal(feature)}
                          aria-label={`${t("entitlements.features.edit")}: ${feature.getDisplayName(language)}`}
                        >
                          <Edit3 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                      {canDelete && !feature.isSystem && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setPendingDelete(feature)}
                          aria-label={`${t("entitlements.features.deleteConfirmTitle")}: ${feature.getDisplayName(language)}`}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-nx-ink-2">
                    {feature.description || t("entitlements.features.noDescription")}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-nx-line pt-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
                        {t("entitlements.features.defaultValue")}
                      </p>
                      <p
                        className="truncate font-mono text-sm font-medium text-nx-ink"
                        title={feature.defaultValue}
                      >
                        {feature.defaultValue || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-nx-ink-3">
                        {t("entitlements.features.marketingOnly")}
                      </span>
                      <Switch
                        checked={feature.isMarketingOnly}
                        onCheckedChange={(checked) => handleMarketingToggle(feature, checked)}
                        disabled={!canUpdate}
                        busy={vm.isUpdating}
                        aria-label={`${t("entitlements.features.marketingOnly")}: ${feature.getDisplayName(language)}`}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DetailSheet
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
        title={activeFeature ? t("entitlements.features.edit") : t("entitlements.features.create")}
        description={
          activeFeature
            ? t("entitlements.features.editDesc")
            : t("entitlements.features.createDesc")
        }
        width="md"
      >
        <DetailSheetHeader className="pe-12">
          <h2 className="text-lg font-semibold text-nx-ink">
            {activeFeature ? t("entitlements.features.edit") : t("entitlements.features.create")}
          </h2>
          <p className="mt-1 text-sm text-nx-ink-2">
            {activeFeature
              ? t("entitlements.features.editDesc")
              : t("entitlements.features.createDesc")}
          </p>
        </DetailSheetHeader>
        <DetailSheetBody className="px-6 py-5">
          <GenericForm
            key={activeFeature?.id ?? "create-feature"}
            fields={formFields}
            onSubmit={handleSubmit}
            onCancel={closeDrawer}
          />
        </DetailSheetBody>
      </DetailSheet>

      <ConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={t("entitlements.features.deleteConfirmTitle")}
        description={t("entitlements.features.deleteConfirmDesc")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
        isLoading={vm.isDeleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await vm.deleteItem(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
