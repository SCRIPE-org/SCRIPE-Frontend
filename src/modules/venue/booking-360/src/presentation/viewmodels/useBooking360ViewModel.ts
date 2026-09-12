"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type {
  Booking360OperationalAction,
  Booking360OperationalFeedbackKind,
  Booking360Reservation,
  Booking360State,
} from "../../domain/entities/Booking360";

const initialState: Booking360State = {
  stage: "loading", reservation: null, customer: null, resource: null, profile: null, facility: null,
  enrichmentLoading: false, customerError: false, resourceError: false, facilityError: false,
  activeAction: null, actionError: null, operationalFeedback: null,
};

function errorDetails(error: unknown): { statusCode?: number; errorCode?: string } {
  if (!(error instanceof Error)) return {};
  const typed = error as Error & {
    status?: number;
    details?: { statusCode?: number; errorCode?: string };
  };
  return { ...typed.details, statusCode: typed.details?.statusCode ?? typed.status };
}

function coreFailure(error: unknown): Booking360State["stage"] {
  const details = errorDetails(error);
  if (details.statusCode === 404) return "notFound";
  if (details.errorCode === "Error.Forbidden") return "featureUnavailable";
  return "error";
}

function conflict(error: unknown): boolean {
  const details = errorDetails(error);
  return details.statusCode === 409 || details.errorCode === "ENTITY_OPERATION_CONFLICT";
}

function operationalFailure(error: unknown): Booking360OperationalFeedbackKind {
  const { errorCode, statusCode } = errorDetails(error);
  if (errorCode === "ENTITY_CONCURRENCY_CONFLICT") return "concurrency";
  if (errorCode === "ENTITY_OPERATION_CONFLICT") return "invalidState";
  if ([
    "VALIDATION_FAILED", "VALIDATION_REQUIRED", "VALIDATION_MAX_LENGTH", "VALIDATION_INVALID_FORMAT",
  ].includes(errorCode ?? "") || statusCode === 400 || statusCode === 422) return "validation";
  // Feature-gate rejections are structured business 403s. Permission rejection remains a
  // separate state so operators are not told to seek access when the product capability is off.
  if (errorCode === "Error.Forbidden") return "feature";
  if (errorCode === "AUTH_FORBIDDEN" || statusCode === 403) return "permission";
  return "network";
}

function holdIsAuthoritativelyExpired(reservation: Booking360Reservation): boolean {
  return reservation.status === "Expired" ||
    ((reservation.status === "Held" || reservation.status === "PendingApproval") && !reservation.activeHold);
}

export function useBooking360ViewModel(
  reservationId: string,
  canViewReservation: boolean,
  canViewCustomer: boolean,
  canViewResource: boolean,
  canViewProfile: boolean,
  canViewFacility: boolean
) {
  const {
    booking360Repository, bookingRepository, customerRepository, schedulableResourceRepository,
    facilityResourceProfileRepository, facilityRepository,
  } = getVenueContainer();
  const [state, setState] = useState(initialState);
  const generation = useRef(0);
  const submitting = useRef(false);
  const actionKeys = useRef(new Map<string, string>());

  const load = useCallback(async () => {
    if (!canViewReservation || !reservationId) return null;
    const currentGeneration = ++generation.current;
    setState((current) => ({ ...current, stage: "loading", actionError: null }));
    try {
      const reservation = await booking360Repository.getById(reservationId);
      if (currentGeneration !== generation.current) return null;
      setState({ ...initialState, stage: "ready", reservation, enrichmentLoading: true });

      const [customerResult, resourceResult] = await Promise.allSettled([
        canViewCustomer ? customerRepository.getById(reservation.customerPartyId) : Promise.resolve(null),
        canViewResource ? schedulableResourceRepository.getById(reservation.resourceId) : Promise.resolve(null),
      ]);
      if (currentGeneration !== generation.current) return reservation;
      const customerSource = customerResult.status === "fulfilled" ? customerResult.value : null;
      const resourceSource = resourceResult.status === "fulfilled" ? resourceResult.value : null;
      let profile = null;
      let facility = null;
      let facilityId: string | null = null;
      let facilityError = false;
      let resourceError = resourceResult.status === "rejected";

      if (resourceSource && canViewProfile) {
        try {
          const source = await facilityResourceProfileRepository.getById(
            resourceSource.facilityResourceProfileId
          );
          profile = {
            name: source.name,
            timeZoneId: source.operatingPolicy?.timeZoneId ?? null,
          };
          facilityId = source.facilityId;
        } catch {
          resourceError = true;
        }
      }
      if (facilityId && canViewFacility) {
        try {
          const source = await facilityRepository.getById(facilityId);
          facility = { name: source.name };
        } catch {
          facilityError = true;
        }
      }
      if (currentGeneration !== generation.current) return reservation;
      setState((current) => ({
        ...current,
        reservation,
        customer: customerSource ? { displayName: customerSource.displayName } : null,
        resource: resourceSource ? { name: resourceSource.name } : null,
        profile,
        facility,
        enrichmentLoading: false,
        customerError: customerResult.status === "rejected", resourceError, facilityError,
      }));
      return reservation;
    } catch (error) {
      if (currentGeneration === generation.current) {
        setState({ ...initialState, stage: coreFailure(error) });
      }
      return null;
    }
  }, [
    booking360Repository, canViewCustomer, canViewFacility, canViewProfile, canViewReservation,
    canViewResource, customerRepository, facilityRepository, facilityResourceProfileRepository,
    reservationId, schedulableResourceRepository,
  ]);

  useEffect(() => { void load(); return () => { generation.current += 1; }; }, [load]);

  const confirm = useCallback(async () => {
    const reservation = state.reservation;
    if (submitting.current || state.stage !== "ready" || !reservation ||
      reservation.status !== "Held" || !reservation.activeHold) return;
    submitting.current = true;
    setState((current) => ({
      ...current, activeAction: "confirm", actionError: null, operationalFeedback: null,
    }));
    try {
      const mapKey = `${reservation.id}:confirm`;
      const key = actionKeys.current.get(mapKey) ?? crypto.randomUUID();
      actionKeys.current.set(mapKey, key);
      await bookingRepository.confirm(reservation.id, key);
      await load();
    } catch (error) {
      let actionError: Booking360State["actionError"] = "failed";
      if (conflict(error)) {
        const refreshed = await load();
        actionError = refreshed && holdIsAuthoritativelyExpired(refreshed)
          ? "expired"
          : "conflict";
      }
      setState((current) => ({ ...current, actionError }));
    } finally {
      submitting.current = false;
      setState((current) => ({ ...current, activeAction: null }));
    }
  }, [bookingRepository, load, state.reservation]);

interface TransitionOptions {
  reason?: string;
  rescheduleInput?: { resourceId: string; requestedStartUtc: string; requestedEndUtc: string };
  changeResourceInput?: { targetResourceId: string; requestedStartUtc: string; requestedEndUtc: string };
}

  const transition = useCallback(async (
    action: Exclude<Booking360OperationalAction, "confirm">,
    options?: TransitionOptions
  ) => {
    const reservation = state.reservation;
    if (submitting.current || state.stage !== "ready" || !reservation) return;

    const isEligible = action === "complete"
      ? reservation.status === "CheckedIn"
      : action === "checkIn" || action === "noShow" || action === "reschedule" || action === "changeResource"
      ? reservation.status === "Confirmed"
      : reservation.status === "Held" || reservation.status === "Confirmed";
    if (!isEligible) return;

    const normalizedReason = options?.reason?.trim() ?? "";
    if ((action === "noShow" || action === "cancel") && (!normalizedReason || normalizedReason.length > 1000)) {
      setState((current) => ({
        ...current,
        operationalFeedback: { action, kind: "validation", status: reservation.status },
      }));
      return;
    }

    const snapshot = state;
    submitting.current = true;
    setState((current) => ({
      ...current, activeAction: action, operationalFeedback: null, actionError: null,
    }));

    try {
      const mapKey = `${reservation.id}:${action}`;
      const idempotencyKey = actionKeys.current.get(mapKey) ?? crypto.randomUUID();
      actionKeys.current.set(mapKey, idempotencyKey);

      if (action === "checkIn") {
        await bookingRepository.checkIn(reservation.id, idempotencyKey);
      } else if (action === "complete") {
        await bookingRepository.complete(reservation.id, idempotencyKey);
      } else if (action === "noShow") {
        await bookingRepository.markNoShow(reservation.id, idempotencyKey, normalizedReason);
      } else if (action === "cancel") {
        await bookingRepository.cancel(reservation.id, idempotencyKey, normalizedReason);
      } else if (action === "reschedule" && options?.rescheduleInput) {
        await bookingRepository.reschedule(reservation.id, {
          resourceId: options.rescheduleInput.resourceId,
          requestedStartUtc: options.rescheduleInput.requestedStartUtc,
          requestedEndUtc: options.rescheduleInput.requestedEndUtc,
          idempotencyKey,
        });
      } else if (action === "changeResource" && options?.changeResourceInput) {
        await bookingRepository.changeResource(reservation.id, {
          targetResourceId: options.changeResourceInput.targetResourceId,
          requestedStartUtc: options.changeResourceInput.requestedStartUtc,
          requestedEndUtc: options.changeResourceInput.requestedEndUtc,
          idempotencyKey,
        });
      }

      const refreshed = await load();
      if (!refreshed) {
        setState({
          ...snapshot,
          activeAction: null,
          operationalFeedback: { action, kind: "network", status: snapshot.reservation?.status ?? null },
        });
        return;
      }
      setState((current) => ({
        ...current,
        activeAction: null,
        operationalFeedback: { action, kind: "success", status: refreshed.status },
      }));
    } catch (error) {
      let kind = operationalFailure(error);
      let authoritativeStatus: Booking360Reservation["status"] = reservation.status;

      if (kind === "concurrency" || kind === "invalidState") {
        const refreshed = await load();
        if (refreshed) authoritativeStatus = refreshed.status;
        else kind = "network";
      }

      setState((current) => {
        const base = current.stage === "ready" && current.reservation ? current : snapshot;
        return {
          ...base,
          activeAction: null,
          operationalFeedback: { action, kind, status: authoritativeStatus },
        };
      });
    } finally {
      submitting.current = false;
      setState((current) => ({ ...current, activeAction: null }));
    }
  }, [bookingRepository, load, state]);

  const checkIn = useCallback(() => transition("checkIn"), [transition]);
  const complete = useCallback(() => transition("complete"), [transition]);
  const markNoShow = useCallback((reason: string) => transition("noShow", { reason }), [transition]);
  const cancel = useCallback((reason: string) => transition("cancel", { reason }), [transition]);
  const reschedule = useCallback(
    (input: { resourceId: string; requestedStartUtc: string; requestedEndUtc: string }) =>
      transition("reschedule", { rescheduleInput: input }),
    [transition]
  );
  const changeResource = useCallback(
    (input: { targetResourceId: string; requestedStartUtc: string; requestedEndUtc: string }) =>
      transition("changeResource", { changeResourceInput: input }),
    [transition]
  );

  const holdExpired = useCallback(async () => {
    const refreshed = await load();
    if (refreshed && holdIsAuthoritativelyExpired(refreshed)) {
      setState((current) => ({ ...current, actionError: "expired" }));
    }
  }, [load]);

  return { state, refresh: load, confirm, checkIn, complete, markNoShow, cancel, reschedule, changeResource, holdExpired };
}
