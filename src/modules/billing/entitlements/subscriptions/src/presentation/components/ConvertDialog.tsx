/**
 * Convert Trial Dialog
 *
 * Allows admins to convert a trial subscription into a paid plan.
 * Shows billing cycle options filtered by the trial edition's billing controls.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Label } from "@core/ui/label";
import type { SubscriptionEditionDialogProps } from "../types";
import type { SubscriptionListItem } from "../../domain/entities/Subscription";
import { SubscriptionTypeSelect } from "./SubscriptionTypeSelect";

/**
 * Presentation UI component rendering the convert dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ConvertDialog({ vm, editionsVm }: SubscriptionEditionDialogProps) {
  const { t } = useI18n();

  // Get the current trial subscription's edition billing controls
  const activeSubEditionId = vm.items?.find(
    (s: SubscriptionListItem) => s.status === "Active" || s.status === "Trialing"
  )?.editionId;
  const selectedEd = activeSubEditionId
    ? ((editionsVm.allEditionsForSelect ?? []).find((ed) => ed.id === activeSubEditionId) ?? null)
    : null;

  return (
    <Dialog open={vm.showConvertDialog} onOpenChange={vm.setShowConvertDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("entSubscriptions.convertTrial")}</DialogTitle>
          <DialogDescription>{t("entSubscriptions.convertDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("tenant.subscriptionType")}</Label>
            <SubscriptionTypeSelect
              value={vm.convertType}
              onValueChange={vm.setConvertType}
              edition={selectedEd}
              showTrial={false}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowConvertDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={vm.submitConvert} loading={vm.isConverting}>
            {t("entSubscriptions.convertTrial")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
