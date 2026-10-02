"use client";

import React from "react";
import { AlertCircle, CalendarPlus, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import type { BookingWorkspacePrefill } from "../../domain/entities/Booking";
import { AvailabilityCandidates } from "../components/AvailabilityCandidates";
import { BookingSummaryActions } from "../components/BookingSummaryActions";
import { CustomerSelection } from "../components/CustomerSelection";
import { RequestCriteriaSection } from "../components/RequestCriteriaSection";
import { endLocalFor, useBookingWorkspaceViewModel } from "../viewmodels/useBookingWorkspaceViewModel";

const PROGRESS_KEYS = ["customer", "request", "availability", "hold", "confirm"] as const;

function displayError(
  value: string | null,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (value === "booking-validation-failed") return t("booking.validation.required");
  if (value === "booking-search-failed") return t("booking.availability.networkFailure");
  if (value === "booking-setup-failed" || value === "booking-hold-failed" || value === "booking-confirm-failed") {
    return t("booking.errors.generic");
  }
  return value || t("booking.errors.generic");
}

export const BookingWorkspaceView = React.memo(function BookingWorkspaceView({ prefill = {} }: { prefill?: BookingWorkspacePrefill }) {
  useModuleLocales(() => import("../../../locales"), "venue.booking");
  const { t, language, direction } = useI18n();
  const vm = useBookingWorkspaceViewModel(prefill);

  const canViewCustomers = usePermission(VENUE_PERMISSIONS.CUSTOMER_PARTY_VIEW);
  const canViewFacilities = usePermission(VENUE_PERMISSIONS.FACILITY_VIEW);
  const canViewProfiles = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_VIEW);
  const canViewResources = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_VIEW);
  const canSearch = usePermission(VENUE_PERMISSIONS.AVAILABILITY_SEARCH_VIEW);
  const canViewReservations = usePermission(VENUE_PERMISSIONS.RESERVATION_VIEW);
  const canCreateReservation = usePermission(VENUE_PERMISSIONS.RESERVATION_CREATE);
  const canCreateHold = usePermission(VENUE_PERMISSIONS.BOOKING_HOLD_CREATE);
  const canConfirm = usePermission(VENUE_PERMISSIONS.RESERVATION_CONFIRM);
  const canViewCommercials = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_VIEW_COMMERCIALS);
  const canCalculateQuote = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_CALCULATE_QUOTE);
  const canOverridePrice = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_OVERRIDE_PRICE);

  const canUseCoreFlow = canViewCustomers && canViewFacilities && canViewProfiles &&
    canViewResources && canSearch && canViewReservations && canCreateReservation && canCreateHold;
  const invalidCriteria = !vm.customer || !vm.criteria.facilityId || !vm.criteria.date ||
    vm.criteria.quantity < 1 || !endLocalFor(vm.criteria);
  const workflowLocked = vm.state.stage === "holding" || vm.state.stage === "held" ||
    vm.state.stage === "confirming" || vm.state.stage === "confirmed";

  if (!canUseCoreFlow) {
    return (
      <EmptyState
        icon={Lock}
        title={t("booking.permission.title")}
        description={t("booking.permission.description")}
      />
    );
  }

  if (vm.setupLoading) return <LoadingSpinner showText={false} />;

  if (vm.setupFeatureUnavailable || vm.state.stage === "featureUnavailable") {
    return (
      <EmptyState
        icon={Lock}
        title={t("booking.feature.title")}
        description={t("booking.feature.description")}
      />
    );
  }

  if (vm.setupError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("booking.errors.setup")}
        description={displayError(vm.setupError, t)}
        action={<Button variant="outline" onClick={() => void vm.refreshSetup()}>{t("booking.errors.retry")}</Button>}
      />
    );
  }

  return (
    <div className="space-y-6" dir={direction} data-testid="booking-workspace">
      <PageHeader
        icon={CalendarPlus}
        title={t("booking.title")}
        description={t("booking.description")}
      />

      <ol className="grid grid-cols-2 gap-2 rounded-xl border border-nx-border bg-nx-surface p-3 sm:grid-cols-5" aria-label={t("booking.title")}>
        {PROGRESS_KEYS.map((key, index) => (
          <li key={key} className="flex items-center gap-2 text-sm text-nx-ink-2">
            <Badge variant="outline">{index + 1}</Badge>
            <span>{t(`booking.progress.${key}`)}</span>
          </li>
        ))}
      </ol>

      {!canConfirm && (
        <Alert variant="info">
          <AlertTitle>{t("booking.confirm.noPermissionTitle")}</AlertTitle>
          <AlertDescription>{t("booking.permission.confirmOnly")}</AlertDescription>
        </Alert>
      )}

      {vm.state.stage === "error" && (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>{t("booking.errors.generic")}</AlertTitle>
          <AlertDescription>{displayError(vm.state.errorMessage, t)}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="space-y-6">
          <CustomerSelection
            t={t}
            canViewCustomers={canViewCustomers}
            customer={vm.customer}
            results={vm.customerResults}
            searching={vm.customerSearching}
            onSearch={vm.searchCustomers}
            onSelect={vm.selectCustomer}
            onCreateCustomer={vm.createCustomer}
            onClear={vm.clearCustomer}
          />
          <RequestCriteriaSection
            t={t}
            criteria={vm.criteria}
            facilities={vm.facilities}
            resources={vm.resourceOptions}
            resourceKinds={vm.resourceKindOptions}
            usageTypes={vm.usageTypeOptions}
            disabled={workflowLocked}
            onChange={vm.setCriteria}
            onFacilityCreated={async (facilityId) => {
              await vm.refreshSetup();
              vm.setCriteria({ facilityId });
            }}
          />
        </div>

        <div className="space-y-6">
          <AvailabilityCandidates
            t={t}
            locale={language}
            stage={vm.state.stage}
            candidates={vm.state.candidates}
            selected={vm.state.selectedCandidate}
            partialFailure={vm.state.partialSearchFailure}
            canSearch={canSearch}
            searchDisabled={invalidCriteria || workflowLocked}
            onSearch={vm.searchAvailability}
            onSelect={vm.selectCandidate}
          />
          <BookingSummaryActions
            t={t}
            locale={language}
            customer={vm.customer}
            state={vm.state}
            canHold={canCreateHold && canViewCommercials && canCalculateQuote && Boolean(vm.priceQuote) && !vm.priceQuoteLoading}
            canConfirm={canConfirm && canViewCommercials && canCalculateQuote}
            priceQuote={vm.priceQuote}
            priceQuoteLoading={vm.priceQuoteLoading}
            priceQuoteError={vm.priceQuoteError}
            canOverridePrice={canOverridePrice}
            priceOverrideLoading={vm.priceOverrideLoading}
            onHold={vm.createHold}
            onConfirm={vm.confirm}
            onExpired={vm.markHoldExpired}
            onSearchAgain={vm.searchAvailability}
            onCreateAnother={vm.createAnother}
            onOverridePrice={vm.applyPriceOverride}
          />
        </div>
      </div>
    </div>
  );
});
