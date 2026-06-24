"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { ScrollArea } from "@core/ui/scroll-area";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Package,
  Settings2,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ConvertLeadParams } from "../../domain/interfaces/ILeadsRepository";
import type { PlatformLead } from "../../domain/entities/PlatformLead";
import { useConvertWizardViewModel } from "../viewmodels/useConvertWizardViewModel";
import { WizardStep1Edition } from "./wizard/WizardStep1Edition";
import { WizardStep2Setup } from "./wizard/WizardStep2Setup";
import { WizardStep3Features } from "./wizard/WizardStep3Features";
import { WizardStep4Confirm } from "./wizard/WizardStep4Confirm";

// ── Step indicator config ─────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Edition", icon: Package },
  { id: 2, label: "Setup", icon: Building2 },
  { id: 3, label: "Features", icon: Settings2 },
  { id: 4, label: "Confirm", icon: CheckCircle2 },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface ConvertToTenantWizardProps {
  open: boolean;
  lead: PlatformLead | null;
  isConverting: boolean;
  onClose: () => void;
  onConvert: (params: ConvertLeadParams) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the convert to tenant wizard.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ConvertToTenantWizard({
  open,
  lead,
  isConverting,
  onClose,
  onConvert,
}: ConvertToTenantWizardProps) {
  const { t } = useI18n();
  const vm = useConvertWizardViewModel(open, lead, onConvert, onClose, isConverting);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isConverting) vm.handleClose();
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {t("leads.convertDialog.title")}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                {lead
                  ? `${lead.companyName} · ${lead.contactName}`
                  : t("leads.drawer.loadingDetail")}
              </DialogDescription>
            </div>
          </div>

          {/* Step progress */}
          <div className="mt-4 flex items-center gap-0">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = vm.step === s.id;
              const isDone = vm.step > s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-200",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground",
                      ].join(" ")}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                    </div>
                    <span
                      className={`text-[10px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {t(`leads.convertWizard.steps.${s.label.toLowerCase()}`)}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={[
                        "mx-1 mb-4 h-0.5 w-12 flex-1 transition-all duration-300",
                        vm.step > s.id ? "bg-emerald-500" : "bg-border",
                      ].join(" ")}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Override count badge (Step 3) */}
          {vm.step === 3 && vm.overrideCount > 0 && (
            <Badge variant="secondary" className="mt-2 w-fit text-amber-600">
              {t("leads.convertWizard.overrideCount", { count: vm.overrideCount })}
            </Badge>
          )}
        </DialogHeader>

        {/* ── Body ── */}
        <ScrollArea className="min-h-0 flex-1 flex flex-col">
          <div className="px-6 py-4">
            {vm.step === 1 && (
              <WizardStep1Edition
                lead={lead}
                editions={vm.editions}
                isLoading={vm.isLoadingEditions}
                selected={vm.selectedEdition}
                onSelect={vm.setSelectedEdition}
              />
            )}
            {vm.step === 2 && (
              <WizardStep2Setup
                lead={lead}
                edition={vm.selectedEdition}
                state={vm.s2}
                onChange={vm.setS2}
                amountError={vm.amountError}
                onAmountChange={vm.handleAmountChange}
              />
            )}
            {vm.step === 3 && (
              <WizardStep3Features
                edition={vm.selectedEdition}
                groups={vm.featureGroups}
                isLoading={vm.isLoadingFeatures}
                overrides={vm.overrides}
                expandedCategories={vm.expandedCategories}
                onToggleCategory={vm.toggleCategory}
                onOverrideChange={vm.handleOverrideChange}
              />
            )}
            {vm.step === 4 && (
              <WizardStep4Confirm
                lead={lead}
                edition={vm.selectedEdition}
                setup={vm.s2}
                overrideCount={vm.overrideCount}
              />
            )}
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={vm.step === 1 ? vm.handleClose : vm.handleBack}
            disabled={isConverting}
            className="gap-2"
          >
            {vm.step === 1 ? (
              t("leads.convertDialog.cancel")
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                {t("leads.convertWizard.back")}
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            {vm.step < 4 && (
              <Button
                type="button"
                onClick={vm.handleNext}
                disabled={vm.step === 1 && !vm.selectedEdition}
                className="gap-2"
              >
                {t("leads.convertWizard.next")} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {vm.step === 4 && (
              <Button
                type="button"
                onClick={vm.handleSubmit}
                disabled={isConverting}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("leads.convertWizard.converting")}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t("leads.convertWizard.convertNow")}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Re-export alias for backwards compatibility ───────────────────────────────
export { ConvertToTenantWizard as ConvertToTenantDialog };
