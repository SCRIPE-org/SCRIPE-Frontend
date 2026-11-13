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
            <div
              key={c.id}
              className="py-2.5 flex items-center justify-between gap-2 hover:bg-nx-raised/30 px-1 rounded-nx-md cursor-pointer transition-colors"
              onClick={() => onSelectContact(c.id)}
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
                  <Users className="size-3 text-nx-ink-3" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-nx-ink block hover:text-nx-accent">
                    {language === "ar" && c.fullNameAr ? c.fullNameAr : c.fullNameEn}
                  </span>
                  {(c.jobTitle || c.department) && (
                    <span className="text-[11px] text-nx-ink-3 block">
                      {[c.jobTitle, c.department].filter(Boolean).join(" • ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-end text-[11px] text-nx-ink-3 space-y-0.5">
                {c.email && (
                  <div className="flex items-center gap-1 justify-end">
                    <Mail className="size-2.5" />
                    <span>{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1 justify-end font-mono">
                    <Phone className="size-2.5" />
                    <span>{c.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
