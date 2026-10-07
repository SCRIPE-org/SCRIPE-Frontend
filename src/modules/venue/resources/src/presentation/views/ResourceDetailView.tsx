"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Layers,
  CircleDollarSign,
  Ban,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useI18n } from "@core/providers/i18n-provider";
import { VenueNav } from "@modules/venue/shared/src/presentation/components/VenueNav";
import { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";
import { ResourceGeneralTab } from "../components/ResourceGeneralTab";
import { ResourceWorkingHoursTab } from "../components/ResourceWorkingHoursTab";
import { ResourceBookingRulesTab } from "../components/ResourceBookingRulesTab";
import { ResourcePricingTab } from "../components/ResourcePricingTab";
import { ResourceClosuresTab } from "../components/ResourceClosuresTab";

interface Props {
  resourceId: string;
}

export function ResourceDetailView({ resourceId }: Props) {
  const { t, direction } = useI18n();
  const vm = useResourceDetailViewModel(resourceId);
  const [activeTab, setActiveTab] = useState("general");

  if (vm.loading && !vm.resource) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner showText={false} />
      </div>
    );
  }

  if (vm.error && !vm.resource) {
    return (
      <div className="p-6 max-w-lg mx-auto my-12" dir={direction}>
        <Alert variant="destructive">
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/venue/resources">
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              <span>{t("resources.detail.back", { defaultValue: "Back to Courts & Fields" })}</span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={direction} data-testid="resource-detail-view">
      <VenueNav />

      {/* Back button */}
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs text-nx-ink-2">
          <Link href="/venue/resources">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            <span>{t("resources.detail.back", { defaultValue: "Back to Courts & Fields" })}</span>
          </Link>
        </Button>
      </div>

      {/* Court Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-nx-line pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-nx-ink">
              {vm.resource?.name}
            </h1>
            <Badge variant="outline" className="font-medium text-xs">
              {vm.profile?.name ?? vm.profile?.resourceKindCode ?? "Court"}
            </Badge>
            <Badge variant="success" className="text-xs">
              {vm.resource?.isPublished ? "Active" : "Draft"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-nx-ink-2">
            <Building2 className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            <span>{vm.facility?.name ?? "Main Branch"}</span>
            <span className="text-nx-line">·</span>
            <Clock className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            <span>{vm.profile?.operatingPolicy?.timeZoneId ?? "UTC"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
            <Link href={`/venue/calendar?resourceId=${encodeURIComponent(resourceId)}`}>
              <CalendarDays className="size-4 text-nx-accent" aria-hidden="true" />
              <span>{t("resources.card.calendar", { defaultValue: "View on Calendar" })}</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 text-xs font-bold">
            <Link href={`/venue/bookings/new?resourceId=${encodeURIComponent(resourceId)}`}>
              <span>{t("resources.card.book", { defaultValue: "+ Book Slot" })}</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Success feedback alert */}
      {vm.feedback && (
        <Alert variant="success" className="py-2.5">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
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
        <TabsList className="bg-nx-surface border border-nx-line p-1">
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
