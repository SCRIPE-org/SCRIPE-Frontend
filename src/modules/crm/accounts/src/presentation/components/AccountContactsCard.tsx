"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Mail, Phone, Users } from "lucide-react";
import type { CrmAccountContactItem } from "../../domain/entities/AccountEntity";

export interface AccountContactsCardProps {
  readonly contacts?: CrmAccountContactItem[];
  readonly language: string;
  readonly isRtl: boolean;
  readonly t: (key: string) => string;
  readonly onSelectContact: (id: string) => void;
  readonly onViewAllContacts: () => void;
}

export function AccountContactsCard({
  contacts = [],
  language,
  isRtl,
  t,
  onSelectContact,
  onViewAllContacts,
}: AccountContactsCardProps) {
  return (
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden space-y-3 p-4">
      <div className="flex items-center justify-between border-b border-nx-line pb-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-nx-accent" />
          <h2 className="text-sm font-bold text-nx-ink">{t("crmAccounts.detail.contactsTitle")}</h2>
        </div>
        <Badge variant="outline" className="border-nx-line text-nx-ink-3 font-mono text-[11px]">
          {Number(contacts.length).toLocaleString(isRtl ? "ar-SA" : "en-US")}
        </Badge>
      </div>

      {contacts.length === 0 ? (
        <div className="py-6 text-center space-y-2.5">
          <p className="text-xs text-nx-ink-3">{t("crmAccounts.detail.noContacts")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onViewAllContacts}
            className="h-7 text-xs gap-1.5 border-nx-line hover:border-nx-accent"
          >
            <Users className="size-3 text-nx-accent" />
            <span>{t("crmAccounts.detail.viewContactsBtn")}</span>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-nx-line">
          {contacts.map((c) => (
            <div key={c.id} className="py-1 first:pt-0 last:pb-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onSelectContact(c.id)}
                className="group h-auto w-full justify-between gap-2 whitespace-normal rounded-nx-md px-1 py-2 text-start font-normal text-nx-ink hover:bg-nx-raised/30 hover:text-nx-ink"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-nx-line bg-nx-raised">
                    <Users className="size-3 text-nx-ink-3" aria-hidden="true" />
                  </span>
                  <span className="block min-w-0">
                    <span className="block text-xs font-semibold text-nx-ink group-hover:text-nx-accent">
                      {language === "ar" && c.fullNameAr ? c.fullNameAr : c.fullNameEn}
                    </span>
                    {(c.jobTitle || c.department) && (
                      <span className="block text-[11px] text-nx-ink-3">
                        {[c.jobTitle, c.department].filter(Boolean).join(" • ")}
                      </span>
                    )}
                  </span>
                </span>
                <span className="block shrink-0 space-y-0.5 text-end text-[11px] text-nx-ink-3">
                  {c.email && (
                    <span className="flex items-center justify-end gap-1">
                      <Mail className="size-2.5" aria-hidden="true" />
                      <span>{c.email}</span>
                    </span>
                  )}
                  {c.phone && (
                    <span className="flex items-center justify-end gap-1 font-mono">
                      <Phone className="size-2.5" aria-hidden="true" />
                      <span>{c.phone}</span>
                    </span>
                  )}
                </span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
