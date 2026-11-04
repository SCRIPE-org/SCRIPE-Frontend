"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { PhoneInput } from "@core/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import {
  AlertCircle,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Link as LinkIcon,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";
import { cn } from "@core/common/utils";
import {
  CustomFieldsSection,
  useCustomFieldsFormFields,
} from "@core/crud/customFieldsExtension";
import { CRM_PERMISSIONS, CrmShell, ActivityTimeline } from "@modules/crm";
import { LeadStatusBadge } from "../components/LeadStatusBadge";
import { QualifyLeadDialog } from "../components/QualifyLeadDialog";
import { LinkPartyDialog } from "../components/LinkPartyDialog";
import { ConvertLeadDialog } from "../components/ConvertLeadDialog";
import { useLeadDetailViewModel } from "../viewmodels/useLeadDetailViewModel";
import type { LeadStatus } from "../../domain/entities/LeadEntity";

export interface LeadDetailViewProps {
  leadId: string;
}

const LEAD_PROGRESSION_STEPS: { status: LeadStatus; labelEn: string; labelAr: string }[] = [
  { status: "New", labelEn: "1. New Intake", labelAr: "١. جديد" },
  { status: "Working", labelEn: "2. Working", labelAr: "٢. قيد المتابعة" },
  { status: "Qualified", labelEn: "3. Qualified", labelAr: "٣. مؤهل" },
  { status: "Converted", labelEn: "4. Converted to Deal", labelAr: "٤. تم التحويل" },
];

/**
 * Lead 360 Qualification & Conversion Workspace (/crm/leads/[id] — Figma 6:302, SCRIPE-733/734).
 */
export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const router = useRouter();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

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
    handleQualifyLead,
    handleLinkParty,
    handleConvertLead,
    lookupCandidateParties,
  } = useLeadDetailViewModel(leadId);

  const {
    fieldConfigs: leadCustomFieldConfigs,
    isLoading: isLeadCfLoading,
    refetch: refetchLeadCustomFields,
  } = useCustomFieldsFormFields("crm.lead", leadId);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEstimatedValue, setEditEstimatedValue] = useState("");
  const [editCurrency, setEditCurrency] = useState("SAR");
  const [editNotes, setEditNotes] = useState("");
  const [editCustomFields, setEditCustomFields] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (leadCustomFieldConfigs.length > 0) {
      setEditCustomFields((prev) => {
        const next: Record<string, unknown> = { ...prev };
        for (const fc of leadCustomFieldConfigs) {
          if (fc.defaultValue !== undefined && fc.defaultValue !== null) {
            next[fc.name] = fc.defaultValue;
          }
        }
        return next;
      });
    }
  }, [leadCustomFieldConfigs]);

  const openEditModal = () => {
    const lead = state.lead;
    if (!lead) return;
    setEditTitle(lead.title || "");
    setEditFirstName(lead.firstName || "");
    setEditLastName(lead.lastName || "");
    setEditCompany(lead.companyName || "");
    setEditEmail(lead.email || "");
    setEditPhone(lead.phone || "");
    setEditEstimatedValue(lead.estimatedValue != null ? String(lead.estimatedValue) : "");
    setEditCurrency(lead.currency || "SAR");
    setEditNotes(lead.notes || "");
    setSubmitError(null);
    setIsEditOpen(true);
  };

  const onSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await handleUpdateLead(
      {
        title: editTitle.trim() || undefined,
        firstName: editFirstName.trim() || undefined,
        lastName: editLastName.trim() || undefined,
        companyName: editCompany.trim() || undefined,
        email: editEmail.trim() || undefined,
        phone: editPhone.trim() || undefined,
        estimatedValue: editEstimatedValue ? Number(editEstimatedValue) : undefined,
        currency: editCurrency,
        notes: editNotes.trim() || undefined,
      },
      editCustomFields
    );
    if (ok) {
      await refetchLeadCustomFields();
    }
  };

  if (state.stage === "loading" && !state.lead) {
    return (
      <CrmShell activeTab="leads" onTabChange={() => {}}>
        <div className="flex flex-col items-center justify-center py-24">
          <LoadingSpinner size="lg" className="text-nx-accent" />
          <p className="mt-3 text-xs text-nx-ink-3">Loading Lead 360 workspace...</p>
        </div>
      </CrmShell>
    );
  }

  if (state.stage === "failed" || !state.lead) {
    return (
      <CrmShell activeTab="leads" onTabChange={() => {}}>
        <div className="space-y-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/crm/leads")}
            className="h-8 text-xs text-nx-ink-2 gap-1"
          >
            {isRtl ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            <span>Back to Leads</span>
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs">
              {state.error || "Lead not found"}
            </AlertDescription>
          </Alert>
        </div>
      </CrmShell>
    );
  }

  const lead = state.lead;
  const isTerminal = lead.status === "Converted" || lead.status === "Disqualified";

  return (
    <CrmShell activeTab="leads" onTabChange={() => {}}>
      <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"} data-testid="lead-detail-view">
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/crm/leads")}
            className="h-8 text-xs text-nx-ink-2 gap-1 border border-nx-line bg-nx-surface hover:bg-nx-raised"
          >
            {isRtl ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
            <span>Back to Leads</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            {canUpdateLead && !isTerminal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="lead-detail-edit-btn"
                onClick={openEditModal}
                className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
              >
                <Edit2 className="size-3.5 text-nx-accent" />
                <span>Edit Lead</span>
              </Button>
            )}

            {canQualifyLead && !isTerminal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="lead-detail-link-party-btn"
                onClick={() => {
                  setSubmitError(null);
                  setIsLinkPartyOpen(true);
                }}
                className="h-8 text-xs gap-1.5 border-nx-line bg-nx-surface text-nx-ink hover:bg-nx-raised"
              >
                <LinkIcon className="size-3.5 text-nx-accent" />
                <span>Link Organization & Contact</span>
              </Button>
            )}

            {canQualifyLead && lead.status !== "Converted" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="lead-detail-qualify-btn"
                  onClick={() => {
                    setQualifyDefaultDecision("Qualified");
                    setSubmitError(null);
                    setIsQualifyOpen(true);
                  }}
                  className="h-8 text-xs gap-1.5 border-success/40 bg-success/10 text-success hover:bg-success/20"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Qualify Lead</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="lead-detail-disqualify-btn"
                  onClick={() => {
                    setQualifyDefaultDecision("Disqualified");
                    setSubmitError(null);
                    setIsQualifyOpen(true);
                  }}
                  className="h-8 text-xs gap-1.5 border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <XCircle className="size-3.5" />
                  <span>Disqualify</span>
                </Button>
              </>
            )}

            {canQualifyLead && canCreateOpp && !lead.convertedOpportunityId && (
              <Button
                type="button"
                size="sm"
                data-testid="lead-detail-convert-btn"
                onClick={() => {
                  setSubmitError(null);
                  setIsConvertOpen(true);
                }}
                className="h-8 text-xs font-bold gap-1.5"
              >
                <Sparkles className="size-3.5" />
                <span>Convert to Deal</span>
              </Button>
            )}
          </div>
        </div>

        {/* Interactive Lead Qualification Status Progression Bar */}
        <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5" data-testid="lead-progression-bar">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-nx-ink-2">
              Lead Qualification Progression
            </span>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            {LEAD_PROGRESSION_STEPS.map((step) => {
              const isCurrent = lead.status === step.status;
              return (
                <Button
                  key={step.status}
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting || lead.status === "Converted"}
                  data-testid={`lead-step-${step.status}`}
                  onClick={() => handleStatusProgression(step.status)}
                  className={cn(
                    "h-auto flex items-center justify-between rounded-nx-md border px-3 py-2 text-start text-xs transition-all",
                    isCurrent
                      ? "border-nx-accent bg-nx-accent-wash/30 text-nx-accent font-bold"
                      : "border-nx-line bg-nx-ground text-nx-ink-2 hover:border-nx-line-hi"
                  )}
                >
                  <span>{isRtl ? step.labelAr : step.labelEn}</span>
                  {isCurrent && <CheckCircle2 className="size-3.5 shrink-0" />}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Lead 360 Header & Commercial Attributes Card */}
        <Card className="p-5 border-nx-line bg-nx-surface space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nx-line pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-nx-ink font-heading">{lead.title}</h1>
                <LeadStatusBadge status={lead.status} />
                <Badge
                  variant="outline"
                  className="border-nx-line bg-nx-raised text-nx-ink-2 text-[11px]"
                >
                  {lead.source || "Direct"}
                </Badge>
              </div>
              <p className="text-xs text-nx-ink-3">
                {lead.companyName || "Unlinked Organization"} •{" "}
                {lead.fullName || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "—"}
              </p>
            </div>

            <div className="text-end">
              <span className="text-[11px] text-nx-ink-3 block uppercase font-semibold">
                Estimated Commercial Value
              </span>
              <span className="text-xl font-bold text-nx-accent font-mono">
                {lead.estimatedValue != null
                  ? `${lead.currency || "SAR"} ${lead.estimatedValue.toLocaleString()}`
                  : "—"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-nx-ink-3 flex items-center gap-1">
                <User className="size-3" /> Contact Person
              </span>
              <span className="font-semibold text-nx-ink block">
                {lead.fullName || `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "—"}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-nx-ink-3 flex items-center gap-1">
                <Mail className="size-3" /> Email Address
              </span>
              <span className="font-semibold text-nx-ink block">{lead.email || "—"}</span>
            </div>

            <div className="space-y-1">
              <span className="text-nx-ink-3 flex items-center gap-1">
                <Phone className="size-3" /> Phone Number
              </span>
              <span className="font-semibold text-nx-ink font-mono block">{lead.phone || "—"}</span>
            </div>

            <div className="space-y-1">
              <span className="text-nx-ink-3 flex items-center gap-1">
                <Calendar className="size-3" /> Intake Date
              </span>
              <span className="font-semibold text-nx-ink block">
                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>

          {lead.notes && (
            <div className="pt-3 border-t border-nx-line">
              <span className="text-[11px] font-semibold text-nx-ink-3 uppercase block mb-1">
                Qualification & Intake Notes
              </span>
              <p className="text-xs text-nx-ink-2 bg-nx-raised/40 p-3 rounded-nx-md border border-nx-line">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Custom Fields View Section */}
          <div className="pt-2 border-t border-nx-line">
            <CustomFieldsSection
              entityTypeKey="crm.lead"
              entityDisplayName={t("crmLeads.title") || "Commercial Lead"}
              configs={leadCustomFieldConfigs}
              isLoading={isLeadCfLoading}
              onFieldCreated={() => void refetchLeadCustomFields()}
              values={editCustomFields}
              onChange={(key, value) =>
                setEditCustomFields((prev) => ({ ...prev, [key]: value }))
              }
              isViewMode={true}
            />
          </div>
        </Card>

        {/* Party Linkage & Converted Deal Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4 border-nx-line bg-nx-surface space-y-3" data-testid="lead-party-link-card">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">
                  Verified Party & Account Linkage (D3 / PD-1)
                </h2>
              </div>
              {lead.organizationPartyId || lead.personPartyId ? (
                <Badge
                  variant="outline"
                  className="border-success/40 bg-success/10 text-success text-[10px] gap-1"
                >
                  <ShieldCheck className="size-3" /> Party Linked
                </Badge>
              ) : (
                <Badge variant="outline" className="border-nx-line text-nx-ink-3 text-[10px]">
                  Unlinked (Pre-Conversion)
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground p-3">
                <div>
                  <span className="text-nx-ink-3 block text-[11px]">Organization Party</span>
                  <span className="font-semibold text-nx-ink">
                    {lead.companyName || "No Organization Name"}
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] border-nx-line">
                  {lead.organizationPartyId ? "Linked" : "Pending"}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-ground p-3">
                <div>
                  <span className="text-nx-ink-3 block text-[11px]">Person Contact Party</span>
                  <span className="font-semibold text-nx-ink">
                    {lead.fullName || "No Contact Name"}
                  </span>
                </div>
                <Badge variant="outline" className="font-mono text-[10px] border-nx-line">
                  {lead.personPartyId ? "Linked" : "Pending"}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-nx-line bg-nx-surface space-y-3">
            <div className="flex items-center justify-between border-b border-nx-line pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-nx-accent" />
                <h2 className="text-sm font-bold text-nx-ink">
                  Deal Conversion Status (D2=B Dual Entry)
                </h2>
              </div>
            </div>

            {lead.convertedOpportunityId ? (
              <div className="p-4 rounded-nx-md border border-success/30 bg-success/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-success block">
                    Converted to Active Opportunity
                  </span>
                  <span className="text-[11px] text-nx-ink-2">
                    This lead has been converted into a commercial pipeline deal.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/crm/opportunities/${lead.convertedOpportunityId}`)}
                  className="h-8 text-xs gap-1"
                >
                  <span>Open Deal</span>
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-nx-md border border-nx-line bg-nx-ground flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-nx-ink block">
                    Ready for Commercial Conversion
                  </span>
                  <span className="text-[11px] text-nx-ink-3">
                    Convert this lead into a tracked commercial deal in the 5-stage pipeline.
                  </span>
                </div>
                {canQualifyLead && canCreateOpp && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSubmitError(null);
                      setIsConvertOpen(true);
                    }}
                    className="h-8 text-xs font-bold gap-1 shrink-0"
                  >
                    <Sparkles className="size-3.5" />
                    <span>Convert Now</span>
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Lead Activity, Follow-Up & Outbound Communication Timeline */}
        <Card className="p-5 border-nx-line bg-nx-surface">
          <ActivityTimeline
            key={`${lead.id}-${lead.rowVersion || ""}-${lead.status}`}
            leadId={lead.id}
            targetLabel={lead.title}
            defaultRecipientEmail={lead.email}
          />
        </Card>

        {/* Edit Lead Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent
            className="sm:max-w-lg bg-nx-surface border-nx-line text-nx-ink max-h-[90vh] overflow-y-auto"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <form onSubmit={onSaveEdit} className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-nx-ink font-heading">
                  Edit Lead Details
                </DialogTitle>
                <DialogDescription className="text-xs text-nx-ink-2">
                  Update commercial lead contact details, estimated deal value, and custom fields.
                </DialogDescription>
              </DialogHeader>

              {submitError && (
                <Alert variant="destructive" className="text-xs py-2">
                  <AlertCircle className="size-3.5" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <Label className="font-semibold text-nx-ink">Lead Title *</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-semibold text-nx-ink">First Name</Label>
                    <Input
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-semibold text-nx-ink">Last Name</Label>
                    <Input
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-semibold text-nx-ink">Company / Organization</Label>
                    <Input
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-semibold text-nx-ink">Email</Label>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="font-semibold text-nx-ink">Phone</Label>
                  <PhoneInput
                    value={editPhone}
                    onChange={(val) => setEditPhone(val || "")}
                    defaultCountry="SA"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="font-semibold text-nx-ink">Estimated Value</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editEstimatedValue}
                      onChange={(e) => setEditEstimatedValue(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-semibold text-nx-ink">Currency</Label>
                    <Select value={editCurrency} onValueChange={setEditCurrency}>
                      <SelectTrigger className="h-8 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="EGP">EGP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="font-semibold text-nx-ink">Notes</Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-nx-line">
                  <CustomFieldsSection
                    entityTypeKey="crm.lead"
                    entityDisplayName={t("crmLeads.title") || "Commercial Lead"}
                    configs={leadCustomFieldConfigs}
                    isLoading={isLeadCfLoading}
                    onFieldCreated={() => void refetchLeadCustomFields()}
                    values={editCustomFields}
                    onChange={(key, value) =>
                      setEditCustomFields((prev) => ({ ...prev, [key]: value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 border-t border-nx-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditOpen(false)}
                  disabled={isSubmitting}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="h-8 text-xs font-bold">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Qualify Lead Modal */}
        <QualifyLeadDialog
          open={isQualifyOpen}
          onOpenChange={setIsQualifyOpen}
          lead={lead}
          initialDecision={qualifyDefaultDecision}
          onSubmit={handleQualifyLead}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        {/* Link Party Modal */}
        <LinkPartyDialog
          open={isLinkPartyOpen}
          onOpenChange={setIsLinkPartyOpen}
          lead={lead}
          onSubmit={handleLinkParty}
          onLookupParties={lookupCandidateParties}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />

        {/* Convert Lead Modal */}
        <ConvertLeadDialog
          open={isConvertOpen}
          onOpenChange={setIsConvertOpen}
          lead={lead}
          onSubmit={handleConvertLead}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      </div>
    </CrmShell>
  );
}
