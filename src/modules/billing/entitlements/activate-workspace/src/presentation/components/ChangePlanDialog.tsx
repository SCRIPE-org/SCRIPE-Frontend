/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@core/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Button } from "@core/ui/button";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { AlertCircle } from "lucide-react";

interface ChangePlanDialogProps {
  editions: any[];
  isLoadingEditions: boolean;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  selectedCycle: "Monthly" | "Yearly";
  setSelectedCycle: (cycle: "Monthly" | "Yearly") => void;
  isChangingPlan: boolean;
  isConfirmingFree: boolean;
  setIsConfirmingFree: (confirm: boolean) => void;
  handleChangePlanSubmit: () => Promise<void>;
  t: (key: string) => string;
  language: string;
}

/**
 * Presentation UI component rendering the change plan dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ChangePlanDialog({
  editions,
  isLoadingEditions,
  selectedPlanId,
  setSelectedPlanId,
  selectedCycle,
  setSelectedCycle,
  isChangingPlan,
  isConfirmingFree,
  setIsConfirmingFree,
  handleChangePlanSubmit,
  t,
  language,
}: ChangePlanDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          {t("entitlements.activateWorkspace.changePlan")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("entitlements.activateWorkspace.changePlan")}</DialogTitle>
          <DialogDescription>
            {t("entitlements.activateWorkspace.changePlanDialog.description")}
          </DialogDescription>
        </DialogHeader>

        {isLoadingEditions ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-nx-ink-2">
                {t("entitlements.activateWorkspace.changePlanDialog.planLabel")}
              </label>
              <Select
                onValueChange={(val) => {
                  setSelectedPlanId(val);
                  const plan = editions.find((e) => e.id === val);
                  if (plan?.isFree) {
                    setIsConfirmingFree(true);
                  } else {
                    setIsConfirmingFree(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "entitlements.activateWorkspace.changePlanDialog.planPlaceholder"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {editions
                    .filter((e) => e.isSelfServiceEnabled && !e.isRetired)
                    .map((edition) => (
                      <SelectItem key={edition.id} value={edition.id}>
                        {edition.getDisplayName(language)}{" "}
                        {edition.isFree
                          ? `(${t("entitlements.activateWorkspace.changePlanDialog.freeSuffix")})`
                          : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanId && !isConfirmingFree && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-nx-ink-2">
                  {t("entitlements.activateWorkspace.changePlanDialog.billingCycleLabel")}
                </label>
                <Select
                  value={selectedCycle}
                  onValueChange={(val) => setSelectedCycle(val as "Monthly" | "Yearly")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">
                      {t("entitlements.activateWorkspace.monthly")}
                    </SelectItem>
                    <SelectItem value="Yearly">
                      {t("entitlements.activateWorkspace.yearly")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isConfirmingFree && (
              <div className="flex items-start gap-2 rounded-nx-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    {t("entitlements.activateWorkspace.confirmDowngradeTitle")}
                  </p>
                  <p className="mt-1 text-xs text-nx-ink-2">
                    {t("entitlements.activateWorkspace.confirmDowngradeText")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            onClick={handleChangePlanSubmit}
            loading={isChangingPlan}
            disabled={!selectedPlanId}
            className="w-full sm:w-auto"
          >
            {isConfirmingFree
              ? t("entitlements.activateWorkspace.confirmDowngradeCta")
              : t("entitlements.activateWorkspace.changePlanDialog.continueToCheckout")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
