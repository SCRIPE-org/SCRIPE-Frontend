"use client";

import React from "react";
import type { GroupDetailMetric } from "../../domain/entities/AcademyAnalytics";

interface GroupCapacityTableProps {
  groups: GroupDetailMetric[];
  locale?: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}

export function GroupCapacityTable({ groups, locale = "en", t }: GroupCapacityTableProps) {
  const isAr = locale === "ar";

  return (
    <div className="rounded-lg border border-nx-line bg-nx-surface overflow-hidden">
      <div className="p-4 border-b border-nx-line flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-nx-ink">
            {t("groupTable.title")}
          </h2>
          <p className="text-xs text-nx-ink-3 mt-0.5">
            {t("kpi.groupCapacitySub")}
          </p>
        </div>
        <span className="text-xs font-mono text-nx-ink-3">
          {groups.length} {isAr ? "مجموعات" : "groups"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left rtl:text-right border-collapse text-xs">
          <thead>
            <tr className="border-b border-nx-line bg-nx-ground/50 text-nx-ink-3">
              <th className="py-2.5 px-4 font-medium">{t("groupTable.groupName")}</th>
              <th className="py-2.5 px-4 font-medium">{t("groupTable.offering")}</th>
              <th className="py-2.5 px-4 font-medium">{t("groupTable.capacity")}</th>
              <th className="py-2.5 px-4 font-medium">{t("groupTable.activeMembers")}</th>
              <th className="py-2.5 px-4 font-medium">{t("groupTable.fillRate")}</th>
              <th className="py-2.5 px-4 font-medium">{t("groupTable.status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-line/60">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-nx-ink-3">
                  {t("groupTable.empty")}
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const name = isAr && group.groupNameAr ? group.groupNameAr : group.groupNameEn;
                const offering = isAr && group.offeringNameEn ? group.offeringNameEn : group.offeringNameEn;
                const isZeroMax = group.maxCapacity === 0;
                const isAtCapacity = group.maxCapacity > 0 && group.activeMembers >= group.maxCapacity;

                const statusLabel = isZeroMax
                  ? t("groupTable.statusUncapped")
                  : isAtCapacity
                  ? t("groupTable.statusFull")
                  : t("groupTable.statusActive");

                return (
                  <tr key={group.groupId} className="hover:bg-nx-raised/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-nx-ink">
                      {name}
                    </td>
                    <td className="py-3 px-4 text-nx-ink-2">
                      {offering}
                    </td>
                    <td className="py-3 px-4 font-mono text-nx-ink-2">
                      {isZeroMax
                        ? t("groupTable.zeroCapacityWarning")
                        : t("groupTable.minMaxFormat", { min: group.minCapacity, max: group.maxCapacity })}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-nx-ink">
                      {group.activeMembers}
                    </td>
                    <td className="py-3 px-4">
                      {isZeroMax ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          0.0% ({t("groupTable.zeroCapacityWarning")})
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-nx-ground overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                group.fillRatePercent >= 100
                                  ? "bg-rose-500"
                                  : group.fillRatePercent >= 75
                                  ? "bg-emerald-500"
                                  : "bg-nx-accent"
                              }`}
                              style={{ width: `${Math.min(group.fillRatePercent, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-medium text-nx-ink">
                            {group.fillRatePercent.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isAtCapacity
                            ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                            : isZeroMax
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-nx-raised text-nx-ink-2 border-nx-line"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
