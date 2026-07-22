// FILE-EXCEPTION: file length
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import {
  Braces,
  Plus,
  Trash2,
  GripVertical,
  Copy,
  AlertTriangle,
  Sparkles,
  Type,
  Hash,
  Calendar,
  Mail,
  Link2,
  ListChecks,
  AlignLeft,
  Paintbrush,
  Clock,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

// ─── Types ──────────────────────────────────────────────────
/**
 * Exported type defining parameters and fields for placeholder type configurations.
 */
export type PlaceholderType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "date"
  | "datetime"
  | "email"
  | "url"
  | "select"
  | "color";

/**
 * Interface defining property specifications, keys types, and structural contract rules for placeholder field.
 */
export interface PlaceholderField {
  id: string;
  key: string;
  label: string;
  type: PlaceholderType;
  required: boolean;
  defaultValue: string;
  description?: string;
  options?: string[]; // For "select" type
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for placeholder schema builder props.
 */
export interface PlaceholderSchemaBuilderProps {
  fields: PlaceholderField[];
  onChange: (fields: PlaceholderField[]) => void;
  /** Pass the combined template body + subject so we can auto-detect variables */
  templateBody?: string;
}

// ─── Helpers ────────────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

// Type metadata with icons
const TYPE_CONFIG: Record<PlaceholderType, { label: string; icon: React.ElementType }> = {
  text: { label: "Text", icon: Type },
  textarea: { label: "Textarea", icon: AlignLeft },
  richtext: { label: "Rich Text", icon: AlignLeft },
  number: { label: "Number", icon: Hash },
  date: { label: "Date", icon: Calendar },
  datetime: { label: "Date & Time", icon: Clock },
  email: { label: "Email", icon: Mail },
  url: { label: "URL", icon: Link2 },
  select: { label: "Select", icon: ListChecks },
  color: { label: "Color", icon: Paintbrush },
};

/** Extract all {{ varName }} keys from a template body string */
function extractVariableKeys(text: string): Set<string> {
  const keys = new Set<string>();
  if (!text) return keys;
  const regex = /\{\{\s*(\w+)(?:\s*\|[^}]*)?\s*\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

// ─── Main Component ─────────────────────────────────────────
/**
 * Presentation UI component rendering the placeholder schema builder.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PlaceholderSchemaBuilder({
  fields,
  onChange,
  templateBody,
}: PlaceholderSchemaBuilderProps) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Detect variables used in the template body
  const bodyVarKeys = useMemo(() => extractVariableKeys(templateBody || ""), [templateBody]);
  const fieldKeys = useMemo(() => new Set(fields.map((f) => f.key)), [fields]);

  // Variables in body but NOT in schema → need to be added
  const missingKeys = useMemo(() => {
    const missing: string[] = [];
    for (const key of bodyVarKeys) {
      if (!fieldKeys.has(key)) missing.push(key);
    }
    return missing;
  }, [bodyVarKeys, fieldKeys]);

  // Variables in schema but NOT in body → orphaned
  const orphanedKeys = useMemo(() => {
    if (!templateBody) return new Set<string>(); // If no body provided, don't flag
    const orphaned = new Set<string>();
    for (const f of fields) {
      if (f.key && !bodyVarKeys.has(f.key)) orphaned.add(f.key);
    }
    return orphaned;
  }, [fields, bodyVarKeys, templateBody]);

  // Auto-sync: add missing variables to schema when detected
  useEffect(() => {
    if (missingKeys.length === 0) return;
    const newFields = missingKeys.map((key) => ({
      id: generateId(),
      key,
      label: key, // Default label = key name
      type: "text" as PlaceholderType,
      required: false,
      defaultValue: "",
    }));
    onChange([...fields, ...newFields]);
  }, [missingKeys.join(",")]);

  const addField = () => {
    const newField: PlaceholderField = {
      id: generateId(),
      key: "",
      label: "",
      type: "text",
      required: false,
      defaultValue: "",
    };
    onChange([...fields, newField]);
    setExpandedId(newField.id);
  };

  const updateField = (id: string, updates: Partial<PlaceholderField>) => {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(`{{ ${key} }}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Braces className="h-4 w-4" />
            {t("messaging.templates.placeholderSchema") || "Placeholder Schema"}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {fields.length}{" "}
            {t("messaging.templates.fields") || `field${fields.length !== 1 ? "s" : ""}`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed py-6 text-center text-sm text-muted-foreground">
            <Braces className="mx-auto mb-2 h-6 w-6 opacity-40" />
            <p>{t("messaging.templates.noPlaceholders") || "No custom placeholders defined"}</p>
            <p className="mt-1 text-xs">
              {t("messaging.templates.addFieldsHint") ||
                "Add fields to define your template\u0027s schema"}
            </p>
            {bodyVarKeys.size > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-warning">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs">
                  {bodyVarKeys.size}{" "}
                  {t("messaging.templates.varsDetected") || "variable(s) detected in body"}
                </span>
              </div>
            )}
          </div>
        ) : (
          fields.map((field, idx) => {
            const isOrphaned = orphanedKeys.has(field.key);
            const TypeIcon = TYPE_CONFIG[field.type]?.icon || Type;

            return (
              <div
                key={field.id}
                className={cn(
                  "rounded-lg border transition-all",
                  isOrphaned && "border-warning/50 bg-warning/5",
                  expandedId === field.id ? "border-accent bg-accent/20" : "hover:border-primary/30"
                )}
              >
                {/* Summary Row */}
                <Button
                  type="button"
                  variant="ghost"
                  className="flex h-auto w-full items-center justify-start gap-2 p-2.5 font-normal"
                  onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="w-5 text-xs text-muted-foreground">{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {field.label ||
                          field.key ||
                          t("messaging.templates.untitled") ||
                          "Untitled"}
                      </span>
                      {field.key && (
                        <Badge
                          variant="outline"
                          className="shrink-0 px-1 py-0 font-mono text-[10px]"
                        >
                          {`{{${field.key}}}`}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isOrphaned && (
                    <span title="Not used in template body">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                    </span>
                  )}
                  <Badge variant="secondary" className="shrink-0 gap-1 px-1.5 py-0 text-[10px]">
                    <TypeIcon className="h-2.5 w-2.5" />
                    {TYPE_CONFIG[field.type]?.label || field.type}
                  </Badge>
                  {field.required && <span className="text-xs font-bold text-destructive">*</span>}
                </Button>

                {/* Expanded Editor */}
                {expandedId === field.id && (
                  <div className="space-y-3 border-t px-3 pb-3 pt-3">
                    {isOrphaned && (
                      <div className="flex items-center gap-2 rounded bg-warning/10 p-2 text-xs text-warning">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {t("messaging.templates.orphanedVar") ||
                            "This variable is not used in the template body"}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("messaging.templates.varKey") || "Key"}
                        </Label>
                        <div className="flex gap-1">
                          <Input
                            value={field.key}
                            onChange={(e) =>
                              updateField(field.id, {
                                key: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                              })
                            }
                            placeholder="e.g. orderNumber"
                            className="h-7 font-mono text-xs"
                          />
                          {field.key && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 shrink-0 p-0"
                              onClick={() => copyKey(field.key)}
                              title={t("messaging.templates.copyPlaceholder") || "Copy placeholder"}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("messaging.templates.varLabel") || "Label"}
                        </Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="e.g. Order Number"
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("messaging.templates.varType") || "Type"}
                        </Label>
                        <Select
                          value={field.type}
                          onValueChange={(v) =>
                            updateField(field.id, { type: v as PlaceholderType })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TYPE_CONFIG).map(([v, cfg]) => {
                              const Icon = cfg.icon;
                              return (
                                <SelectItem key={v} value={v}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-3 w-3 text-muted-foreground" />
                                    <span>{cfg.label}</span>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("messaging.templates.defaultValue") || "Default Value"}
                        </Label>
                        <Input
                          value={field.defaultValue}
                          onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                          placeholder={
                            t("messaging.templates.optionalDefault") || "Optional default"
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>

                    {field.type === "select" && (
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("messaging.templates.selectOptions") || "Options (comma-separated)"}
                        </Label>
                        <Input
                          value={(field.options || []).join(", ")}
                          onChange={(e) =>
                            updateField(field.id, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Option A, Option B, Option C"
                          className="h-7 text-xs"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label className="text-xs">
                        {t("messaging.templates.varDescription") || "Description"}
                      </Label>
                      <Input
                        value={field.description || ""}
                        onChange={(e) => updateField(field.id, { description: e.target.value })}
                        placeholder={
                          t("messaging.templates.descriptionHint") ||
                          "What this field is used for..."
                        }
                        className="h-7 text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(v) => updateField(field.id, { required: v })}
                        />
                        <Label className="text-xs">
                          {t("messaging.templates.required") || "Required"}
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        {t("common.remove") || "Remove"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Add Button */}
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full gap-1.5 border-dashed text-sm"
          onClick={addField}
        >
          <Plus className="h-3.5 w-3.5" />
          {t("messaging.templates.addPlaceholderField") || "Add Placeholder Field"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default PlaceholderSchemaBuilder;
