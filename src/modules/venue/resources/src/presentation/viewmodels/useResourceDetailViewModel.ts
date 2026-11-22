// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue";
import type { FacilityResourceProfile } from "@modules/venue";
import type {
  SchedulableResource,
  PublicationChecklistReport,
  ResourceAllocationMode,
} from "@modules/venue";
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
import {
  extractCourtPhotos,
  extractCourtBio,
  getDisplayCourtPhotos,
  packCourtPhotoMetadata,
} from "../../domain/court-photos";

const WEEK_DAYS: WeekDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Documentation for module export
 */
export function useResourceDetailViewModel(resourceId: string) {
  const {
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
    availabilityRepository,
    commercialPricingRepository,
    resourceMediaService,
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
  const [courtPhotos, setCourtPhotos] = useState<string[]>([]);
  const [activePhoto, setActivePhoto] = useState<string>("/images/venue/padel-court-indoor.svg");
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<PublicationChecklistReport | null>(null);
  const [checklistLoading, setChecklistLoading] = useState<boolean>(false);
  const [availableParentResources, setAvailableParentResources] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const pricingIntentRef = useRef<{
    fingerprint: string;
    key: string;
    effectiveFromUtc: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!resourceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await schedulableResourceRepository.getById(resourceId);
      setResource(res);
      const initialPhotos = getDisplayCourtPhotos(res.photoMetadata, res.description);
      setCourtPhotos(initialPhotos);
      setActivePhoto((prev) => (initialPhotos.includes(prev) ? prev : res.imageUrl || initialPhotos[0] || "/images/venue/padel-court-indoor.svg"));

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

      try {
        const siblings = await schedulableResourceRepository.getAll({
          facilityResourceProfileIds: [res.facilityResourceProfileId],
          page: 1,
          pageSize: 100,
        });
        if (siblings?.items) {
          setAvailableParentResources(
            siblings.items
              .filter((item) => item.id !== resourceId)
              .map((item) => ({ id: item.id, name: item.name }))
          );
        }
      } catch {
        setAvailableParentResources([]);
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
    void Promise.resolve().then(() => {
      void loadData();
    });
  }, [loadData]);

  const updateGeneral = useCallback(
    async (input: { name: string; capacity: number; description?: string }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      setFeedback(null);
      try {
        const bioToSave = input.description !== undefined ? input.description.trim() : extractCourtBio(resource.description);

        await schedulableResourceRepository.update(resource.id, {
          name: input.name.trim(),
          description: bioToSave,
          imageUrl: resource.imageUrl ?? null,
          photoMetadata: resource.photoMetadata ?? null,
          parentSchedulableResourceId: resource.parentSchedulableResourceId ?? null,
          isComposite: resource.isComposite,
          namedUnitLabel: resource.namedUnitLabel ?? null,
          unitCount: resource.unitCount > 0 ? resource.unitCount : 1,
          allocationMode: resource.capacity?.allocationMode ?? "SingleUnit",
          maxConcurrentUsage:
            input.capacity > 0 ? input.capacity : (resource.capacity?.maxConcurrentUsage ?? 1),
          slotPolicy: resource.slotPolicy
            ? {
                slotDurationMinutes: resource.slotPolicy.slotDurationMinutes,
                startIncrementMinutes: resource.slotPolicy.startIncrementMinutes,
                timeZoneId: resource.slotPolicy.timeZoneId ?? null,
                allowMultiSlot: resource.slotPolicy.allowMultiSlot ?? false,
              }
            : null,
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

  const uploadCourtPhoto = useCallback(
    async (file: File) => {
      if (!resource) return null;
      setUploadingPhoto(true);
      setError(null);
      try {
        const uploadResult = await resourceMediaService.uploadImage(file, resource.id);
        const uploadedUrl = uploadResult.url;
        const currentCustomPhotos = extractCourtPhotos(resource.photoMetadata, resource.description);
        const newCustomPhotos = [uploadedUrl, ...currentCustomPhotos.filter((p: string) => p !== uploadedUrl)];
        const currentBio = extractCourtBio(resource.description);
        const newPhotoMetadata = packCourtPhotoMetadata(newCustomPhotos);

        await schedulableResourceRepository.update(resource.id, {
          name: resource.name,
          description: currentBio,
          imageUrl: uploadedUrl,
          photoMetadata: newPhotoMetadata,
          parentSchedulableResourceId: resource.parentSchedulableResourceId ?? null,
          isComposite: resource.isComposite,
          namedUnitLabel: resource.namedUnitLabel ?? null,
          unitCount: resource.unitCount > 0 ? resource.unitCount : 1,
          allocationMode: resource.capacity?.allocationMode ?? "SingleUnit",
          maxConcurrentUsage: resource.capacity?.maxConcurrentUsage ?? 1,
          slotPolicy: resource.slotPolicy
            ? {
                slotDurationMinutes: resource.slotPolicy.slotDurationMinutes,
                startIncrementMinutes: resource.slotPolicy.startIncrementMinutes,
                timeZoneId: resource.slotPolicy.timeZoneId ?? null,
                allowMultiSlot: resource.slotPolicy.allowMultiSlot ?? false,
              }
            : null,
        });

        const displayPhotos = getDisplayCourtPhotos(newPhotoMetadata, currentBio);
        setCourtPhotos(displayPhotos);
        setActivePhoto(uploadedUrl);
        setFeedback("photo.uploaded");
        await loadData();
        return uploadedUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload photo");
        return null;
      } finally {
        setUploadingPhoto(false);
      }
    },
    [loadData, resource, resourceMediaService, schedulableResourceRepository]
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
              endLocal: "23:59:59",
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
    async (input: {
      slotDurationMinutes: number;
      startIncrementMinutes: number;
      allowMultiSlot?: boolean;
    }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      setFeedback(null);
      try {
        const timeZoneId = profile?.operatingPolicy?.timeZoneId ?? "UTC";
        await schedulableResourceRepository.update(resource.id, {
          name: resource.name,
          description: resource.description ?? null,
          parentSchedulableResourceId: resource.parentSchedulableResourceId ?? null,
          isComposite: resource.isComposite,
          namedUnitLabel: resource.namedUnitLabel ?? null,
          unitCount: resource.unitCount > 0 ? resource.unitCount : 1,
          allocationMode: resource.capacity?.allocationMode ?? "SingleUnit",
          maxConcurrentUsage: resource.capacity?.maxConcurrentUsage ?? 1,
          slotPolicy: {
            slotDurationMinutes: input.slotDurationMinutes,
            startIncrementMinutes: input.startIncrementMinutes,
            timeZoneId,
            allowMultiSlot: input.allowMultiSlot ?? false,
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
        const fingerprint = JSON.stringify([
          resource.id,
          input.currencyCode || "EGP",
          input.unitPrice,
          input.taxCategoryId ?? null,
          slotDuration,
          startIncrement,
        ]);
        if (pricingIntentRef.current?.fingerprint !== fingerprint) {
          pricingIntentRef.current = {
            fingerprint,
            key: crypto.randomUUID(),
            effectiveFromUtc: new Date().toISOString(),
          };
        }
        const intent = pricingIntentRef.current;

        await commercialPricingRepository.configureResourcePrice({
          schedulableResourceId: resource.id,
          displayName: `${resource.name} Rate`,
          currencyCode: input.currencyCode || "EGP",
          unitPrice: input.unitPrice,
          effectiveFromUtc: intent.effectiveFromUtc,
          minDurationMinutes: slotDuration,
          maxDurationMinutes: null,
          incrementMinutes: startIncrement,
          taxCategoryId: input.taxCategoryId ?? null,
          idempotencyKey: intent.key,
        });

        if (pricingIntentRef.current?.key === intent.key) pricingIntentRef.current = null;
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

  const publishCourt = useCallback(async () => {
    if (!resource) return false;
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      await schedulableResourceRepository.publish(resource.id);
      setFeedback("courtPublished");
      await loadData();
      return true;
    } catch (err) {
      try {
        const checklist = await schedulableResourceRepository.getPublicationChecklist(resource.id);
        if (checklist && !checklist.canPublish && checklist.blockers.length > 0) {
          const blockerText = checklist.blockers.map((b) => b.message).join("; ");
          setError(`Publication blockers: ${blockerText}`);
          return false;
        }
      } catch {
        // Fall back to original error
      }
      setError(err instanceof Error ? err.message : "Failed to publish court");
      return false;
    } finally {
      setSaving(false);
    }
  }, [loadData, resource, schedulableResourceRepository]);

  const loadChecklist = useCallback(async () => {
    if (!resourceId) return null;
    setChecklistLoading(true);
    try {
      const report = await schedulableResourceRepository.getPublicationChecklist(resourceId);
      setChecklist(report);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load publication checklist");
      return null;
    } finally {
      setChecklistLoading(false);
    }
  }, [resourceId, schedulableResourceRepository]);

  const updateAdvanced = useCallback(
    async (input: {
      allocationMode: ResourceAllocationMode;
      maxConcurrentUsage: number;
      isComposite: boolean;
      parentSchedulableResourceId: string | null;
      namedUnitLabel?: string | null;
    }) => {
      if (!resource) return false;
      setSaving(true);
      setError(null);
      setFeedback(null);
      try {
        await schedulableResourceRepository.update(resource.id, {
          name: resource.name,
          description: resource.description,
          imageUrl: resource.imageUrl ?? null,
          photoMetadata: resource.photoMetadata ?? null,
          parentSchedulableResourceId: input.parentSchedulableResourceId || null,
          isComposite: input.isComposite,
          namedUnitLabel: input.namedUnitLabel ?? null,
          unitCount: input.maxConcurrentUsage > 0 ? input.maxConcurrentUsage : 1,
          allocationMode: input.allocationMode,
          maxConcurrentUsage: input.maxConcurrentUsage > 0 ? input.maxConcurrentUsage : 1,
          slotPolicy: resource.slotPolicy
            ? {
                slotDurationMinutes: resource.slotPolicy.slotDurationMinutes,
                startIncrementMinutes: resource.slotPolicy.startIncrementMinutes,
                timeZoneId: resource.slotPolicy.timeZoneId ?? null,
                allowMultiSlot: resource.slotPolicy.allowMultiSlot ?? false,
              }
            : null,
        });
        setFeedback("advanced.saved");
        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update advanced settings");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadData, resource, schedulableResourceRepository]
  );

  const isCalendar247 = Boolean(
    calendar?.windows &&
    calendar.windows.length >= 7 &&
    calendar.windows.every(
      (w) =>
        w.startLocal === "00:00" &&
        (w.endLocal === "23:59:59" ||
          w.endLocal === "24:00" ||
          w.endLocal === "23:59" ||
          w.endLocal === "00:00")
    )
  );

  const deleteCourt = useCallback(async () => {
    if (!resource) return false;
    setSaving(true);
    setError(null);
    try {
      if (typeof (schedulableResourceRepository as any).deleteResource === "function") {
        await (schedulableResourceRepository as any).deleteResource(resource.id);
      } else {
        await schedulableResourceRepository.delete(resource.id);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete court");
      return false;
    } finally {
      setSaving(false);
    }
  }, [resource, schedulableResourceRepository]);

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
    courtPhotos,
    activePhoto,
    setActivePhoto,
    uploadingPhoto,
    uploadCourtPhoto,
    updateGeneral,
    updateWorkingHours,
    updateBookingRules,
    updatePricing,
    publishCourt,
    addClosure,
    deleteClosure,
    checklist,
    checklistLoading,
    loadChecklist,
    availableParentResources,
    updateAdvanced,
    deleteCourt,
    refresh: loadData,
  };
}
