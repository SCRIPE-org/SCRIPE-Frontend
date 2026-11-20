"use client";

import { useI18n } from "@core/providers/i18n-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import { cn } from "@core/common/utils";

/** Pipeline option descriptor consumed by `PipelineSelector`. */
export interface PipelineSelectorOption {
  id: string;
  code?: string;
  entityType?: "deal" | "lead";
  nameEn: string;
  nameAr?: string | null;
}

/** Props for `PipelineSelector`. */
export interface PipelineSelectorProps {
  pipelines: PipelineSelectorOption[];
  value: string;
  onChange: (pipelineId: string) => void;
  entityType?: "deal" | "lead" | "all";
  includeAllOption?: boolean;
  allOptionLabel?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  "data-testid"?: string;
}

/**
 * Unified bilingual pipeline switcher shared across Overview, Opportunities, Leads, and Studio.
 */
export function PipelineSelector({
  pipelines,
  value,
  onChange,
  entityType = "all",
  includeAllOption = false,
  allOptionLabel,
  placeholder,
  ariaLabel,
  disabled = false,
  className,
  triggerClassName,
  "data-testid": testId,
}: PipelineSelectorProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const scopedPipelines =
    entityType === "all"
      ? pipelines
      : pipelines.filter((p) => (p.entityType ?? "deal") === entityType);

  const selected = scopedPipelines.find((p) => p.id === value);
  const selectedLabel =
    value === "all"
      ? (allOptionLabel ?? t("crm.pipeline.allPipelinesOption"))
      : selected
        ? ((isRtl && selected.nameAr ? selected.nameAr : selected.nameEn) || selected.nameEn)
        : undefined;

  return (
    <div className={cn("inline-flex items-center", className)}>
      <Select
        dir={isRtl ? "rtl" : "ltr"}
        value={value}
        onValueChange={(nextId) => {
          if (nextId) onChange(nextId);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          data-testid={testId}
          aria-label={ariaLabel ?? t("crm.pipeline.filterPipelineLabel")}
          className={cn("h-8 text-xs border-nx-line bg-nx-surface", triggerClassName)}
        >
          <SelectValue placeholder={placeholder ?? t("crm.pipeline.selectPipelinePlaceholder")}>
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value="all" className="text-xs">
              {allOptionLabel ?? t("crm.pipeline.allPipelinesOption")}
            </SelectItem>
          )}
          {scopedPipelines.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {(isRtl && p.nameAr ? p.nameAr : p.nameEn) || p.nameEn}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
