/**
 * RecommendationRulesCatalogView — Admin CRUD table for recommendation rules.
 *
 * Wraps GenericCrudView with rule-specific column/field configuration.
 * Receives vm, t, language from RecommendationRulesView — never accesses DI directly.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { Badge, type BadgeProps } from "@core/ui/badge";
import type { RecommendationRule } from "../../domain/entities/RecommendationRule";
import { Pencil, Trash2 } from "lucide-react";

const TIER_BADGE_VARIANT: Record<number, BadgeProps["variant"]> = {
  0: "secondary",
  1: "info",
  2: "default",
  3: "warning",
};

interface RecommendationRulesCatalogViewProps {
  vm: Record<string, unknown>;
  t: (key: string) => string;
  language: string;
}

/**
 * Presentation UI component rendering the recommendation rules catalog view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RecommendationRulesCatalogView({ vm, t }: RecommendationRulesCatalogViewProps) {
  // `vm` is typed as Record<string, unknown> at this prop boundary, but at runtime it is
  // always the object returned by useCrudViewModel (see useRecommendationRulesViewModel.ts),
  // which always exposes openEditModal/deleteItem. Narrow locally so getActions/deleteService
  // below type-check without loosening the shared prop type.
  const vmActions = vm as {
    openEditModal: (item: RecommendationRule) => void;
    deleteItem: (id: string) => Promise<void>;
  };

  const config: CrudConfig<RecommendationRule> = useMemo(
    () => ({
      titleKey: "entitlements.onboarding.rules.title",
      subtitleKey: "entitlements.onboarding.rules.description",
      resource: "onboarding_rules",
      // Registered in the backend's EntitlementsEntityTypeCatalog -- must match
      // exactly. Create/edit both route through GenericCrudView's own modal
      // here, so this one line is all the wiring this screen needs.
      entityTypeKey: "entitlements.onboarding-rule",

      columns: [
        {
          key: "name",
          label: t("entitlements.onboarding.rules.name"),
          render: (value: unknown) => (
            <span className="font-mono text-xs text-nx-ink-2">{String(value ?? "")}</span>
          ),
        },
        {
          key: "conditionJson",
          label: t("entitlements.onboarding.rules.condition"),
          render: (value: unknown) => (
            <code className="rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-xs text-nx-ink-2">
              {String(value ?? "").length > 40
                ? String(value ?? "").slice(0, 40) + "…"
                : String(value ?? "")}
            </code>
          ),
        },
        {
          key: "recommendedTierLevel",
          label: t("entitlements.onboarding.rules.tier"),
          render: (value: unknown) => {
            const level = value as number | undefined;
            if (level === undefined || level === null)
              return <span className="text-nx-ink-3">—</span>;
            const tierLabelKeys: Record<number, string> = {
              0: "entitlements.onboarding.rules.tierFree",
              1: "entitlements.onboarding.rules.tierPro",
              2: "entitlements.onboarding.rules.tierUltra",
              3: "entitlements.onboarding.rules.tierEnterprise",
            };
            const labelKey = tierLabelKeys[level];
            return (
              <Badge variant={TIER_BADGE_VARIANT[level] ?? "secondary"}>
                {labelKey ? t(labelKey) : "—"}
              </Badge>
            );
          },
        },
        {
          key: "scoreBonus",
          label: t("entitlements.onboarding.rules.scoreBonus"),
          render: (value: unknown) => (
            <span className="font-mono text-sm font-semibold tabular-nums text-nx-ink">
              +{String(value ?? 0)}
            </span>
          ),
        },
        {
          key: "priority",
          label: t("entitlements.onboarding.rules.priority"),
        },
        {
          key: "isSystem",
          label: t("entitlements.onboarding.rules.isSystem"),
          render: (value: unknown) =>
            value ? (
              <Badge variant="default">{t("entitlements.onboarding.rules.isSystem")}</Badge>
            ) : null,
        },
      ],

      createFields: [
        {
          name: "name",
          label: t("entitlements.onboarding.rules.name"),
          type: "text" as const,
          required: true,
          placeholder: t("entitlements.onboarding.rules.namePlaceholder"),
          description: t("entitlements.onboarding.rules.nameHelp"),
        },
        {
          name: "conditionJson",
          label: t("entitlements.onboarding.rules.condition"),
          type: "textarea" as const,
          required: true,
          placeholder: t("entitlements.onboarding.rules.conditionPlaceholder"),
          description: t("entitlements.onboarding.rules.conditionHelp"),
        },
        {
          name: "recommendedTierLevel",
          label: t("entitlements.onboarding.rules.tier"),
          type: "select" as const,
          options: [
            { value: "0", label: t("entitlements.onboarding.rules.tierFree") },
            { value: "1", label: t("entitlements.onboarding.rules.tierPro") },
            { value: "2", label: t("entitlements.onboarding.rules.tierUltra") },
            { value: "3", label: t("entitlements.onboarding.rules.tierEnterprise") },
          ],
        },
        {
          name: "scoreBonus",
          label: t("entitlements.onboarding.rules.scoreBonus"),
          type: "number" as const,
          required: true,
          defaultValue: 25,
          description: t("entitlements.onboarding.rules.scoreBonusHelp"),
        },
        {
          name: "reasonEn",
          label: t("entitlements.onboarding.rules.reasonEn"),
          type: "textarea" as const,
          required: true,
          placeholder: t("entitlements.onboarding.rules.reasonEnPlaceholder"),
        },
        {
          name: "reasonAr",
          label: t("entitlements.onboarding.rules.reasonAr"),
          type: "textarea" as const,
          required: true,
          placeholder: t("entitlements.onboarding.rules.reasonArPlaceholder"),
        },
        {
          name: "priority",
          label: t("entitlements.onboarding.rules.priority"),
          type: "number" as const,
          defaultValue: 5,
          description: t("entitlements.onboarding.rules.priorityHelp"),
        },
      ],

      editFields: (item: RecommendationRule | null) => [
        {
          name: "conditionJson",
          label: t("entitlements.onboarding.rules.condition"),
          type: "textarea" as const,
          required: true,
          defaultValue: item?.conditionJson ?? "",
        },
        {
          name: "recommendedTierLevel",
          label: t("entitlements.onboarding.rules.tier"),
          type: "select" as const,
          defaultValue:
            item?.recommendedTierLevel !== undefined && item?.recommendedTierLevel !== null
              ? String(item.recommendedTierLevel)
              : undefined,
          options: [
            { value: "0", label: t("entitlements.onboarding.rules.tierFree") },
            { value: "1", label: t("entitlements.onboarding.rules.tierPro") },
            { value: "2", label: t("entitlements.onboarding.rules.tierUltra") },
            { value: "3", label: t("entitlements.onboarding.rules.tierEnterprise") },
          ],
        },
        {
          name: "scoreBonus",
          label: t("entitlements.onboarding.rules.scoreBonus"),
          type: "number" as const,
          required: true,
          defaultValue: item?.scoreBonus ?? 0,
        },
        {
          name: "reasonEn",
          label: t("entitlements.onboarding.rules.reasonEn"),
          type: "textarea" as const,
          required: true,
          defaultValue: item?.reasonEn ?? "",
        },
        {
          name: "reasonAr",
          label: t("entitlements.onboarding.rules.reasonAr"),
          type: "textarea" as const,
          required: true,
          defaultValue: item?.reasonAr ?? "",
        },
        {
          name: "priority",
          label: t("entitlements.onboarding.rules.priority"),
          type: "number" as const,
          defaultValue: item?.priority ?? 5,
        },
      ],

      getItemDisplayName: (item: RecommendationRule) => item.name,
      deleteService: (id: string) => vmActions.deleteItem(id),
      getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<RecommendationRule>[] => [
        {
          label: tFn("common.edit"),
          onClick: (item: RecommendationRule) => vmActions.openEditModal(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: tFn("common.delete"),
          onClick: (item: RecommendationRule) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/80",
          icon: <Trash2 className="h-4 w-4" />,
        },
      ],
    }),
    [t, vmActions]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
