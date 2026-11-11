"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Building2, Users, Briefcase } from "lucide-react";
import type { CrmAccount } from "../../domain/entities/AccountEntity";
import { AccountStatusBadge } from "./AccountStatusBadge";

interface AccountCardGridItemProps {
  readonly account: CrmAccount;
  readonly actions: React.ReactNode;
  readonly language: string;
  readonly onViewDetail: (id: string) => void;
  readonly t: (key: string) => string;
}

export function AccountCardGridItem({
  account,
  actions,
  language,
  onViewDetail,
  t,
}: AccountCardGridItemProps) {
  const isAr = language === "ar";
  const name = isAr && account.partyLegalNameAr ? account.partyLegalNameAr : account.partyLegalNameEn;

  return (
    <Card className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
              <Building2 className="size-3.5 text-nx-accent" />
            </div>
            <div>
              <span
                className="font-bold text-sm text-nx-ink hover:text-nx-accent cursor-pointer line-clamp-1"
                onClick={() => onViewDetail(account.id)}
              >
                {name}
              </span>
              {!isAr && account.partyLegalNameAr && (
                <span className="text-[10px] text-nx-ink-3 block font-arabic">
                  {account.partyLegalNameAr}
                </span>
              )}
            </div>
          </div>
          <AccountStatusBadge tierCode={account.commercialTierCode} />
        </div>
        {account.commercialNotes && (
          <p className="text-xs text-nx-ink-3 line-clamp-2 leading-relaxed">
            {account.commercialNotes}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-nx-ink-3">
          <Badge variant="outline" className="border-nx-line bg-nx-raised/60 gap-1 font-mono text-[10px]">
            <Users className="size-2.5 text-nx-ink-3" />
            {account.linkedContactsCount} {t("crmAccounts.table.contacts")}
          </Badge>
          <Badge variant="outline" className="border-nx-line bg-nx-raised/60 gap-1 font-mono text-[10px]">
            <Briefcase className="size-2.5 text-nx-ink-3" />
            {account.activeOpportunitiesCount} {t("crmAccounts.table.opportunities")}
          </Badge>
        </div>
      </div>
      <div className="border-t border-nx-line pt-3 flex items-center justify-between">
        <span className="text-xs font-mono text-nx-ink-2">
          {account.preferredCurrencyCode || "SAR"}
        </span>
        {actions}
      </div>
    </Card>
  );
}
