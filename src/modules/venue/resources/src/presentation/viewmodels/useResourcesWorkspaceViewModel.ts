"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import type { FacilityResourceProfile } from "@modules/venue/facility-resource-profile/src/domain/entities/FacilityResourceProfile";
import type { SchedulableResource } from "@modules/venue/schedulable-resource/src/domain/entities/SchedulableResource";
import type {
  FirstTimeSetupInput,
  ResourceWorkspaceItem,
} from "../../domain/entities/ResourceWorkspaceItem";

const PAGE_SIZE = 100;

export function useResourcesWorkspaceViewModel() {
  const {
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
    availabilityRepository,
    commercialPricingRepository,
  } = getVenueContainer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [profiles, setProfiles] = useState<FacilityResourceProfile[]>([]);
  const [resources, setResources] = useState<SchedulableResource[]>([]);
  const [prices, setPrices] = useState<Map<string, { unitPrice: number; currencyCode: string }>>(new Map());
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSubmitting, setWizardSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [facilityPage, profilePage, resourcePage] = await Promise.all([
        facilityRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
        facilityResourceProfileRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
        schedulableResourceRepository.getAll({ page: 1, pageSize: PAGE_SIZE }),
      ]);

      setFacilities(facilityPage.items);
      setProfiles(profilePage.items);
      setResources(resourcePage.items);

      // Fetch pricing for non-composite resources
      const nonComposite = resourcePage.items.filter((r) => !r.isComposite);
      const priceMap = new Map<string, { unitPrice: number; currencyCode: string }>();

      await Promise.all(
        nonComposite.map(async (r) => {
          try {
            const config = await commercialPricingRepository.getResourceConfiguration(r.id);
            if (config && config.unitPrice != null) {
              priceMap.set(r.id, {
                unitPrice: config.unitPrice,
                currencyCode: config.currencyCode || "EGP",
              });
            }
          } catch {
            // Price may not be configured yet
          }
        })
      );

      setPrices(priceMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [commercialPricingRepository, facilityRepository, facilityResourceProfileRepository, schedulableResourceRepository]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const profileMap = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const facilityMap = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities]);

  const items: ResourceWorkspaceItem[] = useMemo(() => {
    return resources
      .filter((r) => !r.isComposite)
      .map((r) => {
        const profile = profileMap.get(r.facilityResourceProfileId);
        const facility = profile ? facilityMap.get(profile.facilityId) : undefined;
        const price = prices.get(r.id);
        const slotDuration = r.slotPolicy?.slotDurationMinutes ?? 60;
        const startIncrement = r.slotPolicy?.startIncrementMinutes ?? slotDuration;
        const timeZoneId = profile?.operatingPolicy?.timeZoneId ?? "UTC";

        return {
          id: r.id,
          name: r.name,
          sportType: profile?.name ?? profile?.resourceKindCode ?? "Court",
          profileId: profile?.id ?? "",
          facilityId: facility?.id ?? "",
          facilityName: facility?.name ?? "Main Branch",
          capacity: r.capacity?.maxConcurrentUsage ?? r.unitCount ?? 1,
          workingHoursSummary: "Open 24/7",
          isOpen247: true,
          slotDurationMinutes: slotDuration,
          startIncrementMinutes: startIncrement,
          pricePerSlot: price?.unitPrice ?? null,
          currencyCode: price?.currencyCode ?? "EGP",
          isPublished: r.isPublished,
          timeZoneId,
        };
      });
  }, [facilityMap, prices, profileMap, resources]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchFacility = !selectedFacilityId || item.facilityId === selectedFacilityId;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sportType.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFacility && matchQuery;
    });
  }, [items, searchQuery, selectedFacilityId]);

  const executeFirstTimeSetup = useCallback(
    async (input: FirstTimeSetupInput): Promise<boolean> => {
      setWizardSubmitting(true);
      try {
        // 1. Resolve or create Facility (Branch)
        let facilityId = facilities.find(
          (f) => f.name.toLowerCase() === input.branchName.trim().toLowerCase()
        )?.id;

        if (!facilityId) {
          const code = input.branchName.trim().replace(/\s+/g, "_").toUpperCase().slice(0, 30);
          facilityId = await facilityRepository.create({
            name: input.branchName.trim(),
            code,
            venueProfileId: "",
            description: `${input.branchName.trim()} sports branch`,
          });
        }

        // 2. Resolve or create Resource Profile (Sport type)
        let profile = profiles.find(
          (p) =>
            p.facilityId === facilityId &&
            p.name.toLowerCase() === input.sportType.trim().toLowerCase()
        );

        let profileId = profile?.id;

        if (!profileId) {
          const profileCode = `${input.sportType.trim().toUpperCase()}_${Date.now().toString().slice(-4)}`;
          profileId = await facilityResourceProfileRepository.create({
            facilityId,
            code: profileCode,
            name: input.sportType.trim(),
            resourceKindCode: input.sportType.trim(),
            description: `${input.sportType.trim()} courts`,
            timeZoneId: input.timeZoneId,
            days: 127, // All 7 days
            opensAt: input.customWorkingHours?.opensAt ?? "00:00",
            closesAt: input.customWorkingHours?.closesAt ?? "23:59",
            setupBufferMinutes: 0,
            cleanupBufferMinutes: 0,
            usageTypes: [{ code: "STANDARD", label: "Standard Match" }],
          });
        }

        // 3. Create courts
        const weekDays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ] as const;

        const effectiveFrom = new Date().toISOString().slice(0, 10);

        for (const courtName of input.courts) {
          if (!courtName.trim()) continue;

          // Create Schedulable Resource
          const resourceId = await schedulableResourceRepository.create({
            facilityResourceProfileId: profileId,
            name: courtName.trim(),
            isComposite: false,
            unitCount: 1,
            allocationMode: "SingleUnit",
            maxConcurrentUsage: 1,
            slotPolicy: {
              slotDurationMinutes: input.slotDurationMinutes,
              startIncrementMinutes: input.startIncrementMinutes,
              timeZoneId: input.timeZoneId,
              allowMultiSlot: false,
            },
          });

          // Publish
          try {
            await schedulableResourceRepository.publish(resourceId);
          } catch {
            // Non-blocking if validation requirements differ
          }

          // Save base availability calendar
          const windows = input.isOpen247
            ? weekDays.map((dayOfWeek) => ({
                dayOfWeek,
                startLocal: "00:00",
                endLocal: "23:59",
                capacityOverride: null,
              }))
            : weekDays.map((dayOfWeek) => ({
                dayOfWeek,
                startLocal: input.customWorkingHours?.opensAt ?? "08:00",
                endLocal: input.customWorkingHours?.closesAt ?? "00:00",
                capacityOverride: null,
              }));

          try {
            await availabilityRepository.saveCalendar(null, {
              resourceId,
              timeZoneId: input.timeZoneId,
              effectiveFrom,
              effectiveTo: null,
              windows,
            });
          } catch {
            // Base calendar creation fallback
          }

          // Configure rental pricing
          if (input.pricePerSlot > 0) {
            try {
              await commercialPricingRepository.configureResourcePrice({
                schedulableResourceId: resourceId,
                displayName: `${courtName.trim()} Standard Rate`,
                currencyCode: input.currencyCode || "EGP",
                unitPrice: input.pricePerSlot,
                effectiveFromUtc: new Date().toISOString(),
                minDurationMinutes: input.slotDurationMinutes,
                maxDurationMinutes: null,
                incrementMinutes: input.startIncrementMinutes,
                taxCategoryId: null,
                idempotencyKey: crypto.randomUUID(),
              });
            } catch {
              // Non-blocking pricing configuration
            }
          }
        }

        await loadData();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to execute setup journey");
        return false;
      } finally {
        setWizardSubmitting(false);
      }
    },
    [
      availabilityRepository,
      commercialPricingRepository,
      facilities,
      facilityRepository,
      facilityResourceProfileRepository,
      loadData,
      profiles,
      schedulableResourceRepository,
    ]
  );

  return {
    loading,
    error,
    items: filteredItems,
    allItems: items,
    facilities,
    selectedFacilityId,
    setSelectedFacilityId,
    searchQuery,
    setSearchQuery,
    wizardOpen,
    setWizardOpen,
    wizardSubmitting,
    executeFirstTimeSetup,
    refresh: loadData,
  };
}
