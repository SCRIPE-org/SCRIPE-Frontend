"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { useServices } from "@core/providers/service-provider";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { CreditCard, LogOut, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * PaymentWallDialog — Blocks access when subscription is PendingPayment.
 *
 * Shows an unclosable dialog prompting the tenant admin to contact
 * their system admin for payment. The admin can only log out.
 */
export function PaymentWallDialog() {
  const { t } = useI18n();
  const router = useRouter();
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus);
  const editionName = useAppStore((s) => s.editionName);
  const logoutStore = useAppStore((s) => s.logout);
  const user = useAppStore((s) => s.user);
  const { authRepository } = useServices();
  const queryClient = useQueryClient();

  // System admins (tenantId=null) don't have subscriptions — never block
  if (!user?.tenantId) return null;

  // Only show for PendingPayment status
  if (subscriptionStatus !== "PendingPayment") return null;

  const handleLogout = async () => {
    try {
      await authRepository.logout();
    } catch {
      // ignore
    } finally {
      logoutStore();
      queryClient.clear();
      router.replace("/login");
    }
  };

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        /* unclosable */
      }}
    >
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10">
            <ShieldAlert className="h-8 w-8 text-warning" />
          </div>
          <DialogTitle className="text-xl">
            {t("subscription.paymentWall.title") || "Payment Required"}
          </DialogTitle>
          <DialogDescription className="mt-2 text-center leading-relaxed">
            {(
              t("subscription.paymentWall.description") ||
              "Your subscription to {edition} is pending payment. Please contact your system administrator to complete the payment and activate your account."
            ).replace(
              "{edition}",
              editionName || t("subscription.paymentWall.yourPlan") || "your plan"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-warning" />
            <span>
              {t("subscription.paymentWall.contactAdmin") ||
                "Contact your system administrator to generate a payment link."}
            </span>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:justify-center">
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t("nav.logout") || "Log Out"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
