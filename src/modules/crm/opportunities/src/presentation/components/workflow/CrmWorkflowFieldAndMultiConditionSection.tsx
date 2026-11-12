"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Input } from "@core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { CRM_RULE_OPERATORS, type CrmCustomFieldDefinition } from "@modules/crm";

export interface WorkflowConditionRow {
  fieldKey: string;
  operator: string;
  value: string;
}

export interface CrmWorkflowFieldAndMultiConditionSectionProps {
  isAr: boolean;
  activeEntity: "deal" | "lead";
  ruleTypeKey: string;
  configDraft: Record<string, string>;
  onChangeConfig: (next: Record<string, string>) => void;
  allFields: Array<{ key: string; labelEn: string; labelAr: string }>;
  onAddCrmCustomField?: (field: CrmCustomFieldDefinition) => void;
}

const parseCsv = (val?: string) => (val ? val.split(",").map((s) => s.trim()).filter(Boolean) : []);
const toggleCsv = (val: string | undefined, item: string) => {
  const list = parseCsv(val);
  return (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]).join(",");
};

function parseConditionRows(configDraft: Record<string, string>): WorkflowConditionRow[] {
  if (configDraft.conditionsJson) {
    try {
      const parsed = JSON.parse(configDraft.conditionsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((r) => ({
          fieldKey: String(r.fieldKey || "estimatedAmount"),
          operator: String(r.operator || "greater_or_equal"),
          value: String(r.value ?? r.expectedValue ?? "100000"),
        }));
      }
    } catch { /* fallback */ }
  }
  return [{
    fieldKey: configDraft.fieldKey || "estimatedAmount",
    operator: configDraft.operator || "greater_or_equal",
    value: configDraft.expectedValue ?? configDraft.value ?? configDraft.newValue ?? "100000",
  }];
}

export function CrmWorkflowFieldAndMultiConditionSection({
  isAr, activeEntity, ruleTypeKey: rk, configDraft, onChangeConfig, allFields, onAddCrmCustomField,
}: CrmWorkflowFieldAndMultiConditionSectionProps) {
  const { t } = useI18n();
  const [newCfLabel, setNewCfLabel] = useState("");
  const [showCfCreator, setShowCfCreator] = useState(false);
  const setKeys = (patch: Record<string, string>) => onChangeConfig({ ...configDraft, ...patch });
  const selectedPromptFields = parseCsv(configDraft.fieldKeys || configDraft.fields || "estimatedAmount,targetCloseDate");
  const logicJoin = configDraft.conditionJoin || "AND";
  const rows = parseConditionRows(configDraft);
  const isConditionRule = rk === "restrict.field_value" || rk === "validate.multi_condition";

  const syncRows = (nextRows: WorkflowConditionRow[]) => {
    const first = nextRows[0] || { fieldKey: "estimatedAmount", operator: "greater_or_equal", value: "100000" };
    setKeys({
      fieldKey: first.fieldKey,
      operator: first.operator,
      expectedValue: first.value,
      value: first.value,
      newValue: first.value,
      conditionsJson: JSON.stringify(nextRows),
    });
  };

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
          {isConditionRule && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-nx-ink-2">
                {t("crmOpportunities.ruleConfig.multiConditionLogicLabel")} ({rows.length})
              </span>
              <div className="flex items-center gap-1.5">
                <Button type="button" size="sm" variant="outline" className="h-6 px-2 text-[10px] font-mono" onClick={() => setKeys({ conditionJoin: logicJoin === "AND" ? "OR" : "AND" })} data-testid="rule-condition-logic-toggle">
                  Match {logicJoin}
                </Button>
                <Button
                  type="button" size="sm" variant="outline" className="h-6 px-2 text-[10px]"
                  onClick={() => syncRows([...rows, { fieldKey: allFields[1]?.key || "discountPercent", operator: "less_or_equal", value: "15" }])}
                  data-testid="add-condition-row-btn"
                >
                  <Plus className="w-3 h-3 me-1" />{t("crmOpportunities.ruleConfig.addConditionRowBtn")}
                </Button>
              </div>
            </div>
          )}

          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center" data-testid={`condition-row-${idx}`}>
              <div className="sm:col-span-5">
                <Select value={row.fieldKey} onValueChange={(v) => syncRows(rows.map((r, i) => (i === idx ? { ...r, fieldKey: v } : r)))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent className="z-[10006]">{allFields.map((f) => <SelectItem key={f.key} value={f.key} className="text-xs">{isAr ? f.labelAr : f.labelEn}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isConditionRule && (
                <div className="sm:col-span-4">
                  <Select value={row.operator} onValueChange={(v) => syncRows(rows.map((r, i) => (i === idx ? { ...r, operator: v } : r)))}>
                    <SelectTrigger className="h-8 text-xs" data-testid={idx === 0 ? "rule-operator-select" : `rule-operator-select-${idx}`}><SelectValue /></SelectTrigger>
                    <SelectContent className="z-[10006]">{CRM_RULE_OPERATORS.map((op) => <SelectItem key={op.key} value={op.key} className="text-xs">{isAr ? op.labelAr : op.labelEn}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {row.operator !== "not_empty" && (
                <div className={isConditionRule ? (rows.length > 1 ? "sm:col-span-2" : "sm:col-span-3") : "sm:col-span-7"}>
                  <Input
                    value={row.value}
                    onChange={(e) => syncRows(rows.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r)))}
                    className="h-8 text-xs font-mono"
                    data-testid={idx === 0 ? "rule-field-expected-input" : `rule-field-expected-input-${idx}`}
                  />
                </div>
              )}
              {rows.length > 1 && (
                <div className="sm:col-span-1 flex justify-end">
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => syncRows(rows.filter((_, i) => i !== idx))} data-testid={`remove-condition-row-${idx}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {onAddCrmCustomField && (
        <div className="flex items-center gap-2 pt-1">
          {showCfCreator ? (
            <>
              <Input value={newCfLabel} onChange={(e) => setNewCfLabel(e.target.value)} placeholder={t("crmOpportunities.ruleConfig.newCustomFieldPlaceholder")} className="h-7 text-xs" />
              <Button type="button" size="sm" className="h-7 text-xs" onClick={() => { if (!newCfLabel.trim()) return; const key = newCfLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"); onAddCrmCustomField({ id: `cf-${Date.now()}`, entityTypeKey: activeEntity === "lead" ? "crm.lead" : "crm.opportunity", key, labelEn: newCfLabel.trim(), labelAr: newCfLabel.trim(), valueType: "Text", isRequired: false, createdAtIso: new Date().toISOString() }); setNewCfLabel(""); setShowCfCreator(false); }}>{t("crmOpportunities.ruleConfig.createField")}</Button>
            </>
          ) : (
            <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowCfCreator(true)}><Plus className="w-3 h-3 me-1" />{t("crmOpportunities.ruleConfig.createCustomFieldInline")}</Button>
          )}
        </div>
      )}
    </div>
  );
}
