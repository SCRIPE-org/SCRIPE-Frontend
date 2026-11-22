"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { AlertCircle, Briefcase, Building2, ChevronLeft, ChevronRight, Edit2, ArrowUpRight, Activity } from "lucide-react";
import { CRM_PERMISSIONS, CrmShell, ActivityTimeline, CRM_TAB_ROUTES } from "@modules/crm";
import type { CrmTabId } from "@modules/crm";
import { ContactDetailSkeleton } from "../components/ContactDetailSkeleton";
import { ContactDetailProfileCard } from "../components/ContactDetailProfileCard";
import { ContactEditDialog } from "../components/ContactEditDialog";
import { ContactDealsCard } from "../components/ContactDealsCard";
import { useContactDetailViewModel } from "../viewmodels/useContactDetailViewModel";

interface ContactDetailViewProps {
  contactId: string;
}

/** Commercial Contact 360 detail view (<200 lines). */
export function ContactDetailView({ contactId }: ContactDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canUpdateContact = usePermission(CRM_PERMISSIONS.CONTACTS_UPDATE);
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);
  const { state, isEditOpen, isSubmitting, submitError, accountOptions, setIsEditOpen, handleUpdateContact } = useContactDetailViewModel(contactId);

  const [editPrimaryAccount, setEditPrimaryAccount] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  const openEditModal = () => {
    if (!state.contact) return;
    setEditPrimaryAccount(state.contact.primaryAccountId || "__none__");
    setEditJobTitle(state.contact.jobTitleSnapshot || "");
    setEditDepartment(state.contact.departmentName || "");
    setEditNotes(state.contact.commercialNotes || "");
    setIsEditOpen(true);
  };

  if (state.stage === "loading" && !state.contact) {
    return (<CrmShell activeTab="contacts" onTabChange={handleTabChange}><ContactDetailSkeleton /></CrmShell>);
  }

  if (state.stage === "failed" && !state.contact) {
    return (
      <CrmShell activeTab="contacts" onTabChange={handleTabChange}>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/crm/contacts")} className="h-8 text-xs text-nx-ink-2 gap-1">
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            <span>{t("crmContacts.detail.back")}</span>
          </Button>
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmContacts.actions.error")}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert>
        </div>
      </CrmShell>
    );
  }

  const contact = state.contact;
  if (!contact) return null;

  return (
    <CrmShell activeTab="contacts" onTabChange={handleTabChange}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/crm/contacts")} className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised">
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            <span>{t("crmContacts.detail.back")}</span>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {canCreateOpp && (
              <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/crm/opportunities?create=1${contact.primaryAccountId ? `&accountId=${contact.primaryAccountId}` : ""}${contact.personPartyId ? `&partyId=${contact.personPartyId}` : ""}`)} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <Briefcase className="size-3.5 text-nx-accent" />
                <span>{t("crmContacts.detail.createDealBtn")}</span>
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/crm/activities?contact=${contactId}`)} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
              <Activity className="size-3.5 text-nx-accent" />
              <span>{t("crmContacts.detail.logActivityBtn")}</span>
            </Button>
            {canUpdateContact && (
              <Button type="button" variant="outline" size="sm" onClick={openEditModal} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <Edit2 className="size-3.5 text-nx-accent" />
                <span>{t("crmContacts.actions.edit")}</span>
              </Button>
            )}
          </div>
        </div>

        <ContactDetailProfileCard contact={contact} language={language} isRtl={isRtl} t={t} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">{t("crmContacts.detail.organizationTitle")}</h2>
              </div>
            </div>
            {contact.primaryAccountId ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-nx-ink">
                    {language === "ar" && contact.primaryAccountNameAr ? contact.primaryAccountNameAr : contact.primaryAccountNameEn || t("crmContacts.detail.defaultAccountLabel")}
                  </span>
                  <Badge variant="outline" className="border-nx-line bg-nx-raised text-[10px]">{t("crmContacts.detail.primaryBadge")}</Badge>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/crm/accounts/${contact.primaryAccountId}`)} className="w-full text-xs h-8 border-nx-line bg-nx-raised/60 hover:bg-nx-raised text-nx-ink justify-between">
                  <span>{t("crmContacts.detail.viewAccount360")}</span>
                  <ArrowUpRight className="size-3.5 text-nx-accent" />
                </Button>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2.5">
                <p className="text-xs text-nx-ink-3 italic">{t("crmContacts.detail.noPrimaryAccount")}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => router.push("/crm/accounts")} className="h-7 text-xs gap-1.5 border-nx-line hover:border-nx-accent">
                  <Building2 className="size-3 text-nx-accent" />
                  <span>{t("crmContacts.detail.viewAccountsBtn")}</span>
                </Button>
              </div>
            )}
          </Card>

          <ContactDealsCard opportunities={contact.opportunities} jobTitleSnapshot={contact.jobTitleSnapshot} language={language} t={t} onSelectOpportunity={(id) => router.push(id ? `/crm/opportunities/${id}` : "/crm/opportunities")} onViewAllOpportunities={() => router.push("/crm/opportunities")} />
        </div>

        <Card className="p-5 bg-nx-surface border-nx-line">
          <ActivityTimeline accountId={contact.primaryAccountId || undefined} targetLabel={language === "ar" && contact.personLegalNameAr ? contact.personLegalNameAr : contact.personLegalNameEn} defaultRecipientEmail={contact.email} />
        </Card>

        <ContactEditDialog isOpen={isEditOpen} isSubmitting={isSubmitting} submitError={submitError} accountOptions={accountOptions} initialAccountId={editPrimaryAccount} initialJobTitle={editJobTitle} initialDepartment={editDepartment} initialNotes={editNotes} onOpenChange={setIsEditOpen} onSave={async (data) => { await handleUpdateContact(data); }} isRtl={isRtl} t={t} />
      </div>
    </CrmShell>
  );
}
