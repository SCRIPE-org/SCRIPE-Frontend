"use client";

import { useEffect, useState } from "react";
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
import { VenueNav } from "@modules/venue/shared/src/presentation/components/VenueNav";
import { useResourcesWorkspaceViewModel } from "../viewmodels/useResourcesWorkspaceViewModel";
import { ResourceCard } from "../components/ResourceCard";
import { FirstTimeSetupWizard } from "../components/FirstTimeSetupWizard";

export function ResourcesWorkspaceView() {
  const { t, direction } = useI18n();
  const searchParams = useSearchParams();
  const vm = useResourcesWorkspaceViewModel();

  const [setupWizardOpen, setSetupWizardOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("setup") === "new") {
      void Promise.resolve().then(() => {
        setSetupWizardOpen(true);
      });
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
            title={t("resources.title", { defaultValue: "Courts & Fields" })}
            description={t("resources.subtitle", {
              defaultValue:
                "Manage your courts, fields, working hours, booking slots, and pricing.",
            })}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced Settings Escape Hatch Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
                <Sliders className="size-3.5 text-nx-ink-3" aria-hidden="true" />
                <span>{t("resources.advancedSetup", { defaultValue: "Advanced Settings" })}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">Advanced Architecture</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/venue/facilities">Facilities / Branches</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/resource-profiles">Resource Profiles</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/resource-builder">Resource Builder</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/sites">Sites & Campuses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/availability">Operating Hours & Calendars</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/venue/pricing">Pricing Catalog</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Primary CTA: + Add Court / Field */}
          <Button
            size="sm"
            onClick={() => setSetupWizardOpen(true)}
            className="gap-1.5 font-bold shadow-nx-sm"
          >
            <Plus className="size-4" aria-hidden="true" />
            <span>{t("resources.addCourt", { defaultValue: "+ Add Court / Field" })}</span>
          </Button>
        </div>
      </div>

      {vm.error && (
        <Alert variant="destructive">
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-nx-ink-3" aria-hidden="true" />
          <Input
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder={t("resources.search", { defaultValue: "Search courts & fields..." })}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {vm.facilities.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-nx-ink-3" aria-hidden="true" />
            <select
              value={vm.selectedFacilityId}
              onChange={(e) => vm.setSelectedFacilityId(e.target.value)}
              className="h-9 rounded-nx-md border border-nx-line bg-nx-surface px-3 py-1.5 text-xs font-semibold text-nx-ink"
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
          </div>
        )}
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
          title={t("resources.empty.title", { defaultValue: "No courts or fields yet" })}
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
      ) : vm.items.length === 0 ? (
        <div className="py-12 text-center text-xs text-nx-ink-3">
          No courts match your search filter.
        </div>
      ) : (
        /* Resources Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vm.items.map((item) => (
            <ResourceCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* First-Time Setup Wizard Modal */}
      <FirstTimeSetupWizard
        open={setupWizardOpen}
        onOpenChange={setSetupWizardOpen}
        onSubmit={vm.executeFirstTimeSetup}
        submitting={vm.wizardSubmitting}
      />
    </div>
  );
}
