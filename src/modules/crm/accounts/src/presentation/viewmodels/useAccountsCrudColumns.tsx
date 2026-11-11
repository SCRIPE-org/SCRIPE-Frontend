"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@core/ui/badge";
import { Building2, Users, Briefcase, Calendar } from "lucide-react";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import type { CrmAccount } from "../../domain/entities/AccountEntity";
import { AccountStatusBadge } from "../components/AccountStatusBadge";

export function useAccountsCrudColumns(
  language: string,
  t: (key: string) => string
): CrudColumn<CrmAccount>[] {
  const router = useRouter();

  return useMemo<CrudColumn<CrmAccount>[]>(
    () => [
      {
        key: "partyLegalNameEn",
        label: t("crmAccounts.table.account"),
        sortable: true,
        render: (_val, account: CrmAccount) => (
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push(`/crm/accounts/${account.id}`)}
          >
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
        ),
      },
      {
        key: "commercialTierCode",
        label: t("crmAccounts.table.tier"),
        sortable: true,
        render: (_val, account: CrmAccount) => (
          <AccountStatusBadge tierCode={account.commercialTierCode} />
        ),
      },
      {
        key: "preferredCurrencyCode",
        label: t("crmAccounts.table.currency"),
        render: (_val, account: CrmAccount) => (
          <span className="text-nx-ink font-mono font-medium">
            {account.preferredCurrencyCode || "SAR"}
          </span>
        ),
      },
      {
        key: "linkedContactsCount",
        label: t("crmAccounts.table.contacts"),
        sortable: true,
        render: (_val, account: CrmAccount) => (
          <Badge
            variant="outline"
            className="border-nx-line bg-nx-raised/60 text-nx-ink-2 gap-1 font-mono text-[11px]"
          >
            <Users className="size-3 text-nx-ink-3" />
            {account.linkedContactsCount}
          </Badge>
        ),
      },
      {
        key: "activeOpportunitiesCount",
        label: t("crmAccounts.table.opportunities"),
        sortable: true,
        render: (_val, account: CrmAccount) => (
          <Badge
            variant="outline"
            className="border-nx-line bg-nx-raised/60 text-nx-ink-2 gap-1 font-mono text-[11px]"
          >
            <Briefcase className="size-3 text-nx-ink-3" />
            {account.activeOpportunitiesCount}
          </Badge>
        ),
      },
      {
        key: "createdAt",
        label: t("crmAccounts.table.createdAt"),
        sortable: true,
        render: (_val, account: CrmAccount) => {
          const formattedDate = account.createdAt
            ? new Date(account.createdAt).toLocaleDateString(
                language === "ar" ? "ar-SA" : "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )
            : "—";
          return (
            <div className="flex items-center gap-1 text-nx-ink-3 text-[11px]">
              <Calendar className="size-3 text-nx-ink-3" />
              {formattedDate}
            </div>
          );
        },
      },
    ],
    [language, t, router]
  );
}
