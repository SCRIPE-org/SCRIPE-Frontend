"use client";

import React, { useMemo, useState, useCallback, lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { DatePicker } from "@core/ui/date-picker";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@core/ui/form";
import { useI18n } from "@core/providers/i18n-provider";
import {
  User,
  Building2,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { cn } from "@core/common/utils";
import {
  resolveVariableLabel,
  type VariableCategory,
  type VariableDefinition,
} from "./VariablePicker";

// Lazy load RichTextEditor to avoid circular dependency / heavy bundle
const RichTextEditor = lazy(() => import("./RichTextEditor"));

// ─── Types ──────────────────────────────────────────────────
export interface VariableValuesMap {
  [key: string]: string;
}

export type TypeOverridesMap = Record<string, string>;

export interface VariableValuesPanelProps {
  variables: VariableDefinition[];
  values: VariableValuesMap;
  onChange: (values: VariableValuesMap) => void;
  /** When set, only show variables actually used in the template body */
  templateBody?: string;
  /** Context values from the current session (e.g., recipient data) for auto-fill */
  contextValues?: VariableValuesMap;
  /** Controlled type overrides from parent — synced between panels */
  typeOverrides?: TypeOverridesMap;
  /** Called when type overrides change (controlled mode) */
  onTypeOverridesChange?: (overrides: TypeOverridesMap) => void;
  className?: string;
}

// ─── Category Config ────────────────────────────────────────
// Tone comes from the measured semantic tokens, NOT the nx status aliases. The
// nx aliases hold a COMPLETE colour value, so Tailwind's slash-alpha is
// silently dropped on them: `bg-nx-info/10` painted the category header a solid
// saturated block instead of a 10% wash, and the label on top of it lost every
// bit of its contrast budget. The semantic tokens are HSL triplets, so the tint
// resolves. Accent has a dedicated wash token and uses that.
const CATEGORY_CONFIG: Record<
  VariableCategory,
  { labelKey: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
  recipient: {
    labelKey: "editorBlocks.variables.category.recipient",
    icon: <User className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  company: {
    labelKey: "editorBlocks.variables.category.company",
    icon: <Building2 className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  system: {
    labelKey: "editorBlocks.variables.category.system",
    icon: <Settings className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-nx-accent",
    bgColor: "bg-nx-accent-wash",
  },
  template: {
    labelKey: "editorBlocks.variables.category.template",
    icon: <FileText className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
};

const CATEGORY_ORDER: VariableCategory[] = ["recipient", "company", "system", "template"];

// ─── Heuristic: infer fieldType from variable key name ──────
function inferFieldType(key: string): VariableDefinition["fieldType"] {
  const k = key.toLowerCase();
  if (k.includes("email") || k.includes("mail")) return "email";
  if (k.includes("datetime") || k.includes("date_time")) return "datetime";
  if (k.includes("date")) return "date";
  if (k.includes("url") || k.includes("link") || k.includes("website")) return "url";
  return "text";
}

// ─── Type-Specific Input Renderer ───────────────────────────
interface VariableInputProps {
  variable: VariableDefinition;
  value: string;
  onChange: (val: string) => void;
  effectiveType?: string;
  /** Injected by FormControl — the id the label points at. */
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

// forwardRef + an explicit id/aria passthrough so FormControl's Slot can reach
// the real control. Without it the generated id landed on nothing and every
// field in this panel stayed anonymous to assistive tech.
const VariableInput = React.forwardRef<HTMLElement, VariableInputProps>(function VariableInput(
  { variable, value, onChange, effectiveType, ...fieldProps },
  ref
) {
  const { t } = useI18n();
  const type = effectiveType || variable.fieldType || "text";
  const placeholderFor = (fallbackKey: string) =>
    variable.sample || variable.defaultValue || t(fallbackKey);

  switch (type) {
    case "textarea":
      return (
        <Textarea
          {...fieldProps}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.sample || variable.defaultValue || ""}
          rows={3}
          className="resize-none text-sm"
        />
      );

    case "richtext":
      return (
        <Suspense
          fallback={
            <Textarea
              rows={4}
              disabled
              placeholder={t("editorBlocks.values.placeholder.loadingEditor")}
              className="resize-none text-sm"
            />
          }
        >
          <RichTextEditor
            value={value}
            onChange={onChange}
            placeholder={placeholderFor("editorBlocks.values.placeholder.richText")}
            minHeight="120px"
            showSourceToggle={false}
          />
        </Suspense>
      );

    case "number":
      return (
        <Input
          {...fieldProps}
          ref={ref as React.Ref<HTMLInputElement>}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderFor("editorBlocks.values.placeholder.number")}
          className="h-8 text-sm"
        />
      );

    case "date":
      return (
        <DatePicker
          id={fieldProps.id}
          type="date"
          value={value}
          onChange={onChange}
          placeholder={placeholderFor("editorBlocks.values.placeholder.date")}
        />
      );

    case "datetime":
      return (
        <DatePicker
          id={fieldProps.id}
          type="datetime-local"
          value={value}
          onChange={onChange}
          placeholder={placeholderFor("editorBlocks.values.placeholder.datetime")}
        />
      );

    case "email":
      return (
        <Input
          {...fieldProps}
          ref={ref as React.Ref<HTMLInputElement>}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderFor("editorBlocks.values.placeholder.email")}
          className="h-8 text-sm"
        />
      );

    case "url":
      return (
        <Input
          {...fieldProps}
          ref={ref as React.Ref<HTMLInputElement>}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholderFor("editorBlocks.values.placeholder.url")}
          className="h-8 text-sm"
        />
      );

    case "color":
      // COLOUR EXCEPTION — the fallback below is literal by necessity: a native
      // <input type="color"> requires a real hex string as its value (a CSS
      // custom property is not a valid colour-input value, and an invalid one
      // silently resolves to black), and the variable itself holds arbitrary
      // CONTENT data — a template field value — not this app's chrome.
      return (
        <div className="flex items-center gap-2">
          <Input
            {...fieldProps}
            ref={ref as React.Ref<HTMLInputElement>}
            type="color"
            value={value || variable.defaultValue || "#3b82f6"}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-12 cursor-pointer p-0.5"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={t("editorBlocks.color.custom")}
            placeholder={variable.defaultValue || "#3b82f6"}
            className="h-8 flex-1 font-mono text-sm"
          />
        </div>
      );

    case "select":
      if (variable.options && variable.options.length > 0) {
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger {...fieldProps} className="h-8 text-sm">
              <SelectValue
                placeholder={variable.sample || t("editorBlocks.values.placeholder.select")}
              />
            </SelectTrigger>
            <SelectContent>
              {variable.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      // Fallback to text if no options
      return (
        <Input
          {...fieldProps}
          ref={ref as React.Ref<HTMLInputElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.sample || variable.defaultValue || ""}
          className="h-8 text-sm"
        />
      );

    case "text":
    default:
      return (
        <Input
          {...fieldProps}
          ref={ref as React.Ref<HTMLInputElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.sample || variable.defaultValue || ""}
          className="h-8 text-sm"
        />
      );
  }
});

// ─── Main Component ─────────────────────────────────────────
export function VariableValuesPanel({
  variables,
  values,
  onChange,
  templateBody,
  contextValues,
  typeOverrides: controlledTypeOverrides,
  onTypeOverridesChange,
  className,
}: VariableValuesPanelProps) {
  const { t } = useI18n();

  // react-hook-form is hosted here ONLY as the field-anatomy context: FormItem,
  // FormLabel and FormControl read their generated id and aria-describedby out
  // of it, which is what binds each label to its control and drives the
  // designed invalid skin off aria-invalid. No field is registered, because the
  // values are owned by the caller through the values/onChange contract —
  // registering them would put a second copy of the truth in this component.
  const fieldAnatomy = useForm();

  // If templateBody is provided, filter to only used variables
  // AND auto-detect any variables in the body that aren't in the provided list
  const usedVariables = useMemo(() => {
    if (!templateBody) return variables;

    // First: filter known variables to only those used in the body
    const knownUsed = variables.filter(
      (v) =>
        templateBody.includes(`{{${v.key}}}`) ||
        templateBody.includes(`{{ ${v.key} }}`) ||
        templateBody.includes(`{{${v.key} |`) ||
        templateBody.includes(`{{ ${v.key} |`)
    );

    // Second: extract ALL variable keys from the body
    const allKeysInBody = new Set<string>();
    const regex = /\{\{\s*(\w+)(?:\s*\|[^}]*)?\s*\}\}/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(templateBody)) !== null) {
      allKeysInBody.add(match[1]);
    }

    // Third: create entries for any keys found in body but not in the known list
    const knownKeys = new Set(variables.map((v) => v.key));
    const knownUsedKeys = new Set(knownUsed.map((v) => v.key));
    const autoDetected: VariableDefinition[] = [];
    for (const key of allKeysInBody) {
      if (!knownKeys.has(key) && !knownUsedKeys.has(key)) {
        autoDetected.push({
          key,
          label: key,
          category: "template" as VariableCategory,
          sample: "",
          supportsFallback: true,
          dataSource: "manual" as const,
          fieldType: inferFieldType(key),
        });
      }
    }

    return [...knownUsed, ...autoDetected];
  }, [variables, templateBody]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Partial<Record<VariableCategory, VariableDefinition[]>> = {};
    for (const v of usedVariables) {
      if (!groups[v.category]) groups[v.category] = [];
      groups[v.category]!.push(v);
    }
    return groups;
  }, [usedVariables]);

  // Stats
  const totalVars = usedVariables.length;
  const filledVars = usedVariables.filter((v) => values[v.key]?.trim()).length;
  const allFilled = totalVars === filledVars;

  const updateValue = (key: string, val: string) => {
    onChange({ ...values, [key]: val });
  };

  // ─── Type overrides (Issue 7) ─────────────────────────────
  const FIELD_TYPE_OPTIONS = [
    { value: "text", labelKey: "editorBlocks.values.type.text" },
    { value: "textarea", labelKey: "editorBlocks.values.type.textarea" },
    { value: "richtext", labelKey: "editorBlocks.values.type.richtext" },
    { value: "number", labelKey: "editorBlocks.values.type.number" },
    { value: "date", labelKey: "editorBlocks.values.type.date" },
    { value: "datetime", labelKey: "editorBlocks.values.type.datetime" },
    { value: "email", labelKey: "editorBlocks.values.type.email" },
    { value: "url", labelKey: "editorBlocks.values.type.url" },
    { value: "color", labelKey: "editorBlocks.values.type.color" },
  ];

  const [localTypeOverrides, setLocalTypeOverrides] = useState<Record<string, string>>({});
  const typeOverrides = controlledTypeOverrides ?? localTypeOverrides;

  const getEffectiveType = useCallback(
    (v: VariableDefinition) => typeOverrides[v.key] || v.fieldType || "text",
    [typeOverrides]
  );

  const setTypeOverride = useCallback(
    (key: string, type: string) => {
      const next = { ...typeOverrides, [key]: type };
      if (onTypeOverridesChange) onTypeOverridesChange(next);
      else setLocalTypeOverrides(next);
    },
    [typeOverrides, onTypeOverridesChange]
  );

  const autoPopulate = () => {
    const populated: VariableValuesMap = { ...values };
    for (const v of usedVariables) {
      if (!populated[v.key]?.trim()) {
        populated[v.key] = contextValues?.[v.key]?.trim() || v.defaultValue || v.sample;
      }
    }
    onChange(populated);
  };

  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">{t("editorBlocks.values.title")}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={allFilled ? "default" : "secondary"}
              aria-label={t("editorBlocks.values.progress", {
                filled: filledVars,
                total: totalVars,
              })}
              className={cn(
                "h-5 gap-1 text-[10px] tabular-nums",
                allFilled && "border-success/30 bg-success/10 text-success"
              )}
            >
              {allFilled ? (
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
              )}
              {filledVars}/{totalVars}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-6 gap-1 px-2 text-[10px]"
              aria-label={t("editorBlocks.values.autoFillLabel")}
              onClick={autoPopulate}
            >
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {t("editorBlocks.values.autoFill")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto pt-0">
        {totalVars === 0 ? (
          <EmptyState
            bare
            size="sm"
            icon={FileText}
            title={t("editorBlocks.values.emptyTitle")}
            description={t("editorBlocks.values.emptyDescription")}
          />
        ) : (
          <Form {...fieldAnatomy}>
            <div className="space-y-4 pb-2">
              {CATEGORY_ORDER.map((cat) => {
                const items = grouped[cat];
                if (!items || items.length === 0) return null;
                const config = CATEGORY_CONFIG[cat];

                return (
                  <div key={cat}>
                    {/* Category Header */}
                    <div
                      className={cn(
                        "mb-2 flex items-center gap-1.5 rounded-nx-sm px-2 py-1.5",
                        config.bgColor
                      )}
                    >
                      <span className={config.color}>{config.icon}</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2">
                        {t(config.labelKey)}
                      </span>
                      <Badge
                        variant="secondary"
                        className="ms-auto h-4 px-1 py-0 text-[10px] tabular-nums"
                      >
                        {items.filter((v) => values[v.key]?.trim()).length}/{items.length}
                      </Badge>
                    </div>

                    {/* Variable Inputs — Type-Specific */}
                    <div className="space-y-2 ps-1">
                      {items.map((v) => {
                        const hasValue = !!values[v.key]?.trim();
                        const name = resolveVariableLabel(t, v);
                        return (
                          <FormItem key={v.key} className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <FormLabel className="text-xs font-medium">{name}</FormLabel>
                              <div className="flex items-center gap-1.5">
                                <Select
                                  value={getEffectiveType(v)}
                                  onValueChange={(val) => setTypeOverride(v.key, val)}
                                >
                                  <SelectTrigger
                                    aria-label={t("editorBlocks.values.fieldType", { name })}
                                    className="h-5 w-auto min-w-0 gap-0.5 border-dashed px-1.5 py-0 font-mono text-[9px]"
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  {/* Radix portals this to the body, so it has
                                      to outrank a dialog this panel may be
                                      rendered inside; the select surface itself
                                      sits at z-dropdown for the ordinary case. */}
                                  <SelectContent align="end" className="z-toast">
                                    {FIELD_TYPE_OPTIONS.map((opt) => (
                                      <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                        className="text-xs"
                                      >
                                        {t(opt.labelKey)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {hasValue ? (
                                  <CheckCircle2
                                    className="h-3 w-3 text-success"
                                    role="img"
                                    aria-label={t("editorBlocks.values.hasValue", { name })}
                                  />
                                ) : (
                                  <AlertCircle
                                    className="h-3 w-3 text-warning"
                                    role="img"
                                    aria-label={t("editorBlocks.values.isEmpty", { name })}
                                  />
                                )}
                              </div>
                            </div>
                            <FormControl>
                              <VariableInput
                                variable={v}
                                value={values[v.key] || ""}
                                onChange={(val) => updateValue(v.key, val)}
                                effectiveType={getEffectiveType(v)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

export default VariableValuesPanel;
