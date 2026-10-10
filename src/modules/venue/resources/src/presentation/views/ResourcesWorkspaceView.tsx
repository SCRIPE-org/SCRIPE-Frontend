"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GitFork,
  Plus,
  Sliders,
  Search,
  Building2,
  Sparkles,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { EmptyState } from "@core/ui/empty-state";
import { Alert, AlertDescription } from "@core/ui/alert";
import { PageHeader } from "@core/ui/page-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { VenueNav } from "@modules/venue/shared/src/presentation/components/VenueNav";
import { useResourcesWorkspaceViewModel } from "../viewmodels/useResourcesWorkspaceViewModel";
import { ResourceCard } from "../components/ResourceCard";
import { FirstTimeSetupWizard } from "../components/FirstTimeSetupWizard";

export function ResourcesWorkspaceView() {
  useModuleLocales(() => import("../../../locales"), "venue.resources");
  const { t, direction } = useI18n();
  const searchParams = useSearchParams();
  const vm = useResourcesWorkspaceViewModel();

  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Spaces");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "setup-required">("all");

  const categories = useMemo(() => {
    const sports = Array.from(new Set(vm.allItems.map((i) => i.sportType))).filter(Boolean);
    return ["All Spaces", ...sports];
  }, [vm.allItems]);

  const displayedItems = useMemo(() => {
    return vm.items.filter((item) => {
      // Category filter
      if (selectedCategory !== "All Spaces" && item.sportType.toLowerCase() !== selectedCategory.toLowerCase()) {
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
  }, [vm.items, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (searchParams.get("setup") === "new") {
      setSetupWizardOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-resources-workspace">
      <VenueNav />

      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-4">
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
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Sliders className="size-3.5 text-nx-ink-3" aria-hidden="true" />
                <span>{t("resources.advancedSetup", { defaultValue: "Settings" })}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">
                {t("resources.advancedSetup", { defaultValue: "Settings" })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/venue/facilities">Facilities / Branches</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/availability">Operating Hours & Calendars</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/pricing">Pricing Catalog</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/sites">Sites & Campuses</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary CTA: + Add Court / Space */}
          <Button
            size="sm"
            onClick={() => setSetupWizardOpen(true)}
            className="gap-1.5 font-bold shadow-nx-sm"
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

      {/* Filter Chips Bar & Dropdowns */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Category Tabs: Dynamically derived from domain items */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdowns & Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" aria-hidden="true" />
            <Input
              value={vm.searchQuery}
              onChange={(e) => vm.setSearchQuery(e.target.value)}
              placeholder={t("resources.search", { defaultValue: "Search courts & spaces..." })}
              className="pl-8 h-8 text-xs rounded-lg"
            />
          </div>

          {vm.facilities.length > 1 && (
            <select
              value={vm.selectedFacilityId}
              onChange={(e) => vm.setSelectedFacilityId(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="">
                {t("resources.allBranches", { defaultValue: "All Branches" })}
              </option>
              {vm.facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as "all" | "active" | "setup-required")}
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="setup-required">Setup Required</option>
          </select>
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
            <Button onClick={() => setSetupWizardOpen(true)} className="gap-2 font-bold">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedItems.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}

          {/* Add New Court / Space Empty Card */}
          <button
            type="button"
            onClick={() => setSetupWizardOpen(true)}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 hover:border-blue-500 transition-all text-center min-h-[140px] group cursor-pointer"
          >
            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="size-5" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              + Add New Court / Space
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
              Padel Court, Football Field, Pool, Studio, or any other space
            </span>
          </button>
        </div>
      )}

      {/* First-Time Setup Wizard Modal */}
      <FirstTimeSetupWizard
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
        onSubmit={vm.executeFirstTimeSetup}
        submitting={vm.wizardSubmitting}
        errorMessage={vm.error}
      />
    </div>
  );
}
