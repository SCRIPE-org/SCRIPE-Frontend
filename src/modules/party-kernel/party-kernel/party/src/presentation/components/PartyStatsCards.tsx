"use client";

import React, { memo } from "react";
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

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Total Parties */}
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelectType("all")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectType("all");
          }
        }}
        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-start transition-all ${
          selectedType === "all"
            ? "border-nx-accent bg-nx-accent/5"
            : "border-nx-line hover:border-nx-line-hi hover:bg-nx-raised/40 bg-nx-surface"
        }`}
      >
        <div className="space-y-1">
          <span className="text-xs font-medium text-nx-ink-2">
            {t("party.directory.totalParties")}
          </span>
          <div className="text-2xl font-bold text-nx-ink">{stats.total}</div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            selectedType === "all"
              ? "bg-nx-accent-fill text-nx-on-fill"
              : "bg-nx-raised text-nx-ink-2"
          }`}
        >
          <Users className="h-5 w-5" />
        </div>
      </Card>

      {/* People */}
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelectType("Person")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectType("Person");
          }
        }}
        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-start transition-all ${
          selectedType === "Person"
            ? "border-info/40 bg-info/10"
            : "border-nx-line hover:border-nx-line-hi hover:bg-nx-raised/40 bg-nx-surface"
        }`}
      >
        <div className="space-y-1">
          <span className="text-xs font-medium text-nx-ink-2">
            {t("party.directory.totalPeople")}
          </span>
          <div className="text-2xl font-bold text-nx-ink">{stats.people}</div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            selectedType === "Person"
              ? "bg-info/20 text-info"
              : "bg-nx-raised text-nx-ink-2"
          }`}
        >
          <User className="h-5 w-5" />
        </div>
      </Card>

      {/* Organizations */}
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onSelectType("Organization")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectType("Organization");
          }
        }}
        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-start transition-all ${
          selectedType === "Organization"
            ? "border-success/40 bg-success/10"
            : "border-nx-line hover:border-nx-line-hi hover:bg-nx-raised/40 bg-nx-surface"
        }`}
      >
        <div className="space-y-1">
          <span className="text-xs font-medium text-nx-ink-2">
            {t("party.directory.totalOrganizations")}
          </span>
          <div className="text-2xl font-bold text-nx-ink">{stats.organizations}</div>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            selectedType === "Organization"
              ? "bg-success/20 text-success"
              : "bg-nx-raised text-nx-ink-2"
          }`}
        >
          <Building className="h-5 w-5" />
        </div>
      </Card>
    </div>
  );
});
