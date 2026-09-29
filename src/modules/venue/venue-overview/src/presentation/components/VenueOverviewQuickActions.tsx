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
      <Button
        asChild
        size="sm"
        className="gap-2 shadow-nx-sm font-semibold"
      >
        <Link href="/venue/bookings/new">
          <Plus className="size-4" aria-hidden="true" />
          <span>{t("venueOverview.quickActions.newBooking")}</span>
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        size="sm"
        className="gap-2 border-nx-line text-nx-ink hover:bg-nx-hover"
      >
        <Link href="/venue/calendar">
          <Calendar className="size-4 text-nx-accent" aria-hidden="true" />
          <span>{t("venueOverview.quickActions.openCalendar")}</span>
        </Link>
      </Button>

      {canViewAttention && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2 border-nx-line text-nx-ink hover:bg-nx-hover"
        >
          <Link href="/venue/attention">
            <ShieldAlert className="size-4 text-amber-500" aria-hidden="true" />
            <span>{t("venueOverview.quickActions.attentionCenter")}</span>
          </Link>
        </Button>
      )}

      {canViewMoney && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2 border-nx-line text-nx-ink hover:bg-nx-hover"
        >
          <Link href="/venue/money/receivables">
            <ReceiptText className="size-4 text-emerald-500" aria-hidden="true" />
            <span>{t("venueOverview.quickActions.receivables")}</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
