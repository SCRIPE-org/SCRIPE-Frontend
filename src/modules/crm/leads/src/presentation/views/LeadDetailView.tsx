"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  AlertCircle, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Edit2, Link as LinkIcon, XCircle,
} from "lucide-react";
import { useCustomFieldsFormFields } from "@core/crud/customFieldsExtension";
import {
  CRM_PERMISSIONS, CrmShell, ActivityTimeline, useCrmCurrency, useCrmWorkflowsStore,
  CrmWorkflowTransitionDialog, type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { QualifyLeadDialog } from "../components/QualifyLeadDialog";
import { LinkPartyDialog } from "../components/LinkPartyDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { LeadDetailProfileCards } from "../components/LeadDetailProfileCards";
import { LeadDetailSkeleton } from "../components/LeadDetailSkeleton";
import { EditLeadDetailDialog } from "../components/EditLeadDetailDialog";
import { LeadStageProgressionCard } from "../components/LeadStageProgressionCard";
import { useLeadDetailViewModel } from "../viewmodels/useLeadDetailViewModel";

export interface LeadDetailViewProps {
  leadId: string;
}

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, defaultDealCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();

  const canUpdateLead = usePermission(CRM_PERMISSIONS.LEADS_UPDATE);
  const canQualifyLead = usePermission(CRM_PERMISSIONS.LEADS_QUALIFY);
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);

  const {
    state, isEditOpen, setIsEditOpen, isQualifyOpen, setIsQualifyOpen,
    qualifyDefaultDecision, setQualifyDefaultDecision, isLinkPartyOpen, setIsLinkPartyOpen,
    isConvertOpen, setIsConvertOpen, isSubmitting, submitError, setSubmitError,
    handleUpdateLead, handleTransitionSubmit, handleQualifyLead,
    handleLinkParty, handleConvertLead, lookupCandidateParties,
  } = useLeadDetailViewModel(leadId);

  const activeLeadWorkflow = useCrmWorkflowsStore((s) => s.getActiveWorkflow("lead"));
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);
  const [transitionFromKey, setTransitionFromKey] = useState("");
  const [transitionToKey, setTransitionToKey] = useState("");
  const [transitionEvalResult, setTransitionEvalResult] = useState<EvaluatedWorkflowTransition | null>(null);

  const onTabNav = (tab: string) => {
    if (tab !== "leads") router.push(tab === "overview" ? "/crm" : tab === "deals" ? "/crm/opportunities" : `/crm/${tab}`);
  };

  const handleStageTransition = async (targetStageKeyOrStatus: string) => {
    if (!state.lead) return;
    const currentLead = state.lead;
    const fromKey = currentLead.stageKey || `lead.${currentLead.status.toLowerCase()}`;
    const targetStage = activeLeadWorkflow?.stages.find(
      (s) => s.stageKey === targetStageKeyOrStatus || s.labelEn.toLowerCase() === targetStageKeyOrStatus.toLowerCase()
    );
    const toKey = targetStage ? targetStage.stageKey : targetStageKeyOrStatus.startsWith("lead.") ? targetStageKeyOrStatus : `lead.${targetStageKeyOrStatus.toLowerCase()}`;

    if (toKey === fromKey) return;

    if (targetStage?.triggerDealConversion || targetStage?.category === "done" || toKey.includes("converted")) {
      setSubmitError(null);
      setIsConvertOpen(true);
      return;
    }

    const evalResult = useCrmWorkflowsStore.getState().evaluateTransition("lead", fromKey, toKey, {
      hasVerifiedParty: Boolean(currentLead.organizationPartyId || currentLead.personPartyId || currentLead.verifiedPartyId),
      estimatedAmount: currentLead.estimatedValue ?? null,
      targetCloseDate: null,
    });

    if (evalResult.status === "blocked") {
      setSubmitError(evalResult.reason || t("crmLeads.detail.transitionBlockedTitle", { defaultValue: "Status Transition Blocked" }));
      return;
    }

    if (evalResult.status === "allowed_screen_required") {
      setTransitionFromKey(fromKey);
      setTransitionToKey(toKey);
      setTransitionEvalResult(evalResult);
      setTransitionDialogOpen(true);
      return;
    }

    await handleTransitionSubmit({
      entityId: currentLead.id,
      targetStageKey: toKey,
      expectedRowVersion: currentLead.rowVersion,
    });
  };

  const {
    fieldConfigs: leadCustomFieldConfigs,
    isLoading: isLeadCfLoading,
    refetch: refetchLeadCustomFields,
  } = useCustomFieldsFormFields("crm.lead", leadId);

  const [editCustomFields, setEditCustomFields] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (leadCustomFieldConfigs.length > 0) {
      setEditCustomFields((prev) => {
        const next: Record<string, unknown> = { ...prev };
        for (const fc of leadCustomFieldConfigs) if (fc.defaultValue != null) next[fc.name] = fc.defaultValue;
        return next;
      });
    }
  }, [leadCustomFieldConfigs]);

  const onSaveLead = async (payload: Record<string, any>) => {
    const ok = await handleUpdateLead(payload, editCustomFields);
    if (ok) await refetchLeadCustomFields();
  };

  if (state.stage === "loading" && !state.lead) {
    return <CrmShell activeTab="leads" onTabChange={onTabNav}><LeadDetailSkeleton /></CrmShell>;
  }

  if (state.stage === "failed" || !state.lead) {
    return (
      <CrmShell activeTab="leads" onTabChange={onTabNav}>
        <div className="space-y-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/crm/leads")} className="h-8 text-xs text-nx-ink-2 gap-1">
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            <span>{t("crmLeads.detail.backToLeads")}</span>
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmLeads.detail.errorTitle")}</AlertTitle>
            <AlertDescription className="text-xs">{state.error || t("crmLeads.detail.notFound")}</AlertDescription>
          </Alert>
        </div>
      </CrmShell>
    );
  }

  const lead = state.lead;
  const isTerminal = lead.status === "Converted" || lead.status === "Disqualified";

  return (
    <CrmShell activeTab="leads" onTabChange={onTabNav}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"} data-testid="lead-detail-view">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/crm/leads")} className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised">
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            <span>{t("crmLeads.detail.backToLeads")}</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {canUpdateLead && !isTerminal && (
              <Button type="button" variant="outline" size="sm" data-testid="lead-detail-edit-btn" onClick={() => { setSubmitError(null); setIsEditOpen(true); }} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <Edit2 className="size-3.5 text-nx-accent" />
                <span>{t("crmLeads.detail.editLeadBtn")}</span>
              </Button>
            )}
            {canQualifyLead && !isTerminal && (
              <Button type="button" variant="outline" size="sm" data-testid="lead-detail-link-party-btn" onClick={() => { setSubmitError(null); setIsLinkPartyOpen(true); }} className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised">
                <LinkIcon className="size-3.5 text-nx-accent" />
                <span>{t("crmLeads.detail.linkPartyBtn")}</span>
              </Button>
            )}
            {canQualifyLead && lead.status !== "Converted" && (
              <>
                <Button type="button" variant="outline" size="sm" data-testid="lead-detail-qualify-btn" onClick={() => { setQualifyDefaultDecision("Qualified"); setSubmitError(null); setIsQualifyOpen(true); }} className="h-8 text-xs gap-1.5 border-success/40 bg-success/10 text-success hover:bg-success/20">
                  <CheckCircle2 className="size-3.5" />
                  <span>{t("crmLeads.detail.qualifyLeadBtn")}</span>
                </Button>
                <Button type="button" variant="outline" size="sm" data-testid="lead-detail-disqualify-btn" onClick={() => { setQualifyDefaultDecision("Disqualified"); setSubmitError(null); setIsQualifyOpen(true); }} className="h-8 text-xs gap-1.5 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20">
                  <XCircle className="size-3.5" />
                  <span>{t("crmLeads.detail.disqualifyBtn")}</span>
                </Button>
              </>
            )}
            {canQualifyLead && canCreateOpp && !lead.convertedOpportunityId && (
              <Button type="button" size="sm" data-testid="lead-detail-convert-btn" onClick={() => { setSubmitError(null); setIsConvertOpen(true); }} className="h-8 text-xs font-bold gap-1.5">
                <ArrowUpRight className="size-3.5" />
                <span>{t("crmLeads.detail.convertBtn")}</span>
              </Button>
            )}
          </div>
        </div>

        {submitError && !isEditOpen && !isQualifyOpen && !isLinkPartyOpen && !isConvertOpen && (
          <Alert variant="destructive" data-testid="lead-detail-transition-error-banner" dir={isRtl ? "rtl" : "ltr"}>
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmLeads.detail.transitionBlockedTitle")}</AlertTitle>
            <AlertDescription className="mt-1 flex items-center justify-between gap-3">
              <span className="text-xs">{submitError}</span>
              <Button type="button" size="sm" variant="outline" onClick={() => setSubmitError(null)} className="text-xs h-7 shrink-0">{t("crmLeads.detail.dismissBtn")}</Button>
            </AlertDescription>
          </Alert>
        )}

        <LeadStageProgressionCard
          lead={lead}
          activeWorkflow={activeLeadWorkflow}
          isSubmitting={isSubmitting}
          onStageTransition={handleStageTransition}
          isRtl={isRtl}
          t={t}
        />

        <LeadDetailProfileCards
          lead={lead} baseCurrency={baseCurrency} autoConvertToBase={autoConvertToBase} convertAmount={convertAmount}
          leadCustomFieldConfigs={leadCustomFieldConfigs} isLeadCfLoading={isLeadCfLoading} refetchLeadCustomFields={refetchLeadCustomFields}
          editCustomFields={editCustomFields} onCustomFieldChange={(key, value) => setEditCustomFields((prev) => ({ ...prev, [key]: value }))}
          canQualifyLead={canQualifyLead} canCreateOpp={canCreateOpp} onOpenConvert={() => { setSubmitError(null); setIsConvertOpen(true); }}
        />

        <Card className="p-5 border-nx-line bg-nx-surface">
          <ActivityTimeline key={`${lead.id}-${lead.rowVersion || ""}-${lead.status}`} leadId={lead.id} targetLabel={lead.title} defaultRecipientEmail={lead.email} />
        </Card>

        <EditLeadDetailDialog
          t={t} isRtl={isRtl} lead={lead} defaultDealCurrency={defaultDealCurrency}
          isEditOpen={isEditOpen} onOpenChange={setIsEditOpen} onSaveLead={onSaveLead} submitError={submitError}
          leadCustomFieldConfigs={leadCustomFieldConfigs} isLeadCfLoading={isLeadCfLoading} refetchLeadCustomFields={refetchLeadCustomFields}
          editCustomFields={editCustomFields} onCustomFieldChange={(key, value) => setEditCustomFields((prev) => ({ ...prev, [key]: value }))}
          isSubmitting={isSubmitting}
        />

        <QualifyLeadDialog open={isQualifyOpen} onOpenChange={setIsQualifyOpen} lead={lead} initialDecision={qualifyDefaultDecision} onSubmit={handleQualifyLead} isSubmitting={isSubmitting} submitError={submitError} />
        <LinkPartyDialog open={isLinkPartyOpen} onOpenChange={setIsLinkPartyOpen} lead={lead} onSubmit={handleLinkParty} onLookupParties={lookupCandidateParties} isSubmitting={isSubmitting} submitError={submitError} />
        <ConvertLeadDialog open={isConvertOpen} onOpenChange={setIsConvertOpen} lead={lead} onSubmit={handleConvertLead} isSubmitting={isSubmitting} submitError={submitError} />

        {(() => {
          const fromStage = activeLeadWorkflow?.stages.find((s) => s.stageKey === transitionFromKey);
          const toStage = activeLeadWorkflow?.stages.find((s) => s.stageKey === transitionToKey);
          return (
            <CrmWorkflowTransitionDialog
              open={transitionDialogOpen}
              onOpenChange={setTransitionDialogOpen}
              entityType="lead"
              record={lead ? {
                id: lead.id,
                title: lead.title,
                partyId: lead.verifiedPartyId || lead.organizationPartyId || lead.personPartyId,
                estimatedValue: lead.estimatedValue,
                currency: lead.currency,
                rowVersion: lead.rowVersion,
              } : null}
              fromStageKey={transitionFromKey}
              toStageKey={transitionToKey}
              fromStageLabel={fromStage ? (isRtl && fromStage.labelAr ? fromStage.labelAr : fromStage.labelEn) : undefined}
              toStageLabel={toStage ? (isRtl && toStage.labelAr ? toStage.labelAr : toStage.labelEn) : undefined}
              evalResult={transitionEvalResult}
              onSubmit={handleTransitionSubmit}
              isSubmitting={isSubmitting}
            />
          );
        })()}
      </div>
    </CrmShell>
  );
}
