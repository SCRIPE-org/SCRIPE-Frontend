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
          <div
            className="mx-auto mb-2 grid h-16 w-16 place-items-center rounded-nx-md border border-warning/30 bg-warning/10 text-warning"
            aria-hidden="true"
          >
            <ShieldAlert className="h-8 w-8" />
          </div>
          <DialogTitle>{t("subscription.paymentWall.title")}</DialogTitle>
          <DialogDescription className="mt-2 text-center">
            {/* The provider interpolates {edition} — the old manual .replace()
                skipped the Arabic string's own placeholder handling. */}
            {t("subscription.paymentWall.description", {
              edition: editionName || t("subscription.paymentWall.yourPlan"),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-nx-md border border-nx-line bg-nx-raised p-4 text-sm text-nx-ink-2">
          <div className="flex items-start gap-2">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            <span>{t("subscription.paymentWall.contactAdmin")}</span>
          </div>
        </div>

        <DialogFooter className="mt-2 sm:justify-center">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="me-2 h-4 w-4" aria-hidden="true" />
            {t("nav.logout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
