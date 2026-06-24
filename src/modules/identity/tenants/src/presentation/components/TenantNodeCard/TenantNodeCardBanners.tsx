import { AlertTriangle, Ban, XCircle, CreditCard } from "lucide-react";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";
import type { TenantStatus } from "./TenantNodeCardHeader";

interface TenantNodeCardBannersProps {
  node: TenantTreeNode;
  status: TenantStatus;
  t: (key: string, variables?: any) => string;
}

/**
 * React presentation component representing the tenant node card banners UI element.
 */
export function TenantNodeCardBanners({ node, status, t }: TenantNodeCardBannersProps) {
  return (
    <>
      {status === "suspended" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-medium text-amber-500">{t("tenant.suspendedBanner")}</p>
            {node.suspensionReason && (
              <p className="mt-1 text-muted-foreground">{node.suspensionReason}</p>
            )}
          </div>
        </div>
      )}
      {status === "canceled" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="text-sm">
            <p className="font-medium text-red-500">{t("tenant.canceledBanner")}</p>
            {node.suspensionReason && (
              <p className="mt-1 text-muted-foreground">{node.suspensionReason}</p>
            )}
          </div>
        </div>
      )}
      {status === "expired" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="text-sm">
            <p className="font-medium text-red-500">{t("tenant.expiredBanner")}</p>
          </div>
        </div>
      )}
      {node.subscriptionStatus === "PendingPayment" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="text-sm">
            <p className="font-medium text-amber-600 dark:text-amber-400">
              {t("tenant.pendingPaymentBanner") ||
                "This tenant has a pending payment. Generate a payment link from the subscriptions page."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
