// FILE-EXCEPTION: rule bypass for existing large file
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getVenueContainer } from "@modules/venue/di";
import type {
  Facility,
  FacilityResourceProfile,
  SchedulableResource,
  AvailabilityCalendar,
} from "@modules/venue";
import {
  evaluateCourtReadiness,
  type CourtCreationResult,
  type CourtSetupItem,
  type FirstTimeSetupInput,
  type ResourceWorkspaceItem,
} from "../../domain/entities/ResourceWorkspaceItem";
import { mapVenueError, getSavedFacilityId, saveFacilityId } from "@modules/venue";

const PAGE_SIZE = 100;

/**
 * Documentation for module export
 */
export function useResourcesWorkspaceViewModel() {
  const {
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
    availabilityRepository,
    commercialPricingRepository,
    venueProfileRepository,
    siteRepository,
  } = getVenueContainer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [profiles, setProfiles] = useState<FacilityResourceProfile[]>([]);
  const [resources, setResources] = useState<SchedulableResource[]>([]);
  const [prices, setPrices] = useState<
    Map<string, { unitPrice: number; currencyCode: string; effectiveFromUtc?: string | null }>
  >(new Map());
  const [calendars, setCalendars] = useState<Map<string, AvailabilityCalendar | null>>(new Map());
  const [selectedFacilityId, setSelectedFacilityIdState] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSubmitting, setWizardSubmitting] = useState(false);
  const [lastSetupResults, setLastSetupResults] = useState<CourtCreationResult[]>([]);
  const pricingIntentKeys = useRef(new Map<string, string>());

  const setSelectedFacilityId = useCallback((id: string) => {
    setSelectedFacilityIdState(id);
    if (id) {
      saveFacilityId(id);
    }
  }, []);

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

      // Auto-initialize selected facility from saved context if authorized and unselected
      if (facilityPage.items.length > 0) {
        setSelectedFacilityIdState((current) => {
          if (current) {
            const stillValid = facilityPage.items.some((f) => f.id === current);
            return stillValid ? current : "";
          }
          const saved = getSavedFacilityId(facilityPage.items);
          return facilityPage.items.length === 1 && saved ? saved : "";
        });
      }

      // Fetch pricing and availability calendars for non-composite resources
      const nonComposite = resourcePage.items.filter((r) => !r.isComposite);
      const priceMap = new Map<
        string,
        { unitPrice: number; currencyCode: string; effectiveFromUtc?: string | null }
      >();
      const calendarMap = new Map<string, AvailabilityCalendar | null>();

      await Promise.all(
        nonComposite.map(async (r) => {
          try {
            const config = await commercialPricingRepository.getResourceConfiguration(r.id);
            if (config && config.unitPrice != null) {
              priceMap.set(r.id, {
                unitPrice: config.unitPrice,
                currencyCode: config.currencyCode || "EGP",
                effectiveFromUtc: config.effectiveFromUtc || null,
              });
            }
          } catch {
            // Price may not be configured yet
          }

          if (availabilityRepository.getCurrentCalendar) {
            try {
              const cal = await availabilityRepository.getCurrentCalendar(r.id);
              if (cal) {
                calendarMap.set(r.id, cal);
              }
            } catch {
              // Calendar may not be configured yet
            }
          }
        })
      );

      setPrices(priceMap);
      setCalendars(calendarMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }, [
    availabilityRepository,
    commercialPricingRepository,
    facilityRepository,
    facilityResourceProfileRepository,
    schedulableResourceRepository,
  ]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadData();
    });
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
        const cal = calendars.get(r.id);
        const slotDuration = r.slotPolicy?.slotDurationMinutes ?? 60;
        const startIncrement = r.slotPolicy?.startIncrementMinutes ?? slotDuration;
        const timeZoneId = profile?.operatingPolicy?.timeZoneId ?? "UTC";

        let isOpen247 = false;
        let workingHoursSummary = "Open 24/7";
        let hasCalendar = false;

        if (cal && cal.windows && cal.windows.length > 0) {
          hasCalendar = true;
          const is247 =
            cal.windows.length >= 7 &&
            cal.windows.every(
              (w) =>
                w.startLocal === "00:00" &&
                (w.endLocal === "23:59:59" ||
                  w.endLocal === "24:00" ||
                  w.endLocal === "23:59" ||
                  w.endLocal === "00:00")
            );
          if (is247) {
            isOpen247 = true;
            workingHoursSummary = "Open 24/7";
          } else {
            isOpen247 = false;
            const w = cal.windows[0];
            workingHoursSummary = `${w.startLocal} - ${w.endLocal}`;
          }
        } else if (profile?.operatingPolicy) {
          const pol = profile.operatingPolicy;
          const is247 =
            pol.days === 127 &&
            pol.opensAt === "00:00" &&
            (pol.closesAt === "23:59" || pol.closesAt === "00:00");
          if (is247) {
            isOpen247 = true;
            workingHoursSummary = "Open 24/7";
          } else {
            isOpen247 = false;
            workingHoursSummary = `${pol.opensAt} - ${pol.closesAt}`;
          }
        }

        const hasCal =
          hasCalendar ||
          isOpen247 ||
          Boolean(workingHoursSummary && workingHoursSummary !== "Schedule Not Set");

        const readiness = evaluateCourtReadiness({
          isPublished: r.isPublished,
          profileId: profile?.id,
          slotDurationMinutes: slotDuration,
          pricePerSlot: price?.unitPrice ?? null,
          priceEffectiveFromUtc: price?.effectiveFromUtc ?? null,
          hasCalendar: hasCal,
        });

        return {
          id: r.id,
          name: r.name,
          sportType: profile?.name ?? profile?.resourceKindCode ?? "Court",
          profileId: profile?.id ?? "",
          facilityId: facility?.id ?? "",
          facilityName: facility?.name ?? "Main Branch",
          capacity: r.capacity?.maxConcurrentUsage ?? r.unitCount ?? 1,
          workingHoursSummary,
          isOpen247,
          hasCalendar,
          slotDurationMinutes: slotDuration,
          startIncrementMinutes: startIncrement,
          pricePerSlot: price?.unitPrice ?? null,
          currencyCode: price?.currencyCode ?? "EGP",
          priceEffectiveFromUtc: price?.effectiveFromUtc ?? null,
          isPublished: r.isPublished,
          timeZoneId,
          readinessState: readiness.state,
          readiness,
        };
      });
  }, [calendars, facilityMap, prices, profileMap, resources]);

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

  const metrics = useMemo(() => {
    const totalSpaces = items.length;
    const readySpaces = items.filter(
      (i) => i.readinessState === "Ready" || i.readinessState === "Active"
    ).length;
    const activatingSpaces = items.filter((i) => i.readinessState === "Pricing Activating").length;
    const setupRequired = items.filter((i) => i.readinessState === "Setup Required").length;
    const branchCount = new Set(facilities.map((f) => f.id)).size;
    return {
      totalSpaces,
      activeSpaces: readySpaces,
      readySpaces,
      activatingSpaces,
      setupRequired,
      branchCount,
    };
  }, [facilities, items]);

  // Bounded auto-revalidation when courts are in "Pricing Activating" state
  useEffect(() => {
    const activatingItems = items.filter(
      (i) => i.readinessState === "Pricing Activating" && i.priceEffectiveFromUtc
    );
    if (activatingItems.length === 0) return;

    const earliestUtc = activatingItems.reduce((earliest, cur) => {
      const ms = Date.parse(cur.priceEffectiveFromUtc!);
      return ms < earliest ? ms : earliest;
    }, Infinity);

    if (!Number.isFinite(earliestUtc)) return;

    const now = Date.now();
    const delayMs = Math.max(1000, Math.min(earliestUtc - now + 500, 30_000));
    const timer = setTimeout(() => {
      void loadData();
    }, delayMs);

    return () => clearTimeout(timer);
  }, [items, loadData]);

  const executeFirstTimeSetup = useCallback(
    async (input: FirstTimeSetupInput): Promise<boolean> => {
      setWizardSubmitting(true);
      setError(null);
      try {
        // 1. Resolve or create Facility (Branch)
        let facilityId = input.facilityId;

        if (!facilityId) {
          const matched = facilities.find(
            (f) => f.name.toLowerCase() === input.branchName.trim().toLowerCase()
          );
          if (matched) {
            facilityId = matched.id;
          }
        }

        if (!facilityId) {
          // Authoritatively resolve VenueProfileId from existing facility or tenant context
          let venueProfileId = facilities[0]?.venueProfileId || "";
          try {
            if (!venueProfileId && venueProfileRepository) {
              const profilesRes = await venueProfileRepository.getAll({ page: 1, pageSize: 10 });
              if (profilesRes.items.length > 0) {
                venueProfileId = profilesRes.items[0].id;
              }
            }
            if (!venueProfileId && siteRepository && venueProfileRepository) {
              // Orchestrate first-time setup: ensure Site exists first
              let siteId = "";
              const sitesRes = await siteRepository.getAll({ page: 1, pageSize: 10 });
              if (sitesRes.items.length > 0) {
                siteId = sitesRes.items[0].id;
              } else {
                siteId = await siteRepository.create({
                  name: input.branchName.trim() || "Main Sports Site",
                  timeZone: input.timeZoneId || "UTC",
                });
              }
              const vpCode = `VP_${Date.now().toString().slice(-6)}`;
              venueProfileId = await venueProfileRepository.create({
                siteId,
                name: input.branchName.trim() || "Main Venue",
                code: vpCode,
                description: `${input.branchName.trim()} venue profile`,
              });
            }
          } catch {
            // Context resolution fallback
          }

          if (!venueProfileId && facilities.length > 0) {
            venueProfileId = facilities[0].venueProfileId;
          }

          const code = input.branchName.trim().replace(/\s+/g, "_").toUpperCase().slice(0, 30);
          facilityId = await facilityRepository.create({
            name: input.branchName.trim(),
            code,
            venueProfileId: venueProfileId || "default",
            description: `${input.branchName.trim()} sports branch`,
          });
        }

        // 2. Resolve or create Resource Profile (Sport type)
        const profile = profiles.find(
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

        // 3. Create courts with granular persistence safety
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
        const results: CourtCreationResult[] = [];
        let anyFailed = false;

        const courtItemsToProcess: CourtSetupItem[] = (
          input.courtItems && input.courtItems.length > 0
            ? input.courtItems
            : input.courts
                .filter((c) => c.trim().length > 0)
                .map((name, idx) => ({
                  clientKey: `court-${idx}`,
                  name: name.trim(),
                  resourceId: input.existingCourtResources?.[name.trim()],
                }))
        ).filter((c) => c.name.trim().length > 0);

        for (const courtItem of courtItemsToProcess) {
          const trimmedName = courtItem.name.trim();
          const courtResult: CourtCreationResult = {
            name: trimmedName,
            resourceId: courtItem.resourceId,
            success: false,
            isCalendarSaved: courtItem.isCalendarSaved ?? false,
            isPublished: courtItem.isPublished ?? false,
            isPriceConfigured: courtItem.isPriceConfigured ?? false,
          };

          try {
            // 1. Create or update Schedulable Resource on retry
            let resourceId = courtItem.resourceId;

            if (!resourceId) {
              resourceId = await schedulableResourceRepository.create({
                facilityResourceProfileId: profileId,
                name: trimmedName,
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
              courtItem.resourceId = resourceId;
            } else {
              // Resource already exists: synchronize edited name safely without creating duplicate
              try {
                if (schedulableResourceRepository.update) {
                  await schedulableResourceRepository.update(resourceId, {
                    name: trimmedName,
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
                }
              } catch {
                // Name sync non-blocking
              }
            }
            courtResult.resourceId = resourceId;

            // 2. Save availability calendar (reuse if already verified)
            if (!courtItem.isCalendarSaved) {
              try {
                const windows = input.isOpen247
                  ? weekDays.map((dayOfWeek) => ({
                      dayOfWeek,
                      startLocal: "00:00",
                      endLocal: "23:59:59",
                      capacityOverride: null,
                    }))
                  : weekDays.map((dayOfWeek) => ({
                      dayOfWeek,
                      startLocal: input.customWorkingHours?.opensAt ?? "08:00",
                      endLocal: input.customWorkingHours?.closesAt ?? "00:00",
                      capacityOverride: null,
                    }));

                await availabilityRepository.saveCalendar(null, {
                  resourceId,
                  timeZoneId: input.timeZoneId,
                  effectiveFrom,
                  effectiveTo: null,
                  windows,
                });
                courtItem.isCalendarSaved = true;
                courtResult.isCalendarSaved = true;
              } catch (calErr) {
                console.error(`Calendar save failed for ${trimmedName}:`, calErr);
                courtResult.stepFailed = "calendar";
                courtResult.error =
                  calErr instanceof Error ? calErr.message : "Calendar setup failed";
                courtItem.stepFailed = "calendar";
                courtItem.error = courtResult.error;
                results.push(courtResult);
                anyFailed = true;
                continue;
              }
            }

            // 3. Publish FIRST if requested (publishImmediately !== false)
            if (input.publishImmediately !== false && !courtItem.isPublished) {
              try {
                await schedulableResourceRepository.publish(resourceId);
                courtItem.isPublished = true;
                courtResult.isPublished = true;
              } catch (pubErr) {
                console.error(`Publish failed for ${trimmedName}:`, pubErr);
                courtResult.stepFailed = "publish";
                courtResult.error =
                  pubErr instanceof Error ? pubErr.message : "Publication validation failed";
                courtItem.stepFailed = "publish";
                courtItem.error = courtResult.error;
                results.push(courtResult);
                anyFailed = true;
                continue;
              }
            }

            // 4. Configure rental pricing AFTER publication with a UTC future safety buffer
            if (
              input.pricePerSlot > 0 &&
              input.publishImmediately !== false &&
              !courtItem.isPriceConfigured
            ) {
              try {
                const pricingFingerprint = JSON.stringify([
                  input.currencyCode || "EGP",
                  input.pricePerSlot,
                  input.slotDurationMinutes,
                  input.startIncrementMinutes,
                ]);
                const pricingIntentId = `${courtItem.clientKey}:${resourceId}`;
                const idempotencyKey =
                  courtItem.priceIntentFingerprint === pricingFingerprint &&
                  courtItem.priceIntentKey
                    ? courtItem.priceIntentKey
                    : (pricingIntentKeys.current.get(pricingIntentId) ?? crypto.randomUUID());
                pricingIntentKeys.current.set(pricingIntentId, idempotencyKey);
                await commercialPricingRepository.configureResourcePrice({
                  schedulableResourceId: resourceId,
                  displayName: `${trimmedName} Standard Rate`,
                  currencyCode: input.currencyCode || "EGP",
                  unitPrice: input.pricePerSlot,
                  effectiveFromUtc: new Date(Date.now() + 15_000).toISOString(),
                  minDurationMinutes: input.slotDurationMinutes,
                  maxDurationMinutes: null,
                  incrementMinutes: input.startIncrementMinutes,
                  taxCategoryId: null,
                  idempotencyKey,
                });
                courtItem.isPriceConfigured = true;
                courtResult.isPriceConfigured = true;
              } catch (priceErr) {
                console.error(`Pricing setup failed for ${trimmedName}:`, priceErr);
                courtResult.stepFailed = "pricing";
                courtResult.error =
                  priceErr instanceof Error ? priceErr.message : "Pricing setup failed";
                courtItem.stepFailed = "pricing";
                courtItem.error = courtResult.error;
                results.push(courtResult);
                anyFailed = true;
                continue;
              }
            }

            courtResult.success = true;
            courtItem.success = true;
            courtItem.stepFailed = undefined;
            courtItem.error = undefined;
            results.push(courtResult);
          } catch (createErr) {
            console.error(`Creation failed for ${trimmedName}:`, createErr);
            courtResult.stepFailed = "create";
            courtResult.error =
              createErr instanceof Error ? createErr.message : "Court creation failed";
            courtItem.stepFailed = "create";
            courtItem.error = courtResult.error;
            results.push(courtResult);
            anyFailed = true;
          }
        }

        setLastSetupResults(results);
        await loadData();

        if (anyFailed) {
          const failedDetails = results
            .filter((r) => !r.success)
            .map((r) => `${r.name}: ${r.error || "Failed"}`)
            .join("; ");
          setError(`Partial setup: Some courts failed (${failedDetails})`);
          return false;
        }

        return true;
      } catch (err) {
        const safe = mapVenueError(err);
        setError(safe.message);
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
      siteRepository,
      venueProfileRepository,
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
    lastSetupResults,
    metrics,
    executeFirstTimeSetup,
    refresh: loadData,
  };
}
