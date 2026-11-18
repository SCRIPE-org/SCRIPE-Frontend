"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Building2 } from "lucide-react";
import type { CrmAccount360 } from "../../domain/entities/AccountEntity";
import { AccountStatusBadge } from "./AccountStatusBadge";

interface AccountDetailProfileCardProps {
  account: CrmAccount360;
  language: string;
  isRtl: boolean;
  t: (key: string) => string;
}

/** Displays legal organization header, tier badge, currency badge, counters, and commercial notes. */
export function AccountDetailProfileCard({
  account,
  language,
  isRtl,
  t,
}: AccountDetailProfileCardProps) {
  return (
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <Building2 className="size-6 text-nx-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-nx-ink font-heading">
                {language === "ar" && account.partyLegalNameAr
                  ? account.partyLegalNameAr
                  : account.partyLegalNameEn}
              </h1>
              <AccountStatusBadge tierCode={account.commercialTierCode} />
              <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink-2 font-mono text-[11px]">
                {account.preferredCurrencyCode || "SAR"}
              </Badge>
            </div>
            {account.partyLegalNameAr && language !== "ar" && (
              <p className="text-xs text-nx-ink-3 font-arabic mt-0.5">{account.partyLegalNameAr}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-nx-md border border-nx-line bg-nx-raised/50 px-3 py-1.5 text-center">
            <span className="text-[10px] text-nx-ink-3 uppercase tracking-wider block font-semibold">
              {t("crmAccounts.table.contacts")}
            </span>
            <span className="text-base font-bold text-nx-ink font-mono">
              {Number(account.contacts?.length ?? account.linkedContactsCount ?? 0).toLocaleString(isRtl ? "ar-SA" : "en-US")}
            </span>
          </div>
          <div className="rounded-nx-md border border-nx-line bg-nx-raised/50 px-3 py-1.5 text-center">
            <span className="text-[10px] text-nx-ink-3 uppercase tracking-wider block font-semibold">
              {t("crmAccounts.table.opportunities")}
            </span>
            <span className="text-base font-bold text-nx-ink font-mono">
              {Number(account.opportunities?.length ?? account.activeOpportunitiesCount ?? 0).toLocaleString(isRtl ? "ar-SA" : "en-US")}
            </span>
          </div>
        </div>
      </div>
      {account.commercialNotes && (
        <div className="pt-3 border-t border-nx-line">
          <span className="text-[11px] font-semibold text-nx-ink-3 uppercase block mb-1">
            {t("crmAccounts.detail.notes")}
          </span>
          <p className="text-xs text-nx-ink-2 leading-relaxed bg-nx-raised/40 p-2.5 rounded-nx-md border border-nx-line/50">
            {account.commercialNotes}
          </p>
        </div>
      )}
    </Card>
  );
}
