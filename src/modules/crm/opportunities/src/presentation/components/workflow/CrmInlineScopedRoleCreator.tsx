"use client";

import React, { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  CRM_PERMISSIONS,
  DEFAULT_CRM_SCOPED_ROLES,
  useCrmSettingsStore,
  type CrmScopedRoleDefinition,
} from "@modules/crm";

export interface CrmInlineScopedRoleCreatorProps {
  isAr: boolean;
  onRoleCreated?: (created: CrmScopedRoleDefinition) => void;
}

/**
 * Inline Decoupled CRM Pipeline/Workflow Role Creator (`crm.workflow_roles.manage`) (<145 lines).
 * Creates a functional CRM Pipeline Approval Queue (`pipe_role:*`) with assigned members,
 * monetary approval threshold, and Out-of-Office / SLA backup delegation role without polluting Identity RBAC.
 */
export function CrmInlineScopedRoleCreator({
  isAr,
  onRoleCreated,
}: CrmInlineScopedRoleCreatorProps) {
  const crmRoles = useCrmSettingsStore((s) => s.crmRoles ?? DEFAULT_CRM_SCOPED_ROLES);
  const addCrmScopedRole = useCrmSettingsStore((s) => s.addCrmScopedRole);
  const [open, setOpen] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [membersCsv, setMembersCsv] = useState("");
  const [maxLimit, setMaxLimit] = useState("350000");
  const [backupRoleKey, setBackupRoleKey] = useState("pipe_role:commercial_director");

  const handleSave = () => {
    if (!nameEn.trim()) return;
    const memberNames = membersCsv.split(",").map((m) => m.trim()).filter(Boolean);
    const created = addCrmScopedRole({
      nameEn: nameEn.trim(),
      nameAr: (nameAr || nameEn).trim(),
      memberNames,
      maxApprovalThresholdAmount: maxLimit ? Number(maxLimit) : null,
      backupRoleKey: backupRoleKey === "none" ? null : backupRoleKey,
      permissions: [
        CRM_PERMISSIONS.OPPORTUNITIES_READ,
        CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
        CRM_PERMISSIONS.OPPORTUNITIES_STAGE_OVERRIDE,
      ],
    });
    setNameEn("");
    setNameAr("");
    setMembersCsv("");
    setOpen(false);
    onRoleCreated?.(created);
  };

  if (!open) {
    return (
      <div className="flex items-center gap-2" data-testid="inline-create-crm-role-btn">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
          className="h-7 text-[11px] gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
          data-testid="inline-create-pipeline-role-btn"
        >
          <Plus className="w-3 h-3" />
          {isAr ? "إنشاء دور اعتماد في خط البيع (Pipeline Role)" : "Create Pipeline Role Inline (Approval Queue)"}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="rounded-md border border-primary/40 bg-nx-surface p-3 space-y-2.5"
      data-testid="inline-create-crm-role-form"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-nx-ink">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>{isAr ? "إنشاء دور خط بيع ومصفوفة اعتماد مستقل" : "New Decoupled CRM Pipeline Role (Approval Queue)"}</span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">crm.workflow_roles.manage</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "اسم دور خط البيع (EN)" : "Pipeline Role Name (EN)"}</Label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="e.g. Regional Sponsorship Desk" className="h-7 text-xs" data-testid="inline-crm-role-name-en" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "اسم دور خط البيع (AR)" : "Pipeline Role Name (AR)"}</Label>
          <Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مثال: مكتب الرعايات الإقليمي" className="h-7 text-xs" data-testid="inline-crm-role-name-ar" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "الأعضاء المعينون" : "Queue Members (CSV)"}</Label>
          <Input value={membersCsv} onChange={(e) => setMembersCsv(e.target.value)} className="h-7 text-xs" data-testid="inline-pipeline-role-members" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "حد الصلاحية المالية" : "Max Authority Limit"}</Label>
          <Input type="number" value={maxLimit} onChange={(e) => setMaxLimit(e.target.value)} className="h-7 text-xs font-mono" data-testid="inline-pipeline-role-limit" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-nx-ink-2">{isAr ? "الدور البديل للتفويض" : "Backup / Escalation Role"}</Label>
          <Select value={backupRoleKey} onValueChange={setBackupRoleKey}>
            <SelectTrigger className="h-7 text-xs" data-testid="inline-pipeline-role-backup"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[10006]">
              <SelectItem value="none" className="text-xs">None</SelectItem>
              {crmRoles.map((r) => <SelectItem key={r.key} value={r.key} className="text-xs">{isAr ? r.nameAr : r.nameEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(false)}>{isAr ? "إلغاء" : "Cancel"}</Button>
        <Button type="button" size="sm" disabled={!nameEn.trim()} onClick={handleSave} className="h-7 text-xs" data-testid="inline-crm-role-save-btn">
          {isAr ? "حفظ وربط دور خط البيع" : "Create & Bind Pipeline Role"}
        </Button>
      </div>
    </div>
  );
}
