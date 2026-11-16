"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type { DelegationDurationPreset } from "./GrantDelegationModal";

const PRESET_OPTIONS = [
  { id: "24h", labelKey: "profile.governance.preset24h" },
  { id: "3d", labelKey: "profile.governance.preset3d" },
  { id: "7d", labelKey: "profile.governance.preset7d" },
  { id: "custom", labelKey: "profile.governance.presetCustom" },
] as const;

/**
 * Props for DelegationWindowPickerField.
 */
export interface DelegationWindowPickerFieldProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  delegationType: string;
  durationPreset: DelegationDurationPreset;
  customStartLocal: string;
  customEndLocal: string;
  onDelegationTypeChange: (value: string) => void;
  onDurationPresetChange: (preset: DelegationDurationPreset) => void;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
}

/**
 * Renders delegation classification select, duration presets, and custom UTC date-time bounds.
 */
export function DelegationWindowPickerField({
  t,
  delegationType,
  durationPreset,
  customStartLocal,
  customEndLocal,
  onDelegationTypeChange,
  onDurationPresetChange,
  onCustomStartChange,
  onCustomEndChange,
}: DelegationWindowPickerFieldProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("profile.governance.delegationTypeLabel")}
          </Label>
          <Select value={delegationType} onValueChange={onDelegationTypeChange}>
            <SelectTrigger className="h-9 text-xs bg-nx-ground border-nx-line">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TemporaryCoverage">
                {t("profile.governance.typeTemporaryCoverage")}
              </SelectItem>
              <SelectItem value="ReadOnlyAudit">
                {t("profile.governance.typeReadOnlyAudit")}
              </SelectItem>
              <SelectItem value="EmergencyDelegate">
                {t("profile.governance.typeEmergencyDelegate")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-nx-ink">
            {t("profile.governance.durationPresetLabel")}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_OPTIONS.map((p) => (
              <Button
                key={p.id}
                type="button"
                size="sm"
                variant={durationPreset === p.id ? "default" : "outline"}
                onClick={() => onDurationPresetChange(p.id)}
                className={
                  durationPreset === p.id
                    ? "h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-semibold"
                    : "h-8 text-xs"
                }
              >
                {t(p.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {durationPreset === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-nx-line bg-nx-ground">
          <div className="space-y-1">
            <Label className="text-[11px] text-nx-ink-2">
              {t("profile.governance.customStartUtcLabel")}
            </Label>
            <Input
              type="datetime-local"
              value={customStartLocal}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-nx-ink-2">
              {t("profile.governance.customEndUtcLabel")}
            </Label>
            <Input
              type="datetime-local"
              value={customEndLocal}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
