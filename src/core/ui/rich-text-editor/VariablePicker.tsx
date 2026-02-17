"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import {
      Braces,
      Search,
      User,
      Building2,
      Settings,
      FileText,
      Clock,
      ChevronRight,
} from "lucide-react";
import { cn } from "@core/common/utils";

// ─── Types ──────────────────────────────────────────────────
export type VariableCategory = "recipient" | "company" | "system" | "template";

export interface VariableDefinition {
      /** The variable key, e.g. "userName" */
      key: string;
      /** Display label, e.g. "User Name" */
      label: string;
      /** Category for grouping */
      category: VariableCategory;
      /** Sample value shown in preview */
      sample: string;
      /** Whether this variable supports fallback values */
      supportsFallback?: boolean;
      /** Data source hint for auto-fill (e.g., "api", "context", "manual") */
      dataSource?: "api" | "context" | "manual";
      /** Input field type for the variable values panel */
      fieldType?: "text" | "textarea" | "richtext" | "number" | "date" | "datetime" | "email" | "url" | "select" | "color";
      /** Default value for this variable */
      defaultValue?: string;
      /** Options for select type */
      options?: string[];
}

export interface VariablePickerProps {
      variables: VariableDefinition[];
      onInsert: (variableText: string) => void;
}

// ─── Category Config ────────────────────────────────────────
const CATEGORY_CONFIG: Record<
      VariableCategory,
      { label: string; icon: React.ReactNode; color: string }
> = {
      recipient: {
            label: "Recipient",
            icon: <User className="h-3.5 w-3.5" />,
            color: "text-blue-500",
      },
      company: {
            label: "Company",
            icon: <Building2 className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
      },
      system: {
            label: "System",
            icon: <Settings className="h-3.5 w-3.5" />,
            color: "text-purple-500",
      },
      template: {
            label: "Template",
            icon: <FileText className="h-3.5 w-3.5" />,
            color: "text-amber-500",
      },
};

// ─── Default System Variables ───────────────────────────────
export const DEFAULT_VARIABLES: VariableDefinition[] = [
      // Recipient
      { key: "userName", label: "User Name", category: "recipient", sample: "Ahmed Hassan", supportsFallback: true, fieldType: "text" },
      { key: "userEmail", label: "Email Address", category: "recipient", sample: "ahmed@example.com", supportsFallback: true, fieldType: "email" },
      { key: "firstName", label: "First Name", category: "recipient", sample: "Ahmed", supportsFallback: true, fieldType: "text" },
      { key: "lastName", label: "Last Name", category: "recipient", sample: "Hassan", supportsFallback: true, fieldType: "text" },
      { key: "jobTitle", label: "Job Title", category: "recipient", sample: "Software Engineer", supportsFallback: true, fieldType: "text" },
      // Company
      { key: "companyName", label: "Company Name", category: "company", sample: "NEXORA", fieldType: "text" },
      { key: "companyLogo", label: "Company Logo URL", category: "company", sample: "/branding/nexora-logo.png", fieldType: "url" },
      { key: "companyAddress", label: "Company Address", category: "company", sample: "123 Business Ave", fieldType: "text" },
      { key: "companyPhone", label: "Phone Number", category: "company", sample: "+1 (555) 123-4567", fieldType: "text" },
      { key: "companyWebsite", label: "Website URL", category: "company", sample: "https://nexora.com", fieldType: "url" },
      // System
      { key: "currentDate", label: "Current Date", category: "system", sample: "February 16, 2026", fieldType: "date" },
      { key: "currentYear", label: "Current Year", category: "system", sample: "2026", fieldType: "number" },
      { key: "supportEmail", label: "Support Email", category: "system", sample: "support@nexora.com", fieldType: "email" },
      { key: "loginUrl", label: "Login URL", category: "system", sample: "https://app.nexora.com/login", fieldType: "url" },
      { key: "dashboardUrl", label: "Dashboard URL", category: "system", sample: "https://app.nexora.com/dashboard", fieldType: "url" },
      { key: "unsubscribeUrl", label: "Unsubscribe URL", category: "system", sample: "https://app.nexora.com/unsubscribe", fieldType: "url" },
];

// ─── Variable Item ──────────────────────────────────────────
function VariableItem({
      variable,
      onInsert,
}: {
      variable: VariableDefinition;
      onInsert: (text: string) => void;
}) {
      const [showFallback, setShowFallback] = useState(false);
      const [fallback, setFallback] = useState("");

      const handleInsert = () => {
            if (showFallback && fallback.trim()) {
                  onInsert(`{{ ${variable.key} | "${fallback.trim()}" }}`);
            } else {
                  onInsert(`{{ ${variable.key} }}`);
            }
      };

      const cat = CATEGORY_CONFIG[variable.category];

      return (
            <div className="group">
                  <button
                        type="button"
                        className="w-full px-3 py-2 text-sm text-left hover:bg-accent rounded-md flex items-center gap-2 transition-colors"
                        onClick={handleInsert}
                  >
                        <span className={cn("shrink-0", cat.color)}>{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium truncate">{variable.label}</span>
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono shrink-0">
                                          {`{{${variable.key}}}`}
                                    </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    Sample: {variable.sample}
                              </p>
                        </div>
                  </button>
                  {variable.supportsFallback && (
                        <div className="px-3 pb-1">
                              {!showFallback ? (
                                    <button
                                          type="button"
                                          className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-0.5 transition-colors"
                                          onClick={(e) => {
                                                e.stopPropagation();
                                                setShowFallback(true);
                                          }}
                                    >
                                          <ChevronRight className="h-3 w-3" />
                                          Add fallback value
                                    </button>
                              ) : (
                                    <div className="flex gap-1 items-center mt-0.5" onClick={(e) => e.stopPropagation()}>
                                          <Input
                                                value={fallback}
                                                onChange={(e) => setFallback(e.target.value)}
                                                placeholder="e.g. Valued Customer"
                                                className="h-6 text-xs"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                      if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleInsert();
                                                      }
                                                }}
                                          />
                                          <Button
                                                type="button"
                                                size="sm"
                                                className="h-6 text-[10px] px-2"
                                                onClick={handleInsert}
                                          >
                                                Insert
                                          </Button>
                                    </div>
                              )}
                        </div>
                  )}
            </div>
      );
}

// ─── Main Component ─────────────────────────────────────────
export function VariablePicker({ variables, onInsert }: VariablePickerProps) {
      const [open, setOpen] = useState(false);
      const [search, setSearch] = useState("");

      const filtered = useMemo(() => {
            if (!search.trim()) return variables;
            const q = search.toLowerCase();
            return variables.filter(
                  (v) =>
                        v.key.toLowerCase().includes(q) ||
                        v.label.toLowerCase().includes(q) ||
                        v.sample.toLowerCase().includes(q)
            );
      }, [variables, search]);

      const grouped = useMemo(() => {
            const groups: Partial<Record<VariableCategory, VariableDefinition[]>> = {};
            for (const v of filtered) {
                  if (!groups[v.category]) groups[v.category] = [];
                  groups[v.category]!.push(v);
            }
            return groups;
      }, [filtered]);

      const handleInsert = (text: string) => {
            onInsert(text);
            setOpen(false);
            setSearch("");
      };

      const categoryOrder: VariableCategory[] = [
            "recipient",
            "company",
            "system",
            "template",
      ];

      return (
            <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                        <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1.5 px-2 text-xs font-medium"
                              title="Insert Variable"
                        >
                              <Braces className="h-4 w-4" />
                              <span className="hidden sm:inline">Variables</span>
                        </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                        {/* Search */}
                        <div className="p-2 border-b">
                              <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          placeholder="Search variables..."
                                          className="h-8 pl-8 text-sm"
                                          autoFocus
                                    />
                              </div>
                        </div>

                        {/* Variable List — native scroll with overscroll-contain to prevent page scroll */}
                        <div className="max-h-[320px] overflow-y-auto overscroll-contain p-1.5">
                              {filtered.length === 0 ? (
                                    <div className="text-center py-6 text-sm text-muted-foreground">
                                          <Clock className="h-5 w-5 mx-auto mb-1 opacity-40" />
                                          No variables found
                                    </div>
                              ) : (
                                    categoryOrder.map((cat) => {
                                          const items = grouped[cat];
                                          if (!items || items.length === 0) return null;
                                          const config = CATEGORY_CONFIG[cat];
                                          return (
                                                <div key={cat} className="mb-2">
                                                      <div className="flex items-center gap-1.5 px-2 py-1.5">
                                                            <span className={config.color}>
                                                                  {config.icon}
                                                            </span>
                                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                                  {config.label}
                                                            </span>
                                                            <Badge
                                                                  variant="secondary"
                                                                  className="text-[10px] px-1 py-0 h-4 ml-auto"
                                                            >
                                                                  {items.length}
                                                            </Badge>
                                                      </div>
                                                      {items.map((v) => (
                                                            <VariableItem
                                                                  key={v.key}
                                                                  variable={v}
                                                                  onInsert={handleInsert}
                                                            />
                                                      ))}
                                                </div>
                                          );
                                    })
                              )}
                        </div>
                  </PopoverContent>
            </Popover>
      );
}

export default VariablePicker;
