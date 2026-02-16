"use client";

import React, { useState } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import { Switch } from "@core/ui/switch";
import { Braces, Plus, Trash2, GripVertical, Copy } from "lucide-react";
import { cn } from "@core/common/utils";

// ─── Types ──────────────────────────────────────────────────
export type PlaceholderType = "text" | "number" | "date" | "email" | "url" | "select";

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

export interface PlaceholderSchemaBuilderProps {
      fields: PlaceholderField[];
      onChange: (fields: PlaceholderField[]) => void;
}

// ─── Helpers ────────────────────────────────────────────────
function generateId() {
      return Math.random().toString(36).slice(2, 10);
}

const TYPE_LABELS: Record<PlaceholderType, string> = {
      text: "Text",
      number: "Number",
      date: "Date",
      email: "Email",
      url: "URL",
      select: "Select",
};

// ─── Main Component ─────────────────────────────────────────
export function PlaceholderSchemaBuilder({ fields, onChange }: PlaceholderSchemaBuilderProps) {
      const [expandedId, setExpandedId] = useState<string | null>(null);

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
            navigator.clipboard.writeText(`{{${key}}}`);
      };

      return (
            <Card>
                  <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2 text-base">
                                    <Braces className="h-4 w-4" />
                                    Placeholder Schema
                              </CardTitle>
                              <Badge variant="secondary" className="text-xs">
                                    {fields.length} field{fields.length !== 1 ? "s" : ""}
                              </Badge>
                        </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                        {fields.length === 0 ? (
                              <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                    <Braces className="h-6 w-6 mx-auto mb-2 opacity-40" />
                                    <p>No custom placeholders defined</p>
                                    <p className="text-xs mt-1">Add fields to define your template&apos;s schema</p>
                              </div>
                        ) : (
                              fields.map((field, idx) => (
                                    <div
                                          key={field.id}
                                          className={cn(
                                                "border rounded-lg transition-all",
                                                expandedId === field.id ? "bg-accent/20 border-accent" : "hover:border-primary/30"
                                          )}
                                    >
                                          {/* Summary Row */}
                                          <button
                                                type="button"
                                                className="w-full flex items-center gap-2 p-2.5 text-left"
                                                onClick={() => setExpandedId(expandedId === field.id ? null : field.id)}
                                          >
                                                <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                      <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium truncate">
                                                                  {field.label || field.key || "Untitled"}
                                                            </span>
                                                            {field.key && (
                                                                  <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono shrink-0">
                                                                        {`{{${field.key}}}`}
                                                                  </Badge>
                                                            )}
                                                      </div>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                                                      {TYPE_LABELS[field.type]}
                                                </Badge>
                                                {field.required && (
                                                      <span className="text-destructive text-xs font-bold">*</span>
                                                )}
                                          </button>

                                          {/* Expanded Editor */}
                                          {expandedId === field.id && (
                                                <div className="px-3 pb-3 space-y-3 border-t pt-3">
                                                      <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                  <Label className="text-xs">Key</Label>
                                                                  <div className="flex gap-1">
                                                                        <Input
                                                                              value={field.key}
                                                                              onChange={(e) =>
                                                                                    updateField(field.id, {
                                                                                          key: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                                                                                    })
                                                                              }
                                                                              placeholder="e.g. orderNumber"
                                                                              className="h-7 text-xs font-mono"
                                                                        />
                                                                        {field.key && (
                                                                              <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-7 w-7 p-0 shrink-0"
                                                                                    onClick={() => copyKey(field.key)}
                                                                                    title="Copy placeholder"
                                                                              >
                                                                                    <Copy className="h-3 w-3" />
                                                                              </Button>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                  <Label className="text-xs">Label</Label>
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
                                                                  <Label className="text-xs">Type</Label>
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
                                                                              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                                                                                    <SelectItem key={v} value={v}>
                                                                                          {l}
                                                                                    </SelectItem>
                                                                              ))}
                                                                        </SelectContent>
                                                                  </Select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                  <Label className="text-xs">Default Value</Label>
                                                                  <Input
                                                                        value={field.defaultValue}
                                                                        onChange={(e) => updateField(field.id, { defaultValue: e.target.value })}
                                                                        placeholder="Optional default"
                                                                        className="h-7 text-xs"
                                                                  />
                                                            </div>
                                                      </div>

                                                      {field.type === "select" && (
                                                            <div className="space-y-1">
                                                                  <Label className="text-xs">Options (comma-separated)</Label>
                                                                  <Input
                                                                        value={(field.options || []).join(", ")}
                                                                        onChange={(e) =>
                                                                              updateField(field.id, {
                                                                                    options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                                                                              })
                                                                        }
                                                                        placeholder="Option A, Option B, Option C"
                                                                        className="h-7 text-xs"
                                                                  />
                                                            </div>
                                                      )}

                                                      <div className="space-y-1">
                                                            <Label className="text-xs">Description</Label>
                                                            <Input
                                                                  value={field.description || ""}
                                                                  onChange={(e) => updateField(field.id, { description: e.target.value })}
                                                                  placeholder="What this field is used for..."
                                                                  className="h-7 text-xs"
                                                            />
                                                      </div>

                                                      <div className="flex items-center justify-between pt-1">
                                                            <div className="flex items-center gap-2">
                                                                  <Switch
                                                                        checked={field.required}
                                                                        onCheckedChange={(v) => updateField(field.id, { required: v })}
                                                                  />
                                                                  <Label className="text-xs">Required</Label>
                                                            </div>
                                                            <Button
                                                                  type="button"
                                                                  variant="destructive"
                                                                  size="sm"
                                                                  className="h-7 text-xs gap-1"
                                                                  onClick={() => removeField(field.id)}
                                                            >
                                                                  <Trash2 className="h-3 w-3" />
                                                                  Remove
                                                            </Button>
                                                      </div>
                                                </div>
                                          )}
                                    </div>
                              ))
                        )}

                        {/* Add Button */}
                        <Button
                              type="button"
                              variant="outline"
                              className="w-full h-9 text-sm gap-1.5 border-dashed"
                              onClick={addField}
                        >
                              <Plus className="h-3.5 w-3.5" />
                              Add Placeholder Field
                        </Button>
                  </CardContent>
            </Card>
      );
}

export default PlaceholderSchemaBuilder;
