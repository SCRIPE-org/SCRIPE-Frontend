"use client";

import Link from "next/link";
import { AlertCircle, CalendarClock, Lock, RefreshCw, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import type { VenueAttentionSignal } from "../../domain/entities/VenueAttention";
import { useVenueAttentionViewModel } from "../viewmodels/useVenueAttentionViewModel";

function formatInterval(signal: VenueAttentionSignal, locale: string): string | null {
  if (!signal.startUtc || !signal.endUtc) return null;
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return `${formatter.format(new Date(signal.startUtc))} – ${formatter.format(new Date(signal.endUtc))}`;
}

/**
 * Documentation for module export
 */
export function VenueAttentionView() {
  useModuleLocales(() => import("../../../locales"), "venue.attention");
  const { t, language, direction } = useI18n();
  const canView = usePermission(VENUE_PERMISSIONS.VENUE_ATTENTION_VIEW);
  const canOpenBooking = usePermission(VENUE_PERMISSIONS.RESERVATION_VIEW);
  const canOpenAvailability = usePermission(VENUE_PERMISSIONS.AVAILABILITY_CALENDAR_VIEW);
  const vm = useVenueAttentionViewModel(canView);

  if (!canView || vm.stage === "forbidden") {
    return <EmptyState icon={Lock} title={t("attention.permission.title")} description={t("attention.permission.description")} />;
  }
  if (vm.stage === "loading" && !vm.data) return <LoadingSpinner showText={false} />;
  if (vm.stage === "error" || !vm.data) {
    return <EmptyState icon={AlertCircle} title={t("attention.error.title")} description={t("attention.error.description")}
      action={<Button variant="outline" onClick={() => void vm.refresh()}><RefreshCw className="size-4" aria-hidden="true" />{t("attention.error.retry")}</Button>} />;
  }
  if (vm.data.items.length === 0) {
    return <EmptyState icon={ShieldAlert} title={t("attention.empty.title")} description={t("attention.empty.description")}
      action={<Button variant="outline" onClick={() => void vm.refresh()}><RefreshCw className="size-4" aria-hidden="true" />{t("attention.refresh")}</Button>} />;
  }

  return <div className="space-y-6" dir={direction} data-testid="venue-attention">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-nx-line pb-5">
      <div><p className="text-sm font-medium text-nx-ink-2">{t("attention.eyebrow")}</p><h1 className="mt-1 text-2xl font-semibold text-nx-ink">{t("attention.title")}</h1><p className="mt-2 max-w-2xl text-sm text-nx-ink-2">{t("attention.description")}</p></div>
      <Button variant="outline" size="sm" onClick={() => void vm.refresh()}><RefreshCw className="size-4" aria-hidden="true" />{t("attention.refresh")}</Button>
    </header>
    <Alert variant="info"><AlertDescription>{t("attention.asOf", { value: new Intl.DateTimeFormat(language, { dateStyle: "medium", timeStyle: "short" }).format(new Date(vm.data.asOfUtc)) })}</AlertDescription></Alert>
    <div className="space-y-3">
      {vm.data.items.map((signal) => <Card key={`${signal.kind}:${signal.blockId ?? signal.resourceId}:${signal.reservationId ?? ""}`}>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0"><div><CardTitle className="flex items-center gap-2 text-base"><ShieldAlert className="size-5 text-nx-accent" aria-hidden="true" />{t(`attention.signal.${signal.kind}.title`)}</CardTitle><p className="mt-1 text-sm text-nx-ink-2">{signal.resourceName}</p></div><Badge variant={signal.severity === "High" ? "destructive" : "outline"}>{t(`attention.severity.${signal.severity}`)}</Badge></CardHeader>
        <CardContent className="space-y-3"><p className="text-sm text-nx-ink-2">{t(`attention.signal.${signal.kind}.description`)}</p>{formatInterval(signal, language) && <p className="flex items-center gap-2 text-sm tabular-nums text-nx-ink-2"><CalendarClock className="size-4" aria-hidden="true" />{formatInterval(signal, language)}</p>}<div className="flex flex-wrap gap-2">{signal.reservationId && canOpenBooking && <Button size="sm" asChild><Link href={`/venue/bookings/${encodeURIComponent(signal.reservationId)}`}>{t("attention.openBooking")}</Link></Button>}{canOpenAvailability && <Button size="sm" variant="outline" asChild><Link href={`/venue/availability?resourceId=${encodeURIComponent(signal.resourceId)}`}>{t("attention.openAvailability")}</Link></Button>}</div></CardContent>
      </Card>)}
    </div>
  </div>;
}
