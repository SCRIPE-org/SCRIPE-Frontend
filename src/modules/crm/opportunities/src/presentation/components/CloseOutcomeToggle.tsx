"use client";

import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { CheckCircle, XCircle } from "lucide-react";
import type { OpportunityStatus } from "../../domain/entities/OpportunityEntity";

interface CloseOutcomeToggleProps {
  outcome: OpportunityStatus;
  onOutcomeChange: (outcome: OpportunityStatus) => void;
  label: string;
  wonLabel: string;
  lostLabel: string;
}

/** Toggle buttons for selecting Won vs Lost deal outcome in CloseOpportunityDialog. */
export function CloseOutcomeToggle({
  outcome,
  onOutcomeChange,
  label,
  wonLabel,
  lostLabel,
}: CloseOutcomeToggleProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className={`flex items-center justify-center gap-2 p-3 h-auto text-sm font-semibold transition-colors ${
            outcome === "Won"
              ? "border-success bg-success/15 text-success hover:bg-success/20"
              : "border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink"
          }`}
          onClick={() => onOutcomeChange("Won")}
        >
          <CheckCircle className="size-4" />
          {wonLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={`flex items-center justify-center gap-2 p-3 h-auto text-sm font-semibold transition-colors ${
            outcome === "Lost"
              ? "border-destructive bg-destructive/15 text-destructive hover:bg-destructive/20"
              : "border-nx-line bg-nx-surface text-nx-ink-2 hover:text-nx-ink"
          }`}
          onClick={() => onOutcomeChange("Lost")}
        >
          <XCircle className="size-4" />
          {lostLabel}
        </Button>
      </div>
    </div>
  );
}
