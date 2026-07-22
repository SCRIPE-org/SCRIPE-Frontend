import { AlertTriangle, Ban, XCircle, CreditCard } from "lucide-react";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";
import type { TenantStatus } from "./TenantNodeCardHeader";

interface TenantNodeCardBannersProps {
  node: TenantTreeNode;
  status: TenantStatus;
  t: (key: string, variables?: any) => string;
}

/**
 * Presentation UI component rendering the tenant node card banners.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TenantNodeCardBanners({ node, status, t }: TenantNodeCardBannersProps) {
  return (
    <>
      {status === "suspended" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-medium text-warning">{t("tenant.suspendedBanner")}</p>
            {node.suspensionReason && (
              <p className="mt-1 text-muted-foreground">{node.suspensionReason}</p>
            )}
          </div>
        </div>
      )}
      {status === "canceled" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-medium text-destructive">{t("tenant.canceledBanner")}</p>
            {node.suspensionReason && (
              <p className="mt-1 text-muted-foreground">{node.suspensionReason}</p>
            )}
          </div>
        </div>
      )}
      {status === "expired" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-medium text-destructive">{t("tenant.expiredBanner")}</p>
          </div>
        </div>
      )}
      {node.subscriptionStatus === "PendingPayment" && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-medium text-warning">
              {t("tenant.pendingPaymentBanner") ||
                "This tenant has a pending payment. Generate a payment link from the subscriptions page."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
