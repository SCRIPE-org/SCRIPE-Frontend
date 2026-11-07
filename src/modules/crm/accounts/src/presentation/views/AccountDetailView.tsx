"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@core/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { AlertCircle, Building2, Users, Briefcase, ChevronLeft, ChevronRight, Edit2, Mail, Phone, Calendar } from "lucide-react";
import { CRM_PERMISSIONS, CrmShell, ActivityTimeline, useCrmCurrency, CRM_CURRENCY_OPTIONS } from "@modules/crm";
import { AccountDetailSkeleton } from "../components/AccountDetailSkeleton";
import { AccountStatusBadge } from "../components/AccountStatusBadge";
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
  const { state, isEditOpen, isSubmitting, submitError, setIsEditOpen, handleUpdateAccount } = useAccountDetailViewModel(accountId);
  const [editTier, setEditTier] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const openEditModal = () => {
    if (!state.account) return;
    setEditTier(state.account.commercialTierCode || "Standard");
    setEditCurrency(state.account.preferredCurrencyCode || baseCurrency || "SAR");
    setEditNotes(state.account.commercialNotes || "");
    setIsEditOpen(true);
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateAccount({
      commercialTierCode: editTier.trim() || undefined,
      preferredCurrencyCode: editCurrency.trim() || undefined,
      commercialNotes: editNotes.trim() || undefined,
    });
  };

  if (state.stage === "loading" && !state.account) {
    return (
      <CrmShell activeTab="accounts" onTabChange={() => {}}>
        <AccountDetailSkeleton />
      </CrmShell>
    );
  }

  if (state.stage === "failed" && !state.account) {
    return (
      <CrmShell activeTab="accounts" onTabChange={() => {}}>
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/crm/accounts")} className="h-8 text-xs text-nx-ink-2 gap-1">
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            <span>{t("crmAccounts.detail.back") || "Back to Accounts"}</span>
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

  const account = state.account;
  if (!account) return null;

  return (
    <CrmShell activeTab="accounts" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/crm/accounts")} className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised">
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            <span>{t("crmAccounts.detail.back") || "Back to Accounts"}</span>
          </Button>
          {canUpdateAccount && (
            <Button type="button" variant="outline" size="sm" onClick={openEditModal} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
              <Edit2 className="size-3.5 text-nx-accent" />
              <span>{t("crmAccounts.actions.edit") || "Edit Commercial Terms"}</span>
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
                    {language === "ar" && account.partyLegalNameAr ? account.partyLegalNameAr : account.partyLegalNameEn}
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
                <span className="text-[10px] text-nx-ink-3 uppercase tracking-wider block font-semibold">{t("crmAccounts.table.contacts") || "Contacts"}</span>
                <span className="text-base font-bold text-nx-ink font-mono">{account.contacts?.length ?? account.linkedContactsCount}</span>
              </div>
              <div className="rounded-nx-md border border-nx-line bg-nx-raised/50 px-3 py-1.5 text-center">
                <span className="text-[10px] text-nx-ink-3 uppercase tracking-wider block font-semibold">{t("crmAccounts.table.opportunities") || "Deals"}</span>
                <span className="text-base font-bold text-nx-ink font-mono">{account.opportunities?.length ?? account.activeOpportunitiesCount}</span>
              </div>
            </div>
          </div>
          {account.commercialNotes && (
            <div className="pt-3 border-t border-nx-line">
              <span className="text-[11px] font-semibold text-nx-ink-3 uppercase block mb-1">{t("crmAccounts.detail.notes") || "Commercial Strategy & Notes"}</span>
              <p className="text-xs text-nx-ink-2 leading-relaxed bg-nx-raised/40 p-2.5 rounded-nx-md border border-nx-line/50">{account.commercialNotes}</p>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">{t("crmAccounts.detail.contactsTitle") || "Key Stakeholders & Contacts"}</h2>
              </div>
              <Badge variant="outline" className="border-nx-line text-nx-ink-3 font-mono text-[11px]">{account.contacts?.length ?? 0}</Badge>
            </div>
            {account.contacts?.length === 0 ? (
              <p className="text-xs text-nx-ink-3 py-6 text-center">{t("crmAccounts.detail.noContacts") || "No linked contacts found for this account."}</p>
            ) : (
              <div className="divide-y divide-nx-line">
                {account.contacts?.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between gap-2 hover:bg-nx-raised/30 px-1 rounded-nx-md cursor-pointer transition-colors" onClick={() => router.push(`/crm/contacts/${c.id}`)}>
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-nx-raised border border-nx-line flex items-center justify-center shrink-0">
                        <Users className="size-3 text-nx-ink-3" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-nx-ink block hover:text-nx-accent">{language === "ar" && c.fullNameAr ? c.fullNameAr : c.fullNameEn}</span>
                        {(c.jobTitle || c.department) && <span className="text-[11px] text-nx-ink-3 block">{[c.jobTitle, c.department].filter(Boolean).join(" • ")}</span>}
                      </div>
                    </div>
                    <div className="text-end text-[11px] text-nx-ink-3 space-y-0.5">
                      {c.email && <div className="flex items-center gap-1 justify-end"><Mail className="size-2.5" /><span>{c.email}</span></div>}
                      {c.phone && <div className="flex items-center gap-1 justify-end font-mono"><Phone className="size-2.5" /><span>{c.phone}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="rounded-nx-lg border border-nx-line bg-nx-surface overflow-hidden space-y-3 p-4">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">{t("crmAccounts.detail.dealsTitle") || "Active Pipeline Deals"}</h2>
              </div>
              <Badge variant="outline" className="border-nx-line text-nx-ink-3 font-mono text-[11px]">{account.opportunities?.length ?? 0}</Badge>
            </div>
            {account.opportunities?.length === 0 ? (
              <p className="text-xs text-nx-ink-3 py-6 text-center">{t("crmAccounts.detail.noDeals") || "No active opportunities linked to this account."}</p>
            ) : (
              <div className="divide-y divide-nx-line">
                {account.opportunities?.map((opp) => (
                  <div key={opp.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-nx-raised/30 px-1 rounded-nx-md cursor-pointer transition-colors" onClick={() => router.push(`/crm/opportunities/${opp.id}`)}>
                    <div>
                      <span className="text-xs font-semibold text-nx-ink block hover:text-nx-accent">{opp.title}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="border-nx-line bg-nx-raised text-[10px] py-0 px-1.5 text-nx-ink-2">
                          {language === "ar" && opp.stageLabelAr ? opp.stageLabelAr : opp.stageLabelEn}
                        </Badge>
                        <span className="text-[10px] text-nx-ink-3 uppercase font-medium">{opp.status}</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="text-xs font-bold text-nx-ink font-mono block">
                        {opp.estimatedAmount != null ? `${opp.estimatedAmount.toLocaleString()} ${opp.currencyCode}` : "••••••"}
                      </span>
                      {autoConvertToBase && opp.estimatedAmount != null && opp.currencyCode.toUpperCase() !== baseCurrency.toUpperCase() && (
                        <span className="text-[10px] font-mono text-nx-accent block">
                          ≈ {baseCurrency} {convertAmount(opp.estimatedAmount, opp.currencyCode, baseCurrency).toLocaleString()}
                        </span>
                      )}
                      {opp.targetCloseDate && (
                        <span className="text-[10px] text-nx-ink-3 flex items-center gap-1 justify-end mt-0.5">
                          <Calendar className="size-2.5" />
                          {new Date(opp.targetCloseDate).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-5 bg-nx-surface border-nx-line">
          <ActivityTimeline accountId={accountId} targetLabel={language === "ar" && account.partyLegalNameAr ? account.partyLegalNameAr : account.partyLegalNameEn} />
        </Card>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md bg-nx-surface border-nx-line text-nx-ink" dir={isRtl ? "rtl" : "ltr"}>
            <form onSubmit={onSaveEdit}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-nx-ink font-heading">{t("crmAccounts.edit.title") || "Update Commercial Terms"}</DialogTitle>
                <DialogDescription className="text-xs text-nx-ink-2">{t("crmAccounts.edit.description") || "Edit commercial tier, preferred settlement currency, and account notes."}</DialogDescription>
              </DialogHeader>
              {submitError && (
                <Alert variant="destructive" className="my-3 border-destructive/20 bg-destructive/10 text-destructive text-xs py-2">
                  <AlertCircle className="size-3.5" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-3.5 py-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-account-tier" className="text-nx-ink-2 font-medium">{t("crmAccounts.create.tier") || "Commercial Tier"}</Label>
                    <Select value={editTier || "Standard"} onValueChange={setEditTier}>
                      <SelectTrigger id="edit-account-tier" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Enterprise">{t("crmAccounts.tiers.Enterprise")}</SelectItem>
                        <SelectItem value="MidMarket">{t("crmAccounts.tiers.MidMarket")}</SelectItem>
                        <SelectItem value="Standard">{t("crmAccounts.tiers.Standard")}</SelectItem>
                        <SelectItem value="Trial">{t("crmAccounts.tiers.Trial")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-account-currency" className="text-nx-ink-2 font-medium">{t("crmAccounts.create.currency") || "Currency Code"}</Label>
                    <Select value={editCurrency || baseCurrency || "SAR"} onValueChange={setEditCurrency}>
                      <SelectTrigger id="edit-account-currency" className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CRM_CURRENCY_OPTIONS.map((c) => <SelectItem key={c.code} value={c.code}>{c.code} — {c.nameEn}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-account-notes" className="text-nx-ink-2 font-medium">{t("crmAccounts.create.notes") || "Commercial Account Notes"}</Label>
                  <Input id="edit-account-notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="h-8 text-xs bg-nx-ground border-nx-line text-nx-ink" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-nx-line">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)} disabled={isSubmitting} className="h-8 text-xs border-nx-line text-nx-ink-2">{t("common.cancel") || "Cancel"}</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold">{isSubmitting ? t("common.saving") || "Saving..." : t("common.saveChanges") || "Save Changes"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CrmShell>
  );
}
