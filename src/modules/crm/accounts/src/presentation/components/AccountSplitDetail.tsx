"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Building2, Users, Briefcase, Calendar } from "lucide-react";
import type { CrmAccount } from "../../domain/entities/AccountEntity";
import { AccountStatusBadge } from "./AccountStatusBadge";

interface AccountSplitDetailProps {
  readonly account: CrmAccount;
  readonly actions: React.ReactNode;
  readonly language: string;
  readonly t: (key: string) => string;
}

export function AccountSplitDetail({
  account,
  actions,
  language,
  t,
}: AccountSplitDetailProps) {
  const isAr = language === "ar";
  const name = isAr && account.partyLegalNameAr ? account.partyLegalNameAr : account.partyLegalNameEn;
  const formattedDate = account.createdAt
    ? new Date(account.createdAt).toLocaleDateString(
        isAr ? "ar-SA" : "en-US",
        { month: "short", day: "numeric", year: "numeric" }
      )
    : "—";

  return (
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
      <div className="flex items-start justify-between border-b border-nx-line pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <Building2 className="size-5 text-nx-accent" />
          </div>
          <div>
            <h3 className="text-base font-bold text-nx-ink">{name}</h3>
            {!isAr && account.partyLegalNameAr && (
              <p className="text-xs text-nx-ink-3 font-arabic">{account.partyLegalNameAr}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AccountStatusBadge tierCode={account.commercialTierCode} />
          {actions}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-nx-md bg-nx-raised/40 p-3 border border-nx-line space-y-1">
          <span className="text-[11px] text-nx-ink-3 font-mono block">
            {t("crmAccounts.table.contacts")}
          </span>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-nx-accent" />
            <span className="text-lg font-bold text-nx-ink font-mono">
              {account.linkedContactsCount}
            </span>
          </div>
        </div>

        <div className="rounded-nx-md bg-nx-raised/40 p-3 border border-nx-line space-y-1">
          <span className="text-[11px] text-nx-ink-3 font-mono block">
            {t("crmAccounts.table.opportunities")}
          </span>
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-nx-accent" />
            <span className="text-lg font-bold text-nx-ink font-mono">
              {account.activeOpportunitiesCount}
            </span>
          </div>
        </div>
      </div>

      {account.commercialNotes && (
        <div className="rounded-nx-md border border-nx-line bg-nx-raised/30 p-3.5 space-y-1.5">
          <span className="text-[11px] font-semibold text-nx-ink block font-mono">
            {t("crmAccounts.detail.commercialNotes")}
          </span>
          <p className="text-xs text-nx-ink-2 leading-relaxed">
            {account.commercialNotes}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-nx-ink-3 pt-2 border-t border-nx-line">
        <span className="font-mono">
          {t("crmAccounts.table.currency")}: {account.preferredCurrencyCode || "SAR"}
        </span>
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <Calendar className="size-3 text-nx-ink-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </Card>
  );
}
