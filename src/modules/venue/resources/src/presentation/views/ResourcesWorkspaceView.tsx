"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GitFork, Plus, Sliders, Search, Sparkles } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { GenericSelect } from "@core/crud/components/generic-select";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import { Alert, AlertDescription } from "@core/ui/alert";
import { PageHeader } from "@core/ui/page-header";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useResourcesWorkspaceViewModel } from "../viewmodels/useResourcesWorkspaceViewModel";
import { ResourceCard } from "../components/ResourceCard";
import { FirstTimeSetupWizard } from "../components/FirstTimeSetupWizard";

/**
 * Documentation for module export
 */
export function ResourcesWorkspaceView() {
  useModuleLocales(() => import("../../../locales"), "venue.resources");
  const { t, direction } = useI18n();
  const searchParams = useSearchParams();
  const vm = useResourcesWorkspaceViewModel();

  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const allCategoriesLabel = t("resources.filters.allCategories", { defaultValue: "All Spaces" });
  const [selectedCategory, setSelectedCategory] = useState("__all_categories__");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "setup-required">("all");

  const categories = useMemo(() => {
    const sports = Array.from(new Set(vm.allItems.map((i) => i.sportType))).filter(Boolean);
    return [
      { value: "__all_categories__", label: allCategoriesLabel },
      ...sports.map((sport) => ({ value: sport, label: sport })),
    ];
  }, [vm.allItems, allCategoriesLabel]);

  const displayedItems = useMemo(() => {
    return vm.items.filter((item) => {
      // Category filter
      if (
        selectedCategory !== "__all_categories__" &&
        item.sportType.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
      // Status filter
      if (selectedStatus === "active") {
        return item.isPublished && item.pricePerSlot != null;
      }
      if (selectedStatus === "setup-required") {
        return !item.isPublished || item.pricePerSlot == null;
      }
      return true;
    });
  }, [vm.items, selectedCategory, selectedStatus, allCategoriesLabel]);

  useEffect(() => {
    if (searchParams.get("setup") === "new") {
      void Promise.resolve().then(() => {
        setSetupWizardOpen(true);
      });
    }
  }, [searchParams]);

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-resources-workspace">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col gap-4 border-b border-nx-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageHeader
            icon={GitFork}
            title={t("resources.title", { defaultValue: "Courts & Spaces" })}
            description={t("resources.subtitle", {
              defaultValue:
                "Manage your courts, spaces, working hours, booking slots, and pricing.",
            })}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Link to Venue Settings */}
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
            <Link href="/venue/settings">
              <Sliders className="size-3.5 text-nx-ink-3" aria-hidden="true" />
              <span>{t("resources.advancedSetup", { defaultValue: "Settings" })}</span>
            </Link>
          </Button>

          {/* Primary CTA: + Add Court / Space */}
          <Button
            size="sm"
            onClick={() => setSetupWizardOpen(true)}
            className="gap-1.5 rounded-xl bg-nx-accent text-xs font-bold text-nx-on-fill shadow-sm hover:bg-nx-accent/90"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>{t("resources.addCourt", { defaultValue: "+ Add Court / Space" })}</span>
          </Button>
        </div>
      </div>

      {vm.error && (
        <Alert variant="destructive">
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
      )}

      {/* Operational Metrics Strip derived from source-backed data */}
      {vm.metrics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-nx-border shadow-xs rounded-2xl border bg-nx-surface p-3.5">
            <p className="text-[11px] font-semibold text-nx-ink-3">
              {t("resources.metrics.total", { defaultValue: "Total Courts & Spaces" })}
            </p>
            <p className="mt-0.5 text-xl font-bold text-nx-ink">{vm.metrics.totalSpaces}</p>
          </div>
          <div className="border-nx-border shadow-xs rounded-2xl border bg-nx-surface p-3.5">
            <p className="text-[11px] font-semibold text-nx-ink-3">
              {t("resources.metrics.active", { defaultValue: "Active & Bookable" })}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {vm.metrics.activeSpaces}
              </p>
              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                {t("resources.metrics.ready", { defaultValue: "Ready" })}
              </span>
            </div>
          </div>
          <div className="border-nx-border shadow-xs rounded-2xl border bg-nx-surface p-3.5">
            <p className="text-[11px] font-semibold text-nx-ink-3">
              {t("resources.metrics.setupRequired", { defaultValue: "Setup Required" })}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {vm.metrics.setupRequired}
              </p>
              {vm.metrics.setupRequired > 0 && (
                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                  {t("resources.metrics.actionNeeded", { defaultValue: "Action needed" })}
                </span>
              )}
            </div>
          </div>
          <div className="border-nx-border shadow-xs rounded-2xl border bg-nx-surface p-3.5">
            <p className="text-[11px] font-semibold text-nx-ink-3">
              {t("resources.metrics.authorizedFacilities", {
                defaultValue: "Authorized Facilities",
              })}
            </p>
            <p className="mt-0.5 text-xl font-bold text-nx-ink">{vm.metrics.branchCount}</p>
          </div>
        </div>
      )}

      {/* Filter Chips Bar & Dropdowns */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Tabs: Dynamically derived from domain items */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((category) => (
            <Button
              variant="outline"
              key={category.value}
              type="button"
              onClick={() => setSelectedCategory(category.value)}
              aria-pressed={selectedCategory === category.value}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === category.value
                  ? "shadow-xs bg-nx-accent text-nx-on-fill hover:bg-nx-accent/90"
                  : "border-nx-border border bg-nx-surface text-nx-ink-2 hover:bg-nx-raised"
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Dropdowns & Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <Search
              className="absolute left-2.5 top-2.5 size-3.5 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              value={vm.searchQuery}
              onChange={(e) => vm.setSearchQuery(e.target.value)}
              placeholder={t("resources.search", { defaultValue: "Search courts & spaces..." })}
              className="h-8 rounded-lg pl-8 text-xs"
            />
          </div>

          {vm.facilities.length > 1 && (
            <GenericSelect
              value={vm.selectedFacilityId || "__all_facilities__"}
              options={[
                {
                  value: "__all_facilities__",
                  label: t("resources.allBranches", { defaultValue: "All Facilities" }),
                },
                ...vm.facilities.map((fac) => ({ value: fac.id, label: fac.name })),
              ]}
              aria-label={t("resources.filters.facility", { defaultValue: "Facility" })}
              onValueChange={(value: string | string[]) => {
                if (typeof value === "string")
                  vm.setSelectedFacilityId(value === "__all_facilities__" ? "" : value);
              }}
              className="h-8 w-48 text-xs"
            />
          )}

          <GenericSelect
            value={selectedStatus}
            options={[
              {
                value: "all",
                label: t("resources.filters.allStatuses", { defaultValue: "All Statuses" }),
              },
              { value: "active", label: t("resources.filters.active", { defaultValue: "Active" }) },
              {
                value: "setup-required",
                label: t("resources.filters.setupRequired", { defaultValue: "Setup Required" }),
              },
            ]}
            aria-label={t("resources.filters.status", { defaultValue: "Status" })}
            onValueChange={(value: string | string[]) => {
              if (typeof value === "string")
                setSelectedStatus(value as "all" | "active" | "setup-required");
            }}
            className="h-8 w-40 text-xs"
          />
        </div>
      </div>

      {/* Loading state */}
      {vm.loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner showText={false} />
        </div>
      ) : vm.allItems.length === 0 ? (
        /* Empty State: First-time setup onboarding */
        <EmptyState
          icon={Sparkles}
          title={t("resources.empty.title", { defaultValue: "No courts or spaces yet" })}
          description={t("resources.empty.description", {
            defaultValue:
              "Set up your branch and courts in under two minutes with the simplified operator journey.",
          })}
          action={
            <Button
              onClick={() => setSetupWizardOpen(true)}
              className="gap-2 bg-nx-accent font-bold text-nx-on-fill hover:bg-nx-accent/90"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              <span>{t("resources.empty.action", { defaultValue: "Start Setup Journey" })}</span>
            </Button>
          }
        />
      ) : displayedItems.length === 0 ? (
        <div className="py-12 text-center text-xs text-nx-ink-3">
          {t("resources.emptySearch", { defaultValue: "No courts match your search filter." })}
        </div>
      ) : (
        /* Courts Grid + Add New Empty Card */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {displayedItems.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}

          {/* Add New Court / Space Empty Card */}
          <Button
            type="button"
            onClick={() => setSetupWizardOpen(true)}
            variant="outline"
            className="border-nx-border bg-nx-raised/30 group flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all hover:border-nx-accent/60 hover:bg-nx-accent/5"
          >
            <div className="mb-2.5 flex size-11 items-center justify-center rounded-full bg-nx-accent/15 text-nx-ink transition-transform group-hover:scale-110 dark:text-nx-accent">
              <Plus className="size-5" />
            </div>
            <span className="text-xs font-bold text-nx-ink transition-colors group-hover:text-emerald-600 dark:group-hover:text-nx-accent">
              {t("resources.addCourt", { defaultValue: "+ Add New Court / Space" })}
            </span>
            <span className="mt-1 max-w-[200px] text-[11px] text-nx-ink-3">
              {t("resources.addCourtDescription", {
                defaultValue: "Padel Court, Football Field, Pool, Studio, or any other space",
              })}
            </span>
          </Button>
        </div>
      )}

      {/* First-Time Setup Wizard Modal */}
      <FirstTimeSetupWizard
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
        onSubmit={vm.executeFirstTimeSetup}
        submitting={vm.wizardSubmitting}
        errorMessage={vm.error}
        facilities={vm.facilities}
        lastResults={vm.lastSetupResults}
      />
    </div>
  );
}
