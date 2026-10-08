"use client";

import { AlertCircle, CheckCircle2, ChevronDown, Search, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import type {
  AvailabilityCandidate,
  BookingWorkspaceStage,
} from "../../domain/entities/Booking";

interface AvailabilityCandidatesProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: string;
  stage: BookingWorkspaceStage;
  candidates: AvailabilityCandidate[];
  selected: AvailabilityCandidate | null;
  partialFailure: boolean;
  canSearch: boolean;
  searchDisabled: boolean;
  onSearch: () => Promise<AvailabilityCandidate[]>;
  onSelect: (candidate: AvailabilityCandidate) => void;
}

function formatInterval(candidate: AvailabilityCandidate, locale: string): string {
  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: candidate.timeZoneId,
  }).format(new Date(candidate.startUtc));
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: candidate.timeZoneId,
  });
  return `${date} Â· ${time.format(new Date(candidate.startUtc))}â€“${time.format(new Date(candidate.endUtc))}`;
}

function CandidateCard({
  candidate,
  selected,
  locale,
  t,
  onSelect,
}: {
  candidate: AvailabilityCandidate;
  selected: boolean;
  locale: string;
  t: AvailabilityCandidatesProps["t"];
  onSelect?: () => void;
}) {
  return (
    <div className={`rounded-xl border p-4 ${selected ? "border-nx-accent bg-nx-accent/5" : "border-nx-border bg-nx-surface"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-nx-ink">{candidate.resourceName}</p>
            <Badge variant={candidate.isAvailable ? "active" : "inactive"}>
              {t(candidate.isAvailable ? "booking.availability.available" : "booking.availability.unavailable")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-nx-ink-2">{candidate.facilityName} Â· {candidate.profileName}</p>
          <p className="mt-2 text-sm text-nx-ink">{formatInterval(candidate, locale)}</p>
          <p className="mt-1 text-xs text-nx-ink-3">{candidate.timeZoneId}</p>
          <p className="mt-2 text-sm text-nx-ink-2">
            {t("booking.availability.capacity", {
              remaining: candidate.remainingCapacity,
              maximum: candidate.maximumCapacity,
            })}
          </p>
          {!candidate.isAvailable && candidate.reason && (
            <p className="mt-2 text-sm text-nx-danger">{candidate.reason}</p>
          )}
        </div>
        {candidate.isAvailable && onSelect && (
          <Button type="button" variant={selected ? "outline" : "default"} onClick={onSelect}>
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {t(selected ? "booking.availability.selected" : "booking.availability.select")}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Documentation for AvailabilityCandidates
 */
export function AvailabilityCandidates({
  t,
  locale,
  stage,
  candidates,
  selected,
  partialFailure,
  canSearch,
  searchDisabled,
  onSearch,
  onSelect,
}: AvailabilityCandidatesProps) {
  const available = candidates.filter((candidate) => candidate.isAvailable);
  const unavailable = candidates.filter((candidate) => !candidate.isAvailable);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-nx-accent" aria-hidden="true" />
            {t("booking.availability.title")}
          </CardTitle>
          <p className="mt-1 text-sm text-nx-ink-2">{t("booking.availability.description")}</p>
        </div>
        <Button type="button" disabled={!canSearch || searchDisabled || stage === "searching"} onClick={() => void onSearch()}>
          <Search className="size-4" aria-hidden="true" />
          {stage === "searching" ? t("booking.availability.searching") : t("booking.availability.action")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {partialFailure && (
          <Alert variant="warning">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{t("booking.availability.partialFailure")}</AlertDescription>
          </Alert>
        )}

        {stage === "noAvailability" && (
          <EmptyState
            icon={XCircle}
            title={t("booking.availability.noAvailability")}
            description={t("booking.availability.noAvailabilityDescription")}
          />
        )}

        {available.map((candidate) => (
          <CandidateCard
            key={candidate.resourceId}
            candidate={candidate}
            selected={selected?.resourceId === candidate.resourceId}
            locale={locale}
            t={t}
            onSelect={() => onSelect(candidate)}
          />
        ))}

        {unavailable.length > 0 && (
          <details className="rounded-xl border border-nx-border p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-nx-ink">
              {t("booking.availability.unavailableGroup")}
              <ChevronDown className="size-4" aria-hidden="true" />
            </summary>
            <div className="mt-4 space-y-3">
              {unavailable.map((candidate) => (
                <CandidateCard key={candidate.resourceId} candidate={candidate} selected={false} locale={locale} t={t} />
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
