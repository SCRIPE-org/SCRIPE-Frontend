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
  tokens: any;
  t: any;
  language: string;
  isRtl: boolean;
}

/**
 * React presentation component representing the change plan dialog UI element.
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
  tokens,
  t,
  language,
  isRtl,
}: ChangePlanDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full border-border text-base font-medium hover:bg-accent/10 hover:text-accent"
        >
          {t("entitlements.activateWorkspace.changePlan")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("entitlements.activateWorkspace.changePlan")}</DialogTitle>
          <DialogDescription>
            {isRtl
              ? "اختر خطة جديدة لمساحة عملك. الخطة المجانية تفعل فوراً."
              : "Choose a new plan for your workspace. Free plan activates instantly."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingEditions ? (
          <div className="flex justify-center p-6">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {isRtl ? "الخطة" : "Plan"}
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
                  <SelectValue placeholder={isRtl ? "اختر خطة..." : "Select a plan..."} />
                </SelectTrigger>
                <SelectContent>
                  {editions
                    .filter((e) => e.isSelfServiceEnabled && !e.isRetired)
                    .map((edition) => (
                      <SelectItem key={edition.id} value={edition.id}>
                        {edition.getDisplayName(language)}{" "}
                        {edition.isFree ? `(${isRtl ? "مجانية" : "Free"})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanId && !isConfirmingFree && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {isRtl ? "دورة الفوترة" : "Billing cycle"}
                </label>
                <Select
                  value={selectedCycle}
                  onValueChange={(val) => setSelectedCycle(val as "Monthly" | "Yearly")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monthly">{isRtl ? "شهري" : "Monthly"}</SelectItem>
                    <SelectItem value="Yearly">{isRtl ? "سنوي" : "Yearly"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isConfirmingFree && (
              <div className="border-warning/30 bg-warning/5 text-warning flex items-start gap-2 rounded-lg border p-3 text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">
                    {t("entitlements.activateWorkspace.confirmDowngradeTitle")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
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
            style={{
              background: isConfirmingFree ? undefined : tokens.accent,
            }}
          >
            {isConfirmingFree
              ? t("entitlements.activateWorkspace.confirmDowngradeCta")
              : isRtl
                ? "متابعة للدفع"
                : "Continue to checkout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
