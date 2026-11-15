/**
 * Shared Group Capacity Policy (DEF-006)
 *
 * Enforces unified thresholds across card badges, progress bars, filters, and KPIs:
 * - < 90%: Active
 * - >= 90% and < 100%: Near Full
 * - >= 100%: Full
 *
 * Full groups hard-block direct addition and transfer, directing users to the waitlist.
 */

export const GROUP_CAPACITY_THRESHOLDS = {
  NEAR_FULL_PERCENT: 90,
  FULL_PERCENT: 100,
} as const;

export type GroupCapacityStatus = "Active" | "NearFull" | "Full";

export interface GroupCapacityEvaluation {
  status: GroupCapacityStatus;
  fillPercent: number;
  clampedFillPercent: number;
  isFull: boolean;
  isNearFull: boolean;
  isActive: boolean;
  badgeLabelEn: string;
  badgeLabelAr: string;
  badgeVariantClass: string;
  barColorClass: string;
}

export function evaluateGroupCapacity(
  activeMemberCount: number,
  maxCapacity: number
): GroupCapacityEvaluation {
  const active = Math.max(0, activeMemberCount || 0);
  const max = Math.max(0, maxCapacity || 0);

  if (max <= 0) {
    return {
      status: "Active",
      fillPercent: 0,
      clampedFillPercent: 0,
      isFull: false,
      isNearFull: false,
      isActive: true,
      badgeLabelEn: "Active",
      badgeLabelAr: "نشط",
      badgeVariantClass: "border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent",
      barColorClass: "bg-nx-accent-fill",
    };
  }

  const exactPercent = (active / max) * 100;
  const fillPercent = Math.round(exactPercent);
  const clampedFillPercent = Math.min(100, Math.max(0, fillPercent));
  const isFull = active >= max;
  const isNearFull = !isFull && fillPercent >= GROUP_CAPACITY_THRESHOLDS.NEAR_FULL_PERCENT;
  const isActive = !isFull && !isNearFull;

  let status: GroupCapacityStatus = "Active";
  let badgeLabelEn = "Active";
  let badgeLabelAr = "نشط";
  let badgeVariantClass = "border-nx-accent-fill/40 bg-nx-accent-fill/15 text-nx-accent";
  let barColorClass = "bg-nx-accent-fill";

  if (isFull) {
    status = "Full";
    badgeLabelEn = "Full";
    badgeLabelAr = "ممتلئ";
    badgeVariantClass = "border-rose-500/50 bg-rose-500/15 text-rose-500";
    barColorClass = "bg-rose-500";
  } else if (isNearFull) {
    status = "NearFull";
    badgeLabelEn = "Near Full";
    badgeLabelAr = "شبه ممتلئ";
    badgeVariantClass = "border-warning/50 bg-warning/15 text-warning";
    barColorClass = "bg-warning";
  }

  return {
    status,
    fillPercent,
    clampedFillPercent,
    isFull,
    isNearFull,
    isActive,
    badgeLabelEn,
    badgeLabelAr,
    badgeVariantClass,
    barColorClass,
  };
}
