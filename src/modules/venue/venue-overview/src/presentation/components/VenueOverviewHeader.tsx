"use client";

import { Calendar, Clock, RefreshCw, Building2 } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";

interface FacilityOption {
  id: string;
  name: string;
}

interface Props {
  facilityName: string;
  selectedFacilityId: string;
  facilities: FacilityOption[];
  timeZoneId: string;
  localDate: string;
  refreshing: boolean;
  onRefresh: () => void;
  onFacilityChange: (facilityId: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewHeader({
  facilityName,
  selectedFacilityId,
  facilities,
  timeZoneId,
  localDate,
  refreshing,
  onRefresh,
  onFacilityChange,
  t,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-nx-line pb-4 mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-nx-ink">
            {t("venueOverview.title")}
          </h1>
          <Badge variant="outline" className="text-xs font-mono font-medium">
            <Building2 className="size-3 me-1 text-nx-ink-3" aria-hidden="true" />
            {facilityName}
          </Badge>
        </div>
        <p className="text-xs text-nx-ink-2">
          {t("venueOverview.subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="inline-flex items-center gap-1.5 rounded-nx-sm border border-nx-line bg-nx-surface px-2.5 py-1 text-nx-ink tabular-nums">
          <Calendar className="size-3.5 text-nx-ink-3" aria-hidden="true" />
          <span className="font-medium">{t("venueOverview.header.today")}</span>
          <span className="text-nx-ink-3 font-mono">({localDate})</span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-nx-sm border border-nx-line bg-nx-surface px-2.5 py-1 text-nx-ink font-mono" dir="ltr">
          <Clock className="size-3.5 text-nx-ink-3" aria-hidden="true" />
          <span>{timeZoneId || "UTC"}</span>
        </div>

        {facilities.length > 1 && (
          <select
            value={selectedFacilityId}
            onChange={(e) => onFacilityChange(e.target.value)}
            className="h-8 rounded-nx-sm border border-nx-line bg-nx-surface px-2.5 text-xs text-nx-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-nx-accent"
            aria-label={t("venueOverview.header.facility")}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={t("venueOverview.header.refresh")}
          className="h-8 gap-1.5 text-xs font-medium"
        >
          <RefreshCw
            className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span>
            {refreshing
              ? t("venueOverview.header.refreshing")
              : t("venueOverview.header.refresh")}
          </span>
        </Button>
      </div>
    </div>
  );
}
