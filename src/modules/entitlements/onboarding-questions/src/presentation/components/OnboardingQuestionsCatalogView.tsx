/**
 * OnboardingQuestionsCatalogView — Admin CRUD table for onboarding questions.
 *
 * Wraps GenericCrudView with question-specific column/field configuration.
 * Receives vm, t, language from OnboardingQuestionsView — never accesses DI directly.
 */
"use client";

import { useMemo, useState } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import { OptionsEditorDialog } from "./OptionsEditorDialog";
import type { OnboardingQuestion } from "../../domain/entities/OnboardingQuestion";

interface OnboardingQuestionsCatalogViewProps {
  vm: Record<string, any>;
  t: (key: string) => string;
  language: string;
}

export function OnboardingQuestionsCatalogView({
  vm,
  t,
  language,
}: OnboardingQuestionsCatalogViewProps) {
  const [optionsTarget, setOptionsTarget] = useState<{ id: string; label: string } | null>(null);

  const config: CrudConfig<OnboardingQuestion> = useMemo(
    () => ({
      titleKey: "entitlements.onboarding.questions.title",
      subtitleKey: "entitlements.onboarding.questions.description",
      resource: "onboarding_questions",

      columns: [
        {
          key: "key",
          label: t("entitlements.onboarding.questions.key") || "Key",
          render: (value: unknown) => (
            <span className="font-mono text-xs text-muted-foreground">{String(value ?? "")}</span>
          ),
        },
        {
          key: "labelEn",
          label: t("entitlements.onboarding.questions.label") || "Label",
          render: (_val: unknown, q: OnboardingQuestion) => q.getLabel(language),
        },
        {
          key: "questionType",
          label: t("entitlements.onboarding.questions.type") || "Type",
          render: (value: unknown) => (
            <Badge variant={value === "MultiSelect" ? "default" : "secondary"}>
              {String(value ?? "")}
            </Badge>
          ),
        },
        {
          key: "sortOrder",
          label: t("entitlements.onboarding.questions.sortOrder") || "Sort Order",
        },
        {
          key: "isSystem",
          label: t("entitlements.onboarding.questions.isSystem") || "System",
          render: (value: unknown) =>
            value ? (
              <Badge variant="outline" className="border-purple-500 text-purple-600">
                System
              </Badge>
            ) : null,
        },
      ],

      createFields: [
        {
          name: "key",
          label: t("entitlements.onboarding.questions.key") || "Question Key",
          type: "text" as const,
          required: true,
          placeholder: "e.g. team_size",
          description: "Unique snake_case key used to identify this question in the engine.",
        },
        {
          name: "labelEn",
          label: t("entitlements.onboarding.questions.labelEn") || "Label (English)",
          type: "text" as const,
          required: true,
        },
        {
          name: "labelAr",
          label: t("entitlements.onboarding.questions.labelAr") || "Label (Arabic)",
          type: "text" as const,
          required: true,
        },
        {
          name: "questionType",
          label: t("entitlements.onboarding.questions.type") || "Question Type",
          type: "select" as const,
          required: true,
          options: [
            { value: "SingleSelect", label: "Single Select" },
            { value: "MultiSelect", label: "Multi Select" },
          ],
        },
        {
          name: "sortOrder",
          label: t("entitlements.onboarding.questions.sortOrder") || "Sort Order",
          type: "number" as const,
          defaultValue: 10,
        },
        {
          name: "isRequired",
          label: t("entitlements.onboarding.questions.required") || "Required",
          type: "switch" as const,
          defaultValue: true,
        },
      ],

      editFields: (item: OnboardingQuestion | null) => [
        {
          name: "labelEn",
          label: t("entitlements.onboarding.questions.labelEn") || "Label (English)",
          type: "text" as const,
          required: true,
          defaultValue: item?.labelEn ?? "",
        },
        {
          name: "labelAr",
          label: t("entitlements.onboarding.questions.labelAr") || "Label (Arabic)",
          type: "text" as const,
          required: true,
          defaultValue: item?.labelAr ?? "",
        },
        {
          name: "sortOrder",
          label: t("entitlements.onboarding.questions.sortOrder") || "Sort Order",
          type: "number" as const,
          defaultValue: item?.sortOrder ?? 10,
        },
      ],

      getItemDisplayName: (item: OnboardingQuestion) => item.getLabel(language),

      renderActions: (item: OnboardingQuestion) => (
        <button
          onClick={() => setOptionsTarget({ id: item.id, label: item.getLabel(language) })}
          title="Edit answer options"
          className="rounded p-1.5 text-violet-400/70 transition-colors hover:bg-violet-500/10 hover:text-violet-300"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </button>
      ),
    }),
    // setOptionsTarget is stable — intentionally omitted from deps
     
    [t, language]
  );

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      <OptionsEditorDialog
        open={!!optionsTarget}
        onClose={() => setOptionsTarget(null)}
        questionId={optionsTarget?.id ?? null}
        questionLabel={optionsTarget?.label ?? ""}
      />
    </>
  );
}
