"use client";

import { Card } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { User, Mail } from "lucide-react";
import type { CrmContact } from "../../domain/entities/ContactEntity";

interface ContactCardGridItemProps {
  readonly contact: CrmContact;
  readonly actions: React.ReactNode;
  readonly language: string;
  readonly onViewDetail: (id: string) => void;
  readonly t: (key: string) => string;
}

/** Grid card item displaying a CRM Contact's name, role, account, and actions. */
export function ContactCardGridItem({
  contact,
  actions,
  language,
  onViewDetail,
  t,
}: ContactCardGridItemProps) {
  const isAr = language === "ar";
  const name = isAr && contact.personLegalNameAr ? contact.personLegalNameAr : contact.personLegalNameEn;
  const accountName = isAr && contact.primaryAccountNameAr
    ? contact.primaryAccountNameAr
    : contact.primaryAccountNameEn || t("crmContacts.table.noAccount");

  return (
    <Card className="flex flex-col justify-between gap-3 rounded-nx-lg border border-nx-line bg-nx-surface p-4 hover:border-nx-line-hi transition-all">
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
              <User className="size-3.5 text-nx-accent" />
            </div>
            <div>
              <span
                className="font-bold text-sm text-nx-ink hover:text-nx-accent cursor-pointer line-clamp-1"
                onClick={() => onViewDetail(contact.id)}
              >
                {name}
              </span>
              {!isAr && contact.personLegalNameAr && (
                <span className="text-[10px] text-nx-ink-3 block font-arabic">
                  {contact.personLegalNameAr}
                </span>
              )}
            </div>
          </div>
          {contact.jobTitleSnapshot && (
            <Badge variant="outline" className="border-nx-line bg-nx-raised text-[10px]">
              {contact.jobTitleSnapshot}
            </Badge>
          )}
        </div>
        {contact.email && (
          <div className="text-xs text-nx-ink-3 flex items-center gap-1.5">
            <Mail className="size-3" />
            <span>{contact.email}</span>
          </div>
        )}
        {contact.commercialNotes && (
          <p className="text-xs text-nx-ink-3 line-clamp-2 leading-relaxed">
            {contact.commercialNotes}
          </p>
        )}
      </div>
      <div className="border-t border-nx-line pt-3 flex items-center justify-between">
        <span className="text-xs text-nx-ink-2 truncate max-w-[150px]">
          {accountName}
        </span>
        {actions}
      </div>
    </Card>
  );
}
