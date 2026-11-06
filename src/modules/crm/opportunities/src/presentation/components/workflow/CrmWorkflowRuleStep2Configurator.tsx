"use client";

import React, { useState } from "react";
import { Plus, Search, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  CRM_RECORD_RELATIVE_PRINCIPALS, CRM_RULE_OPERATORS, CRM_SCOPED_PERMISSION_OPTIONS,
  CRM_WORKFLOW_SYSTEM_FIELDS, DEFAULT_BUYING_COMMITTEE_ROLES, DEFAULT_CRM_SCOPED_ROLES,
  STAGE_COLOR_PALETTE, resolveDefaultStageColor, useCrmSettingsStore,
  type CrmCustomFieldDefinition, type CrmRuleCatalogDefinition,
} from "@modules/crm";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";
import { CrmInlineScopedRoleCreator } from "./CrmInlineScopedRoleCreator";

export interface CrmWorkflowRuleStep2ConfiguratorProps {
  isAr: boolean; activeEntity: "deal" | "lead"; selectedTpl: CrmRuleCatalogDefinition;
  configDraft: Record<string, string>; onChangeConfig: (next: Record<string, string>) => void;
  stages: CrmWorkflowStageNode[]; crmCustomFields: CrmCustomFieldDefinition[];
  onAddCrmCustomField?: (field: CrmCustomFieldDefinition) => void;
}

const parseCsv = (val?: string) => (val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []);
const toggleCsv = (val: string | undefined, item: string) => {
  const list = parseCsv(val);
  return (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]).join(",");
};

export function CrmWorkflowRuleStep2Configurator({
  isAr, activeEntity, selectedTpl, configDraft, onChangeConfig, stages, crmCustomFields, onAddCrmCustomField,
}: CrmWorkflowRuleStep2ConfiguratorProps) {
  const crmRoles = useCrmSettingsStore((s) => s.crmRoles ?? DEFAULT_CRM_SCOPED_ROLES);
  const buyingCommitteeRoles = useCrmSettingsStore((s) => s.buyingCommitteeRoles ?? DEFAULT_BUYING_COMMITTEE_ROLES);
  const addBuyingCommitteeRole = useCrmSettingsStore((s) => s.addBuyingCommitteeRole);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStakeholderRoleEn, setNewStakeholderRoleEn] = useState("");
  const [newCfLabel, setNewCfLabel] = useState("");
  const [showCfCreator, setShowCfCreator] = useState(false);

  const setKeys = (patch: Record<string, string>) => onChangeConfig({ ...configDraft, ...patch });
  const rk = selectedTpl.ruleTypeKey;
  const allFields = [
    ...CRM_WORKFLOW_SYSTEM_FIELDS.filter((f) => f.entityType === "both" || f.entityType === activeEntity),
    ...crmCustomFields.map((cf) => ({ key: cf.key.startsWith("custom:") ? cf.key : `custom:${cf.key}`, labelEn: `${cf.labelEn} (Custom)`, labelAr: `${cf.labelAr} (مخصص)` })),
  ];

  if (rk === "restrict.approval_required" || rk === "restrict.roles_permissions") {
    const selectedPrincipals = parseCsv(configDraft.approverRoles || configDraft.allowedPrincipals || configDraft.principals || configDraft.approverRole || "pipe_role:deal_desk");
    const selectedPerms = parseCsv(configDraft.permissions || configDraft.permission);
    const quorum = configDraft.quorum || "any";
    const q = searchQuery.trim().toLowerCase();
    const filteredRoles = crmRoles.filter((r) => !q || r.nameEn.toLowerCase().includes(q) || r.nameAr.includes(q) || r.key.toLowerCase().includes(q));
    const filteredPrincipals = CRM_RECORD_RELATIVE_PRINCIPALS.filter((p) => !q || p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(q));
    const updatePrincipals = (nextCsv: string) => setKeys({ approverRoles: nextCsv, allowedPrincipals: nextCsv, principals: nextCsv, approverRole: nextCsv });

    return (
      <div className="space-y-2" data-testid="rule-principal-multi-select">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-bold text-nx-ink inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-primary" />{isAr ? "أدوار خط البيع والمسؤولون النسبيون" : "CRM Pipeline Roles & Record Principals (Approval Queues + ABAC)"}</Label>
          <Select value={quorum} onValueChange={(v) => setKeys({ quorum: v })}>
            <SelectTrigger className="h-7 w-48 text-[11px]" data-testid="rule-quorum-select"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10006]">
              <SelectItem value="any" className="text-xs">{isAr ? "نصاب فردي (أول مستجيب)" : "Quorum: Any First Responder"}</SelectItem>
              <SelectItem value="all" className="text-xs">{isAr ? "إجماع كامل (جميع الأدوار)" : "Quorum: All Unanimous"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-nx-ink-3 absolute start-2.5 top-2" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={isAr ? "ابحث في أدوار خط البيع أو المسؤولين..." : "Search CRM pipeline roles or dynamic record principals..."} className="h-7 ps-8 text-xs" data-testid="rule-principal-search-input" />
        </div>
        <div className="max-h-36 overflow-y-auto rounded-md border border-nx-line bg-nx-surface p-2 space-y-1.5">
          <div className="text-[10px] font-mono uppercase text-nx-ink-3">{isAr ? "أدوار خطوط البيع (Pipeline Roles)" : "Decoupled CRM Pipeline Roles (Approval Queues)"}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {filteredRoles.map((role) => (
              <label key={role.key} className="flex items-center justify-between gap-1.5 rounded border border-nx-line bg-nx-ground px-2 py-1 text-xs cursor-pointer" data-testid={`principal-option-${role.key}`}>
                <span className="inline-flex items-center gap-1.5 truncate"><Checkbox checked={selectedPrincipals.includes(role.key)} onCheckedChange={() => updatePrincipals(toggleCsv(selectedPrincipals.join(","), role.key))} /><span className="font-semibold text-nx-ink truncate">{isAr ? role.nameAr : role.nameEn}</span></span>
                <Badge variant="outline" className="text-[9px] font-mono shrink-0">{(role.memberNames?.length ?? 1)} mbr</Badge>
              </label>
            ))}
          </div>
          <div className="text-[10px] font-mono uppercase text-nx-ink-3 pt-1">{isAr ? "المسؤولون النسبيون للسجل (ABAC)" : "Dynamic Record-Relative Principals (ABAC)"}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {filteredPrincipals.map((pr) => (
              <label key={pr.key} className="flex items-center gap-1.5 rounded border border-nx-line bg-nx-ground px-2 py-1 text-xs cursor-pointer" data-testid={`principal-option-${pr.key}`}>
                <Checkbox checked={selectedPrincipals.includes(pr.key)} onCheckedChange={() => updatePrincipals(toggleCsv(selectedPrincipals.join(","), pr.key))} /><span className="text-nx-ink truncate">{isAr ? pr.nameAr : pr.nameEn}</span>
              </label>
            ))}
          </div>
        </div>
        <CrmInlineScopedRoleCreator isAr={isAr} onRoleCreated={(created) => updatePrincipals(toggleCsv(selectedPrincipals.join(","), created.key))} />
        {rk === "restrict.roles_permissions" && (
          <div className="max-h-16 overflow-y-auto rounded border border-nx-line bg-nx-surface p-1.5 grid grid-cols-2 gap-1" data-testid="rule-permission-multi-select">
            {CRM_SCOPED_PERMISSION_OPTIONS.map((perm) => (
              <label key={perm.key} className="flex items-center gap-1.5 text-[11px] text-nx-ink cursor-pointer"><Checkbox checked={selectedPerms.includes(perm.key)} onCheckedChange={() => setKeys({ permissions: toggleCsv(selectedPerms.join(","), perm.key) })} /><span className="truncate">{isAr ? perm.labelAr : perm.labelEn}</span></label>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (rk === "restrict.approval_matrix") {
    const t1Roles = parseCsv(configDraft.tier1Roles || "pipe_role:deal_desk");
    const t2Roles = parseCsv(configDraft.tier2Roles || "pipe_role:commercial_director,pipe_role:finance_gatekeeper");
    return (
      <div className="space-y-2" data-testid="rule-approval-matrix-config">
        {[
          { label: "Tier 1 Deal Desk Gate", amtKey: "tier1MinAmount", defAmt: "100000", roles: t1Roles, rKey: "tier1Roles", testId: "matrix-tier1-amount" },
          { label: "Tier 2 Executive Quorum (All)", amtKey: "tier2MinAmount", defAmt: "500000", roles: t2Roles, rKey: "tier2Roles", testId: "matrix-tier2-amount" },
        ].map((tier) => (
          <div key={tier.rKey} className="rounded-md border border-nx-line bg-nx-surface p-2 space-y-1.5">
            <div className="flex items-center justify-between"><Badge variant="outline" className="text-[10px] font-mono">{tier.label}</Badge><Input type="number" value={configDraft[tier.amtKey] || tier.defAmt} onChange={(e) => setKeys({ [tier.amtKey]: e.target.value })} className="h-7 w-28 text-xs font-mono" data-testid={tier.testId} /></div>
            <div className="flex flex-wrap gap-1">{crmRoles.map((r) => <label key={r.key} className="inline-flex items-center gap-1 rounded border border-nx-line px-1.5 py-0.5 text-[11px] cursor-pointer"><Checkbox checked={tier.roles.includes(r.key)} onCheckedChange={() => setKeys({ [tier.rKey]: toggleCsv(tier.roles.join(","), r.key) })} /><span>{isAr ? r.nameAr : r.nameEn}</span></label>)}</div>
          </div>
        ))}
        <CrmInlineScopedRoleCreator isAr={isAr} onRoleCreated={(created) => setKeys({ tier2Roles: toggleCsv(t2Roles.join(","), created.key) })} />
      </div>
    );
  }

  if (rk === "restrict.prior_status" || rk === "validate.buying_committee_role") {
    const isPrior = rk === "restrict.prior_status";
    const selected = parseCsv(isPrior ? (configDraft.priorStageKeys || configDraft.requiredStageKey || stages[0]?.stageKey) : (configDraft.committeeRoles || configDraft.requiredRole || "DecisionMaker"));
    return (
      <div className="space-y-2" data-testid={isPrior ? "rule-prior-stage-multi-select" : "rule-buying-committee-multi-select"}>
        <Label className="text-xs font-bold text-nx-ink inline-flex items-center gap-1.5">
          {!isPrior && <Users className="w-3.5 h-3.5 text-primary" />}
          {isPrior ? (isAr ? "المراحل السابقة المطلوب المرور بها" : "Required Prior Workflow Stages") : (isAr ? "أدوار لجنة الشراء المطلوبة" : "Required Buying Committee Stakeholder Roles")}
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {isPrior ? stages.map((st) => (
            <label key={st.stageKey} className="flex items-center gap-2 rounded border border-nx-line bg-nx-surface px-2 py-1 text-xs cursor-pointer">
              <Checkbox checked={selected.includes(st.stageKey)} onCheckedChange={() => { const next = toggleCsv(selected.join(","), st.stageKey); setKeys({ priorStageKeys: next, requiredStageKey: next }); }} />
              <span className={`w-2 h-2 rounded-full ${STAGE_COLOR_PALETTE[resolveDefaultStageColor(st.stageKey, st.category, st.order, st.color)]?.dotClass || "bg-blue-500"}`} />
              <span className="font-semibold text-nx-ink">{isAr ? st.labelAr : st.labelEn}</span>
            </label>
          )) : buyingCommitteeRoles.map((role) => (
            <label key={role.key} className="flex items-center gap-2 rounded border border-nx-line bg-nx-surface px-2 py-1 text-xs cursor-pointer">
              <Checkbox checked={selected.includes(role.key)} onCheckedChange={() => { const next = toggleCsv(selected.join(","), role.key); setKeys({ committeeRoles: next, requiredRole: next }); }} />
              <span className="font-semibold text-nx-ink">{isAr ? role.labelAr : role.labelEn}</span>
            </label>
          ))}
        </div>
        {!isPrior && (
          <div className="flex items-center gap-2 pt-1">
            <Input value={newStakeholderRoleEn} onChange={(e) => setNewStakeholderRoleEn(e.target.value)} placeholder="New stakeholder role..." className="h-7 text-xs" data-testid="inline-committee-role-input" />
            <Button type="button" size="sm" variant="outline" className="h-7 text-xs shrink-0" disabled={!newStakeholderRoleEn.trim()} onClick={() => { const c = addBuyingCommitteeRole({ labelEn: newStakeholderRoleEn.trim() }); const next = toggleCsv(selected.join(","), c.key); setKeys({ committeeRoles: next, requiredRole: next }); setNewStakeholderRoleEn(""); }} data-testid="inline-create-committee-role-btn"><Plus className="w-3 h-3 me-1" />Add Role</Button>
          </div>
        )}
      </div>
    );
  }

  if (rk === "restrict.field_value" || rk === "input.prompt_fields" || rk === "action.update_field") {
    const selectedPromptFields = parseCsv(configDraft.fieldKeys || configDraft.fields || "estimatedAmount,targetCloseDate");
    const logicJoin = configDraft.conditionJoin || "AND";
    return (
      <div className="space-y-2" data-testid="rule-field-selector">
        {rk === "input.prompt_fields" ? (
          <div className="max-h-32 overflow-y-auto rounded border border-nx-line bg-nx-surface p-2 grid grid-cols-2 gap-1">
            {allFields.map((f) => (
              <label key={f.key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <Checkbox checked={selectedPromptFields.includes(f.key)} onCheckedChange={() => { const next = toggleCsv(selectedPromptFields.join(","), f.key); setKeys({ fieldKeys: next, fields: next }); }} />
                <span className="text-nx-ink truncate">{isAr ? f.labelAr : f.labelEn}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {rk === "restrict.field_value" && <div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-nx-ink-2">Multi-Condition Logic</span><Button type="button" size="sm" variant="outline" className="h-6 px-2 text-[10px] font-mono" onClick={() => setKeys({ conditionJoin: logicJoin === "AND" ? "OR" : "AND" })} data-testid="rule-condition-logic-toggle">Match {logicJoin}</Button></div>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={configDraft.fieldKey || "estimatedAmount"} onValueChange={(v) => setKeys({ fieldKey: v })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent className="z-[10006]">{allFields.map((f) => <SelectItem key={f.key} value={f.key} className="text-xs">{isAr ? f.labelAr : f.labelEn}</SelectItem>)}</SelectContent></Select>
              {rk === "restrict.field_value" && <Select value={configDraft.operator || "greater_or_equal"} onValueChange={(v) => setKeys({ operator: v })}><SelectTrigger className="h-8 text-xs" data-testid="rule-operator-select"><SelectValue /></SelectTrigger><SelectContent className="z-[10006]">{CRM_RULE_OPERATORS.map((op) => <SelectItem key={op.key} value={op.key} className="text-xs">{isAr ? op.labelAr : op.labelEn}</SelectItem>)}</SelectContent></Select>}
              {configDraft.operator !== "not_empty" && <Input value={configDraft.expectedValue ?? configDraft.value ?? configDraft.newValue ?? "100000"} onChange={(e) => setKeys({ expectedValue: e.target.value, value: e.target.value, newValue: e.target.value })} className="h-8 text-xs font-mono" data-testid="rule-field-expected-input" />}
            </div>
          </div>
        )}
        {onAddCrmCustomField && (
          <div className="flex items-center gap-2 pt-1">
            {showCfCreator ? (
              <><Input value={newCfLabel} onChange={(e) => setNewCfLabel(e.target.value)} placeholder="New Custom Field Label..." className="h-7 text-xs" /><Button type="button" size="sm" className="h-7 text-xs" onClick={() => { if (!newCfLabel.trim()) return; const key = newCfLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"); onAddCrmCustomField({ id: `cf-${Date.now()}`, entityTypeKey: activeEntity === "lead" ? "crm.lead" : "crm.opportunity", key, labelEn: newCfLabel.trim(), labelAr: newCfLabel.trim(), valueType: "Text", isRequired: false, createdAtIso: new Date().toISOString() }); setNewCfLabel(""); setShowCfCreator(false); }}>Create Field</Button></>
            ) : <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowCfCreator(true)}><Plus className="w-3 h-3 me-1" />Create Custom Field Inline</Button>}
          </div>
        )}
      </div>
    );
  }

  const keys = Object.keys(configDraft);
  if (keys.length === 0) return <p className="text-xs text-nx-ink-2" data-testid="rule-no-config-msg">{isAr ? "لا تتطلب هذه القاعدة أي إعدادات إضافية." : "This rule requires no configuration."}</p>;
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{keys.map((k) => <div key={k} className="space-y-1"><Label className="text-[11px] text-nx-ink-2">{k}</Label><Input value={configDraft[k] ?? ""} onChange={(e) => setKeys({ [k]: e.target.value })} className="h-8 text-xs font-mono" data-testid={`rule-config-input-${k}`} /></div>)}</div>;
}
