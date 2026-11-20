"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { cn } from "@core/common/utils";
import type { CrmAccount } from "@modules/crm";
import { Search } from "lucide-react";

/** Props for `ContactsToolbarContent`. */
export interface ContactsToolbarContentProps {
  t: (key: string) => string;
  isRtl: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  accountId: string | undefined;
  onAccountFilterChange: (id?: string) => void;
  accountsList: CrmAccount[];
}

/** Search input and quick account filter chips for the CRM Contacts directory toolbar. */
export function ContactsToolbarContent({
  t,
  isRtl,
  search,
  onSearchChange,
  accountId,
  onAccountFilterChange,
  accountsList,
}: ContactsToolbarContentProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1" dir={isRtl ? "rtl" : "ltr"}>
      <div className="relative w-full sm:w-72">
        <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-nx-ink-3 pointer-events-none" />
        <Input
          type="text"
          placeholder={t("crmContacts.searchPlaceholder")}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 ps-8 pe-3 text-xs bg-nx-surface border-nx-line text-nx-ink"
        />
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAccountFilterChange(undefined)}
          className={cn(
            "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
            !accountId
              ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
              : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
          )}
        >
          {t("crmContacts.filters.allAccounts")}
        </Button>
        {accountsList.slice(0, 5).map((acc) => {
          const isSelected = accountId === acc.id;
          const name = isRtl && acc.partyLegalNameAr ? acc.partyLegalNameAr : acc.partyLegalNameEn;
          return (
            <Button
              key={acc.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAccountFilterChange(isSelected ? undefined : acc.id)}
              className={cn(
                "h-7 px-2.5 text-xs rounded-nx-md shrink-0 transition-all",
                isSelected
                  ? "border-nx-accent/40 bg-nx-accent-wash text-nx-accent font-semibold"
                  : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink"
              )}
            >
              {name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
