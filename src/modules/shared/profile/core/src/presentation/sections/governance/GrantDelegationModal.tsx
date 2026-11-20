"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import type { AccountColleagueOption } from "../../../domain/entities/SovereignAccountEntities";
import { ColleaguePickerField } from "./ColleaguePickerField";
import { DelegationScopeChecklistField } from "./DelegationScopeChecklistField";
import { DelegationWindowPickerField } from "./DelegationWindowPickerField";
import { Check, Loader2 } from "lucide-react";

/**
 * Duration preset option for time-bounded access delegation.
 */
export type DelegationDurationPreset = "24h" | "3d" | "7d" | "custom";

/**
 * Request payload submitted when creating a time-bounded delegation.
 */
export interface CreateDelegationRequest {
  delegateAdminId: string;
  delegateDisplayName: string;
  delegationType: string;
  grantedScopes: string[];
  justification: string;
  startsAtUtc: string;
  expiresAtUtc: string;
}

function resolveDelegationWindow(
  preset: DelegationDurationPreset,
  customStartLocal: string,
  customEndLocal: string,
  t: (key: string) => string
): { startsAtUtc: string; expiresAtUtc: string } | { error: string } {
  if (preset === "custom") {
    if (!customEndLocal) return { error: t("profile.governance.customRangeRequiredError") };
    const endDate = new Date(customEndLocal);
    const startDate = customStartLocal ? new Date(customStartLocal) : new Date();
    if (Number.isNaN(endDate.getTime()) || Number.isNaN(startDate.getTime()) || endDate <= startDate) {
      return { error: t("profile.governance.customRangeInvalidError") };
    }
    return { startsAtUtc: startDate.toISOString(), expiresAtUtc: endDate.toISOString() };
  }
  const hours = preset === "3d" ? 72 : preset === "7d" ? 168 : 24;
  const now = new Date();
  return { startsAtUtc: now.toISOString(), expiresAtUtc: new Date(now.getTime() + hours * 3600 * 1000).toISOString() };
}

/**
 * Props for GrantDelegationModal.
 */
export interface GrantDelegationModalProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  open: boolean;
  colleagueQuery: string;
  colleagues: AccountColleagueOption[];
  isSearchingColleagues: boolean;
  availableScopeCodes: string[];
  isCreatingDelegation: boolean;
  onOpenChange: (open: boolean) => void;
  onColleagueQueryChange: (val: string) => void;
  onCreateDelegation: (request: CreateDelegationRequest) => Promise<unknown>;
}

/**
 * Guided modal for selecting a colleague, duration window, scopes, and justification
 * to grant a time-bounded delegation.
 */
export function GrantDelegationModal({
  t,
  open,
  colleagueQuery,
  colleagues,
  isSearchingColleagues,
  availableScopeCodes,
  isCreatingDelegation,
  onOpenChange,
  onColleagueQueryChange,
  onCreateDelegation,
}: GrantDelegationModalProps) {
  const [selectedColleague, setSelectedColleague] = useState<AccountColleagueOption | null>(null);
  const [delegationType, setDelegationType] = useState("TemporaryCoverage");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [scopeSearch, setScopeSearch] = useState("");
  const [durationPreset, setDurationPreset] = useState<DelegationDurationPreset>("24h");
  const [customStartLocal, setCustomStartLocal] = useState("");
  const [customEndLocal, setCustomEndLocal] = useState("");
  const [justification, setJustification] = useState("");
  const [grantError, setGrantError] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedColleague(null);
    setDelegationType("TemporaryCoverage");
    setSelectedScopes([]);
    setScopeSearch("");
    setDurationPreset("24h");
    setCustomStartLocal("");
    setCustomEndLocal("");
    setJustification("");
    setGrantError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const filteredModalScopes = availableScopeCodes.filter((code) =>
    !scopeSearch.trim() ? true : code.toLowerCase().includes(scopeSearch.trim().toLowerCase())
  );

  const handleSubmit = async () => {
    setGrantError(null);
    if (!selectedColleague) return setGrantError(t("profile.governance.selectColleagueError"));
    if (selectedScopes.length === 0) return setGrantError(t("profile.governance.selectScopesError"));
    if (!justification.trim()) return setGrantError(t("profile.governance.justificationRequiredError"));

    const windowResult = resolveDelegationWindow(durationPreset, customStartLocal, customEndLocal, t);
    if ("error" in windowResult) return setGrantError(windowResult.error);

    try {
      await onCreateDelegation({
        delegateAdminId: selectedColleague.id,
        delegateDisplayName: selectedColleague.displayName,
        delegationType,
        grantedScopes: selectedScopes,
        startsAtUtc: windowResult.startsAtUtc,
        expiresAtUtc: windowResult.expiresAtUtc,
        justification: justification.trim(),
      });
      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      setGrantError(err instanceof Error ? err.message : t("profile.common.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[88vh] overflow-y-auto bg-nx-surface border-nx-line p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-nx-ink">
            {t("profile.governance.grantDelegationTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-nx-ink-3">
            {t("profile.governance.grantDelegationDesc")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <ColleaguePickerField
            t={t}
            colleagueQuery={colleagueQuery}
            selectedColleague={selectedColleague}
            colleagues={colleagues}
            isSearchingColleagues={isSearchingColleagues}
            onQueryChange={onColleagueQueryChange}
            onSelectColleague={setSelectedColleague}
            onClearColleague={() => setSelectedColleague(null)}
          />

          <DelegationWindowPickerField
            t={t}
            delegationType={delegationType}
            durationPreset={durationPreset}
            customStartLocal={customStartLocal}
            customEndLocal={customEndLocal}
            onDelegationTypeChange={setDelegationType}
            onDurationPresetChange={setDurationPreset}
            onCustomStartChange={setCustomStartLocal}
            onCustomEndChange={setCustomEndLocal}
          />

          <DelegationScopeChecklistField
            t={t}
            selectedScopes={selectedScopes}
            availableScopeCodes={availableScopeCodes}
            filteredModalScopes={filteredModalScopes}
            scopeSearch={scopeSearch}
            justification={justification}
            onScopeSearchChange={setScopeSearch}
            onToggleScope={(code) =>
              setSelectedScopes((prev) =>
                prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
              )
            }
            onSelectAllScopes={() => setSelectedScopes(availableScopeCodes)}
            onClearScopes={() => setSelectedScopes([])}
            onJustificationChange={setJustification}
          />

          {grantError && <p className="text-xs text-destructive font-medium">{grantError}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isCreatingDelegation}
            className="text-xs"
          >
            {t("profile.common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            data-testid="confirm-grant-delegation-btn"
            onClick={() => void handleSubmit()}
            disabled={isCreatingDelegation}
            className="text-xs font-semibold bg-nx-accent-fill text-nx-on-fill gap-1.5"
          >
            {isCreatingDelegation ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>{t("profile.governance.grantDelegationBtn")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
