"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { Building2, Users, Briefcase, Eye, Calendar } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import type { CrmAccount } from "../../domain/models/crm-account.types";
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
          title={t("crmAccounts.table.emptyTitle") || "No Accounts Found"}
          description={
            t("crmAccounts.table.emptyDescription") ||
            "No commercial accounts match the current filter or search criteria."
          }
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
              <th className="px-4 py-3 text-start">{t("crmAccounts.table.account") || "Account / Organization"}</th>
              <th className="px-4 py-3 text-start">{t("crmAccounts.table.tier") || "Commercial Tier"}</th>
              <th className="px-4 py-3 text-start">{t("crmAccounts.table.currency") || "Currency"}</th>
              <th className="px-4 py-3 text-start">{t("crmAccounts.table.contacts") || "Contacts"}</th>
              <th className="px-4 py-3 text-start">{t("crmAccounts.table.opportunities") || "Deals"}</th>
              <th className="px-4 py-3 text-start">{t("crmAccounts.table.createdAt") || "Created"}</th>
              <th className="px-4 py-3 text-end">{t("crmAccounts.table.actions") || "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-line">
            {accounts.map((account) => {
              const formattedDate = account.createdAt
                ? new Date(account.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr
                  key={account.id}
                  className="hover:bg-nx-surfaceSubtle/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/crm/accounts/${account.id}`)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-nx-md bg-nx-surfaceSubtle border border-nx-line flex items-center justify-center shrink-0">
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
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <AccountStatusBadge tierCode={account.commercialTierCode} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-nx-ink font-mono font-medium">
                    {account.preferredCurrencyCode || "SAR"}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="border-nx-line bg-nx-surfaceSubtle/60 text-nx-ink-2 gap-1 font-mono text-[11px]"
                    >
                      <Users className="size-3 text-nx-ink-3" />
                      {account.linkedContactsCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className="border-nx-line bg-nx-surfaceSubtle/60 text-nx-ink-2 gap-1 font-mono text-[11px]"
                    >
                      <Briefcase className="size-3 text-nx-ink-3" />
                      {account.activeOpportunitiesCount}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-nx-ink-3 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 text-nx-ink-3" />
                      {formattedDate}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/crm/accounts/${account.id}`)}
                      className="h-7 px-2.5 text-xs gap-1 border border-nx-line bg-nx-surface hover:bg-nx-surfaceSubtle text-nx-ink"
                    >
                      <Eye className="size-3 text-nx-accent" />
                      <span>{t("crmAccounts.actions.view360") || "View 360"}</span>
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
