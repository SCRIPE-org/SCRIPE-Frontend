"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Layers,
  CircleDollarSign,
  Ban,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { evaluateCourtReadiness } from "../../domain/entities/ResourceWorkspaceItem";
import { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";
import { ResourceGeneralTab } from "../components/ResourceGeneralTab";
import { ResourceWorkingHoursTab } from "../components/ResourceWorkingHoursTab";
import { ResourceBookingRulesTab } from "../components/ResourceBookingRulesTab";
import { ResourcePricingTab } from "../components/ResourcePricingTab";
import { ResourceClosuresTab } from "../components/ResourceClosuresTab";

interface Props {
  resourceId: string;
}

export function resolveResourceDetailTab(raw: string | null): string {
  if (!raw) return "general";
  const lower = raw.toLowerCase().trim();
  if (lower === "workinghours" || lower === "hours" || lower === "schedule" || lower === "time") {
    return "workingHours";
  }
  if (lower === "bookingrules" || lower === "rules" || lower === "slots" || lower === "booking") {
    return "bookingRules";
  }
  if (lower === "pricing" || lower === "rates" || lower === "price" || lower === "prices") {
    return "pricing";
  }
  if (
    lower === "closures" ||
    lower === "maintenance" ||
    lower === "closure" ||
    lower === "blocks"
  ) {
    return "closures";
  }
  return "general";
}

export function ResourceDetailView({ resourceId }: Props) {
  useModuleLocales(() => import("../../../locales"), "venue.resources");
  const { t, direction } = useI18n();
  const searchParams = useSearchParams();
  const vm = useResourceDetailViewModel(resourceId);
  const [activeTab, setActiveTab] = useState(() =>
    resolveResourceDetailTab(searchParams.get("tab"))
  );

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(resolveResourceDetailTab(tabParam));
    }
  }, [searchParams]);

  if (vm.loading && !vm.resource) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner showText={false} />
      </div>
    );
  }

  if (vm.error && !vm.resource) {
    return (
      <div className="mx-auto my-12 max-w-lg p-6" dir={direction}>
        <Alert variant="destructive">
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/venue/resources">
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              <span>{t("resources.detail.back", { defaultValue: "Back to Courts & Spaces" })}</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Sanitize internal architecture names so normal operators never see "Schedulable Resource" or "Resource Profile"
  const getCleanCategory = () => {
    const raw = vm.profile?.name ?? vm.profile?.resourceKindCode;
    if (!raw) return "Court";
    const lower = raw.toLowerCase();
    if (
      lower.includes("schedulable") ||
      lower.includes("profile") ||
      lower.includes("facility resource")
    ) {
      return "Court";
    }
    return raw;
  };

  const readiness = evaluateCourtReadiness({
    isPublished: Boolean(vm.resource?.isPublished),
    profileId: vm.profile?.id,
    slotDurationMinutes: vm.resource?.slotPolicy?.slotDurationMinutes,
    pricePerSlot: vm.priceConfig?.unitPrice,
    hasCalendar: Boolean(vm.calendar?.windows && vm.calendar.windows.length > 0),
  });
  const isReady = readiness.state === "Active";

  return (
    <div className="space-y-6" dir={direction} data-testid="resource-detail-view">
      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-nx-ink-2">
          <Link href="/venue/resources">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t("resources.detail.back", { defaultValue: "Back to Courts & Spaces" })}</span>
          </Link>
        </Button>
      </div>

      {/* Court Header */}
      <div className="flex flex-col gap-3 border-b border-nx-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-nx-ink">{vm.resource?.name}</h1>
            <Badge variant="outline" className="text-xs font-medium">
              {getCleanCategory()}
            </Badge>
            {isReady ? (
              <Badge
                variant="success"
                className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                {t("resources.card.statusPublished", { defaultValue: "Active" })}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-300 bg-amber-50 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              >
                {t("resources.card.setupRequired", { defaultValue: "Setup Required" })}
              </Badge>
            )}
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-nx-ink-2">
            <Building2 className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            <span>{vm.facility?.name ?? "Main Branch"}</span>
            <span className="text-nx-line">Â·</span>
            <Clock className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            <span>{vm.profile?.operatingPolicy?.timeZoneId ?? "UTC"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href={`/venue/calendar?resourceId=${encodeURIComponent(resourceId)}`}>
              <CalendarDays className="size-4 text-nx-accent" aria-hidden="true" />
              <span>{t("resources.card.calendar", { defaultValue: "Calendar" })}</span>
            </Link>
          </Button>
          {isReady ? (
            <Button asChild size="sm" className="gap-1.5 text-xs font-bold">
              <Link
                href={`/venue/calendar?newBooking=true&resourceId=${encodeURIComponent(
                  resourceId
                )}&facilityId=${encodeURIComponent(vm.facility?.id ?? vm.profile?.facilityId ?? "")}`}
              >
                <span>{t("resources.card.book", { defaultValue: "Book" })}</span>
              </Link>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-amber-300 text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              onClick={() => {
                if (readiness.missingActions.length > 0) {
                  setActiveTab(readiness.missingActions[0].tab);
                }
              }}
            >
              <span>{t("resources.card.completeSetup", { defaultValue: "Complete Setup" })}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Setup Required Banner with exact actionable missing steps */}
      {!isReady && (
        <Alert className="flex flex-col gap-2 border-amber-300 bg-amber-50/60 py-2.5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle
              className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <AlertDescription className="text-xs font-semibold">
              {t("resources.card.setupRequired", { defaultValue: "Setup Required" })}:{" "}
              {readiness.missingActions.map((a) => a.label).join(" · ")}
            </AlertDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 self-start sm:self-auto">
            {readiness.missingActions.map((action) => (
              <Button
                key={action.id}
                size="sm"
                variant="outline"
                disabled={vm.saving}
                onClick={() => {
                  if (action.id === "publish" || action.id === "publish-court") {
                    void vm.publishCourt();
                  } else {
                    setActiveTab(action.tab);
                  }
                }}
                className="h-7 border-amber-400 text-xs text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/40"
              >
                {(action.id === "publish" || action.id === "publish-court") && vm.saving
                  ? "Publishing..."
                  : action.label}
              </Button>
            ))}
          </div>
        </Alert>
      )}

      {/* Success feedback alert */}
      {vm.feedback && (
        <Alert variant="success" className="py-2.5">
          <CheckCircle2
            className="size-4 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <AlertDescription className="text-xs font-medium">
            {t(`resources.${vm.feedback}`, { defaultValue: "Settings saved successfully." })}
          </AlertDescription>
        </Alert>
      )}

      {/* Error alert */}
      {vm.error && (
        <Alert variant="destructive" className="py-2.5">
          <AlertDescription className="text-xs">{vm.error}</AlertDescription>
        </Alert>
      )}

      {/* 5 Simplified Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="border border-nx-line bg-nx-surface p-1">
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <Layers className="size-3.5" aria-hidden="true" />
            <span>{t("resources.tabs.general", { defaultValue: "General" })}</span>
          </TabsTrigger>
          <TabsTrigger value="workingHours" className="gap-1.5 text-xs">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>{t("resources.tabs.workingHours", { defaultValue: "Working Hours" })}</span>
          </TabsTrigger>
          <TabsTrigger value="bookingRules" className="gap-1.5 text-xs">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <span>{t("resources.tabs.bookingRules", { defaultValue: "Booking Rules" })}</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5 text-xs">
            <CircleDollarSign className="size-3.5" aria-hidden="true" />
            <span>{t("resources.tabs.pricing", { defaultValue: "Pricing" })}</span>
          </TabsTrigger>
          <TabsTrigger value="closures" className="gap-1.5 text-xs">
            <Ban className="size-3.5" aria-hidden="true" />
            <span>{t("resources.tabs.closures", { defaultValue: "Closures" })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <ResourceGeneralTab vm={vm} />
        </TabsContent>

        <TabsContent value="workingHours">
          <ResourceWorkingHoursTab vm={vm} />
        </TabsContent>

        <TabsContent value="bookingRules">
          <ResourceBookingRulesTab vm={vm} />
        </TabsContent>

        <TabsContent value="pricing">
          <ResourcePricingTab vm={vm} />
        </TabsContent>

        <TabsContent value="closures">
          <ResourceClosuresTab vm={vm} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
