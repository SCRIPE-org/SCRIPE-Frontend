"use client";

import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { User, Building2, Eye, ArrowUpRight } from "lucide-react";
import type { CrmContact } from "../../domain/entities/ContactEntity";

interface ContactSplitDetailProps {
  readonly contact: CrmContact;
  readonly actions: React.ReactNode;
  readonly language: string;
  readonly onViewDetail: (id: string) => void;
  readonly onSelectAccount: (id: string) => void;
  readonly t: (key: string) => string;
}

export function ContactSplitDetail({
  contact,
  actions,
  language,
  onViewDetail,
  onSelectAccount,
  t,
}: ContactSplitDetailProps) {
  const isAr = language === "ar";
  const name = isAr && contact.personLegalNameAr ? contact.personLegalNameAr : contact.personLegalNameEn;
  const roleSubtitle =
    [contact.jobTitleSnapshot, contact.departmentName].filter(Boolean).join(" • ") || "—";
  const accountName = isAr && contact.primaryAccountNameAr
    ? contact.primaryAccountNameAr
    : contact.primaryAccountNameEn || t("crmContacts.detail.defaultAccountLabel");

  return (
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
      <div className="flex items-start justify-between border-b border-nx-line pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <User className="size-5 text-nx-accent" />
          </div>
          <div>
            <h3 className="text-base font-bold text-nx-ink">{name}</h3>
            {!isAr && contact.personLegalNameAr && (
              <p className="text-xs text-nx-ink-3 font-arabic">{contact.personLegalNameAr}</p>
            )}
            <p className="text-xs text-nx-ink-3 mt-0.5">{roleSubtitle}</p>
          </div>
        </div>
        {actions}
      </div>

      {contact.primaryAccountId && (
        <div
          className="p-3 rounded-nx-md border border-nx-line bg-nx-raised/40 hover:border-nx-accent transition-all cursor-pointer flex items-center justify-between"
          onClick={() => onSelectAccount(contact.primaryAccountId!)}
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="size-4 text-nx-accent" />
            <div>
              <span className="text-xs font-semibold text-nx-ink block hover:text-nx-accent">
                {accountName}
              </span>
              <span className="text-[10px] text-nx-ink-3">
                {t("crmContacts.detail.linkedOrganization")}
              </span>
            </div>
          </div>
          <ArrowUpRight className="size-3 text-nx-ink-3" />
        </div>
      )}

      {contact.commercialNotes && (
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-semibold text-nx-ink-3 font-mono">
            {t("crmContacts.detail.notes")}
          </span>
          <p className="text-xs text-nx-ink-2 bg-nx-raised/40 p-2.5 rounded-nx-md border border-nx-line/50 leading-relaxed">
            {contact.commercialNotes}
          </p>
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(contact.id)}
          className="h-7 text-xs gap-1.5 border-nx-line text-nx-ink hover:bg-nx-raised"
        >
          <Eye className="size-3 text-nx-accent" />
          <span>{t("crmContacts.actions.viewContext")}</span>
        </Button>
      </div>
    </Card>
  );
}
