"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { User, Building2, Mail, Phone, Eye, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { cn } from "@core/common/utils";
import type { CrmContact } from "../../domain/entities/ContactEntity";

interface ContactsTableProps {
  contacts: CrmContact[];
  className?: string;
}

export function ContactsTable({ contacts, className }: ContactsTableProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  if (contacts.length === 0) {
    return (
      <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-8 text-center">
        <EmptyState
          title={t("crmContacts.table.emptyTitle") || "No Contacts Found"}
          description={
            t("crmContacts.table.emptyDescription") ||
            "No commercial contacts match the current filter or search criteria."
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden",
        className
      )}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse" dir={isRtl ? "rtl" : "ltr"}>
          <thead>
            <tr className="border-b border-nx-line bg-nx-surfaceSubtle/50 text-nx-ink-2 font-semibold">
              <th className="px-4 py-3 text-start">{t("crmContacts.table.contact") || "Contact Name"}</th>
              <th className="px-4 py-3 text-start">{t("crmContacts.table.account") || "Primary Account"}</th>
              <th className="px-4 py-3 text-start">{t("crmContacts.table.role") || "Job Title & Dept"}</th>
              <th className="px-4 py-3 text-start">{t("crmContacts.table.communication") || "Direct Contact"}</th>
              <th className="px-4 py-3 text-start">{t("crmContacts.table.createdAt") || "Created"}</th>
              <th className="px-4 py-3 text-end">{t("crmContacts.table.actions") || "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nx-line">
            {contacts.map((contact) => {
              const formattedDate = contact.createdAt
                ? new Date(contact.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr
                  key={contact.id}
                  className="hover:bg-nx-surfaceSubtle/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/crm/contacts/${contact.id}`)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-nx-surfaceSubtle border border-nx-line flex items-center justify-center shrink-0">
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
                  </td>

                  <td className="px-4 py-3.5">
                    {contact.primaryAccountId ? (
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-nx-sm bg-nx-surfaceSubtle border border-nx-line hover:border-nx-accent transition-colors text-nx-ink"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/crm/accounts/${contact.primaryAccountId}`);
                        }}
                      >
                        <Building2 className="size-3 text-nx-accent" />
                        <span className="font-medium text-xs">
                          {language === "ar" && contact.primaryAccountNameAr
                            ? contact.primaryAccountNameAr
                            : contact.primaryAccountNameEn || "Account"}
                        </span>
                        <ArrowUpRight className="size-2.5 text-nx-ink-3" />
                      </div>
                    ) : (
                      <span className="text-nx-ink-3 text-[11px] italic">
                        {t("crmContacts.table.noAccount") || "Unassigned"}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-medium text-nx-ink block">
                      {contact.jobTitleSnapshot || "—"}
                    </span>
                    {contact.departmentName && (
                      <span className="text-[11px] text-nx-ink-3 block">
                        {contact.departmentName}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-nx-ink-2 space-y-0.5">
                    {contact.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3 text-nx-ink-3" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-1.5 font-mono text-nx-ink-3">
                        <Phone className="size-3" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {!contact.email && !contact.phone && <span className="text-nx-ink-3">—</span>}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-nx-ink-3 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 text-nx-ink-3" />
                      {formattedDate}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap text-end" onClick={(e) => e.stopPropagation()}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/crm/contacts/${contact.id}`)}
                      className="h-7 px-2.5 text-xs gap-1 border border-nx-line bg-nx-surface hover:bg-nx-surfaceSubtle text-nx-ink"
                    >
                      <Eye className="size-3 text-nx-accent" />
                      <span>{t("crmContacts.actions.viewContext") || "View Context"}</span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
