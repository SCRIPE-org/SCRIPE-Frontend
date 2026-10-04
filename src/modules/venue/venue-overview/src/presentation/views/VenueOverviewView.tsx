"use client";

import Link from "next/link";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { AlertCircle, Building2, RefreshCw, ShieldAlert } from "lucide-react";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { useVenueAttentionViewModel } from "@modules/venue/attention-center/src/presentation/viewmodels/useVenueAttentionViewModel";
import { VenueNav } from "@modules/venue/shared/src/presentation/components/VenueNav";
import { useVenueOverviewViewModel } from "../viewmodels/useVenueOverviewViewModel";
import { VenueOverviewHeader } from "../components/VenueOverviewHeader";
import { VenueOverviewKpiStrip } from "../components/VenueOverviewKpiStrip";
import { VenueOverviewHeroTimeline } from "../components/VenueOverviewHeroTimeline";
import { VenueOverviewLiveFeed } from "../components/VenueOverviewLiveFeed";
import { VenueOverviewDemandChart } from "../components/VenueOverviewDemandChart";
import { VenueOverviewStatusDonut } from "../components/VenueOverviewStatusDonut";
import { VenueOverviewUpNext } from "../components/VenueOverviewUpNext";
import { VenueOverviewResourcePulse } from "../components/VenueOverviewResourcePulse";
import { VenueOverviewMoneyCard } from "../components/VenueOverviewMoneyCard";
import { VenueOverviewRecentActivityDeferred } from "../components/VenueOverviewRecentActivityDeferred";

interface Props {
  facilityId?: string;
  localDate?: string;
}

export function VenueOverviewView({ facilityId, localDate }: Props) {
  const { t, language } = useI18n();
  const dir = language === "ar" ? "rtl" : "ltr";
  const canViewAttention = usePermission(VENUE_PERMISSIONS.VENUE_ATTENTION_VIEW);
  const attentionVm = useVenueAttentionViewModel(canViewAttention);
  const attentionCount = canViewAttention && attentionVm.data ? attentionVm.data.items.length : 0;

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
      <div className="p-6 max-w-[1600px] mx-auto space-y-6" dir={dir} data-testid="venue-overview-empty">
        <VenueNav attentionCount={attentionCount} />
        <EmptyState
          icon={Building2}
          title={t("venueOverview.empty.noFacilityTitle")}
          description={t("venueOverview.empty.noFacilityDescription")}
        />
      </div>
    );
  }

  if (state.stage === "limited") {
    return (
      <div className="p-6 max-w-lg mx-auto my-12" dir={dir} data-testid="venue-overview-limited">
        <Alert>
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertTitle className="font-bold">{t("venueOverview.errors.resourceLimitTitle")}</AlertTitle>
          <AlertDescription className="mt-2">
            {t("venueOverview.errors.resourceLimitDescription")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Gracefully fallback for timeline if initialized from legacy/mock states
  const timelineDay = state.timelineDay ?? {
    dateLocal: state.localDate,
    timeZoneId: state.timeZoneId,
    fromUtc: `${state.localDate}T06:00:00Z`,
    toUtc: `${state.localDate}T23:00:00Z`,
    asOfUtc: state.asOfUtc,
    isTruncated: false,
    blocks: [],
  };

  const timelineResources =
    state.timelineResources && state.timelineResources.length > 0
      ? state.timelineResources
      : state.resourceActivity.map((r) => ({
          id: r.resourceId,
          name: r.resourceName,
          profileId: r.facilityId,
          profileName: "General",
          facilityId: r.facilityId,
          facilityName: state.facilityName,
          resourceKindCode: "General",
          timeZoneId: state.timeZoneId,
        }));

  return (
    <div
      className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 text-nx-ink"
      dir={dir}
      data-testid="venue-overview-view"
    >
      {/* 4-Tier Product Mental Model Navigation */}
      <VenueNav attentionCount={attentionCount} />

      {/* Metis-Inspired Page Header */}
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

      {/* Operational Attention Notice Banner (if active signals exist) */}
      {canViewAttention && attentionVm.data && attentionVm.data.items.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-nx-ink">
                  {t("venueOverview.attention.activeTitle", { count: attentionVm.data.items.length })}
                </p>
                <p className="text-xs text-nx-ink-2">
                  {t("venueOverview.attention.activeDescription")}
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="text-xs border-amber-500/40 hover:bg-amber-500/10">
              <Link href="/venue/attention">
                {t("venueOverview.attention.viewAll")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top KPI Row — 4 Compact Metis Stats Cards */}
      <VenueOverviewKpiStrip
        kpis={state.kpis}
        attentionCount={canViewAttention ? attentionCount : undefined}
        t={t}
      />

      {/* Main Hero Row: Today's Venue Activity (8 cols) + Live Venue Feed (4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-8">
          <VenueOverviewHeroTimeline
            day={timelineDay}
            resources={timelineResources}
            locale={language}
            direction={dir}
            t={t}
          />
        </div>
        <div className="lg:col-span-4">
          <VenueOverviewLiveFeed
            blocks={timelineDay.blocks}
            upNext={state.upNext}
            attentionSignals={attentionVm.data?.items}
            timeZoneId={state.timeZoneId}
            t={t}
          />
        </div>
      </div>

      {/* Secondary Analytics Row: Bookings by Time (6 cols) + Today's Booking Status (6 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <VenueOverviewDemandChart buckets={state.hourlyLoad} t={t} />
        </div>
        <div className="lg:col-span-6">
          <VenueOverviewStatusDonut items={state.atAGlance} t={t} />
        </div>
      </div>

      {/* Next Row: Up Next (8 cols) + Resource Pulse (4 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <VenueOverviewUpNext items={state.upNext} t={t} />
        </div>
        <div className="lg:col-span-4">
          <VenueOverviewResourcePulse items={state.resourceActivity} t={t} />
        </div>
      </div>

      {/* Money & Commercial Operations Snapshot */}
      <VenueOverviewMoneyCard t={t} />

      {/* Deferred Activity Note */}
      <VenueOverviewRecentActivityDeferred t={t} />
    </div>
  );
}
