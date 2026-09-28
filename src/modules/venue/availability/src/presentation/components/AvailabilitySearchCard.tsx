"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { AvailabilitySearchInput } from "../../domain/entities/Availability";
import type { useAvailabilityViewModel } from "../viewmodels/useAvailabilityViewModel";

interface AvailabilitySearchCardProps {
  vm: ReturnType<typeof useAvailabilityViewModel>;
  timeZoneId: string;
  canSearch: boolean;
}

export function AvailabilitySearchCard({
  vm,
  timeZoneId,
  canSearch,
}: AvailabilitySearchCardProps) {
  const { t } = useI18n();
  const { error: toastError } = useEnhancedToast();
  const maximumCapacity = vm.selectedResource?.capacity?.maxConcurrentUsage ?? 1;

  const [startLocal, setStartLocal] = useState("2026-09-27T09:00");
  const [endLocal, setEndLocal] = useState("2026-09-27T10:00");
  const [quantity, setQuantity] = useState(1);

  const searchDisabled = !canSearch || !vm.selectedResource?.isPublished || !vm.calendar;

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!startLocal || !endLocal || startLocal >= endLocal || quantity < 1) {
      toastError({ title: t("availability.validation.search") });
      return;
    }
    const input: AvailabilitySearchInput = {
      resourceId: vm.selectedResourceId,
      timeZoneId,
      startLocal,
      endLocal,
      quantity,
    };
    try {
      await vm.search(input);
    } catch (caught) {
      toastError({ title: caught instanceof Error ? caught.message : t("common.error") });
    }
  };

  return (
    <Card className="h-fit xl:sticky xl:top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="size-4" />
          {t("availability.searchTitle")}
        </CardTitle>
        <p className="text-sm text-nx-ink-2">{t("availability.searchDescription")}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-start">{t("availability.fields.searchStart")}</Label>
            <Input
              id="search-start"
              type="datetime-local"
              value={startLocal}
              disabled={searchDisabled}
              onChange={(event) => setStartLocal(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-end">{t("availability.fields.searchEnd")}</Label>
            <Input
              id="search-end"
              type="datetime-local"
              value={endLocal}
              disabled={searchDisabled}
              onChange={(event) => setEndLocal(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-quantity">{t("availability.fields.quantity")}</Label>
            <Input
              id="search-quantity"
              type="number"
              min={1}
              max={maximumCapacity}
              value={quantity}
              disabled={searchDisabled}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </div>
          <p className="flex items-center gap-2 text-xs text-nx-ink-3">
            <Clock3 className="size-3.5" />
            {timeZoneId}
          </p>
          <Button
            type="submit"
            className="w-full"
            disabled={searchDisabled || vm.searching}
          >
            {vm.searching ? t("availability.searching") : t("availability.search")}
          </Button>
        </form>

        {vm.searchResult && (
          <Alert variant={vm.searchResult.isAvailable ? "success" : "warning"}>
            {vm.searchResult.isAvailable ? <CheckCircle2 /> : <AlertCircle />}
            <AlertTitle>
              {t(
                vm.searchResult.isAvailable
                  ? "availability.resultAvailable"
                  : "availability.resultUnavailable"
              )}
            </AlertTitle>
            <AlertDescription>
              <p>
                {t("availability.remaining")}: {vm.searchResult.remainingCapacity} /{" "}
                {vm.searchResult.maximumCapacity}
              </p>
              <p>
                {t("availability.decision")}:{" "}
                {t(`availability.reasons.${vm.searchResult.reasonCode}`)}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {!canSearch && (
          <p className="text-sm text-nx-ink-3">{t("availability.searchPermission")}</p>
        )}
      </CardContent>
    </Card>
  );
}
