"use client";

import Link from "next/link";
import { Plus, Calendar, ShieldAlert, ReceiptText } from "lucide-react";
import { Button } from "@core/ui/button";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

interface Props {
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function VenueOverviewQuickActions({ t }: Props) {
  const canViewAttention = usePermission(VENUE_PERMISSIONS.VENUE_ATTENTION_VIEW);
  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canViewMoney = canViewReceivables || canViewPayments;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link href="/venue/bookings/new">
        <Button
          type="button"
          size="sm"
          className="gap-2 bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-500 shadow-nx-sm font-semibold"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("venueOverview.quickActions.newBooking")}</span>
        </Button>
      </Link>

      <Link href="/venue/calendar">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-nx-line text-nx-ink hover:bg-nx-hover"
        >
          <Calendar className="size-4 text-nx-accent" aria-hidden="true" />
          <span>{t("venueOverview.quickActions.openCalendar")}</span>
        </Button>
      </Link>

      {canViewAttention && (
        <Link href="/venue/attention">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-nx-line text-nx-ink hover:bg-nx-hover"
          >
            <ShieldAlert className="size-4 text-amber-500" aria-hidden="true" />
            <span>{t("venueOverview.quickActions.attentionCenter")}</span>
          </Button>
        </Link>
      )}

      {canViewMoney && (
        <Link href="/venue/money/receivables">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-nx-line text-nx-ink hover:bg-nx-hover"
          >
            <ReceiptText className="size-4 text-emerald-500" aria-hidden="true" />
            <span>{t("venueOverview.quickActions.receivables")}</span>
          </Button>
        </Link>
      )}
    </div>
  );
}
