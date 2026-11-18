"use client";

import { Card } from "@core/ui/card";
import { Mail, Phone, User } from "lucide-react";
import type { CrmContactContext } from "../../domain/entities/ContactEntity";

interface ContactDetailProfileCardProps {
  contact: CrmContactContext;
  language: string;
  isRtl: boolean;
  t: (key: string) => string;
}

/** Displays primary identity, contact points, deal count, and commercial notes for ContactDetailView. */
export function ContactDetailProfileCard({
  contact,
  language,
  isRtl,
  t,
}: ContactDetailProfileCardProps) {
  const roleSubtitle = [contact.jobTitleSnapshot, contact.departmentName].filter(Boolean).join(" • ");

  return (
    <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
            <User className="size-6 text-nx-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-nx-ink font-heading">
              {language === "ar" && contact.personLegalNameAr
                ? contact.personLegalNameAr
                : contact.personLegalNameEn}
            </h1>
            {contact.personLegalNameAr && language !== "ar" && (
              <p className="text-xs text-nx-ink-3 font-arabic mt-0.5">{contact.personLegalNameAr}</p>
            )}
            {roleSubtitle && <p className="text-xs text-nx-ink-2 mt-1">{roleSubtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-nx-md border border-nx-line bg-nx-raised/50 px-3 py-1.5 text-center">
            <span className="text-[10px] text-nx-ink-3 uppercase tracking-wider block font-semibold">
              {t("crmContacts.detail.dealsTitle")}
            </span>
            <span className="text-base font-bold text-nx-ink font-mono">
              {Number(contact.opportunities?.length ?? 0).toLocaleString(isRtl ? "ar-SA" : "en-US")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-nx-line text-xs">
        {contact.email && (
          <div className="flex items-center gap-2 text-nx-ink-2">
            <Mail className="size-4 text-nx-accent shrink-0" />
            <span className="font-mono">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-nx-ink-2">
            <Phone className="size-4 text-nx-accent shrink-0" />
            <span className="font-mono">{contact.phone}</span>
          </div>
        )}
      </div>

      {contact.commercialNotes && (
        <div className="pt-3 border-t border-nx-line">
          <span className="text-[11px] font-semibold text-nx-ink-3 uppercase block mb-1">
            {t("crmContacts.detail.notes")}
          </span>
          <p className="text-xs text-nx-ink-2 leading-relaxed bg-nx-raised/40 p-2.5 rounded-nx-md border border-nx-line/50">
            {contact.commercialNotes}
          </p>
        </div>
      )}
    </Card>
  );
}
