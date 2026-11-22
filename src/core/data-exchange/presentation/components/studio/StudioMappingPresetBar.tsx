"use client";

import React, { useState } from "react";
import { RotateCcw, Save, Sparkles, Trash2 } from "lucide-react";
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
  onDeletePreset?: (id: string) => Promise<void> | void;
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
  onDeletePreset,
}: StudioMappingPresetBarProps) {
  const { t } = useI18n();
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");

  const activeSelectedId = presets.some((p) => p.id === selectedPresetId) ? selectedPresetId : "";

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 border-nx-line bg-nx-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="text-xs gap-1.5">
          <bdi dir="ltr" className="font-mono">
            {fileName}
          </bdi>
          <span aria-hidden="true">·</span>
          <bdi dir="ltr" className="font-mono tabular-nums">
            {formatByteSize(byteSize)}
          </bdi>
          <span aria-hidden="true">·</span>
          <span>{t("dataExchange.upload.sheetsCount", { count: sheetCount })}</span>
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
          className="h-8 text-xs bg-nx-raised hover:bg-nx-raised-2"
        >
          <Sparkles className="me-1.5 h-3.5 w-3.5 text-nx-accent" />
          <span>{t("dataExchange.actions.autoMap")}</span>
        </Button>
      </div>

      {/* Preset Controls */}
      <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
        {presets.length > 0 && (
          <div className="flex w-full sm:w-auto items-center gap-1">
            <Select
              value={activeSelectedId || undefined}
              onValueChange={(id) => {
                setSelectedPresetId(id);
                const p = presets.find((x) => x.id === id);
                if (p) onSelectPreset(p);
              }}
            >
              <SelectTrigger
                aria-label={t("dataExchange.actions.loadPresets")}
                className="w-full sm:w-48 h-8 text-xs border-nx-line"
              >
                <SelectValue placeholder={t("dataExchange.actions.loadPresets")} />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {onDeletePreset && activeSelectedId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const idToDelete = activeSelectedId;
                  setSelectedPresetId("");
                  void onDeletePreset(idToDelete);
                }}
                aria-label={t("dataExchange.actions.deletePreset")}
                title={t("dataExchange.actions.deletePreset")}
                data-testid="studio-delete-preset-btn"
                className="h-8 w-8 p-0 text-nx-danger hover:bg-destructive/15 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
        <Input
          value={presetNameInput}
          onChange={(e) => onPresetNameChange(e.target.value)}
          placeholder={t("dataExchange.mapping.presetNamePlaceholder")}
          aria-label={t("dataExchange.mapping.presetNamePlaceholder")}
          dir="auto"
          className="w-full sm:w-44 h-8 text-xs font-mono"
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
