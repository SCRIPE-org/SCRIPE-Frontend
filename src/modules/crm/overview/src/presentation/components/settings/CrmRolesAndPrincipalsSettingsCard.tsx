"use client";

import React, { useState } from "react";
import { Plus, ShieldCheck, Trash2, Users, UserCheck } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { Input } from "@core/ui/input";
import {
  CRM_RECORD_RELATIVE_PRINCIPALS,
  DEFAULT_CRM_SCOPED_ROLES,
  DEFAULT_BUYING_COMMITTEE_ROLES,
} from "../../../domain/constants/crmWorkflowGovernanceCatalog";
import { CRM_PERMISSIONS } from "../../../domain/constants/permission-constants";
import type { CrmModuleSettingsState } from "../../viewmodels/useCrmSettingsStore";

export interface CrmRolesAndPrincipalsSettingsCardProps {
  settings: CrmModuleSettingsState;
  onNotifySaved?: (msg: string) => void;
}

export function CrmRolesAndPrincipalsSettingsCard({
  settings,
  onNotifySaved,
}: CrmRolesAndPrincipalsSettingsCardProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const canManageRoles =
    usePermission(CRM_PERMISSIONS.WORKFLOW_ROLES_MANAGE) ||
    usePermission(CRM_PERMISSIONS.PIPELINES_MANAGE);

  const scopedRoles = settings.crmRoles ?? DEFAULT_CRM_SCOPED_ROLES;
  const committeeRoles = settings.buyingCommitteeRoles ?? DEFAULT_BUYING_COMMITTEE_ROLES;

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [membersInput, setMembersInput] = useState("");
  const [maxLimitInput, setMaxLimitInput] = useState("");
  const [commNameEn, setCommNameEn] = useState("");
  const [commNameAr, setCommNameAr] = useState("");

  const handleAddPipelineRole = () => {
    const cleanEn = nameEn.trim();
    if (!cleanEn) return;
    const members = membersInput.split(",").map((m) => m.trim()).filter(Boolean);
    const maxLimit =
      maxLimitInput.trim() === ""
        ? 250000
        : Number(maxLimitInput) > 0
          ? Number(maxLimitInput)
          : null;
    settings.addCrmScopedRole({
      nameEn: cleanEn,
      nameAr: nameAr.trim() || cleanEn,
      descriptionEn: t("crm.settings.rolesCard.defaultCustomRoleDescEn"),
      descriptionAr: t("crm.settings.rolesCard.defaultCustomRoleDescAr"),
      permissions: ["crm.opportunities.read", "crm.opportunities.stage"],
      memberNames: members,
      maxApprovalThresholdAmount: maxLimit,
      backupRoleKey: "pipe_role:commercial_director",
    });
    setNameEn("");
    setNameAr("");
    setMembersInput("");
    setMaxLimitInput("");
    onNotifySaved?.(`${t("crm.settings.rolesCard.createdRoleToast")} ${cleanEn}`);
  };

  const handleAddCommitteeRole = () => {
    const cleanEn = commNameEn.trim();
    if (!cleanEn) return;
    const key = cleanEn.replace(/[^a-zA-Z0-9]/g, "") || `CustomRole${Date.now()}`;
    settings.addBuyingCommitteeRole({
      key,
      labelEn: cleanEn,
      labelAr: commNameAr.trim() || cleanEn,
    });
    setCommNameEn("");
    setCommNameAr("");
    onNotifySaved?.(`${t("crm.settings.rolesCard.createdCommitteeToast")} ${cleanEn}`);
  };

  return (
    <Card className="p-3.5 border-nx-line bg-nx-surface space-y-2.5" data-testid="crm-settings-roles-principals-card">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-nx-line pb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="size-4 text-nx-accent" />
            <h2 className="text-sm font-bold text-nx-ink">{t("crm.settings.rolesCard.title")}</h2>
            <Badge variant="outline" className="text-[10px] font-mono border-nx-accent/40 text-nx-accent">
              {t("crm.settings.rolesCard.badge")}
            </Badge>
          </div>
          <p className="text-xs text-nx-ink-3">{t("crm.settings.rolesCard.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Column 1: Decoupled CRM Pipeline Roles */}
        <div className="lg:col-span-7 rounded-lg border border-nx-line bg-nx-ground/40 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-nx-ink">
              {t("crm.settings.rolesCard.section1Title")}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {scopedRoles.length} {t("crm.settings.rolesCard.queuesSuffix")}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[210px] overflow-y-auto pr-1">
            {scopedRoles.map((role) => (
              <div
                key={role.key}
                className="rounded-md border border-nx-line bg-nx-surface px-2 py-1.5 flex items-start justify-between gap-1.5"
                data-testid={`crm-settings-pipeline-role-${role.key}`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] font-bold text-nx-ink truncate">{isRtl ? role.nameAr : role.nameEn}</span>
                    <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">{role.key}</Badge>
                  </div>
                  <p className="text-[10px] text-nx-ink-3 truncate">
                    {t("crm.settings.rolesCard.membersLabel")}{" "}
                    {(role.memberNames && role.memberNames.length > 0 ? role.memberNames : [t("crm.settings.rolesCard.assignedQueueDefault")]).join(", ")}
                  </p>
                  <div className="flex items-center gap-1 flex-wrap text-[9px] font-mono text-nx-ink-2">
                    <span>
                      {role.maxApprovalThresholdAmount
                        ? `Max: $${role.maxApprovalThresholdAmount.toLocaleString()}`
                        : t("crm.settings.rolesCard.unlimitedAuthority")}
                    </span>
                    {role.backupRoleKey && <span className="truncate">• {t("crm.settings.rolesCard.fallbackPrefix")} {role.backupRoleKey}</span>}
                  </div>
                </div>
                {!role.isSystem && canManageRoles && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5 text-destructive shrink-0"
                    onClick={() => settings.removeCrmScopedRole(role.key)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {canManageRoles && (
            <div className="space-y-1.5 pt-1.5 border-t border-nx-line/60" data-testid="crm-settings-role-creation-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder={t("crm.settings.rolesCard.queueNameEnPlaceholder")} className="h-7 text-xs" data-testid="crm-settings-role-name-en" />
                <Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder={t("crm.settings.rolesCard.queueNameArPlaceholder")} className="h-7 text-xs" data-testid="crm-settings-role-name-ar" />
                <Input value={membersInput} onChange={(e) => setMembersInput(e.target.value)} placeholder={t("crm.settings.rolesCard.membersPlaceholder")} className="h-7 text-xs" data-testid="crm-settings-role-members-input" />
                <Input type="number" value={maxLimitInput} onChange={(e) => setMaxLimitInput(e.target.value)} placeholder={t("crm.settings.rolesCard.maxLimitPlaceholder")} className="h-7 text-xs font-mono" data-testid="crm-settings-role-limit-input" />
              </div>
              <div className="flex justify-end">
                <Button type="button" size="sm" className="h-7 px-3 text-xs gap-1.5 w-full sm:w-auto" onClick={handleAddPipelineRole} data-testid="crm-settings-save-role-btn">
                  <Plus className="size-3.5" />
                  <span>{t("crm.settings.rolesCard.addPipelineRoleBtn")}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Column 2: ABAC Record Principals & Buying Committee Roles */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="rounded-lg border border-nx-line bg-nx-ground/40 p-2.5 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-info shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-nx-ink">
                {t("crm.settings.rolesCard.section2Title")}
              </span>
            </div>
            <div className="space-y-1">
              {CRM_RECORD_RELATIVE_PRINCIPALS.map((p) => (
                <div key={p.key} className="rounded border border-nx-line bg-nx-surface px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px] min-w-0">
                  <span className="font-semibold text-nx-ink">{isRtl ? p.nameAr : p.nameEn}</span>
                  <Badge variant="outline" className="font-mono text-[9px] shrink-0 px-1.5 py-0">{p.key.replace("principal:", "")}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-nx-line bg-nx-ground/40 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-nx-accent shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-nx-ink">{t("crm.settings.rolesCard.section3Title")}</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono">{committeeRoles.length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {committeeRoles.map((r) => (
                <Badge key={r.key} variant="outline" className="text-[10px] bg-nx-surface">{isRtl ? r.labelAr : r.labelEn}</Badge>
              ))}
            </div>
            {canManageRoles && (
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <Input value={commNameEn} onChange={(e) => setCommNameEn(e.target.value)} placeholder={t("crm.settings.rolesCard.committeeRoleEnPlaceholder")} className="h-7 text-xs" data-testid="crm-settings-committee-en" />
                <Input dir="rtl" value={commNameAr} onChange={(e) => setCommNameAr(e.target.value)} placeholder={t("crm.settings.rolesCard.committeeRoleArPlaceholder")} className="h-7 text-xs" data-testid="crm-settings-committee-ar" />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={handleAddCommitteeRole} data-testid="crm-settings-inline-create-committee-btn">
                  <Plus className="size-3 me-1" />{t("crm.settings.rolesCard.addCommitteeBtn")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
