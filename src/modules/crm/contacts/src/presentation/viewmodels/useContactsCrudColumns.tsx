"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@core/ui/badge";
import { User, Building2, Mail, Phone, Calendar } from "lucide-react";
import type { CrudColumn } from "@core/crud/components/generic-crud-view";
import type { CrmContact } from "../../domain/entities/ContactEntity";

/** Builds column definitions for the CRM Contacts `GenericCrudView` table. */
export function useContactsCrudColumns(
  language: string,
  t: (key: string) => string
): CrudColumn<CrmContact>[] {
  const router = useRouter();

  return useMemo<CrudColumn<CrmContact>[]>(
    () => [
      {
        key: "personLegalNameEn",
        label: t("crmContacts.table.contact"),
        sortable: true,
        render: (_val, contact: CrmContact) => (
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            data-testid={`contact-row-link-${contact.id}`}
            onClick={() => router.push(`/crm/contacts/${contact.id}`)}
          >
            <div className="size-7 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
              <User className="size-3.5 text-nx-accent" />
            </div>
            <div>
              <span className="font-semibold text-nx-ink block hover:text-nx-accent transition-colors">
                {language === "ar" && contact.personLegalNameAr
                  ? contact.personLegalNameAr
                  : contact.personLegalNameEn}
              </span>
              {language !== "ar" && contact.personLegalNameAr && (
                <span className="text-[11px] text-nx-ink-3 block font-arabic">
                  {contact.personLegalNameAr}
                </span>
              )}
              {contact.commercialNotes && (
                <span className="text-[11px] text-nx-ink-3 line-clamp-1 mt-0.5 max-w-xs">
                  {contact.commercialNotes}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: "primaryAccountId",
        label: t("crmContacts.table.account"),
        render: (_val, contact: CrmContact) => {
          const accountName =
            language === "ar" && contact.primaryAccountNameAr
              ? contact.primaryAccountNameAr
              : contact.primaryAccountNameEn;

          if (!contact.primaryAccountId || !accountName) {
            return (
              <span className="text-nx-ink-3 text-xs">
                {t("crmContacts.table.noAccount")}
              </span>
            );
          }

          return (
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:text-nx-accent transition-colors"
              onClick={() => router.push(`/crm/accounts/${contact.primaryAccountId}`)}
            >
              <Building2 className="size-3 text-nx-accent shrink-0" />
              <span className="text-xs font-medium text-nx-ink hover:text-nx-accent truncate max-w-[180px]">
                {accountName}
              </span>
            </div>
          );
        },
      },
      {
        key: "jobTitleSnapshot",
        label: t("crmContacts.table.role"),
        render: (_val, contact: CrmContact) => {
          if (!contact.jobTitleSnapshot && !contact.departmentName) {
            return <span className="text-nx-ink-3 text-xs">—</span>;
          }
          return (
            <Badge
              variant="outline"
              className="border-nx-line bg-nx-raised/60 text-nx-ink-2 text-[11px]"
            >
              {contact.jobTitleSnapshot && <span>{contact.jobTitleSnapshot}</span>}
              {contact.jobTitleSnapshot && contact.departmentName && <span> • </span>}
              {contact.departmentName && <span>{contact.departmentName}</span>}
            </Badge>
          );
        },
      },
      {
        key: "email",
        label: t("crmContacts.table.contactInfo"),
        render: (_val, contact: CrmContact) => (
          <div className="space-y-0.5 text-xs text-nx-ink-3">
            {contact.email && (
              <div className="flex items-center gap-1">
                <Mail className="size-3 text-nx-ink-3" />
                <span className="truncate max-w-[160px]">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <Phone className="size-3 text-nx-ink-3" />
                <span>{contact.phone}</span>
              </div>
            )}
            {!contact.email && !contact.phone && <span>—</span>}
          </div>
        ),
      },
      {
        key: "createdAt",
        label: t("crmContacts.table.createdAt"),
        sortable: true,
        render: (_val, contact: CrmContact) => {
          const formattedDate = contact.createdAt
            ? new Date(contact.createdAt).toLocaleDateString(
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
