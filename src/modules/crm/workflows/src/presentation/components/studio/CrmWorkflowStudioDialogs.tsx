"use client";

import React from "react";
import { Palette } from "lucide-react";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  CRM_STAGE_COLOR_TOKENS, STAGE_COLOR_PALETTE,
  type CrmStageColorToken, type CrmWorkflowEntityType,
} from "@modules/crm";
import { CANONICAL_TERMINAL_LABELS, DEFAULT_CUSTOM_STAGE_HEX_FALLBACK } from "@modules/crm/shared";
import type { CrmWorkflowStageNode } from "./CrmWorkflowCanvas2D";

/** Props for `CrmWorkflowStudioDialogs`. */
export interface CrmWorkflowStudioDialogsProps {
  t: (k: string) => string; isAr: boolean; activeEntity: CrmWorkflowEntityType; activeStages: CrmWorkflowStageNode[];
  addStageModalOpen: boolean; setAddStageModalOpen: (open: boolean) => void;
  newStageNameEn: string; setNewStageNameEn: (val: string) => void; newStageNameAr: string; setNewStageNameAr: (val: string) => void;
  newStageProb: number; setNewStageProb: (val: number) => void; newStageSla: number; setNewStageSla: (val: number) => void;
  newStageColorToken?: CrmStageColorToken; setNewStageColorToken?: (val: CrmStageColorToken) => void;
  newStageCustomHex?: string; setNewStageCustomHex?: (val: string) => void;
  newStageConvertsLead: boolean; setNewStageConvertsLead: (val: boolean) => void;
  newStageAutoConnect: boolean; setNewStageAutoConnect: (val: boolean) => void;
  newStageAllowFromAny?: boolean; setNewStageAllowFromAny?: (val: boolean) => void;
  onAddStageSubmit: () => void;
  addTransitionModalOpen: boolean; setAddTransitionModalOpen: (open: boolean) => void;
  newTransFrom: string; setNewTransFrom: (val: string) => void; newTransTo: string; setNewTransTo: (val: string) => void;
  newTransNameEn: string; setNewTransNameEn: (val: string) => void; newTransNameAr: string; setNewTransNameAr: (val: string) => void;
  onAddTransitionSubmit: () => void;
  createWorkflowModalOpen: boolean; setCreateWorkflowModalOpen: (open: boolean) => void;
  newWfEntityType: CrmWorkflowEntityType; setNewWfEntityType: (val: CrmWorkflowEntityType) => void;
  newWfNameEn: string; setNewWfNameEn: (val: string) => void; newWfNameAr: string; setNewWfNameAr: (val: string) => void;
  newWfDescEn: string; setNewWfDescEn: (val: string) => void; newWfDescAr: string; setNewWfDescAr: (val: string) => void;
  onCreateWorkflowSubmit: () => void;
}

/** Modal dialogs for creating workflows, adding statuses, and adding transitions in the Studio (<195 lines). */
export function CrmWorkflowStudioDialogs(props: CrmWorkflowStudioDialogsProps) {
  const {
    t, isAr, activeEntity, activeStages,
    addStageModalOpen, setAddStageModalOpen, newStageNameEn, setNewStageNameEn, newStageNameAr, setNewStageNameAr,
    newStageProb, setNewStageProb, newStageSla, setNewStageSla,
    newStageColorToken = "blue", setNewStageColorToken, newStageCustomHex = "", setNewStageCustomHex,
    newStageConvertsLead, setNewStageConvertsLead, newStageAutoConnect, setNewStageAutoConnect, newStageAllowFromAny = true, setNewStageAllowFromAny, onAddStageSubmit,
    addTransitionModalOpen, setAddTransitionModalOpen, newTransFrom, setNewTransFrom, newTransTo, setNewTransTo,
    newTransNameEn, setNewTransNameEn, newTransNameAr, setNewTransNameAr, onAddTransitionSubmit,
    createWorkflowModalOpen, setCreateWorkflowModalOpen, newWfEntityType, setNewWfEntityType,
    newWfNameEn, setNewWfNameEn, newWfNameAr, setNewWfNameAr, newWfDescEn, setNewWfDescEn, newWfDescAr, setNewWfDescAr, onCreateWorkflowSubmit,
  } = props;

  const handleToStatusChange = (nextToKey: string) => {
    setNewTransTo(nextToKey);
    const targetStage = activeStages.find((s) => s.stageKey === nextToKey);
    if (targetStage && (!newTransNameEn.trim() || newTransNameEn.startsWith(CANONICAL_TERMINAL_LABELS.moveToPrefixEn))) {
      setNewTransNameEn(`${CANONICAL_TERMINAL_LABELS.moveToPrefixEn} ${targetStage.labelEn}`);
      setNewTransNameAr(`${CANONICAL_TERMINAL_LABELS.moveToPrefixAr} ${targetStage.labelAr}`);
    }
  };

  return (
    <>
      <Dialog open={addStageModalOpen} onOpenChange={setAddStageModalOpen}>
        <DialogContent className="max-w-md" data-testid="add-status-modal">
          <DialogHeader>
            <DialogTitle>{t("crmWorkflows.pipelinesPage.addStatusModalTitle")}</DialogTitle>
            <DialogDescription>{t("crmWorkflows.pipelinesPage.addStatusModalDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.statusNameEnLabel")}</Label><Input value={newStageNameEn} onChange={(e) => setNewStageNameEn(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.statusNameEnPlaceholder")} data-testid="new-status-label-en-input" /></div>
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.statusNameArLabel")}</Label><Input dir="rtl" value={newStageNameAr} onChange={(e) => setNewStageNameAr(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.statusNameArPlaceholder")} data-testid="new-status-label-ar-input" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.defaultProbabilityPctLabel")}</Label><Input type="number" min={0} max={100} value={newStageProb} onChange={(e) => setNewStageProb(Number(e.target.value) || 0)} /></div>
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.slaDaysLabel")}</Label><Input type="number" min={0} value={newStageSla} onChange={(e) => setNewStageSla(Number(e.target.value) || 0)} /></div>
            </div>
            <div className="space-y-1.5 rounded-md border border-nx-line bg-nx-raised/30 p-2" data-testid="new-status-color-picker">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] inline-flex items-center gap-1.5"><Palette className="w-3 h-3 text-nx-ink-2" />{t("crmWorkflows.pipelinesPage.stageColorLabel")}</Label>
                {newStageCustomHex && <Button type="button" size="sm" variant="ghost" className="h-5 px-1.5 text-[10px]" onClick={() => setNewStageCustomHex?.("")}>{t("crmWorkflows.pipelinesPage.resetHexBtn")}</Button>}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CRM_STAGE_COLOR_TOKENS.map((c) => (
                  <Button
                    key={c} type="button" size="icon" variant="outline" data-testid={`new-status-color-swatch-${c}`} title={(isAr ? STAGE_COLOR_PALETTE[c]?.labelAr : STAGE_COLOR_PALETTE[c]?.labelEn) || c}
                    onClick={() => { setNewStageColorToken?.(c); setNewStageCustomHex?.(""); }}
                    className={`h-4 w-4 rounded-full p-0 border ${STAGE_COLOR_PALETTE[c].swatchClass} ${!newStageCustomHex && newStageColorToken === c ? "ring-2 ring-primary ring-offset-1 ring-offset-nx-surface scale-110" : "opacity-75 hover:opacity-100"}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-nx-line">
                <Input type="color" value={/^#[0-9A-Fa-f]{6}$/.test(newStageCustomHex ?? "") ? newStageCustomHex : DEFAULT_CUSTOM_STAGE_HEX_FALLBACK} onChange={(e) => setNewStageCustomHex?.(e.target.value.toUpperCase())} className="h-6 w-8 p-0.5 cursor-pointer bg-nx-surface border-nx-line shrink-0" data-testid="new-status-custom-hex-picker" />
                <Input value={newStageCustomHex ?? ""} placeholder="#RRGGBB" onChange={(e) => setNewStageCustomHex?.(e.target.value)} className="h-6 text-[10px] font-mono" data-testid="new-status-custom-hex-input" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="new-stage-allow-from-any" checked={newStageAllowFromAny} onCheckedChange={(v) => setNewStageAllowFromAny?.(Boolean(v))} data-testid="new-stage-allow-from-any" />
              <Label htmlFor="new-stage-allow-from-any" className="text-xs cursor-pointer font-medium text-nx-ink">{t("crmWorkflows.pipelinesPage.allowTransitionsFromAnyStatusLabel")}</Label>
            </div>
            {activeEntity === "lead" && (
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="new-stage-converts-lead" checked={newStageConvertsLead} onCheckedChange={(v) => setNewStageConvertsLead(Boolean(v))} />
                <Label htmlFor="new-stage-converts-lead" className="text-xs cursor-pointer">{t("crmWorkflows.pipelinesPage.newStageConvertsLeadLabel")}</Label>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="new-stage-auto-connect" checked={newStageAutoConnect} onCheckedChange={(v) => setNewStageAutoConnect(Boolean(v))} />
              <Label htmlFor="new-stage-auto-connect" className="text-xs cursor-pointer">{t("crmWorkflows.pipelinesPage.autoConnectFromPreviousLabel")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStageModalOpen(false)}>{t("crmWorkflows.pipelinesPage.cancelBtn")}</Button>
            <Button onClick={onAddStageSubmit} data-testid="new-status-submit-btn">{t("crmWorkflows.pipelinesPage.addStatusSubmitBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addTransitionModalOpen} onOpenChange={setAddTransitionModalOpen}>
        <DialogContent className="max-w-md" data-testid="add-transition-modal">
          <DialogHeader>
            <DialogTitle>{t("crmWorkflows.pipelinesPage.createTransitionModalTitle")}</DialogTitle>
            <DialogDescription>{t("crmWorkflows.pipelinesPage.createTransitionModalDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("crmWorkflows.pipelinesPage.fromStatusLabel")}</Label>
                <Select value={newTransFrom} onValueChange={setNewTransFrom}>
                  <SelectTrigger className="h-9 text-xs" data-testid="new-transition-from-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="*">{t("crmWorkflows.pipelinesPage.anyStatusGlobalOption")}</SelectItem>
                    {activeStages.map((s) => (<SelectItem key={s.stageKey} value={s.stageKey}>{isAr ? s.labelAr : s.labelEn}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("crmWorkflows.pipelinesPage.toStatusLabel")}</Label>
                <Select value={newTransTo} onValueChange={handleToStatusChange}>
                  <SelectTrigger className="h-9 text-xs" data-testid="new-transition-to-select"><SelectValue /></SelectTrigger>
                  <SelectContent>{activeStages.map((s) => (<SelectItem key={s.stageKey} value={s.stageKey}>{isAr ? s.labelAr : s.labelEn}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.transitionNameEnLabel")}</Label><Input value={newTransNameEn} onChange={(e) => setNewTransNameEn(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.transitionNameEnPlaceholder")} data-testid="new-transition-name-en-input" /></div>
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.transitionNameArLabel")}</Label><Input dir="rtl" value={newTransNameAr} onChange={(e) => setNewTransNameAr(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.transitionNameArPlaceholder")} data-testid="new-transition-name-ar-input" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTransitionModalOpen(false)}>{t("crmWorkflows.pipelinesPage.cancelBtn")}</Button>
            <Button onClick={onAddTransitionSubmit} data-testid="new-transition-submit-btn">{t("crmWorkflows.pipelinesPage.createTransitionSubmitBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createWorkflowModalOpen} onOpenChange={setCreateWorkflowModalOpen}>
        <DialogContent className="max-w-md" data-testid="create-workflow-modal">
          <DialogHeader>
            <DialogTitle>{t("crmWorkflows.pipelinesPage.createWorkflowModalTitle")}</DialogTitle>
            <DialogDescription>{t("crmWorkflows.pipelinesPage.createWorkflowModalDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">{t("crmWorkflows.pipelinesPage.entityTypeLabel")}</Label>
              <Select value={newWfEntityType} onValueChange={(v) => setNewWfEntityType(v as CrmWorkflowEntityType)}>
                <SelectTrigger className="h-9 text-xs" data-testid="create-wf-entity-select"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="deal">{t("crmWorkflows.pipelinesPage.entityOptionDeal")}</SelectItem><SelectItem value="lead">{t("crmWorkflows.pipelinesPage.entityOptionLead")}</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.workflowNameEnLabel")}</Label><Input value={newWfNameEn} onChange={(e) => setNewWfNameEn(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.workflowNameEnPlaceholder")} data-testid="create-wf-name-en-input" /></div>
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.workflowNameArLabel")}</Label><Input dir="rtl" value={newWfNameAr} onChange={(e) => setNewWfNameAr(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.workflowNameArPlaceholder")} data-testid="create-wf-name-ar-input" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.descriptionEnLabel")}</Label><Input value={newWfDescEn} onChange={(e) => setNewWfDescEn(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.descriptionEnPlaceholder")} /></div>
              <div className="space-y-1"><Label className="text-xs">{t("crmWorkflows.pipelinesPage.descriptionArLabel")}</Label><Input dir="rtl" value={newWfDescAr} onChange={(e) => setNewWfDescAr(e.target.value)} placeholder={t("crmWorkflows.pipelinesPage.descriptionArPlaceholder")} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateWorkflowModalOpen(false)}>{t("crmWorkflows.pipelinesPage.cancelBtn")}</Button>
            <Button onClick={onCreateWorkflowSubmit} data-testid="create-wf-submit-btn">{t("crmWorkflows.pipelinesPage.createOpenStudioSubmitBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
