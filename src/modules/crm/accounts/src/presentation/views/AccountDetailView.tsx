"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Activity, AlertCircle, Briefcase, UserPlus, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { CRM_PERMISSIONS, CrmShell, ActivityTimeline, useCrmCurrency, CRM_TAB_ROUTES } from "@modules/crm";
import type { CrmTabId } from "@modules/crm";
import { AccountDetailSkeleton } from "../components/AccountDetailSkeleton";
import { AccountDetailProfileCard } from "../components/AccountDetailProfileCard";
import { AccountEditDialog } from "../components/AccountEditDialog";
import { AccountDealsCard } from "../components/AccountDealsCard";
import { AccountContactsCard } from "../components/AccountContactsCard";
import { useAccountDetailViewModel } from "../viewmodels/useAccountDetailViewModel";

interface AccountDetailViewProps {
  accountId: string;
}

/** Commercial Account 360 detail view (<200 lines). */
export function AccountDetailView({ accountId }: AccountDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canUpdateAccount = usePermission(CRM_PERMISSIONS.ACCOUNTS_UPDATE);
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);
  const canCreateContact = usePermission(CRM_PERMISSIONS.CONTACTS_CREATE);
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();
  const { state, isEditOpen, isSubmitting, submitError, setIsEditOpen, handleUpdateAccount } = useAccountDetailViewModel(accountId);

  const [editTier, setEditTier] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const handleTabChange = (tab: CrmTabId) => {
    const route = CRM_TAB_ROUTES[tab];
    if (route) router.push(route);
  };

  const openEditModal = () => {
    if (!state.account) return;
    setEditTier(state.account.commercialTierCode || "Standard");
    setEditCurrency(state.account.preferredCurrencyCode || baseCurrency || "SAR");
    setEditNotes(state.account.commercialNotes || "");
    setIsEditOpen(true);
  };

  if (state.stage === "loading" && !state.account) {
    return (<CrmShell activeTab="accounts" onTabChange={handleTabChange}><AccountDetailSkeleton /></CrmShell>);
  }

  if (state.stage === "failed" && !state.account) {
    return (
      <CrmShell activeTab="accounts" onTabChange={handleTabChange}>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/crm/accounts")} className="h-8 text-xs text-nx-ink-2 gap-1">
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            <span>{t("crmAccounts.detail.back")}</span>
          </Button>
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmAccounts.actions.error")}</AlertTitle>
            <AlertDescription className="text-xs">{state.error}</AlertDescription>
          </Alert>
        </div>
      </CrmShell>
    );
  }

  const account = state.account;
  if (!account) return null;

  return (
    <CrmShell activeTab="accounts" onTabChange={handleTabChange}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/crm/accounts")} className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised">
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            <span>{t("crmAccounts.detail.back")}</span>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {canCreateOpp && (
              <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/crm/opportunities?create=1&accountId=${accountId}${account.partyId ? `&partyId=${account.partyId}` : ""}`)} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <Briefcase className="size-3.5 text-nx-accent" />
                <span>{t("crmAccounts.detail.createDealBtn")}</span>
              </Button>
            )}
            {canCreateContact && (
              <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/crm/contacts?create=1&accountId=${accountId}`)} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <UserPlus className="size-3.5 text-nx-accent" />
                <span>{t("crmAccounts.detail.createContactBtn")}</span>
              </Button>
            )}
            {canUpdateAccount && (
              <Button type="button" variant="outline" size="sm" onClick={openEditModal} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <Edit2 className="size-3.5 text-nx-accent" />
                <span>{t("crmAccounts.actions.edit")}</span>
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/crm/activities?account=${accountId}`)} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
              <Activity className="size-3.5 text-nx-accent" />
              <span>{t("crmAccounts.detail.logActivityBtn")}</span>
            </Button>
          </div>
        </div>

        <AccountDetailProfileCard account={account} language={language} isRtl={isRtl} t={t} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AccountContactsCard contacts={account.contacts} language={language} isRtl={isRtl} t={t} onSelectContact={(id) => router.push(`/crm/contacts/${id}`)} onViewAllContacts={() => router.push("/crm/contacts")} />
          <AccountDealsCard opportunities={account.opportunities} autoConvertToBase={autoConvertToBase} baseCurrency={baseCurrency} convertAmount={convertAmount} language={language} t={t} onSelectOpportunity={(id) => router.push(id ? `/crm/opportunities/${id}` : "/crm/opportunities")} onViewAllOpportunities={() => router.push("/crm/opportunities")} />
        </div>

        <Card className="p-5 bg-nx-surface border-nx-line">
          <ActivityTimeline accountId={accountId} targetLabel={language === "ar" && account.partyLegalNameAr ? account.partyLegalNameAr : account.partyLegalNameEn} />
        </Card>

        <AccountEditDialog isOpen={isEditOpen} isSubmitting={isSubmitting} submitError={submitError} baseCurrency={baseCurrency} initialTier={editTier} initialCurrency={editCurrency} initialNotes={editNotes} onOpenChange={setIsEditOpen} onSave={async (data) => { await handleUpdateAccount(data); }} isRtl={isRtl} t={t} />
      </div>
    </CrmShell>
  );
}
