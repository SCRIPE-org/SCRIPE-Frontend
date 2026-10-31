"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { User, Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import type { CrmLead } from "../../domain/models/crm-lead.types";
import { LeadStatusBadge } from "./LeadStatusBadge";

interface LeadsTableProps {
  leads: CrmLead[];
  className?: string;
}

export function LeadsTable({ leads, className }: LeadsTableProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  if (leads.length === 0) {
    return (
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-8 text-center">
        <EmptyState
          title={t("crmLeads.table.emptyTitle")}
          description={t("crmLeads.table.emptyDescription")}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden",
        className
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-nx-line bg-nx-surfaceSubtle/50 text-nx-ink-2 font-semibold">
              <th className="px-4 py-3 text-start">{t("crmLeads.table.title")}</th>
              <th className="px-4 py-3 text-start">{t("crmLeads.table.contact")}</th>
              <th className="px-4 py-3 text-start">{t("crmLeads.table.company")}</th>
              <th className="px-4 py-3 text-start">{t("crmLeads.table.status")}</th>
              <th className="px-4 py-3 text-start">{t("crmLeads.table.estimatedValue")}</th>
              <th className="px-4 py-3 text-start">{t("crmLeads.table.source")}</th>
              <th className="px-4 py-3 text-start">{t("crmLeads.table.date")}</th>
              <th className="px-4 py-3 text-end">{t("crmLeads.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-line">
            {leads.map((lead) => {
              const formattedDate = lead.createdAt
                ? new Date(lead.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr
                  key={lead.id}
                  className="group hover:bg-nx-surfaceSubtle/40 transition-colors duration-nx-micro"
                >
                  {/* Title */}
                  <td className="px-4 py-3 max-w-xs">
                    <span className="font-semibold text-nx-ink line-clamp-1 block">
                      {lead.title}
                    </span>
                    {lead.notes && (
                      <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5">
                        {lead.notes}
                      </span>
                    )}
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="size-5 rounded-full bg-nx-surfaceSubtle border border-nx-line flex items-center justify-center shrink-0">
                        <User className="size-3 text-nx-ink-3" />
                      </div>
                      <div>
                        <span className="font-medium text-nx-ink block">{lead.fullName}</span>
                        {lead.email && (
                          <span className="text-[11px] text-nx-ink-3 flex items-center gap-1">
                            <Mail className="size-2.5" />
                            {lead.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-nx-ink-2 truncate max-w-[160px] block">
                      {lead.companyName || "—"}
                    </span>
                    {lead.phone && (
                      <span className="text-[11px] text-nx-ink-3 flex items-center gap-1 mt-0.5">
                        <Phone className="size-2.5" />
                        {lead.phone}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>

                  {/* Estimated Value */}
                  <td className="px-4 py-3 font-bold text-nx-ink">
                    {lead.estimatedValue !== undefined && lead.estimatedValue !== null
                      ? `${lead.currency} ${lead.estimatedValue.toLocaleString()}`
                      : "—"}
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-nx-xs bg-nx-surfaceSubtle border border-nx-line text-[11px] text-nx-ink-2">
                      {lead.source || "Direct"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-nx-ink-3">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-2.5" />
                      {formattedDate}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-nx-ink-2 hover:text-nx-ink hover:bg-nx-surfaceSubtle gap-1"
                    >
                      <span>{t("crmLeads.actions.viewDetails")}</span>
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
