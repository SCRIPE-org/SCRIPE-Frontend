"use client";

import { useEffect, useState } from "react";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { getVenueContainer } from "@modules/venue/di";
import type { MoneySummaryItem } from "@modules/venue";

export interface VenueOverviewMoneyCardViewModel {
  summary: MoneySummaryItem | null;
  loading: boolean;
  canView: boolean;
  canViewReceivables: boolean;
  canViewPayments: boolean;
  primaryHref: string;
}

/**
 * Presentation ViewModel hook orchestrating authoritative Finance telemetry
 * for the Operations Dashboard Money Card snapshot.
 *
 * Adheres strictly to View -> ViewModel -> Repository -> Service -> IApiService.
 */
export function useVenueOverviewMoneyCardViewModel(): VenueOverviewMoneyCardViewModel {
  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canView = canViewReceivables || canViewPayments;

  const [summary, setSummary] = useState<MoneySummaryItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canView) return;

    let mounted = true;
    setLoading(true);

    try {
      const container = getVenueContainer();
      if (container?.moneyRepository?.getSummary) {
        container.moneyRepository
          .getSummary({ interval: "day" })
          .then((res) => {
            if (mounted && res) {
              setSummary(res.primary || res.items?.[0] || null);
            }
          })
          .catch(() => {
            // Failure isolation: Finance API unavailability must never break the dashboard.
            if (mounted) {
              setSummary(null);
            }
          })
          .finally(() => {
            if (mounted) {
              setLoading(false);
            }
          });
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [canView]);

  const primaryHref = canViewReceivables ? "/venue/money/receivables" : "/venue/money/payments";

  return {
    summary,
    loading,
    canView,
    canViewReceivables,
    canViewPayments,
    primaryHref,
  };
}
