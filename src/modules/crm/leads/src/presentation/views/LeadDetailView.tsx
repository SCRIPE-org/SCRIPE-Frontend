"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useCustomFieldsFormFields } from "@core/crud/customFieldsExtension";
import { CRM_PERMISSIONS, CrmShell, useCrmCurrency } from "@modules/crm/shared";
import {
  ActivityTimeline,
  useCrmWorkflowsStore,
  CrmWorkflowTransitionDialog,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { QualifyLeadDialog } from "../components/QualifyLeadDialog";
import { LinkPartyDialog } from "../components/LinkPartyDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { AssignLeadOwnerDialog } from "../components/AssignLeadOwnerDialog";
import { LeadDetailProfileCards } from "../components/LeadDetailProfileCards";
import { LeadDetailSkeleton } from "../components/LeadDetailSkeleton";
import { EditLeadDetailDialog } from "../components/EditLeadDetailDialog";
import { LeadStageProgressionCard } from "../components/LeadStageProgressionCard";
import { LeadDetailActionsBar } from "../components/LeadDetailActionsBar";
import { useLeadDetailViewModel } from "../viewmodels/useLeadDetailViewModel";
import { buildLeadTransitionRecord, evaluateLeadStageTransition, resolveLeadTransitionStageLabels } from "../utils/leadTransitionHelpers";
import type { UpdateLeadInput } from "../../domain/entities/LeadEntity";

/** Props for `LeadDetailView`. */
export interface LeadDetailViewProps {
  leadId: string;
}

/** Lead 360 Qualification & Conversion workspace view (<200 lines). */
export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const { baseCurrency, defaultDealCurrency, autoConvertToBase, convertAmount } = useCrmCurrency();

  const canUpdateLead = usePermission(CRM_PERMISSIONS.LEADS_UPDATE);
  const canQualifyLead = usePermission(CRM_PERMISSIONS.LEADS_QUALIFY);
  const canCreateOpp = usePermission(CRM_PERMISSIONS.OPPORTUNITIES_CREATE);
  const canAssignOwner = usePermission(CRM_PERMISSIONS.RECORDS_ASSIGN);

  const {
    state, isEditOpen, setIsEditOpen, isQualifyOpen, setIsQualifyOpen,
    qualifyDefaultDecision, setQualifyDefaultDecision, isLinkPartyOpen, setIsLinkPartyOpen,
    isConvertOpen, setIsConvertOpen, isAssignOwnerOpen, setIsAssignOwnerOpen,
    isSubmitting, submitError, setSubmitError,
    handleUpdateLead, handleTransitionSubmit, handleQualifyLead,
    handleLinkParty, handleConvertLead, handleAssignLeadOwner, linkPartyBeforeConvert,
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

    const evalResult = evaluateLeadStageTransition(currentLead, fromKey, toKey, isRtl);
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
    await handleTransitionSubmit({ entityId: currentLead.id, targetStageKey: toKey, expectedRowVersion: currentLead.rowVersion });
  };

  const { fieldConfigs: leadCustomFieldConfigs, isLoading: isLeadCfLoading, refetch: refetchLeadCustomFields } = useCustomFieldsFormFields("crm.lead", leadId);
  const [editCustomFields, setEditCustomFields] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (leadCustomFieldConfigs.length === 0) return;
    setEditCustomFields((prev) => {
      let changed = false;
      const next: Record<string, unknown> = { ...prev };
      for (const fc of leadCustomFieldConfigs) {
        if (fc.defaultValue != null && next[fc.name] === undefined) {
          next[fc.name] = fc.defaultValue;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [leadCustomFieldConfigs]);

  const onSaveLead = async (payload: Omit<UpdateLeadInput, "leadId" | "expectedRowVersion">) => {
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
        <LeadDetailActionsBar
          lead={lead} isRtl={isRtl} isTerminal={isTerminal} canUpdateLead={canUpdateLead} canAssignOwner={canAssignOwner}
          canQualifyLead={canQualifyLead} canCreateOpp={canCreateOpp} onBack={() => router.push("/crm/leads")}
          onOpenEdit={() => { setSubmitError(null); setIsEditOpen(true); }}
          onOpenAssignOwner={() => { setSubmitError(null); setIsAssignOwnerOpen(true); }}
          onOpenLinkParty={() => { setSubmitError(null); setIsLinkPartyOpen(true); }}
          onOpenQualify={(decision) => { setQualifyDefaultDecision(decision); setSubmitError(null); setIsQualifyOpen(true); }}
          onOpenConvert={() => { setSubmitError(null); setIsConvertOpen(true); }} t={t}
        />
        {submitError && !isEditOpen && !isQualifyOpen && !isLinkPartyOpen && !isConvertOpen && !isAssignOwnerOpen && (
          <Alert variant="destructive" data-testid="lead-detail-transition-error-banner" dir={isRtl ? "rtl" : "ltr"}>
            <AlertCircle className="size-4" />
            <AlertTitle>{t("crmLeads.detail.transitionBlockedTitle")}</AlertTitle>
            <AlertDescription className="mt-1 flex items-center justify-between gap-3">
              <span className="text-xs">{submitError}</span>
              <Button type="button" size="sm" variant="outline" onClick={() => setSubmitError(null)} className="text-xs h-7 shrink-0">{t("crmLeads.detail.dismissBtn")}</Button>
            </AlertDescription>
          </Alert>
        )}
        <LeadStageProgressionCard lead={lead} activeWorkflow={activeLeadWorkflow} isSubmitting={isSubmitting} onStageTransition={handleStageTransition} isRtl={isRtl} t={t} />
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-nx-surface border border-nx-line p-1">
            <TabsTrigger value="profile" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">{t("crmLeads.tabs.profile")}</TabsTrigger>
            <TabsTrigger value="linkage" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">{t("crmLeads.tabs.linkage")}</TabsTrigger>
            <TabsTrigger value="activities" className="text-xs data-[state=active]:bg-nx-accent-wash data-[state=active]:text-nx-accent font-semibold">{t("crmLeads.tabs.activities")}</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-4">
            <LeadDetailProfileCards lead={lead} baseCurrency={baseCurrency} autoConvertToBase={autoConvertToBase} convertAmount={convertAmount} leadCustomFieldConfigs={leadCustomFieldConfigs} isLeadCfLoading={isLeadCfLoading} refetchLeadCustomFields={refetchLeadCustomFields} editCustomFields={editCustomFields} onCustomFieldChange={(key, value) => setEditCustomFields((prev) => ({ ...prev, [key]: value }))} canQualifyLead={canQualifyLead} canCreateOpp={canCreateOpp} onOpenConvert={() => { setSubmitError(null); setIsConvertOpen(true); }} mode="profile" />
          </TabsContent>
          <TabsContent value="linkage" className="space-y-4">
            <LeadDetailProfileCards lead={lead} baseCurrency={baseCurrency} autoConvertToBase={autoConvertToBase} convertAmount={convertAmount} leadCustomFieldConfigs={leadCustomFieldConfigs} isLeadCfLoading={isLeadCfLoading} refetchLeadCustomFields={refetchLeadCustomFields} editCustomFields={editCustomFields} onCustomFieldChange={(key, value) => setEditCustomFields((prev) => ({ ...prev, [key]: value }))} canQualifyLead={canQualifyLead} canCreateOpp={canCreateOpp} onOpenConvert={() => { setSubmitError(null); setIsConvertOpen(true); }} mode="linkage" />
          </TabsContent>
          <TabsContent value="activities" className="space-y-4">
            <Card className="p-5 border-nx-line bg-nx-surface">
              <ActivityTimeline key={`${lead.id}-${lead.rowVersion || ""}-${lead.status}`} leadId={lead.id} targetLabel={lead.title} defaultRecipientEmail={lead.email} />
            </Card>
          </TabsContent>
        </Tabs>
        <EditLeadDetailDialog t={t} isRtl={isRtl} lead={lead} defaultDealCurrency={defaultDealCurrency} isEditOpen={isEditOpen} onOpenChange={setIsEditOpen} onSaveLead={onSaveLead} submitError={submitError} leadCustomFieldConfigs={leadCustomFieldConfigs} isLeadCfLoading={isLeadCfLoading} refetchLeadCustomFields={refetchLeadCustomFields} editCustomFields={editCustomFields} onCustomFieldChange={(key, value) => setEditCustomFields((prev) => ({ ...prev, [key]: value }))} isSubmitting={isSubmitting} />
        <QualifyLeadDialog open={isQualifyOpen} onOpenChange={setIsQualifyOpen} lead={lead} initialDecision={qualifyDefaultDecision} onSubmit={handleQualifyLead} isSubmitting={isSubmitting} submitError={submitError} />
        <LinkPartyDialog open={isLinkPartyOpen} onOpenChange={setIsLinkPartyOpen} lead={lead} onSubmit={handleLinkParty} isSubmitting={isSubmitting} submitError={submitError} />
        <ConvertLeadDialog open={isConvertOpen} onOpenChange={setIsConvertOpen} lead={lead} onLinkPartyBeforeConvert={linkPartyBeforeConvert} onSubmit={handleConvertLead} isSubmitting={isSubmitting} submitError={submitError} />
        <AssignLeadOwnerDialog open={isAssignOwnerOpen} onOpenChange={setIsAssignOwnerOpen} lead={lead} onSubmit={handleAssignLeadOwner} isSubmitting={isSubmitting} submitError={submitError} />
        <CrmWorkflowTransitionDialog open={transitionDialogOpen} onOpenChange={setTransitionDialogOpen} entityType="lead" record={lead ? buildLeadTransitionRecord(lead) : null} fromStageKey={transitionFromKey} toStageKey={transitionToKey} {...resolveLeadTransitionStageLabels(activeLeadWorkflow, transitionFromKey, transitionToKey, isRtl)} evalResult={transitionEvalResult} onSubmit={handleTransitionSubmit} isSubmitting={isSubmitting} />
      </div>
    </CrmShell>
  );
}
