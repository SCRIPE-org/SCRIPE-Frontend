"use client";

import React, { memo } from "react";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import { Users, User, Building } from "lucide-react";

export interface PartyStatsCardsProps {
  stats: {
    total: number;
    people: number;
    organizations: number;
  };
  selectedType: "all" | "Person" | "Organization";
  onSelectType: (type: "all" | "Person" | "Organization") => void;
}

/**
 * Metric filter chips for Party Directory: Total Parties, People, Organizations.
 */
export const PartyStatsCards = memo(function PartyStatsCards({
  stats,
  selectedType,
  onSelectType,
}: PartyStatsCardsProps) {
  const { t } = useI18n();

  const cards = [
    {
      type: "all" as const,
      label: t("party.directory.totalParties"),
      value: stats.total,
      icon: Users,
      activeCardClass: "border-nx-accent bg-nx-accent-wash",
      activeIconClass: "bg-nx-accent-fill text-nx-on-fill",
    },
    {
      type: "Person" as const,
      label: t("party.directory.totalPeople"),
      value: stats.people,
      icon: User,
      activeCardClass: "border-info/40 bg-info/10",
      activeIconClass: "bg-info/20 text-info",
    },
    {
      type: "Organization" as const,
      label: t("party.directory.totalOrganizations"),
      value: stats.organizations,
      icon: Building,
      activeCardClass: "border-success/40 bg-success/10",
      activeIconClass: "bg-success/20 text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card) => {
        const isSelected = selectedType === card.type;
        const Icon = card.icon;
        return (
          <Card
            key={card.type}
            className={`overflow-hidden rounded-xl border transition-all ${
              isSelected
                ? card.activeCardClass
                : "border-nx-line bg-nx-surface hover:border-nx-line-hi hover:bg-nx-raised/40"
            }`}
          >
            <Button
              type="button"
              variant="ghost"
              aria-pressed={isSelected}
              onClick={() => onSelectType(card.type)}
              className="h-auto w-full justify-between whitespace-normal rounded-xl p-4 text-start font-normal hover:bg-transparent"
            >
              <span className="space-y-1">
                <span className="block text-xs font-medium text-nx-ink-2">{card.label}</span>
                <span className="block text-2xl font-bold text-nx-ink tabular-nums">
                  {card.value}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? card.activeIconClass : "bg-nx-raised text-nx-ink-2"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </Button>
          </Card>
        );
      })}
    </div>
  );
});
