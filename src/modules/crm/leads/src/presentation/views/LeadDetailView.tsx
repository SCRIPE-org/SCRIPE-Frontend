"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Link as LinkIcon,
  XCircle,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useCustomFieldsFormFields } from "@core/crud/customFieldsExtension";
import {
  CRM_PERMISSIONS,
  CrmShell,
  ActivityTimeline,
  useCrmCurrency,
  useCrmWorkflowsStore,
  resolveDefaultStageColor,
  STAGE_COLOR_PALETTE,
  buildCustomHexHarmonicStyles,
  CrmWorkflowTransitionDialog,
  type CrmWorkflowTransitionSubmitPayload,
  type EvaluatedWorkflowTransition,
} from "@modules/crm";
import { LeadStatusBadge } from "../components/LeadStatusBadge";
import { QualifyLeadDialog } from "../components/QualifyLeadDialog";
import { LinkPartyDialog } from "../components/LinkPartyDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { LeadDetailProfileCards } from "../components/LeadDetailProfileCards";
import { LeadDetailSkeleton } from "../components/LeadDetailSkeleton";
import { EditLeadDetailDialog } from "../components/EditLeadDetailDialog";
import { stageToLeadStatusValue } from "../components/LeadsKanbanCardItem";
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
    state,
    isEditOpen,
    setIsEditOpen,
    isQualifyOpen,
    setIsQualifyOpen,
    qualifyDefaultDecision,
    setQualifyDefaultDecision,
    isLinkPartyOpen,
    setIsLinkPartyOpen,
    isConvertOpen,
    setIsConvertOpen,
    isSubmitting,
    submitError,
    setSubmitError,
    handleUpdateLead,
    handleStatusProgression,
    handleTransitionSubmit,
    handleQualifyLead,
    handleLinkParty,
    handleConvertLead,
    lookupCandidateParties,
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
      fromStageKey: fromKey,
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
        for (const fc of leadCustomFieldConfigs) {
          if (fc.defaultValue !== undefined && fc.defaultValue !== null) next[fc.name] = fc.defaultValue;
        }
        return next;
      });
    }
  }, [leadCustomFieldConfigs]);

  const onSaveLead = async (payload: Record<string, any>) => {
    const ok = await handleUpdateLead(payload, editCustomFields);
    if (ok) await refetchLeadCustomFields();
  };

  if (state.stage === "loading" && !state.lead) {
    return (
      <CrmShell activeTab="leads" onTabChange={onTabNav}>
        <LeadDetailSkeleton />
      </CrmShell>
    );
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

        <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5" data-testid="lead-progression-bar">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-nx-ink-2">{t("crmLeads.detail.progressionTitle")}</span>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div
            className="grid grid-cols-1 gap-1.5"
            style={{
              gridTemplateColumns:
                activeLeadWorkflow?.stages && activeLeadWorkflow.stages.length >= 2
                  ? `repeat(${activeLeadWorkflow.stages.length}, minmax(0, 1fr))`
                  : undefined,
            }}
          >
            {[...(activeLeadWorkflow?.stages ?? [])]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((stg) => {
                const stageStatus = stageToLeadStatusValue(stg.stageKey, stg.labelEn);
                const isCurrent = (lead.stageKey && lead.stageKey === stg.stageKey) || lead.status === stageStatus;
                const colorToken = resolveDefaultStageColor(stg.stageKey, stg.category, stg.sortOrder, stg.color);
                const colorMeta = STAGE_COLOR_PALETTE[colorToken] ?? STAGE_COLOR_PALETTE.blue;
                const raw = stg as any;
                const customHexStyles = buildCustomHexHarmonicStyles(stg.customColorHex || raw.properties?.customColorHex);
                return (
                  <Button
                    key={stg.stageKey}
                    type="button"
                    variant="ghost"
                    disabled={isSubmitting || isCurrent}
                    data-testid={`lead-step-${stg.stageKey}`}
                    data-stage-status={stageStatus}
                    onClick={() => handleStageTransition(stg.stageKey)}
                    style={customHexStyles.isValidHex ? customHexStyles.cardStyle : undefined}
                    className={cn(
                      "h-auto flex items-center justify-between gap-1 rounded-nx-md border px-2.5 py-2 text-start text-xs transition-all min-w-0",
                      isCurrent
                        ? cn(
                            "ring-2 ring-nx-accent font-bold",
                            !customHexStyles.isValidHex ? colorMeta.badgeClass : "border-nx-accent bg-nx-accent-wash/30 text-nx-accent"
                          )
                        : cn(
                            "hover:border-nx-line-hi",
                            !customHexStyles.isValidHex ? colorMeta.borderClass : "border-nx-line bg-nx-ground text-nx-ink-2"
                          )
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={cn("w-2 h-2 rounded-full shrink-0", !customHexStyles.isValidHex && colorMeta.dotClass)}
                        style={customHexStyles.isValidHex ? customHexStyles.dotStyle : undefined}
                      />
                      <span className="truncate">{isRtl && stg.labelAr ? stg.labelAr : stg.labelEn}</span>
                    </div>
                    {isCurrent && <CheckCircle2 className="size-3.5 shrink-0" />}
                  </Button>
                );
              })}
          </div>
        </Card>

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
