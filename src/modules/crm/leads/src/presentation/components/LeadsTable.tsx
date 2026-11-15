"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { User, Mail, Phone, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";
import { cn } from "@core/common/utils";
import type { CrmLead } from "../../domain/entities/LeadEntity";
import { LeadStatusBadge } from "./LeadStatusBadge";

interface LeadsTableProps {
  leads: CrmLead[];
  className?: string;
}

export function LeadsTable({ leads, className }: LeadsTableProps) {
  const router = useRouter();
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
        <Table className="w-full text-start text-xs border-collapse" dir={isRtl ? "rtl" : "ltr"}>
          <TableHeader>
            <TableRow className="border-b border-nx-line bg-nx-raised/50 text-nx-ink-2 font-semibold">
              <TableHead className="px-4 py-3 text-start">{t("crmLeads.table.title")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmLeads.table.contact")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmLeads.table.company")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmLeads.table.status")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmLeads.table.estimatedValue")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmLeads.table.source")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmLeads.table.date")}</TableHead>
              <TableHead className="px-4 py-3 text-end">{t("crmLeads.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-nx-line">
            {leads.map((lead) => {
              const formattedDate = lead.createdAt
                ? new Date(lead.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <TableRow
                  key={lead.id}
                  onClick={() => router.push(`/crm/leads/${lead.id}`)}
                  className="group hover:bg-nx-raised/40 transition-colors duration-nx-micro cursor-pointer"
                >
                  {/* Title */}
                  <TableCell className="px-4 py-3 max-w-xs">
                    <span className="font-semibold text-nx-ink group-hover:text-nx-accent transition-colors line-clamp-1 block">
                      {lead.title}
                    </span>
                    {lead.notes && (
                      <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5">
                        {lead.notes}
                      </span>
                    )}
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="size-5 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
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
                  </TableCell>

                  {/* Company */}
                  <TableCell className="px-4 py-3">
                    <span className="font-medium text-nx-ink-2 truncate max-w-[160px] block">
                      {lead.companyName || "—"}
                    </span>
                    {lead.phone && (
                      <span className="text-[11px] text-nx-ink-3 flex items-center gap-1 mt-0.5">
                        <Phone className="size-2.5" />
                        {lead.phone}
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>

                  {/* Estimated Value */}
                  <TableCell className="px-4 py-3 font-bold tabular-nums text-nx-ink">
                    {lead.estimatedValue !== undefined && lead.estimatedValue !== null
                      ? `${lead.currency} ${lead.estimatedValue.toLocaleString()}`
                      : "—"}
                  </TableCell>

                  {/* Source */}
                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-nx-sm bg-nx-raised border border-nx-line text-[11px] text-nx-ink-2">
                      {lead.source || t("crmLeads.detail.directSource")}
                    </span>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="px-4 py-3 text-nx-ink-3">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-2.5" />
                      {formattedDate}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-4 py-3 text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/crm/leads/${lead.id}`);
                      }}
                      className="h-7 px-2 text-xs text-nx-ink-2 hover:text-nx-ink hover:bg-nx-raised gap-1"
                    >
                      <span>{t("crmLeads.actions.viewDetails")}</span>
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
