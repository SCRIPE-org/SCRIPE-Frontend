"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { AlertCircle, Building2, RefreshCw } from "lucide-react";
import { useVenueOverviewViewModel } from "../viewmodels/useVenueOverviewViewModel";
import { VenueOverviewHeader } from "../components/VenueOverviewHeader";
import { VenueOverviewKpiStrip } from "../components/VenueOverviewKpiStrip";
import { VenueOverviewOperationalLoad } from "../components/VenueOverviewOperationalLoad";
import { VenueOverviewAtAGlance } from "../components/VenueOverviewAtAGlance";
import { VenueOverviewUpNext } from "../components/VenueOverviewUpNext";
import { VenueOverviewResourceActivity } from "../components/VenueOverviewResourceActivity";
import { VenueOverviewRecentActivityDeferred } from "../components/VenueOverviewRecentActivityDeferred";
import { VenueOverviewQuickActions } from "../components/VenueOverviewQuickActions";

interface Props {
  facilityId?: string;
  localDate?: string;
}

export function VenueOverviewView({ facilityId, localDate }: Props) {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const {
    state,
    facilities,
    selectedFacilityId,
    refreshing,
    refresh,
    changeFacility,
  } = useVenueOverviewViewModel(facilityId, localDate);

  if (state.stage === "loading" && !state.facilityName) {
    return (
      <div className="flex h-96 items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (state.stage === "failed" && state.error) {
    return (
      <div className="p-6 max-w-lg mx-auto my-12" dir={dir}>
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertTitle className="font-bold">{t("venueOverview.errors.loadFailed")}</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-xs">{t("venueOverview.errors.loadFailed")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refresh}
              className="gap-2 text-xs"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {t("venueOverview.errors.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (state.stage === "empty") {
    return (
      <div className="p-6" dir={dir} data-testid="venue-overview-empty">
        <EmptyState
          icon={Building2}
          title={t("venueOverview.empty.noFacilityTitle")}
          description={t("venueOverview.empty.noFacilityDescription")}
        />
      </div>
    );
  }

  return (
    <div
      className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 text-nx-ink"
      dir={dir}
      data-testid="venue-overview-view"
    >
      {/* Compact Enterprise Page Header */}
      <VenueOverviewHeader
        facilityName={state.facilityName}
        selectedFacilityId={selectedFacilityId}
        facilities={facilities}
        timeZoneId={state.timeZoneId}
        localDate={state.localDate}
        refreshing={refreshing}
        onRefresh={refresh}
        onFacilityChange={changeFacility}
        t={t}
      />

      {/* Quick Actions & Primary KPI Strip */}
      <div className="space-y-4">
        <div className="flex justify-end">
          <VenueOverviewQuickActions t={t} />
        </div>
        <VenueOverviewKpiStrip kpis={state.kpis} t={t} />
      </div>

      {/* Main Visualization Row: Today's Operational Load (8 cols) + Today at a Glance (4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <VenueOverviewOperationalLoad buckets={state.hourlyLoad} t={t} />
        </div>
        <div className="lg:col-span-4">
          <VenueOverviewAtAGlance items={state.atAGlance} t={t} />
        </div>
      </div>

      {/* Lower Operational Lists Row: Up Next (6 cols) + Resource Activity (6 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <VenueOverviewUpNext items={state.upNext} t={t} />
        </div>
        <div className="lg:col-span-6">
          <VenueOverviewResourceActivity items={state.resourceActivity} t={t} />
        </div>
      </div>

      {/* Deferred Recent Activity Feed Banner */}
      <VenueOverviewRecentActivityDeferred t={t} />
    </div>
  );
}
