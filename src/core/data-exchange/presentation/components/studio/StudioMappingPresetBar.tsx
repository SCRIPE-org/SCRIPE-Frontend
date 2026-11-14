"use client";

import React from "react";
import { RotateCcw, Save, Sparkles } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { useI18n } from "@core/providers/i18n-provider";
import { formatByteSize } from "../../../domain/mapping-validation";
import type { DataExchangeSavedPresetDto } from "../../../domain/types";

export interface StudioMappingPresetBarProps {
  fileName: string;
  byteSize: number;
  sheetCount: number;
  onPromptReplaceFile: () => void;
  onAutoMap: () => void;
  presets: DataExchangeSavedPresetDto[];
  presetNameInput: string;
  isSavingPreset: boolean;
  onSelectPreset: (preset: DataExchangeSavedPresetDto) => void;
  onPresetNameChange: (name: string) => void;
  onSavePreset: () => void;
}

/**
 * Top file summary ribbon and mapping presets management bar.
 */
export function StudioMappingPresetBar({
  fileName,
  byteSize,
  sheetCount,
  onPromptReplaceFile,
  onAutoMap,
  presets,
  presetNameInput,
  isSavingPreset,
  onSelectPreset,
  onPresetNameChange,
  onSavePreset,
}: StudioMappingPresetBarProps) {
  const { t } = useI18n();

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 border-nx-line bg-nx-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" dir="ltr" className="font-mono text-xs">
          {t("dataExchange.upload.fileSummary", {
            name: fileName,
            size: formatByteSize(byteSize),
            sheets: sheetCount,
          })}
        </Badge>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPromptReplaceFile}
          className="h-8 text-xs border-nx-line"
          data-testid="studio-replace-file-btn"
        >
          <RotateCcw className="me-1.5 h-3.5 w-3.5" />
          <span>{t("dataExchange.actions.changeFile")}</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onAutoMap}
          className="h-8 text-xs bg-nx-raised hover:bg-nx-raised/80"
        >
          <Sparkles className="me-1.5 h-3.5 w-3.5 text-nx-accent" />
          <span>{t("dataExchange.actions.autoMap")}</span>
        </Button>
      </div>

      {/* Preset Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {presets.length > 0 && (
          <Select
            onValueChange={(id) => {
              const p = presets.find((x) => x.id === id);
              if (p) onSelectPreset(p);
            }}
          >
            <SelectTrigger className="w-48 h-8 text-xs border-nx-line">
              <SelectValue placeholder={t("dataExchange.actions.loadPresets")} />
            </SelectTrigger>
            <SelectContent className="z-[960]">
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Input
          value={presetNameInput}
          onChange={(e) => onPresetNameChange(e.target.value)}
          placeholder={t("dataExchange.mapping.presetNamePlaceholder")}
          className="w-44 h-8 text-xs font-mono"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={isSavingPreset}
          disabled={!presetNameInput.trim()}
          onClick={onSavePreset}
          className="h-8 text-xs border-nx-line"
        >
          <Save className="me-1.5 h-3.5 w-3.5" />
          <span>{t("dataExchange.actions.savePreset")}</span>
        </Button>
      </div>
    </Card>
  );
}
