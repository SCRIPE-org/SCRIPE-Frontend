/**
 * Premium system-admin feature catalog.
 *
 * The view receives the complete catalog from the ViewModel, then applies local
 * module/value/enforcement filters so counts and results never describe only one
 * backend page. Mutations continue through the repository-backed CRUD ViewModel.
 */
"use client";

import { useMemo, useState } from "react";
import { Boxes, Plus, RefreshCw, Search } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { PageHeader } from "@core/ui/page-header";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { usePermission } from "@core/hooks/use-permission";
import { ENTITLEMENTS_PERMISSIONS } from "@modules/entitlements/permission-constants";
import type { Feature } from "../../domain/entities/Feature";
import type {
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from "../../domain/entities/FeatureRequests";
import type { FeatureCatalogViewModel } from "../viewmodels/useFeaturesViewModel";
import { CatalogFeatureCard } from "./CatalogFeatureCard";
import {
  CatalogFiltersBar,
  ALL_FILTER,
  CANONICAL_MODULES,
  type EnforcementFilter,
} from "./CatalogFiltersBar";
import { CatalogFormDrawer } from "./CatalogFormDrawer";
import { CatalogStatsSection } from "./CatalogStatsSection";

/**
 * Properties for the CatalogView component.
 */
export interface CatalogViewProps {
  /** The feature catalog view model providing data and mutation methods. */
  vm: FeatureCatalogViewModel;
  /** Localization dictionary lookup function. */
  t: (key: string) => string;
  /** Active UI locale language code. */
  language: string;
}

/**
 * Renders the full catalog administrative overview with KPIs, search/filter bar,
 * feature cards grid, and create/edit drawer.
 */
export function CatalogView({ vm, t, language }: CatalogViewProps) {
  const [moduleFilter, setModuleFilter] = useState(ALL_FILTER);
  const [valueTypeFilter, setValueTypeFilter] = useState(ALL_FILTER);
  const [enforcementFilter, setEnforcementFilter] = useState<EnforcementFilter>(ALL_FILTER);
  const [pendingDelete, setPendingDelete] = useState<Feature | null>(null);

  const hasActiveFilters =
    vm.searchValue.trim().length > 0 ||
    moduleFilter !== ALL_FILTER ||
    valueTypeFilter !== ALL_FILTER ||
    enforcementFilter !== ALL_FILTER;

  const clearFilters = () => {
    vm.handleSearchChange("");
    setModuleFilter(ALL_FILTER);
    setValueTypeFilter(ALL_FILTER);
    setEnforcementFilter(ALL_FILTER);
  };

  const canCreate = usePermission(ENTITLEMENTS_PERMISSIONS.FEATURES_CREATE);
  const canUpdate = usePermission(ENTITLEMENTS_PERMISSIONS.FEATURES_UPDATE);
  const canDelete = usePermission(ENTITLEMENTS_PERMISSIONS.FEATURES_DELETE);

  const items = vm.items;
  const searchValue = vm.searchValue;

  const modules = useMemo(
    () =>
      [...new Set([...CANONICAL_MODULES, ...items.map((feature) => feature.module)])].sort(
        (left, right) => left.localeCompare(right)
      ),
    [items]
  );

  const filteredFeatures = useMemo(() => {
    const search = searchValue.trim().toLocaleLowerCase(language);

    return items.filter((feature) => {
      const matchesSearch =
        !search ||
        feature.name.toLocaleLowerCase(language).includes(search) ||
        feature.getDisplayName(language).toLocaleLowerCase(language).includes(search) ||
        feature.description?.toLocaleLowerCase(language).includes(search);
      const matchesModule = moduleFilter === ALL_FILTER || feature.module === moduleFilter;
      const matchesType = valueTypeFilter === ALL_FILTER || feature.valueType === valueTypeFilter;
      const matchesEnforcement =
        enforcementFilter === ALL_FILTER ||
        (enforcementFilter === "marketing" && feature.isMarketingOnly) ||
        (enforcementFilter === "enforced" && !feature.isMarketingOnly);

      return matchesSearch && matchesModule && matchesType && matchesEnforcement;
    });
  }, [enforcementFilter, language, moduleFilter, valueTypeFilter, items, searchValue]);

  const drawerOpen = vm.isCreateModalOpen || vm.isEditModalOpen;
  const activeFeature = vm.editingItem;

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

      <CatalogStatsSection items={vm.items} loading={vm.loading} t={t} />

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
          <CatalogFiltersBar
            searchValue={vm.searchValue}
            moduleFilter={moduleFilter}
            valueTypeFilter={valueTypeFilter}
            enforcementFilter={enforcementFilter}
            modules={modules}
            t={t}
            onSearchChange={vm.handleSearchChange}
            onModuleChange={setModuleFilter}
            onValueTypeChange={setValueTypeFilter}
            onEnforcementChange={setEnforcementFilter}
          />
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
                <CatalogFeatureCard
                  key={feature.id}
                  feature={feature}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  isUpdating={vm.isUpdating}
                  language={language}
                  t={t}
                  onEdit={() => vm.openEditModal(feature)}
                  onDelete={() => setPendingDelete(feature)}
                  onMarketingToggle={(checked) => handleMarketingToggle(feature, checked)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CatalogFormDrawer
        open={drawerOpen}
        activeFeature={activeFeature}
        modules={modules}
        t={t}
        onSubmit={handleSubmit}
        onClose={closeDrawer}
      />

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
