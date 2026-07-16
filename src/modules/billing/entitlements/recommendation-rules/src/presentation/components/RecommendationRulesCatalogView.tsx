/**
 * RecommendationRulesCatalogView — Admin CRUD table for recommendation rules.
 *
 * Wraps GenericCrudView with rule-specific column/field configuration.
 * Receives vm, t, language from RecommendationRulesView — never accesses DI directly.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import type { RecommendationRule } from "../../domain/entities/RecommendationRule";

const TIER_BADGE_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-700",
  1: "bg-blue-100 text-blue-800",
  2: "bg-purple-100 text-purple-800",
  3: "bg-amber-100 text-amber-800",
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
  const config: CrudConfig<RecommendationRule> = useMemo(
    () => ({
      titleKey: "entitlements.onboarding.rules.title",
      subtitleKey: "entitlements.onboarding.rules.description",
      resource: "onboarding_rules",

      columns: [
        {
          key: "name",
          label: t("entitlements.onboarding.rules.name") || "Rule Name",
          render: (value: unknown) => (
            <span className="font-mono text-xs text-muted-foreground">{String(value ?? "")}</span>
          ),
        },
        {
          key: "conditionJson",
          label: t("entitlements.onboarding.rules.condition") || "Condition",
          render: (value: unknown) => (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {String(value ?? "").length > 40
                ? String(value ?? "").slice(0, 40) + "…"
                : String(value ?? "")}
            </code>
          ),
        },
        {
          key: "recommendedTierLevel",
          label: t("entitlements.onboarding.rules.tier") || "Tier",
          render: (value: unknown) => {
            const level = value as number | undefined;
            if (level === undefined || level === null)
              return <span className="text-muted-foreground">—</span>;
            const colorClass = TIER_BADGE_COLORS[level] ?? "bg-gray-100 text-gray-700";
            const tempRule = new (class {
              getTierLabel() {
                switch (level) {
                  case 0:
                    return t("entitlements.onboarding.rules.tierFree") || "Free";
                  case 1:
                    return t("entitlements.onboarding.rules.tierPro") || "Pro";
                  case 2:
                    return t("entitlements.onboarding.rules.tierUltra") || "Ultra";
                  case 3:
                    return t("entitlements.onboarding.rules.tierEnterprise") || "Enterprise";
                  default:
                    return "—";
                }
              }
            })();
            return (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
              >
                {tempRule.getTierLabel()}
              </span>
            );
          },
        },
        {
          key: "scoreBonus",
          label: t("entitlements.onboarding.rules.scoreBonus") || "Score Bonus",
          render: (value: unknown) => (
            <span className="font-mono text-sm font-semibold">+{String(value ?? 0)}</span>
          ),
        },
        {
          key: "priority",
          label: t("entitlements.onboarding.rules.priority") || "Priority",
        },
        {
          key: "isSystem",
          label: t("entitlements.onboarding.rules.isSystem") || "System",
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
          name: "name",
          label: t("entitlements.onboarding.rules.name") || "Rule Name",
          type: "text" as const,
          required: true,
          placeholder: "e.g. solo-free-tier",
          description: "Unique stable slug for this rule.",
        },
        {
          name: "conditionJson",
          label: t("entitlements.onboarding.rules.condition") || "Condition (JSON)",
          type: "textarea" as const,
          required: true,
          placeholder: '{"team_size":"solo"}',
          description: 'Single value: {"key":"value"}  |  Multi-value match: {"key":["v1","v2"]}',
        },
        {
          name: "recommendedTierLevel",
          label: t("entitlements.onboarding.rules.tier") || "Recommended Tier",
          type: "select" as const,
          options: [
            { value: "0", label: t("entitlements.onboarding.rules.tierFree") || "Free (0)" },
            { value: "1", label: t("entitlements.onboarding.rules.tierPro") || "Pro (1)" },
            { value: "2", label: t("entitlements.onboarding.rules.tierUltra") || "Ultra (2)" },
            {
              value: "3",
              label: t("entitlements.onboarding.rules.tierEnterprise") || "Enterprise (3)",
            },
          ],
        },
        {
          name: "scoreBonus",
          label: t("entitlements.onboarding.rules.scoreBonus") || "Score Bonus",
          type: "number" as const,
          required: true,
          defaultValue: 25,
          description: "Points added to the matching edition's score.",
        },
        {
          name: "reasonEn",
          label: t("entitlements.onboarding.rules.reasonEn") || "Reason (English)",
          type: "textarea" as const,
          required: true,
          placeholder: "Recommended because your team size fits the Pro plan.",
        },
        {
          name: "reasonAr",
          label: t("entitlements.onboarding.rules.reasonAr") || "Reason (Arabic)",
          type: "textarea" as const,
          required: true,
          placeholder: "موصى به لأن حجم فريقك يناسب خطة برو.",
        },
        {
          name: "priority",
          label: t("entitlements.onboarding.rules.priority") || "Priority",
          type: "number" as const,
          defaultValue: 5,
          description: "Lower values are evaluated first. Use 1-10.",
        },
      ],

      editFields: (item: RecommendationRule | null) => [
        {
          name: "conditionJson",
          label: t("entitlements.onboarding.rules.condition") || "Condition (JSON)",
          type: "textarea" as const,
          required: true,
          defaultValue: item?.conditionJson ?? "",
        },
        {
          name: "recommendedTierLevel",
          label: t("entitlements.onboarding.rules.tier") || "Recommended Tier",
          type: "select" as const,
          defaultValue:
            item?.recommendedTierLevel !== undefined && item?.recommendedTierLevel !== null
              ? String(item.recommendedTierLevel)
              : undefined,
          options: [
            { value: "0", label: t("entitlements.onboarding.rules.tierFree") || "Free (0)" },
            { value: "1", label: t("entitlements.onboarding.rules.tierPro") || "Pro (1)" },
            { value: "2", label: t("entitlements.onboarding.rules.tierUltra") || "Ultra (2)" },
            {
              value: "3",
              label: t("entitlements.onboarding.rules.tierEnterprise") || "Enterprise (3)",
            },
          ],
        },
        {
          name: "scoreBonus",
          label: t("entitlements.onboarding.rules.scoreBonus") || "Score Bonus",
          type: "number" as const,
          required: true,
          defaultValue: item?.scoreBonus ?? 0,
        },
        {
          name: "reasonEn",
          label: t("entitlements.onboarding.rules.reasonEn") || "Reason (English)",
          type: "textarea" as const,
          required: true,
          defaultValue: item?.reasonEn ?? "",
        },
        {
          name: "reasonAr",
          label: t("entitlements.onboarding.rules.reasonAr") || "Reason (Arabic)",
          type: "textarea" as const,
          required: true,
          defaultValue: item?.reasonAr ?? "",
        },
        {
          name: "priority",
          label: t("entitlements.onboarding.rules.priority") || "Priority",
          type: "number" as const,
          defaultValue: item?.priority ?? 5,
        },
      ],

      getItemDisplayName: (item: RecommendationRule) => item.name,
    }),
    [t]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
