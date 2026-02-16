"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { cn } from "@core/common/utils";
import { Monitor, Tablet, Smartphone, Braces, PanelRightOpen, PanelRightClose } from "lucide-react";
import { DEFAULT_VARIABLES } from "@core/ui/rich-text-editor/VariablePicker";
import type { VariableDefinition } from "@core/ui/rich-text-editor/VariablePicker";
import { VariableValuesPanel } from "@core/ui/rich-text-editor/VariableValuesPanel";
import type { VariableValuesMap } from "@core/ui/rich-text-editor/VariableValuesPanel";

// ─── Device Presets ─────────────────────────────────────────
const DEVICES = [
      { id: "desktop", label: "Desktop", icon: Monitor, width: 600 },
      { id: "tablet", label: "Tablet", icon: Tablet, width: 480 },
      { id: "mobile", label: "Mobile", icon: Smartphone, width: 320 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

// ─── Variable Resolution ────────────────────────────────────
/**
 * Resolve `{{ variableKey }}` and `{{ variableKey | "fallback" }}` patterns
 * using the provided values map. If a variable has no value AND no fallback,
 * the placeholder is left unchanged so the user can see what's missing.
 */
function resolveVariables(
      text: string,
      values: VariableValuesMap,
      variables: VariableDefinition[]
): string {
      if (!text) return text;

      // Match {{ key }} or {{ key | "fallback" }} patterns
      return text.replace(
            /\{\{\s*(\w+)(?:\s*\|\s*"([^"]*)")?\s*\}\}/g,
            (_match, key: string, fallback?: string) => {
                  // Check if we have a user-provided value
                  if (values[key]?.trim()) return values[key];
                  // Check if we have a fallback in the template
                  if (fallback) return fallback;
                  // Check sample from variable definitions
                  const def = variables.find((v) => v.key === key);
                  if (def?.sample) return def.sample;
                  // Leave unresolved
                  return `{{${key}}}`;
            }
      );
}

// ─── Props ──────────────────────────────────────────────────
export interface EmailPreviewDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      subject: string;
      body: string;
      recipients: string[];
      /** Additional variables beyond defaults */
      customVariables?: VariableDefinition[];
      /** Controlled variable values from parent (e.g. ViewModel) */
      variableValues?: VariableValuesMap;
      /** Called when variable values change (persists values in parent) */
      onVariableValuesChange?: (values: VariableValuesMap) => void;
}

export function EmailPreviewDialog({
      open,
      onOpenChange,
      subject,
      body,
      recipients,
      customVariables,
      variableValues: controlledValues,
      onVariableValuesChange,
}: EmailPreviewDialogProps) {
      const { t } = useI18n();
      const [device, setDevice] = useState<DeviceId>("desktop");
      const [showVariables, setShowVariables] = useState(false);
      // Use controlled values from parent if provided, otherwise local state
      const [localValues, setLocalValues] = useState<VariableValuesMap>({});
      const variableValues = controlledValues ?? localValues;
      const setVariableValues = useCallback((v: VariableValuesMap) => {
            if (onVariableValuesChange) onVariableValuesChange(v);
            else setLocalValues(v);
      }, [onVariableValuesChange]);

      // Merge default + custom variables
      const allVariables = useMemo(() => {
            if (!customVariables?.length) return DEFAULT_VARIABLES;
            return [...DEFAULT_VARIABLES, ...customVariables];
      }, [customVariables]);

      // Resolve variables in subject and body
      const resolvedSubject = useMemo(
            () => resolveVariables(subject, variableValues, allVariables),
            [subject, variableValues, allVariables]
      );

      const resolvedBody = useMemo(
            () => resolveVariables(body, variableValues, allVariables),
            [body, variableValues, allVariables]
      );

      const sanitizedBody = useMemo(() => {
            return resolvedBody
                  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                  .replace(/on\w+="[^"]*"/gi, "")
                  .replace(/on\w+='[^']*'/gi, "");
      }, [resolvedBody]);

      const currentDevice = DEVICES.find((d) => d.id === device)!;

      // Count how many variables are in the template
      const templateVarCount = useMemo(() => {
            const combined = (subject || "") + (body || "");
            const matches = combined.match(/\{\{\s*\w+/g);
            return matches ? new Set(matches.map((m) => m.replace(/\{\{\s*/, ""))).size : 0;
      }, [subject, body]);

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className={cn(
                        "max-h-[90vh] overflow-y-auto transition-all duration-300",
                        showVariables ? "max-w-6xl" : "max-w-4xl"
                  )}>
                        <DialogHeader>
                              <DialogTitle>{t("messaging.email.previewTitle") || "Email Preview"}</DialogTitle>
                              <DialogDescription>
                                    {t("messaging.email.previewDescription") || "Preview how your email will appear to recipients."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className={cn(
                              "pt-2",
                              showVariables ? "grid grid-cols-[1fr_300px] gap-4" : ""
                        )}>
                              {/* Main Preview */}
                              <div className="space-y-4">
                                    {/* Recipients */}
                                    <div className="space-y-1">
                                          <p className="text-sm font-medium text-muted-foreground">
                                                {t("messaging.email.to") || "To"}
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                                {recipients.map((email) => (
                                                      <Badge key={email} variant="secondary" className="text-xs">
                                                            {email}
                                                      </Badge>
                                                ))}
                                          </div>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-1">
                                          <p className="text-sm font-medium text-muted-foreground">
                                                {t("messaging.email.subject") || "Subject"}
                                          </p>
                                          <p className="text-base font-semibold">{resolvedSubject || "—"}</p>
                                    </div>

                                    {/* Controls: Device Switcher + Variable Toggle */}
                                    <div className="flex items-center justify-center gap-3">
                                          <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
                                                {DEVICES.map((d) => {
                                                      const Icon = d.icon;
                                                      return (
                                                            <Button
                                                                  key={d.id}
                                                                  type="button"
                                                                  variant={device === d.id ? "default" : "ghost"}
                                                                  size="sm"
                                                                  className="gap-1.5 h-8 text-xs"
                                                                  onClick={() => setDevice(d.id)}
                                                            >
                                                                  <Icon className="h-3.5 w-3.5" />
                                                                  {d.label}
                                                            </Button>
                                                      );
                                                })}
                                          </div>
                                          {templateVarCount > 0 && (
                                                <Button
                                                      type="button"
                                                      variant={showVariables ? "secondary" : "outline"}
                                                      size="sm"
                                                      className="gap-1.5 h-8 text-xs"
                                                      onClick={() => setShowVariables(!showVariables)}
                                                >
                                                      {showVariables ? (
                                                            <PanelRightClose className="h-3.5 w-3.5" />
                                                      ) : (
                                                            <PanelRightOpen className="h-3.5 w-3.5" />
                                                      )}
                                                      Variables
                                                      <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                                                            {templateVarCount}
                                                      </Badge>
                                                </Button>
                                          )}
                                    </div>

                                    {/* Body Preview */}
                                    <div className="flex justify-center">
                                          <div
                                                className={cn(
                                                      "border rounded-lg bg-white transition-all duration-300 overflow-hidden shadow-sm",
                                                      device === "mobile" && "rounded-2xl border-2"
                                                )}
                                                style={{
                                                      width: `${currentDevice.width}px`,
                                                      maxWidth: "100%",
                                                }}
                                          >
                                                {/* Simulated browser/device bar */}
                                                <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b">
                                                      <div className="flex gap-1">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                                      </div>
                                                      <div className="flex-1 text-center">
                                                            <span className="text-[10px] text-gray-400 font-mono">
                                                                  {currentDevice.width}px
                                                            </span>
                                                      </div>
                                                </div>

                                                {/* Email Content */}
                                                <div className="p-0">
                                                      {resolvedBody.includes("<") ? (
                                                            <iframe
                                                                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:#000;padding:16px;background:#fff}img{max-width:100%;height:auto}a{color:#3b82f6}</style></head><body>${sanitizedBody}</body></html>`}
                                                                  sandbox="allow-same-origin"
                                                                  className="w-full border-0"
                                                                  style={{ minHeight: "200px", height: "400px" }}
                                                                  title="Email Preview"
                                                                  onLoad={(e) => {
                                                                        const iframe = e.currentTarget;
                                                                        try {
                                                                              const body = iframe.contentDocument?.body;
                                                                              if (body) {
                                                                                    iframe.style.height = `${Math.min(body.scrollHeight + 32, 600)}px`;
                                                                              }
                                                                        } catch { /* sandbox restriction */ }
                                                                  }}
                                                            />
                                                      ) : (
                                                            <pre className="whitespace-pre-wrap text-sm font-sans text-black p-4">
                                                                  {resolvedBody}
                                                            </pre>
                                                      )}
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {/* Variable Values Sidebar */}
                              {showVariables && (
                                    <VariableValuesPanel
                                          variables={allVariables}
                                          values={variableValues}
                                          onChange={setVariableValues}
                                          templateBody={body}
                                          className="sticky top-0"
                                    />
                              )}
                        </div>
                  </DialogContent>
            </Dialog>
      );
}
