"use client";

import { AlertTriangle, Ban, XCircle, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";
import type { TenantStatus } from "./TenantNodeCardHeader";

interface TenantNodeCardBannersProps {
  node: TenantTreeNode;
  status: TenantStatus;
}

/**
 * Presentation UI component rendering the tenant node card banners.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantNodeCardBanners({ node, status }: TenantNodeCardBannersProps) {
  const { t } = useI18n();

  return (
    <div className="mt-3 space-y-2">
      {status === "suspended" && (
        <Alert variant="warning">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription>
            <p className="font-medium text-nx-ink">{t("tenant.suspendedBanner")}</p>
            {node.suspensionReason && <p className="mt-0.5">{node.suspensionReason}</p>}
          </AlertDescription>
        </Alert>
      )}
      {status === "canceled" && (
        <Alert variant="destructive">
          <Ban aria-hidden="true" />
          <AlertDescription>
            <p className="font-medium text-nx-ink">{t("tenant.canceledBanner")}</p>
            {node.suspensionReason && <p className="mt-0.5">{node.suspensionReason}</p>}
          </AlertDescription>
        </Alert>
      )}
      {status === "expired" && (
        <Alert variant="destructive">
          <XCircle aria-hidden="true" />
          <AlertDescription>
            <p className="font-medium text-nx-ink">{t("tenant.expiredBanner")}</p>
          </AlertDescription>
        </Alert>
      )}
      {node.subscriptionStatus === "PendingPayment" && (
        <Alert variant="warning">
          <CreditCard aria-hidden="true" />
          <AlertDescription>
            <p className="font-medium text-nx-ink">{t("tenant.pendingPaymentBanner")}</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
