"use client";

import { useCallback, useEffect, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import type { FacilityResourceProfile } from "@modules/venue/facility-resource-profile/src/domain/entities/FacilityResourceProfile";
import type { SchedulableResource } from "@modules/venue/schedulable-resource/src/domain/entities/SchedulableResource";
import type {
  AvailabilityCalendar,
  AvailabilityWindow,
  ResourceBlock,
  ResourceBlockKind,
  WeekDay,
} from "@modules/venue/availability/src/domain/entities/Availability";
import type {
  ResourceRentalPriceConfiguration,
  TaxCategory,
} from "@modules/venue/commercial/src/domain/entities/CommercialPricing";

const WEEK_DAYS: WeekDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function useResourceDetailViewModel(resourceId: string) {
  const {
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
    availabilityRepository,
    commercialPricingRepository,
  } = getVenueContainer();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [resource, setResource] = useState<SchedulableResource | null>(null);
  const [profile, setProfile] = useState<FacilityResourceProfile | null>(null);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [calendar, setCalendar] = useState<AvailabilityCalendar | null>(null);
  const [priceConfig, setPriceConfig] = useState<ResourceRentalPriceConfiguration | null>(null);
  const [taxCategories, setTaxCategories] = useState<TaxCategory[]>([]);
  const [maintenanceBlocks, setMaintenanceBlocks] = useState<ResourceBlock[]>([]);
  const [blackoutBlocks, setBlackoutBlocks] = useState<ResourceBlock[]>([]);

  const loadData = useCallback(async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await schedulableResourceRepository.getById(resourceId);
      setResource(res);

      const [prof, cal, taxes, maint, black] = await Promise.all([
        facilityResourceProfileRepository.getById(res.facilityResourceProfileId).catch(() => null),
        availabilityRepository.getCurrentCalendar(resourceId).catch(() => null),
        commercialPricingRepository.getTaxCategories().catch(() => []),
        availabilityRepository.getBlocks("maintenance", resourceId).catch(() => []),
        availabilityRepository.getBlocks("blackout", resourceId).catch(() => []),
      ]);

      setProfile(prof);
      setCalendar(cal);
      setTaxCategories(taxes);
      setMaintenanceBlocks(maint);
      setBlackoutBlocks(black);

      if (prof?.facilityId) {
        const fac = await facilityRepository.getById(prof.facilityId).catch(() => null);
        setFacility(fac);
      }

      try {
        const pConfig = await commercialPricingRepository.getResourceConfiguration(resourceId);
        setPriceConfig(pConfig);
      } catch {
        setPriceConfig(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resource details");
    } finally {
      setLoading(false);
    }
  }, [
    availabilityRepository,
    commercialPricingRepository,
    facilityRepository,
    facilityResourceProfileRepository,
    resourceId,
    schedulableResourceRepository,
  ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateGeneral = useCallback(
    async (input: { name: string; capacity: number }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      setFeedback(null);
      try {
        await schedulableResourceRepository.update(resource.id, {
          ...resource.data,
          name: input.name.trim(),
          capacity: {
            allocationMode: resource.capacity?.allocationMode ?? "SingleUnit",
            maxConcurrentUsage: input.capacity,
            overbookingAllowed: resource.capacity?.overbookingAllowed ?? false,
          },
        });
        setFeedback("general.saved");
        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update general details");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadData, resource, schedulableResourceRepository]
  );

  const updateWorkingHours = useCallback(
    async (input: { isOpen247: boolean; windows?: AvailabilityWindow[] }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      setFeedback(null);
      try {
        const timeZoneId = profile?.operatingPolicy?.timeZoneId ?? "UTC";
        const effectiveFrom = calendar?.effectiveFrom ?? new Date().toISOString().slice(0, 10);

        const targetWindows: AvailabilityWindow[] = input.isOpen247
          ? WEEK_DAYS.map((dayOfWeek) => ({
              dayOfWeek,
              startLocal: "00:00",
              endLocal: "23:59",
              capacityOverride: null,
            }))
          : input.windows && input.windows.length > 0
          ? input.windows
          : WEEK_DAYS.map((dayOfWeek) => ({
              dayOfWeek,
              startLocal: "08:00",
              endLocal: "00:00",
              capacityOverride: null,
            }));

        await availabilityRepository.saveCalendar(calendar, {
          resourceId: resource.id,
          timeZoneId,
          effectiveFrom,
          effectiveTo: null,
          windows: targetWindows,
        });

        setFeedback("workingHours.saved");
        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update working hours");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [availabilityRepository, calendar, loadData, profile, resource]
  );

  const updateBookingRules = useCallback(
    async (input: { slotDurationMinutes: number; startIncrementMinutes: number }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      setFeedback(null);
      try {
        const timeZoneId = profile?.operatingPolicy?.timeZoneId ?? "UTC";
        await schedulableResourceRepository.update(resource.id, {
          ...resource.data,
          slotPolicy: {
            slotDurationMinutes: input.slotDurationMinutes,
            startIncrementMinutes: input.startIncrementMinutes,
            timeZoneId,
            allowMultiSlot: false,
          },
        });

        setFeedback("bookingRules.saved");
        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update booking rules");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadData, profile, resource, schedulableResourceRepository]
  );

  const updatePricing = useCallback(
    async (input: { unitPrice: number; currencyCode: string; taxCategoryId?: string | null }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      setFeedback(null);
      try {
        const slotDuration = resource.slotPolicy?.slotDurationMinutes ?? 60;
        const startIncrement = resource.slotPolicy?.startIncrementMinutes ?? slotDuration;

        await commercialPricingRepository.configureResourcePrice({
          schedulableResourceId: resource.id,
          displayName: `${resource.name} Rate`,
          currencyCode: input.currencyCode || "EGP",
          unitPrice: input.unitPrice,
          effectiveFromUtc: new Date().toISOString(),
          minDurationMinutes: slotDuration,
          maxDurationMinutes: null,
          incrementMinutes: startIncrement,
          taxCategoryId: input.taxCategoryId ?? null,
          idempotencyKey: crypto.randomUUID(),
        });

        setFeedback("pricing.saved");
        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update pricing");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [commercialPricingRepository, loadData, resource]
  );

  const addClosure = useCallback(
    async (input: {
      kind: ResourceBlockKind;
      startLocal: string;
      endLocal: string;
      reason: string;
    }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      try {
        const timeZoneId = profile?.operatingPolicy?.timeZoneId ?? "UTC";
        await availabilityRepository.createBlock(input.kind, {
          resourceId: resource.id,
          timeZoneId,
          startLocal: input.startLocal,
          endLocal: input.endLocal,
          hardBlock: true,
          reason: input.reason.trim(),
        });

        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add closure");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [availabilityRepository, loadData, profile, resource]
  );

  const deleteClosure = useCallback(
    async (kind: ResourceBlockKind, block: ResourceBlock) => {
      setSaving(true);
      setError(null);
      try {
        await availabilityRepository.deleteBlock(kind, block);
        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete closure");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [availabilityRepository, loadData]
  );

  const isCalendar247 = Boolean(
    calendar?.windows &&
      calendar.windows.length >= 7 &&
      calendar.windows.every(
        (w) => w.startLocal === "00:00" && (w.endLocal === "23:59" || w.endLocal === "00:00")
      )
  );

  return {
    loading,
    saving,
    error,
    feedback,
    resource,
    profile,
    facility,
    calendar,
    priceConfig,
    taxCategories,
    maintenanceBlocks,
    blackoutBlocks,
    isCalendar247,
    updateGeneral,
    updateWorkingHours,
    updateBookingRules,
    updatePricing,
    addClosure,
    deleteClosure,
    refresh: loadData,
  };
}
