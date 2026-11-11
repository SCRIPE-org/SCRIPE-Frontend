"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import {
  AlertCircle,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Mail,
  Phone,
} from "lucide-react";
import {
  CRM_PERMISSIONS,
  CrmShell,
  ActivityTimeline,
  useCrmCurrency,
  CRM_TAB_ROUTES,
} from "@modules/crm";
import type { CrmTabId } from "@modules/crm";
import { AccountDetailSkeleton } from "../components/AccountDetailSkeleton";
import { AccountStatusBadge } from "../components/AccountStatusBadge";
import { AccountEditDialog } from "../components/AccountEditDialog";
import { AccountDealsCard } from "../components/AccountDealsCard";
import { useAccountDetailViewModel } from "../viewmodels/useAccountDetailViewModel";

interface AccountDetailViewProps {
  accountId: string;
}

export function AccountDetailView({ accountId }: AccountDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canUpdateAccount = usePermission(CRM_PERMISSIONS.ACCOUNTS_UPDATE);
  const { baseCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();
  const {
    state,
    isEditOpen,
    isSubmitting,
    submitError,
    setIsEditOpen,
    handleUpdateAccount,
  } = useAccountDetailViewModel(accountId);

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

  const onSaveEdit = async (data: {
    commercialTierCode?: string;
    preferredCurrencyCode?: string;
    commercialNotes?: string;
  }) => {
    await handleUpdateAccount(data);
  };

  if (state.stage === "loading" && !state.account) {
    return (
      <CrmShell activeTab="accounts" onTabChange={handleTabChange}>
        <AccountDetailSkeleton />
      </CrmShell>
    );
  }

  if (state.stage === "failed" && !state.account) {
    return (
      <CrmShell activeTab="accounts" onTabChange={handleTabChange}>
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/crm/accounts")}
            className="h-8 text-xs text-nx-ink-2 gap-1"
          >
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/crm/accounts")}
            className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised"
          >
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            <span>{t("crmAccounts.detail.back")}</span>
          </Button>
          {canUpdateAccount && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openEditModal}
              className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
            >
              <Edit2 className="size-3.5 text-nx-accent" />
              <span>{t("crmAccounts.actions.edit")}</span>
            </Button>
          )}
        </div>

        <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-nx-md bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
                <Building2 className="size-6 text-nx-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-nx-ink font-heading">
                    {language === "ar" && account.partyLegalNameAr
                      ? account.partyLegalNameAr
                      : account.partyLegalNameEn}
                  </h1>
                  <AccountStatusBadge tierCode={account.commercialTierCode} />
                  <Badge variant="outline" className="border-nx-line bg-nx-raised text-nx-ink-2 font-mono text-[11px]">
                    {account.preferredCurrencyCode || "SAR"}
                  </Badge>
                </div>
                {account.partyLegalNameAr && language !== "ar" && (
                  <p className="text-xs text-nx-ink-3 font-arabic mt-0.5">{account.partyLegalNameAr}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-nx-md border border-nx-line bg-nx-raised/50 px-3 py-1.5 text-center">
                <span className="text-[10px] text-nx-ink-3 uppercase tracking-wider block font-semibold">
                  {t("crmAccounts.table.contacts")}
                </span>
                <span className="text-base font-bold text-nx-ink font-mono">
                  {account.contacts?.length ?? account.linkedContactsCount}
                </span>
              </div>
              <div className="rounded-nx-md border border-nx-line bg-nx-raised/50 px-3 py-1.5 text-center">
                <span className="text-[10px] text-nx-ink-3 uppercase tracking-wider block font-semibold">
                  {t("crmAccounts.table.opportunities")}
                </span>
                <span className="text-base font-bold text-nx-ink font-mono">
                  {account.opportunities?.length ?? account.activeOpportunitiesCount}
                </span>
              </div>
            </div>
          </div>
          {account.commercialNotes && (
            <div className="pt-3 border-t border-nx-line">
              <span className="text-[11px] font-semibold text-nx-ink-3 uppercase block mb-1">
                {t("crmAccounts.detail.notes")}
              </span>
              <p className="text-xs text-nx-ink-2 leading-relaxed bg-nx-raised/40 p-2.5 rounded-nx-md border border-nx-line/50">
                {account.commercialNotes}
              </p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">{t("crmAccounts.detail.contactsTitle")}</h2>
              </div>
              <Badge variant="outline" className="border-nx-line text-nx-ink-3 font-mono text-[11px]">
                {account.contacts?.length ?? 0}
              </Badge>
            </div>
            {account.contacts?.length === 0 ? (
              <p className="text-xs text-nx-ink-3 py-6 text-center">{t("crmAccounts.detail.noContacts")}</p>
            ) : (
              <div className="divide-y divide-nx-line">
                {account.contacts?.map((c) => (
                  <div
                    key={c.id}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-nx-raised/30 px-1 rounded-nx-md cursor-pointer transition-colors"
                    onClick={() => router.push(`/crm/contacts/${c.id}`)}
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

          <AccountDealsCard
            opportunities={account.opportunities}
            autoConvertToBase={autoConvertToBase}
            baseCurrency={baseCurrency}
            convertAmount={convertAmount}
            language={language}
            t={t}
            onSelectOpportunity={(id) => router.push(`/crm/opportunities/${id}`)}
          />
        </div>

        <Card className="p-5 bg-nx-surface border-nx-line">
          <ActivityTimeline
            accountId={accountId}
            targetLabel={language === "ar" && account.partyLegalNameAr ? account.partyLegalNameAr : account.partyLegalNameEn}
          />
        </Card>

        <AccountEditDialog
          isOpen={isEditOpen}
          isSubmitting={isSubmitting}
          submitError={submitError}
          baseCurrency={baseCurrency}
          initialTier={editTier}
          initialCurrency={editCurrency}
          initialNotes={editNotes}
          onOpenChange={setIsEditOpen}
          onSave={onSaveEdit}
          isRtl={isRtl}
          t={t}
        />
      </div>
    </CrmShell>
  );
}
