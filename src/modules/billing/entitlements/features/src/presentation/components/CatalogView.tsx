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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@core/ui/sheet";
import { Skeleton } from "@core/ui/skeleton";
import { Switch } from "@core/ui/switch";
import { usePermission } from "@core/hooks/use-permission";
import { cn } from "@core/common/utils";
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
        accent: "from-primary/20 to-primary/5 text-primary",
      },
      {
        label: t("entitlements.features.totalModules"),
        value: new Set(vm.items.map((feature) => feature.module)).size,
        icon: Layers3,
        accent: "from-info/20 to-info/5 text-info",
      },
      {
        label: t("entitlements.features.enforcedFeatures"),
        value: vm.items.filter((feature) => !feature.isMarketingOnly).length,
        icon: ShieldCheck,
        accent: "from-success/20 to-success/5 text-success",
      },
      {
        label: t("entitlements.features.marketingFeatures"),
        value: vm.items.filter((feature) => feature.isMarketingOnly).length,
        icon: Megaphone,
        accent: "from-warning/20 to-warning/5 text-warning",
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
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-card/95 via-card to-primary/5 p-6 shadow-sm backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <Badge variant="outline" className="w-fit border-primary/30 bg-primary/5">
              {t("entitlements.features.controlPanel")}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("entitlements.features.title")}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {t("entitlements.features.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={vm.refreshItems} disabled={vm.loading}>
              <RefreshCw className={cn("h-4 w-4", vm.loading && "animate-spin")} />
              {t("entitlements.features.refresh")}
            </Button>
            {canCreate && (
              <Button onClick={() => vm.setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("entitlements.features.create")}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
              <div className={cn("rounded-2xl bg-gradient-to-br p-3", accent)}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-border/70 bg-card/90 shadow-sm backdrop-blur">
        <CardHeader className="gap-4 border-b">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">{t("entitlements.features.catalogTitle")}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredFeatures.length} {t("entitlements.features.results")}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

        <CardContent className="p-4 sm:p-6">
          {vm.loading ? (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : vm.error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              {vm.error}
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
              <Search className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">{t("entitlements.features.noFeatures")}</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("entitlements.features.noFeaturesHint")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredFeatures.map((feature) => (
                <article
                  key={feature.id}
                  className="group flex min-h-44 flex-col rounded-2xl border bg-background/70 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
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
                        className="truncate font-semibold"
                        title={feature.getDisplayName(language)}
                      >
                        {feature.getDisplayName(language)}
                      </h2>
                      <p
                        className="mt-1 truncate font-mono text-xs text-muted-foreground"
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
                          <Edit3 className="h-4 w-4" />
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
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {feature.description || t("entitlements.features.noDescription")}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-4 border-t pt-3">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {t("entitlements.features.defaultValue")}
                      </p>
                      <p
                        className="truncate font-mono text-sm font-medium"
                        title={feature.defaultValue}
                      >
                        {feature.defaultValue || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t("entitlements.features.marketingOnly")}
                      </span>
                      <Switch
                        checked={feature.isMarketingOnly}
                        onCheckedChange={(checked) => handleMarketingToggle(feature, checked)}
                        disabled={!canUpdate || vm.isUpdating}
                        aria-label={`${t("entitlements.features.marketingOnly")}: ${feature.getDisplayName(language)}`}
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
      >
        <SheetContent
          side={language === "ar" ? "left" : "right"}
          className="w-full overflow-y-auto sm:max-w-xl"
        >
          <SheetHeader className="pe-8">
            <SheetTitle>
              {activeFeature ? t("entitlements.features.edit") : t("entitlements.features.create")}
            </SheetTitle>
            <SheetDescription>
              {activeFeature
                ? t("entitlements.features.editDesc")
                : t("entitlements.features.createDesc")}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <GenericForm
              key={activeFeature?.id ?? "create-feature"}
              fields={formFields}
              onSubmit={handleSubmit}
              onCancel={closeDrawer}
            />
          </div>
        </SheetContent>
      </Sheet>

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
