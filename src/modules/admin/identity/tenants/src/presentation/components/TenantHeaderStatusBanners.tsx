/**
 * TenantHeaderStatusBanners — Status alerts and subscription lifetime indicators for tenant headers.
 */
"use client";

import { Alert, AlertDescription } from "@core/ui/alert";
import { AlertTriangle, Ban, XCircle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn, formatDateUtc } from "@core/common/utils";
import type { TenantStatus } from "../viewmodels/useTenantHeaderViewModel";

/**
 * Properties passed to the TenantHeaderStatusBanners component.
 */
export interface TenantHeaderStatusBannersProps {
  /** Calculated operational status of the tenant */
  status: TenantStatus;
  /** Optional suspension or cancellation rationale message */
  suspensionReason?: string;
  /** Name of the subscribed edition package if assigned */
  editionName?: string;
  /** Expiration timestamp for the current subscription plan */
  editionEndDate?: string | Date | null;
  /** Number of days remaining before subscription expiry */
  daysLeft: number | null;
  /** Percentage of subscription term completed (0-100) */
  progress: number;
  /** Color class associated with the subscription progress status */
  progressColor: string;
}

/**
 * Renders warning or notice banners when tenant is suspended, canceled, or expired,
 * along with subscription progress indicators when active.
 *
 * @param props Component properties.
 * @returns JSX elements representing status alerts and progress bars.
 */
export function TenantHeaderStatusBanners({
  status,
  suspensionReason,
  editionName,
  editionEndDate,
  daysLeft,
  progress,
  progressColor,
}: TenantHeaderStatusBannersProps) {
  const { t } = useI18n();

  return (
    <>
      {status === "suspended" && (
        <Alert variant="warning">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription>
            <p className="font-medium text-nx-ink">{t("tenant.suspendedBanner")}</p>
            {suspensionReason && <p className="mt-0.5">{suspensionReason}</p>}
          </AlertDescription>
        </Alert>
      )}
      {status === "canceled" && (
        <Alert variant="destructive">
          <Ban aria-hidden="true" />
          <AlertDescription>
            <p className="font-medium text-nx-ink">{t("tenant.canceledBanner")}</p>
            {suspensionReason && <p className="mt-0.5">{suspensionReason}</p>}
          </AlertDescription>
        </Alert>
      )}
      {status === "expired" && (
        <Alert variant="warning">
          <XCircle aria-hidden="true" />
          <AlertDescription>
            <p className="font-medium text-nx-ink">{t("tenant.expiredBanner")}</p>
          </AlertDescription>
        </Alert>
      )}

      {status === "active" && editionName && (
        <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-nx-ink-2">
            <span className="font-medium">
              {editionName}
              {daysLeft !== null
                ? ` • ${daysLeft} ${t("tenant.daysLeft")}`
                : ` • ${t("tenant.lifetime")}`}
            </span>
            {editionEndDate && (
              <span>
                {t("tenant.endDate")}: {formatDateUtc(editionEndDate)}
              </span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-nx-raised">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                progressColor
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === "expired" && (
        <div className="rounded-nx-md border border-nx-line bg-nx-surface p-3">
          <p className="mb-1.5 text-xs font-medium text-destructive">
            {t("tenant.expired")} • {editionName}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-nx-raised">
            <div className="h-full w-0 rounded-full bg-destructive" />
          </div>
        </div>
      )}
    </>
  );
}
