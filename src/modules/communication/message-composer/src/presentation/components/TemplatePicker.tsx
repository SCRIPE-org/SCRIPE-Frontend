"use client";

import React, { useMemo } from "react";
import { useTemplatePickerViewModel } from "../viewmodels/useTemplatePickerViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Loader2, FileText } from "lucide-react";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import type { EmailTemplate } from "../../domain/entities/Email";
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";

// ─── Props ──────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for template picker props.
 */
export interface TemplatePickerProps {
  repository: IEmailRepository;
  onSelect: (template: EmailTemplate) => void;
}

/**
 * TemplatePicker Component
 *
 * Provides a dropdown list for selecting active email templates.
 * Follows clean architecture by delegating query state to the TemplatePicker ViewModel.
 */
export function TemplatePicker({ repository, onSelect }: TemplatePickerProps) {
  const { t } = useI18n();

  const { templates, isLoading } = useTemplatePickerViewModel({ repository });

  // Convert templates to GenericSelect options
  const options: GenericSelectOption[] = useMemo(() => {
    return templates.map((tpl) => ({
      value: tpl.id,
      label: tpl.key,
      description: [tpl.category, tpl.language, tpl.description].filter(Boolean).join(" · "),
    }));
  }, [templates]);

  // Selected template ID
  const [selectedId, setSelectedId] = React.useState<string>("");

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedId);

  // Handle selection from GenericSelect
  const handleValueChange = (value: string | string[]) => {
    const id = Array.isArray(value) ? (value[0] ?? "") : value;
    setSelectedId(id);
  };

  // Apply the selected template
  const handleApply = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t("messaging.email.loadingTemplates") || "Loading templates..."}
      </div>
    );
  }

  if (templates.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <GenericSelect
        options={options}
        value={selectedId || undefined}
        onValueChange={handleValueChange}
        type="searchable"
        placeholder={t("messaging.email.selectTemplate") || "Use a template..."}
        searchPlaceholder={t("common.search") || "Search templates..."}
        noResultsText={t("common.noResults") || "No templates found"}
        allowClear
        className="w-[280px]"
      />

      {/* Apply Button */}
      {selectedId && (
        <Button size="sm" variant="default" onClick={handleApply} className="shrink-0">
          {t("messaging.email.applyTemplate") || "Apply"}
        </Button>
      )}
    </div>
  );
}
