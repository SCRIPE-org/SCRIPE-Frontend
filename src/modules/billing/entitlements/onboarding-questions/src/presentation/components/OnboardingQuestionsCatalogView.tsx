/* eslint-disable @typescript-eslint/no-explicit-any */
// UI-EXCEPTION: compact studio layout
/**
 * OnboardingQuestionsCatalogView — Admin CRUD table for onboarding questions.
 *
 * Wraps GenericCrudView with question-specific column/field configuration.
 * Receives vm, t, language from OnboardingQuestionsView — never accesses DI directly.
 */
"use client";

import { useMemo, useState } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { OptionsEditorDialog } from "./OptionsEditorDialog";
import type { OnboardingQuestion } from "../../domain/entities/OnboardingQuestion";

interface OnboardingQuestionsCatalogViewProps {
  vm: Record<string, any>;
  t: (key: string) => string;
  language: string;
}

/**
 * Presentation UI component rendering the onboarding questions catalog view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
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
      // Registered in the backend's EntitlementsEntityTypeCatalog -- must match
      // exactly. Create/edit both route through GenericCrudView's own modal
      // here, so this one line is all the wiring this screen needs.
      entityTypeKey: "entitlements.onboarding-question",

      columns: [
        {
          key: "key",
          label: t("entitlements.onboarding.questions.key"),
          render: (value: unknown) => (
            <span className="font-mono text-xs text-nx-ink-2">{String(value ?? "")}</span>
          ),
        },
        {
          key: "labelEn",
          label: t("entitlements.onboarding.questions.label"),
          render: (_val: unknown, q: OnboardingQuestion) => q.getLabel(language),
        },
        {
          key: "questionType",
          label: t("entitlements.onboarding.questions.type"),
          render: (value: unknown) => (
            <Badge variant={value === "MultiSelect" ? "default" : "secondary"}>
              {value === "MultiSelect"
                ? t("entitlements.onboarding.questions.typeMultiSelect")
                : t("entitlements.onboarding.questions.typeSingleSelect")}
            </Badge>
          ),
        },
        {
          key: "sortOrder",
          label: t("entitlements.onboarding.questions.sortOrder"),
        },
        {
          key: "isSystem",
          label: t("entitlements.onboarding.questions.isSystem"),
          render: (value: unknown) =>
            value ? (
              <Badge variant="default">{t("entitlements.onboarding.questions.isSystem")}</Badge>
            ) : null,
        },
      ],

      createFields: [
        {
          name: "key",
          label: t("entitlements.onboarding.questions.key"),
          type: "text" as const,
          required: true,
          placeholder: t("entitlements.onboarding.questions.keyPlaceholder"),
          description: t("entitlements.onboarding.questions.keyHelp"),
        },
        {
          name: "labelEn",
          label: t("entitlements.onboarding.questions.labelEn"),
          type: "text" as const,
          required: true,
        },
        {
          name: "labelAr",
          label: t("entitlements.onboarding.questions.labelAr"),
          type: "text" as const,
          required: true,
        },
        {
          name: "questionType",
          label: t("entitlements.onboarding.questions.type"),
          type: "select" as const,
          required: true,
          options: [
            {
              value: "SingleSelect",
              label: t("entitlements.onboarding.questions.typeSingleSelect"),
            },
            { value: "MultiSelect", label: t("entitlements.onboarding.questions.typeMultiSelect") },
          ],
        },
        {
          name: "sortOrder",
          label: t("entitlements.onboarding.questions.sortOrder"),
          type: "number" as const,
          defaultValue: 10,
        },
        {
          name: "isRequired",
          label: t("entitlements.onboarding.questions.required"),
          type: "switch" as const,
          defaultValue: true,
        },
      ],

      editFields: (item: OnboardingQuestion | null) => [
        {
          name: "labelEn",
          label: t("entitlements.onboarding.questions.labelEn"),
          type: "text" as const,
          required: true,
          defaultValue: item?.labelEn ?? "",
        },
        {
          name: "labelAr",
          label: t("entitlements.onboarding.questions.labelAr"),
          type: "text" as const,
          required: true,
          defaultValue: item?.labelAr ?? "",
        },
        {
          name: "sortOrder",
          label: t("entitlements.onboarding.questions.sortOrder"),
          type: "number" as const,
          defaultValue: item?.sortOrder ?? 10,
        },
      ],

      getItemDisplayName: (item: OnboardingQuestion) => item.getLabel(language),

      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<OnboardingQuestion>[] => [
        {
          label: tFn("entitlements.onboarding.questions.manageOptions"),
          onClick: (item) => setOptionsTarget({ id: item.id, label: item.getLabel(language) }),
          variant: "ghost" as const,
          className: "text-nx-accent hover:bg-nx-accent-wash",
          icon: <SlidersHorizontal className="h-4 w-4" />,
        },
        {
          label: tFn("common.edit"),
          onClick: (item) => vm.openEditModal(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: tFn("common.delete"),
          onClick: (item) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/80",
          icon: <Trash2 className="h-4 w-4" />,
        },
      ],
    }),
    // setOptionsTarget is stable — intentionally omitted from deps

    [t, language, vm]
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
