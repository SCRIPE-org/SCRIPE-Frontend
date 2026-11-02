"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  AlertCircle,
  User,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Mail,
  Phone,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { CRM_PERMISSIONS, CrmShell, ActivityTimeline } from "@modules/crm";
import { useContactDetailViewModel } from "../viewmodels/useContactDetailViewModel";

interface ContactDetailViewProps {
  contactId: string;
}

export function ContactDetailView({ contactId }: ContactDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canUpdateContact = usePermission(CRM_PERMISSIONS.CONTACTS_UPDATE);

  const viewModel = useContactDetailViewModel(contactId);
  const {
    state,
    isEditOpen,
    isSubmitting,
    submitError,
    setIsEditOpen,
    handleUpdateContact,
    refresh,
  } = viewModel;

  const [editPrimaryAccount, setEditPrimaryAccount] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const openEditModal = () => {
    if (!state.contact) return;
    setEditPrimaryAccount(state.contact.primaryAccountId || "");
    setEditJobTitle(state.contact.jobTitleSnapshot || "");
    setEditDepartment(state.contact.departmentName || "");
    setEditNotes(state.contact.commercialNotes || "");
    setIsEditOpen(true);
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateContact({
      primaryAccountId: editPrimaryAccount.trim() || undefined,
      jobTitleSnapshot: editJobTitle.trim() || undefined,
      departmentName: editDepartment.trim() || undefined,
      commercialNotes: editNotes.trim() || undefined,
    });
  };

  if (state.stage === "loading" && !state.contact) {
    return (
      <CrmShell activeTab="contacts" onTabChange={() => {}}>
        <div className="flex flex-col items-center justify-center py-24">
          <LoadingSpinner size="lg" className="text-nx-accent" />
          <p className="mt-3 text-xs text-nx-ink-3">
            {t("crmContacts.detail.loading") || "Loading contact context..."}
          </p>
        </div>
      </CrmShell>
    );
  }

  if (state.stage === "failed" && !state.contact) {
    return (
      <CrmShell activeTab="contacts" onTabChange={() => {}}>
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/crm/contacts")}
            className="h-8 text-xs text-nx-ink-2 gap-1"
          >
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            <span>{t("crmContacts.detail.back") || "Back to Contacts"}</span>
          </Button>
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("common.error") || "Error"}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert>
        </div>
      </CrmShell>
    );
  }

  const contact = state.contact;
  if (!contact) return null;

  return (
    <CrmShell activeTab="contacts" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        {/* Breadcrumb / Back Action */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/crm/contacts")}
            className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-surfaceSubtle"
          >
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            <span>{t("crmContacts.detail.back") || "Back to Contacts"}</span>
          </Button>

          {canUpdateContact && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openEditModal}
              className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-surfaceSubtle"
            >
              <Edit2 className="size-3.5 text-nx-accent" />
              <span>{t("crmContacts.actions.edit") || "Edit Contact Context"}</span>
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-nx-surfaceSubtle border border-nx-line flex items-center justify-center shrink-0">
                <User className="size-6 text-nx-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-nx-ink font-heading">
                    {language === "ar" && contact.personLegalNameAr
                      ? contact.personLegalNameAr
                      : contact.personLegalNameEn}
                  </h1>
                  {contact.jobTitleSnapshot && (
                    <Badge variant="outline" className="border-nx-line bg-nx-surfaceSubtle text-nx-ink text-xs font-medium">
                      {contact.jobTitleSnapshot}
                    </Badge>
                  )}
                  {contact.departmentName && (
                    <Badge variant="outline" className="border-nx-line bg-nx-surfaceSubtle text-nx-ink-2 text-xs">
                      {contact.departmentName}
                    </Badge>
                  )}
                </div>
                {contact.personLegalNameAr && language !== "ar" && (
                  <p className="text-xs text-nx-ink-3 font-arabic mt-0.5">
                    {contact.personLegalNameAr}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {contact.email && (
                <div className="rounded-nx-md border border-nx-line bg-nx-surfaceSubtle/50 px-3 py-1.5 flex items-center gap-2 text-xs text-nx-ink-2">
                  <Mail className="size-3.5 text-nx-accent" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="rounded-nx-md border border-nx-line bg-nx-surfaceSubtle/50 px-3 py-1.5 flex items-center gap-2 text-xs text-nx-ink font-mono">
                  <Phone className="size-3.5 text-nx-accent" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </div>
          </div>

          {contact.commercialNotes && (
            <div className="pt-3 border-t border-nx-line">
              <span className="text-[11px] font-semibold text-nx-ink-3 uppercase block mb-1">
                {t("crmContacts.detail.notes") || "Relationship Context & Notes"}
              </span>
              <p className="text-xs text-nx-ink-2 leading-relaxed bg-nx-surfaceSubtle/40 p-2.5 rounded-nx-md border border-nx-line/50">
                {contact.commercialNotes}
              </p>
            </div>
          )}
        </div>

        {/* 2-Column Grid: Primary Account & Linked Pipeline Deals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Account Card */}
          <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">
                  {t("crmContacts.detail.accountTitle") || "Primary Account Organization"}
                </h2>
              </div>
            </div>

            {contact.primaryAccountId ? (
              <div
                className="p-3.5 rounded-nx-md border border-nx-line bg-nx-surfaceSubtle/40 hover:border-nx-accent transition-all cursor-pointer flex items-center justify-between"
                onClick={() => router.push(`/crm/accounts/${contact.primaryAccountId}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-nx-md bg-nx-surface border border-nx-line flex items-center justify-center shrink-0">
                    <Building2 className="size-4.5 text-nx-accent" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-nx-ink block hover:text-nx-accent">
                      {language === "ar" && contact.primaryAccountNameAr
                        ? contact.primaryAccountNameAr
                        : contact.primaryAccountNameEn || "Account"}
                    </span>
                    <span className="text-[11px] text-nx-ink-3 font-mono">
                      ID: {contact.primaryAccountId.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1 text-nx-ink"
                >
                  <span>{t("crmAccounts.actions.view360") || "View 360"}</span>
                  <ArrowUpRight className="size-3" />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-nx-ink-3 py-6 text-center italic">
                {t("crmContacts.detail.noPrimaryAccount") ||
                  "This contact is not currently assigned to a primary commercial account."}
              </p>
            )}
          </div>

          {/* Linked Opportunities Sub-card */}
          <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">
                  {t("crmContacts.detail.dealsTitle") || "Associated Deals"}
                </h2>
              </div>
              <Badge variant="outline" className="border-nx-line text-nx-ink-3 font-mono text-[11px]">
                {contact.opportunities?.length ?? 0}
              </Badge>
            </div>

            {contact.opportunities?.length === 0 ? (
              <p className="text-xs text-nx-ink-3 py-6 text-center">
                {t("crmContacts.detail.noDeals") || "No pipeline deals currently linked to this contact."}
              </p>
            ) : (
              <div className="divide-y divide-nx-line">
                {contact.opportunities?.map((opp) => (
                  <div
                    key={opp.id}
                    className="py-2.5 flex items-center justify-between gap-3 hover:bg-nx-surfaceSubtle/30 px-1 rounded-nx-md cursor-pointer transition-colors"
                    onClick={() => router.push(`/crm/opportunities`)}
                  >
                    <div>
                      <span className="text-xs font-semibold text-nx-ink block hover:text-nx-accent">
                        {opp.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge
                          variant="outline"
                          className="border-nx-line bg-nx-surfaceSubtle text-[10px] py-0 px-1.5 text-nx-ink-2"
                        >
                          {language === "ar" && opp.stageLabelAr ? opp.stageLabelAr : opp.stageLabelEn}
                        </Badge>
                        <span className="text-[10px] text-nx-ink-3 uppercase font-medium">{opp.status}</span>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className="text-xs font-bold text-nx-ink font-mono block">
                        {opp.estimatedAmount != null
                          ? `${opp.estimatedAmount.toLocaleString()} ${opp.currencyCode}`
                          : "••••••"}
                      </span>
                      {opp.targetCloseDate && (
                        <span className="text-[10px] text-nx-ink-3 flex items-center gap-1 justify-end mt-0.5">
                          <Calendar className="size-2.5" />
                          {new Date(opp.targetCloseDate).toLocaleDateString(
                            language === "ar" ? "ar-SA" : "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sales Activity & Notes Timeline (SCRIPE-739 / D5/B) */}
        {contact.primaryAccountId && (
          <Card className="p-5 bg-nx-surface border-nx-line">
            <ActivityTimeline
              accountId={contact.primaryAccountId}
              targetLabel={
                language === "ar" && contact.personLegalNameAr
                  ? contact.personLegalNameAr
                  : contact.personLegalNameEn
              }
            />
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
            <form onSubmit={onSaveEdit}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-nx-ink font-heading">
                  {t("crmContacts.edit.title") || "Update Contact Context"}
                </DialogTitle>
                <DialogDescription className="text-xs text-nx-ink-2">
                  {t("crmContacts.edit.description") ||
                    "Edit primary commercial account assignment, organizational title, and notes."}
                </DialogDescription>
              </DialogHeader>

              {submitError && (
                <Alert variant="destructive" className="my-3 border-destructive/20 bg-destructive/10 text-destructive text-xs py-2">
                  <AlertCircle className="size-3.5" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3.5 py-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-primary-account" className="text-nx-ink-2 font-medium">
                    {t("crmContacts.create.primaryAccountId") || "Primary Account ID (GUID)"}
                  </Label>
                  <Input
                    id="edit-primary-account"
                    value={editPrimaryAccount}
                    onChange={(e) => setEditPrimaryAccount(e.target.value)}
                    className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-job-title" className="text-nx-ink-2 font-medium">
                      {t("crmContacts.create.jobTitle") || "Job Title"}
                    </Label>
                    <Input
                      id="edit-job-title"
                      value={editJobTitle}
                      onChange={(e) => setEditJobTitle(e.target.value)}
                      className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-department" className="text-nx-ink-2 font-medium">
                      {t("crmContacts.create.department") || "Department"}
                    </Label>
                    <Input
                      id="edit-department"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-contact-notes" className="text-nx-ink-2 font-medium">
                    {t("crmContacts.create.notes") || "Commercial Context Notes"}
                  </Label>
                  <Input
                    id="edit-contact-notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                  className="h-8 text-xs border-nx-line text-nx-ink-2"
                >
                  {t("common.cancel") || "Cancel"}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-8 text-xs bg-nx-accent-fill text-nx-on-fill font-bold hover:brightness-105"
                >
                  {isSubmitting
                    ? t("common.saving") || "Saving..."
                    : t("common.saveChanges") || "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CrmShell>
  );
}
