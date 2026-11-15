"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Building2, Users, Briefcase, Eye, Calendar } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@core/ui/table";
import { cn } from "@core/common/utils";
import type { CrmAccount } from "../../domain/entities/AccountEntity";
import { AccountStatusBadge } from "./AccountStatusBadge";

interface AccountsTableProps {
  accounts: CrmAccount[];
  className?: string;
}

export function AccountsTable({ accounts, className }: AccountsTableProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  if (accounts.length === 0) {
    return (
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-8 text-center">
        <EmptyState
          title={t("crmAccounts.table.emptyTitle")}
          description={t("crmAccounts.table.emptyDescription")}
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
              <TableHead className="px-4 py-3 text-start">{t("crmAccounts.table.account")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmAccounts.table.tier")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmAccounts.table.currency")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmAccounts.table.contacts")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmAccounts.table.opportunities")}</TableHead>
              <TableHead className="px-4 py-3 text-start">{t("crmAccounts.table.createdAt")}</TableHead>
              <TableHead className="px-4 py-3 text-end">{t("crmAccounts.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-nx-line">
            {accounts.map((account) => {
              const formattedDate = account.createdAt
                ? new Date(account.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <TableRow
                  key={account.id}
                  className="hover:bg-nx-raised/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/crm/accounts/${account.id}`)}
                >
                  <TableCell className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
                        <Building2 className="size-3.5 text-nx-accent" />
                      </div>
                      <div>
                        <span className="font-semibold text-nx-ink block hover:text-nx-accent transition-colors">
                          {language === "ar" && account.partyLegalNameAr
                            ? account.partyLegalNameAr
                            : account.partyLegalNameEn}
                        </span>
                        {language !== "ar" && account.partyLegalNameAr && (
                          <span className="text-[11px] text-nx-ink-3 block font-arabic">
                            {account.partyLegalNameAr}
                          </span>
                        )}
                        {account.commercialNotes && (
                          <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5 max-w-xs">
                            {account.commercialNotes}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <AccountStatusBadge tierCode={account.commercialTierCode} />
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap text-nx-ink font-mono font-medium">
                    {account.preferredCurrencyCode || "SAR"}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="border-nx-line bg-nx-raised/60 text-nx-ink-2 gap-1 font-mono tabular-nums text-[11px]"
                    >
                      <Users className="size-3 text-nx-ink-3" />
                      {account.linkedContactsCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="border-nx-line bg-nx-raised/60 text-nx-ink-2 gap-1 font-mono tabular-nums text-[11px]"
                    >
                      <Briefcase className="size-3 text-nx-ink-3" />
                      {account.activeOpportunitiesCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap text-nx-ink-3 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 text-nx-ink-3" />
                      {formattedDate}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 whitespace-nowrap text-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/crm/accounts/${account.id}`)}
                      className="h-7 px-2.5 text-xs gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised text-nx-ink"
                    >
                      <Eye className="size-3 text-nx-accent" />
                      <span>{t("crmAccounts.actions.view360")}</span>
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
