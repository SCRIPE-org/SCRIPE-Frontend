"use client";

import React, { useMemo } from "react";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
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
import type { VariableCategory, VariableDefinition } from "./VariablePicker";

// ─── Types ──────────────────────────────────────────────────
export interface VariableValuesMap {
      [key: string]: string;
}

export interface VariableValuesPanelProps {
      variables: VariableDefinition[];
      values: VariableValuesMap;
      onChange: (values: VariableValuesMap) => void;
      /** When set, only show variables actually used in the template body */
      templateBody?: string;
      /** Context values from the current session (e.g., recipient data) for auto-fill */
      contextValues?: VariableValuesMap;
      className?: string;
}

// ─── Category Config ────────────────────────────────────────
const CATEGORY_CONFIG: Record<
      VariableCategory,
      { label: string; icon: React.ReactNode; color: string; bgColor: string }
> = {
      recipient: {
            label: "Recipient",
            icon: <User className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
      },
      company: {
            label: "Company",
            icon: <Building2 className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
      },
      system: {
            label: "System",
            icon: <Settings className="h-3.5 w-3.5" />,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
      },
      template: {
            label: "Template",
            icon: <FileText className="h-3.5 w-3.5" />,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10",
      },
};

const CATEGORY_ORDER: VariableCategory[] = [
      "recipient",
      "company",
      "system",
      "template",
];

// ─── Type-Specific Input Renderer ───────────────────────────
function VariableInput({
      variable,
      value,
      onChange,
}: {
      variable: VariableDefinition;
      value: string;
      onChange: (val: string) => void;
}) {
      const type = variable.fieldType || "text";

      switch (type) {
            case "textarea":
                  return (
                        <Textarea
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder={variable.sample || variable.defaultValue || ""}
                              rows={3}
                              className="text-sm resize-none"
                        />
                  );

            case "richtext":
                  return (
                        <Textarea
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder={variable.sample || variable.defaultValue || "HTML content..."}
                              rows={4}
                              className="text-sm font-mono resize-none"
                        />
                  );

            case "number":
                  return (
                        <Input
                              type="number"
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder={variable.sample || variable.defaultValue || "0"}
                              className="h-8 text-sm"
                        />
                  );

            case "date":
                  return (
                        <Input
                              type="date"
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              className="h-8 text-sm"
                        />
                  );

            case "datetime":
                  return (
                        <Input
                              type="datetime-local"
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              className="h-8 text-sm"
                        />
                  );

            case "email":
                  return (
                        <Input
                              type="email"
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder={variable.sample || variable.defaultValue || "user@example.com"}
                              className="h-8 text-sm"
                        />
                  );

            case "url":
                  return (
                        <Input
                              type="url"
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder={variable.sample || variable.defaultValue || "https://..."}
                              className="h-8 text-sm"
                        />
                  );

            case "color":
                  return (
                        <div className="flex gap-2 items-center">
                              <Input
                                    type="color"
                                    value={value || variable.defaultValue || "#3b82f6"}
                                    onChange={(e) => onChange(e.target.value)}
                                    className="h-8 w-12 p-0.5 cursor-pointer"
                              />
                              <Input
                                    type="text"
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    placeholder={variable.defaultValue || "#3b82f6"}
                                    className="h-8 text-sm font-mono flex-1"
                              />
                        </div>
                  );

            case "select":
                  if (variable.options && variable.options.length > 0) {
                        return (
                              <Select
                                    value={value || ""}
                                    onValueChange={onChange}
                              >
                                    <SelectTrigger className="h-8 text-sm">
                                          <SelectValue placeholder={variable.sample || "Select..."} />
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
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              placeholder={variable.sample || variable.defaultValue || ""}
                              className="h-8 text-sm"
                        />
                  );
      }
}

// ─── Main Component ─────────────────────────────────────────
export function VariableValuesPanel({
      variables,
      values,
      onChange,
      templateBody,
      contextValues,
      className,
}: VariableValuesPanelProps) {
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
            const autoDetected: VariableDefinition[] = [];
            for (const key of allKeysInBody) {
                  if (!knownKeys.has(key)) {
                        autoDetected.push({
                              key,
                              label: key,
                              category: "template" as VariableCategory,
                              sample: "",
                              supportsFallback: true,
                              dataSource: "manual" as const,
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
      const filledVars = usedVariables.filter(
            (v) => values[v.key]?.trim()
      ).length;
      const allFilled = totalVars === filledVars;

      const updateValue = (key: string, val: string) => {
            onChange({ ...values, [key]: val });
      };

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
            <Card className={cn("overflow-hidden", className)}>
                  <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-semibold">
                                    Variable Values
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                    <Badge
                                          variant={allFilled ? "default" : "secondary"}
                                          className={cn(
                                                "text-[10px] h-5 gap-1",
                                                allFilled && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                          )}
                                    >
                                          {allFilled ? (
                                                <CheckCircle2 className="h-3 w-3" />
                                          ) : (
                                                <AlertCircle className="h-3 w-3" />
                                          )}
                                          {filledVars}/{totalVars}
                                    </Badge>
                                    <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-[10px] px-2 gap-1"
                                          onClick={autoPopulate}
                                    >
                                          <Sparkles className="h-3 w-3" />
                                          Auto-fill
                                    </Button>
                              </div>
                        </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                        {totalVars === 0 ? (
                              <div className="text-center py-8 text-sm text-muted-foreground">
                                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                    <p>No variables detected in the template</p>
                                    <p className="text-xs mt-1">
                                          Insert variables using{" "}
                                          <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono">
                                                {"{{variableName}}"}
                                          </Badge>
                                    </p>
                              </div>
                        ) : (
                              <ScrollArea className="max-h-[600px]">
                                    <div className="space-y-4">
                                          {CATEGORY_ORDER.map((cat) => {
                                                const items = grouped[cat];
                                                if (!items || items.length === 0) return null;
                                                const config = CATEGORY_CONFIG[cat];

                                                return (
                                                      <div key={cat}>
                                                            {/* Category Header */}
                                                            <div className={cn(
                                                                  "flex items-center gap-1.5 px-2 py-1.5 rounded-md mb-2",
                                                                  config.bgColor
                                                            )}>
                                                                  <span className={config.color}>
                                                                        {config.icon}
                                                                  </span>
                                                                  <span className="text-xs font-semibold uppercase tracking-wider">
                                                                        {config.label}
                                                                  </span>
                                                                  <Badge
                                                                        variant="secondary"
                                                                        className="text-[10px] px-1 py-0 h-4 ml-auto"
                                                                  >
                                                                        {items.filter((v) => values[v.key]?.trim()).length}/{items.length}
                                                                  </Badge>
                                                            </div>

                                                            {/* Variable Inputs — Type-Specific */}
                                                            <div className="space-y-2 pl-1">
                                                                  {items.map((v) => {
                                                                        const hasValue = !!values[v.key]?.trim();
                                                                        return (
                                                                              <div key={v.key} className="space-y-1">
                                                                                    <div className="flex items-center justify-between">
                                                                                          <Label className="text-xs font-medium">
                                                                                                {v.label}
                                                                                          </Label>
                                                                                          <div className="flex items-center gap-1.5">
                                                                                                {v.fieldType && v.fieldType !== "text" && (
                                                                                                      <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                                                                                                            {v.fieldType}
                                                                                                      </Badge>
                                                                                                )}
                                                                                                {hasValue ? (
                                                                                                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                                                                ) : (
                                                                                                      <AlertCircle className="h-3 w-3 text-amber-400" />
                                                                                                )}
                                                                                          </div>
                                                                                    </div>
                                                                                    <VariableInput
                                                                                          variable={v}
                                                                                          value={values[v.key] || ""}
                                                                                          onChange={(val) => updateValue(v.key, val)}
                                                                                    />
                                                                              </div>
                                                                        );
                                                                  })}
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </ScrollArea>
                        )}
                  </CardContent>
            </Card>
      );
}

export default VariableValuesPanel;
