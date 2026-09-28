"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import type { FacilityResourceProfile } from "@modules/venue/facility-resource-profile/src/domain/entities/FacilityResourceProfile";
import type { SchedulableResource } from "@modules/venue/schedulable-resource/src/domain/entities/SchedulableResource";
import type { PriceQuote } from "@modules/venue/commercial/src/domain/entities/CommercialPricing";
import type {
  AvailabilityCandidate,
  BookingRequestCriteria,
  CustomerSummary,
  BookingWorkspacePrefill,
} from "../../domain/entities/Booking";
import { isFeatureUnavailable, isOperationalConflict } from "../../domain/entities/Booking";
import {
  initialBookingWorkspaceState,
  reduceBookingWorkspace,
} from "./bookingWorkspaceState";

const PAGE_SIZE = 100;

export const initialBookingCriteria: BookingRequestCriteria = {
  facilityId: "",
  resourceId: "",
  date: "",
  startTime: "09:00",
  durationMinutes: 60,
  quantity: 1,
  resourceKindCode: "",
  usageTypeCode: "",
};

function criteriaFromPrefill(prefill: BookingWorkspacePrefill): BookingRequestCriteria {
  return {
    ...initialBookingCriteria,
    ...(prefill.facilityId ? { facilityId: prefill.facilityId } : {}),
    ...(prefill.resourceId ? { resourceId: prefill.resourceId } : {}),
    ...(prefill.date && /^\d{4}-\d{2}-\d{2}$/.test(prefill.date) ? { date: prefill.date } : {}),
    ...(prefill.startTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(prefill.startTime) ? { startTime: prefill.startTime } : {}),
    ...(Number.isInteger(prefill.durationMinutes) && prefill.durationMinutes! >= 15 && prefill.durationMinutes! <= 1440
      ? { durationMinutes: prefill.durationMinutes! }
      : {}),
  };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function endLocalFor(criteria: BookingRequestCriteria): string | null {
  const [hours, minutes] = criteria.startTime.split(":").map(Number);
  if (!criteria.date || !Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  const endMinutes = hours * 60 + minutes + criteria.durationMinutes;
  if (endMinutes <= hours * 60 + minutes || endMinutes >= 24 * 60) return null;
  const endHours = Math.floor(endMinutes / 60).toString().padStart(2, "0");
  const endMinutePart = (endMinutes % 60).toString().padStart(2, "0");
  return `${criteria.date}T${endHours}:${endMinutePart}`;
}

function candidateFingerprint(candidate: AvailabilityCandidate, customerId: string): string {
  return [
    customerId,
    candidate.resourceId,
    candidate.startUtc,
    candidate.endUtc,
    candidate.requestedQuantity,
  ].join("|");
}

export function useBookingWorkspaceViewModel(prefill: BookingWorkspacePrefill = {}) {
  const {
    bookingRepository,
    customerRepository,
    availabilityRepository,
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
    commercialPricingRepository,
  } = getVenueContainer();

  const [state, dispatch] = useReducer(reduceBookingWorkspace, initialBookingWorkspaceState);
  const [criteria, setCriteriaState] = useState<BookingRequestCriteria>(() => criteriaFromPrefill(prefill));
  const [customer, setCustomerState] = useState<CustomerSummary | null>(null);
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [profiles, setProfiles] = useState<FacilityResourceProfile[]>([]);
  const [resources, setResources] = useState<SchedulableResource[]>([]);
  const [setupLoading, setSetupLoading] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupFeatureUnavailable, setSetupFeatureUnavailable] = useState(false);
  const submittingRef = useRef(false);
  const draftRef = useRef<{ fingerprint: string; reservationId: string } | null>(null);
  const confirmKeyRef = useRef<string | null>(null);
  const quoteGenerationRef = useRef(0);
  const [priceQuote, setPriceQuote] = useState<PriceQuote | null>(null);
  const [priceQuoteLoading, setPriceQuoteLoading] = useState(false);
  const [priceQuoteError, setPriceQuoteError] = useState<string | null>(null);
  const [priceOverrideLoading, setPriceOverrideLoading] = useState(false);

  const loadSetup = useCallback(async () => {
    setSetupLoading(true);
    setSetupError(null);
    setSetupFeatureUnavailable(false);
    try {
      const [facilityPage, profilePage, resourcePage] = await Promise.all([
        facilityRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
        facilityResourceProfileRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
        schedulableResourceRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
      ]);
      setFacilities(facilityPage.items);
      setProfiles(profilePage.items);
      setResources(resourcePage.items);
      setCriteriaState((current) => ({
        ...current,
        facilityId: current.facilityId || facilityPage.items[0]?.id || "",
      }));
    } catch (error) {
      if (isFeatureUnavailable(error)) setSetupFeatureUnavailable(true);
      else setSetupError(errorMessage(error, "booking-setup-failed"));
    } finally {
      setSetupLoading(false);
    }
  }, [facilityRepository, facilityResourceProfileRepository, schedulableResourceRepository]);

  useEffect(() => {
    void loadSetup();
  }, [loadSetup]);

  const setCriteria = useCallback((patch: Partial<BookingRequestCriteria>) => {
    setCriteriaState((current) => ({
      ...current,
      ...patch,
      ...(("facilityId" in patch || "resourceKindCode" in patch || "usageTypeCode" in patch) && !("resourceId" in patch)
        ? { resourceId: "" }
        : {}),
    }));
    draftRef.current = null;
    confirmKeyRef.current = null;
    quoteGenerationRef.current += 1;
    setPriceQuote(null);
    setPriceQuoteError(null);
    dispatch({ type: "criteriaChanged" });
  }, []);

  const searchCustomers = useCallback(async (query: string) => {
    setCustomerSearching(true);
    try {
      const result = await customerRepository.search(query);
      setCustomerResults(result);
      return result;
    } finally {
      setCustomerSearching(false);
    }
  }, [customerRepository]);

  const selectCustomer = useCallback(async (id: string) => {
    const hydrated = await customerRepository.getById(id);
    setCustomerState(hydrated);
    setCustomerResults([]);
    draftRef.current = null;
    confirmKeyRef.current = null;
    quoteGenerationRef.current += 1;
    setPriceQuote(null);
    setPriceQuoteError(null);
    dispatch({ type: "customerChanged" });
    return hydrated;
  }, [customerRepository]);

  const createCustomer = useCallback(async (displayName: string, type?: "Person" | "Organization") => {
    setCustomerSearching(true);
    try {
      const created = await customerRepository.create(displayName, type);
      setCustomerState(created);
      setCustomerResults([]);
      draftRef.current = null;
      confirmKeyRef.current = null;
      quoteGenerationRef.current += 1;
      setPriceQuote(null);
      setPriceQuoteError(null);
      dispatch({ type: "customerChanged" });
      return created;
    } finally {
      setCustomerSearching(false);
    }
  }, [customerRepository]);

  const clearCustomer = useCallback(() => {
    setCustomerState(null);
    draftRef.current = null;
    confirmKeyRef.current = null;
    quoteGenerationRef.current += 1;
    setPriceQuote(null);
    setPriceQuoteError(null);
    dispatch({ type: "customerChanged" });
  }, []);

  const applicableProfiles = useMemo(
    () => profiles.filter((profile) =>
      (!criteria.facilityId || profile.facilityId === criteria.facilityId) &&
      (!criteria.resourceKindCode || profile.resourceKindCode === criteria.resourceKindCode) &&
      (!criteria.usageTypeCode || profile.usageTypes.some((usage) => usage.code === criteria.usageTypeCode))
    ),
    [criteria.facilityId, criteria.resourceKindCode, criteria.usageTypeCode, profiles]
  );

  const resourceKindOptions = useMemo(
    () => Array.from(new Set(
      profiles
        .filter((profile) => !criteria.facilityId || profile.facilityId === criteria.facilityId)
        .map((profile) => profile.resourceKindCode)
    )).sort(),
    [criteria.facilityId, profiles]
  );

  const usageTypeOptions = useMemo(() => {
    const relevant = profiles.filter((profile) =>
      (!criteria.facilityId || profile.facilityId === criteria.facilityId) &&
      (!criteria.resourceKindCode || profile.resourceKindCode === criteria.resourceKindCode)
    );
    return Array.from(
      new Map(relevant.flatMap((profile) => profile.usageTypes).map((usage) => [usage.code, usage])).values()
    );
  }, [criteria.facilityId, criteria.resourceKindCode, profiles]);

  const searchAvailability = useCallback(async () => {
    const endLocal = endLocalFor(criteria);
    if (!customer || !criteria.facilityId || !criteria.date || !endLocal || criteria.quantity < 1) {
      dispatch({ type: "searchFailed", message: "booking-validation-failed" });
      return [];
    }

    dispatch({ type: "searching" });
    const profileById = new Map(applicableProfiles.map((profile) => [profile.id, profile]));
    const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));
    const matchingResources = resources.filter((resource) =>
      resource.isPublished && !resource.isComposite &&
      (!criteria.resourceId || resource.id === criteria.resourceId) &&
      profileById.has(resource.facilityResourceProfileId)
    );
    const startLocal = `${criteria.date}T${criteria.startTime}`;

    const settled = await Promise.allSettled(matchingResources.map(async (resource) => {
      const profile = profileById.get(resource.facilityResourceProfileId)!;
      const timeZoneId = profile.operatingPolicy?.timeZoneId;
      if (!timeZoneId) throw new Error("booking-timezone-missing");
      const result = await availabilityRepository.search({
        resourceId: resource.id,
        timeZoneId,
        startLocal,
        endLocal,
        quantity: criteria.quantity,
      });
      const candidate: AvailabilityCandidate = {
        resourceId: result.resourceId,
        resourceName: result.resourceName || resource.name,
        facilityId: profile.facilityId,
        facilityName: facilityById.get(profile.facilityId)?.name ?? profile.name,
        profileName: profile.name,
        timeZoneId: result.timeZoneId,
        startUtc: result.startUtc,
        endUtc: result.endUtc,
        requestedQuantity: result.requestedQuantity,
        isAvailable: result.isAvailable,
        maximumCapacity: result.maximumCapacity,
        consumedCapacity: result.consumedCapacity,
        remainingCapacity: result.remainingCapacity,
        reasonCode: result.reasonCode,
        reason: result.reason,
      };
      return candidate;
    }));

    const candidates = settled
      .filter((entry): entry is PromiseFulfilledResult<AvailabilityCandidate> => entry.status === "fulfilled")
      .map((entry) => entry.value)
      .sort((left, right) => Number(right.isAvailable) - Number(left.isAvailable) || left.resourceName.localeCompare(right.resourceName));
    const failures = settled.filter((entry) => entry.status === "rejected");

    if (matchingResources.length > 0 && candidates.length === 0 && failures.length > 0) {
      if (failures.some((failure) => failure.status === "rejected" && isFeatureUnavailable(failure.reason))) {
        dispatch({ type: "featureUnavailable" });
        return [];
      }
      dispatch({
        type: "searchFailed",
        message: errorMessage((failures[0] as PromiseRejectedResult).reason, "booking-search-failed"),
      });
      return [];
    }

    dispatch({
      type: "searchSucceeded",
      candidates,
      partialFailure: failures.length > 0,
    });
    return candidates;
  }, [applicableProfiles, availabilityRepository, criteria, customer, facilities, resources]);

  const selectCandidate = useCallback(async (candidate: AvailabilityCandidate) => {
    dispatch({ type: "candidateSelected", candidate });
    const generation = ++quoteGenerationRef.current;
    setPriceQuote(null);
    setPriceQuoteError(null);
    if (!customer) return;
    setPriceQuoteLoading(true);
    try {
      const configuration = await commercialPricingRepository.getResourceConfiguration(candidate.resourceId);
      const quote = await commercialPricingRepository.calculateQuote({
        offeringId: configuration.offeringId,
        resourceId: candidate.resourceId,
        partyId: customer.id,
        quantity: candidate.requestedQuantity,
        requestedStartUtc: candidate.startUtc,
        requestedEndUtc: candidate.endUtc,
        currencyCode: configuration.currencyCode,
        expiresAtUtc: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
      if (generation === quoteGenerationRef.current) setPriceQuote(quote);
    } catch (error) {
      if (generation === quoteGenerationRef.current) {
        setPriceQuoteError(errorMessage(error, "booking-quote-failed"));
      }
    } finally {
      if (generation === quoteGenerationRef.current) setPriceQuoteLoading(false);
    }
  }, [commercialPricingRepository, customer]);

  const applyPriceOverride = useCallback(async (adjustmentAmount: number, reason: string) => {
    if (!priceQuote || !Number.isFinite(adjustmentAmount) || adjustmentAmount === 0
      || !reason.trim() || reason.trim().length > 500) return false;
    setPriceOverrideLoading(true);
    setPriceQuoteError(null);
    try {
      const applied = await commercialPricingRepository.overrideQuote(priceQuote.id, {
        adjustmentAmount,
        reason: reason.trim(),
        idempotencyKey: crypto.randomUUID(),
      });
      setPriceQuote((current) => current && current.id === priceQuote.id
        ? { ...current, grandTotal: applied.overriddenGrandTotal }
        : current);
      return true;
    } catch (error) {
      setPriceQuoteError(errorMessage(error, "booking-quote-override-failed"));
      return false;
    } finally {
      setPriceOverrideLoading(false);
    }
  }, [commercialPricingRepository, priceQuote]);

  const createHold = useCallback(async () => {
    if (submittingRef.current || !customer || !priceQuote || !state.selectedCandidate || !state.selectedCandidate.isAvailable) return;
    submittingRef.current = true;
    dispatch({ type: "holding" });
    try {
      const fingerprint = candidateFingerprint(state.selectedCandidate, customer.id);
      let reservationId = draftRef.current?.fingerprint === fingerprint
        ? draftRef.current.reservationId
        : null;
      if (!reservationId) {
        const draft = await bookingRepository.createDraft({
          resourceId: state.selectedCandidate.resourceId,
          customerPartyId: customer.id,
          requestedStartUtc: state.selectedCandidate.startUtc,
          requestedEndUtc: state.selectedCandidate.endUtc,
          quantity: state.selectedCandidate.requestedQuantity,
        });
        reservationId = draft.id;
        draftRef.current = { fingerprint, reservationId };
        dispatch({ type: "holding", reservationId });
      }

      const hold = await bookingRepository.createHold(reservationId, crypto.randomUUID());
      const reservation = await bookingRepository.getReservation(reservationId);
      confirmKeyRef.current = crypto.randomUUID();
      dispatch({ type: "held", result: hold, reservation });
    } catch (error) {
      if (isOperationalConflict(error)) {
        dispatch({ type: "holdConflict" });
      } else if (isFeatureUnavailable(error)) {
        dispatch({ type: "featureUnavailable" });
      } else {
        dispatch({ type: "operationFailed", message: errorMessage(error, "booking-hold-failed") });
      }
    } finally {
      submittingRef.current = false;
    }
  }, [bookingRepository, customer, priceQuote, state.selectedCandidate]);

  const markHoldExpired = useCallback(() => {
    draftRef.current = null;
    confirmKeyRef.current = null;
    dispatch({ type: "holdExpired" });
  }, []);

  const confirm = useCallback(async () => {
    if (submittingRef.current || state.stage !== "held" || !state.reservationId || !state.hold || !priceQuote) return;
    if (Date.parse(state.hold.expiresAtUtc) <= Date.now()) {
      dispatch({ type: "holdExpired" });
      return;
    }
    submittingRef.current = true;
    dispatch({ type: "confirming" });
    try {
      const key = confirmKeyRef.current ?? crypto.randomUUID();
      confirmKeyRef.current = key;
      await bookingRepository.confirm(state.reservationId, key, priceQuote.id);
      const reservation = await bookingRepository.getReservation(state.reservationId);
      dispatch({ type: "confirmed", reservation });
    } catch (error) {
      if (isOperationalConflict(error)) {
        draftRef.current = null;
        confirmKeyRef.current = null;
        dispatch({ type: "holdExpired" });
      } else if (isFeatureUnavailable(error)) {
        dispatch({ type: "featureUnavailable" });
      } else {
        dispatch({ type: "operationFailed", message: errorMessage(error, "booking-confirm-failed") });
      }
    } finally {
      submittingRef.current = false;
    }
  }, [bookingRepository, priceQuote, state.hold, state.reservationId, state.stage]);

  const createAnother = useCallback(() => {
    setCustomerState(null);
    setCustomerResults([]);
    setCriteriaState((current) => ({ ...initialBookingCriteria, facilityId: current.facilityId }));
    draftRef.current = null;
    confirmKeyRef.current = null;
    quoteGenerationRef.current += 1;
    setPriceQuote(null);
    setPriceQuoteError(null);
    dispatch({ type: "reset" });
  }, []);

  const resourceOptions = useMemo(() => {
    const profileIds = new Set(applicableProfiles.map((profile) => profile.id));
    return resources.filter((resource) => resource.isPublished && !resource.isComposite && profileIds.has(resource.facilityResourceProfileId));
  }, [applicableProfiles, resources]);

  return {
    state,
    criteria,
    setCriteria,
    customer,
    customerResults,
    customerSearching,
    searchCustomers,
    selectCustomer,
    createCustomer,
    clearCustomer,
    facilities,
    resourceKindOptions,
    usageTypeOptions,
    resourceOptions,
    setupLoading,
    setupError,
    setupFeatureUnavailable,
    priceQuote,
    priceQuoteLoading,
    priceQuoteError,
    priceOverrideLoading,
    refreshSetup: loadSetup,
    searchAvailability,
    selectCandidate,
    applyPriceOverride,
    createHold,
    markHoldExpired,
    confirm,
    createAnother,
  };
}
