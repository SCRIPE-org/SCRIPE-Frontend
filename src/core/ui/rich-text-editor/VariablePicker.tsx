"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { EmptyState } from "@core/ui/empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";
import {
  Braces,
  Search,
  User,
  Building2,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

// ─── Types ──────────────────────────────────────────────────
export type VariableCategory = "recipient" | "company" | "system" | "template";

export interface VariableDefinition {
  /** The variable key, e.g. "userName" */
  key: string;
  /** Display label, e.g. "User Name" */
  label: string;
  /**
   * Locale key for the display label. The built-in variables carry one;
   * variables assembled from tenant data do not and fall back to `label`,
   * which is why this is optional rather than a replacement for it.
   */
  labelKey?: string;
  /** Category for grouping */
  category: VariableCategory;
  /** Sample value shown in preview */
  sample: string;
  /** Whether this variable supports fallback values */
  supportsFallback?: boolean;
  /** Data source hint for auto-fill (e.g., "api", "context", "manual") */
  dataSource?: "api" | "context" | "manual";
  /** Input field type for the variable values panel */
  fieldType?:
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
  /** Default value for this variable */
  defaultValue?: string;
  /** Options for select type */
  options?: string[];
}

export interface VariablePickerProps {
  variables: VariableDefinition[];
  onInsert: (variableText: string) => void;
}

/**
 * The one place a variable's display name is resolved. Both this picker and
 * the values panel render it, and they must agree — a variable named one way
 * in the list and another way in the form is two variables to the reader.
 */
export function resolveVariableLabel(
  t: (key: string, params?: Record<string, string | number>) => string,
  variable: VariableDefinition
): string {
  return variable.labelKey ? t(variable.labelKey) : variable.label;
}

// ─── Category Config ────────────────────────────────────────
// Tone comes from the measured semantic tokens rather than the nx status
// aliases: the aliases hold a COMPLETE colour value, so Tailwind's slash-alpha
// is silently dropped on them and a `/10` wash would have painted the header
// solid. The semantic tokens are HSL triplets, so the tint works.
const CATEGORY_CONFIG: Record<
  VariableCategory,
  { labelKey: string; icon: React.ReactNode; color: string }
> = {
  recipient: {
    labelKey: "editorBlocks.variables.category.recipient",
    icon: <User className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-info",
  },
  company: {
    labelKey: "editorBlocks.variables.category.company",
    icon: <Building2 className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-success",
  },
  system: {
    labelKey: "editorBlocks.variables.category.system",
    icon: <Settings className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-nx-accent",
  },
  template: {
    labelKey: "editorBlocks.variables.category.template",
    icon: <FileText className="h-3.5 w-3.5" aria-hidden="true" />,
    color: "text-warning",
  },
};

// ─── Default System Variables ───────────────────────────────
export const DEFAULT_VARIABLES: VariableDefinition[] = [
  // Recipient
  {
    key: "userName",
    label: "User Name",
    labelKey: "editorBlocks.variables.names.userName",
    category: "recipient",
    sample: "Ahmed Hassan",
    supportsFallback: true,
    fieldType: "text",
  },
  {
    key: "userEmail",
    label: "Email Address",
    labelKey: "editorBlocks.variables.names.userEmail",
    category: "recipient",
    sample: "ahmed@example.com",
    supportsFallback: true,
    fieldType: "email",
  },
  {
    key: "firstName",
    label: "First Name",
    labelKey: "editorBlocks.variables.names.firstName",
    category: "recipient",
    sample: "Ahmed",
    supportsFallback: true,
    fieldType: "text",
  },
  {
    key: "lastName",
    label: "Last Name",
    labelKey: "editorBlocks.variables.names.lastName",
    category: "recipient",
    sample: "Hassan",
    supportsFallback: true,
    fieldType: "text",
  },
  {
    key: "jobTitle",
    label: "Job Title",
    labelKey: "editorBlocks.variables.names.jobTitle",
    category: "recipient",
    sample: "Software Engineer",
    supportsFallback: true,
    fieldType: "text",
  },
  // Company
  {
    key: "companyName",
    label: "Company Name",
    labelKey: "editorBlocks.variables.names.companyName",
    category: "company",
    sample: "SCRIPE",
    fieldType: "text",
  },
  {
    key: "companyLogo",
    label: "Company Logo URL",
    labelKey: "editorBlocks.variables.names.companyLogo",
    category: "company",
    sample: "/branding/scripe-logo.png",
    fieldType: "url",
  },
  {
    key: "companyAddress",
    label: "Company Address",
    labelKey: "editorBlocks.variables.names.companyAddress",
    category: "company",
    sample: "123 Business Ave",
    fieldType: "text",
  },
  {
    key: "companyPhone",
    label: "Phone Number",
    labelKey: "editorBlocks.variables.names.companyPhone",
    category: "company",
    sample: "+1 (555) 123-4567",
    fieldType: "text",
  },
  {
    key: "companyWebsite",
    label: "Website URL",
    labelKey: "editorBlocks.variables.names.companyWebsite",
    category: "company",
    sample: "https://scripe.org",
    fieldType: "url",
  },
  // System
  {
    key: "currentDate",
    label: "Current Date",
    labelKey: "editorBlocks.variables.names.currentDate",
    category: "system",
    sample: "February 16, 2026",
    fieldType: "date",
  },
  {
    key: "currentYear",
    label: "Current Year",
    labelKey: "editorBlocks.variables.names.currentYear",
    category: "system",
    sample: "2026",
    fieldType: "number",
  },
  {
    key: "supportEmail",
    label: "Support Email",
    labelKey: "editorBlocks.variables.names.supportEmail",
    category: "system",
    sample: "support@scripe.org",
    fieldType: "email",
  },
  {
    key: "loginUrl",
    label: "Login URL",
    labelKey: "editorBlocks.variables.names.loginUrl",
    category: "system",
    sample: "https://admin.scripe.org/login",
    fieldType: "url",
  },
  {
    key: "dashboardUrl",
    label: "Dashboard URL",
    labelKey: "editorBlocks.variables.names.dashboardUrl",
    category: "system",
    sample: "https://admin.scripe.org/dashboard",
    fieldType: "url",
  },
  {
    key: "unsubscribeUrl",
    label: "Unsubscribe URL",
    labelKey: "editorBlocks.variables.names.unsubscribeUrl",
    category: "system",
    sample: "https://admin.scripe.org/unsubscribe",
    fieldType: "url",
  },
];

// ─── Variable Item ──────────────────────────────────────────
function VariableItem({
  variable,
  onInsert,
}: {
  variable: VariableDefinition;
  onInsert: (text: string) => void;
}) {
  const { t, direction } = useI18n();
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
  const name = resolveVariableLabel(t, variable);
  // "Reveal the next thing inline" is a forward affordance, so it mirrors.
  const DisclosureChevron = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-nx-sm px-3 py-2 text-start text-sm transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus"
        onClick={handleInsert}
      >
        <span className={cn("shrink-0", cat.color)}>{cat.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate font-medium text-nx-ink">{name}</span>
            <Badge variant="outline" className="shrink-0 px-1.5 py-0 font-mono text-[10px]">
              {`{{${variable.key}}}`}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-xs text-nx-ink-3">
            {t("editorBlocks.variables.sample", { value: variable.sample })}
          </p>
        </div>
      </button>
      {variable.supportsFallback && (
        <div className="px-3 pb-1">
          {!showFallback ? (
            <button
              type="button"
              className="flex items-center gap-0.5 rounded-nx-sm text-[10px] text-nx-ink-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:text-nx-accent focus-visible:outline-none focus-visible:shadow-nx-focus"
              onClick={(e) => {
                e.stopPropagation();
                setShowFallback(true);
              }}
            >
              <DisclosureChevron className="h-3 w-3" aria-hidden="true" />
              {t("editorBlocks.variables.addFallback")}
            </button>
          ) : (
            <div className="mt-0.5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Input
                value={fallback}
                onChange={(e) => setFallback(e.target.value)}
                aria-label={t("editorBlocks.variables.fallbackLabel", { name })}
                placeholder={t("editorBlocks.variables.fallbackPlaceholder")}
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
                className="h-6 px-2 text-[10px]"
                onClick={handleInsert}
              >
                {t("editorBlocks.variables.insertFallback")}
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
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return variables;
    const q = search.toLowerCase();
    return variables.filter(
      (v) =>
        v.key.toLowerCase().includes(q) ||
        v.label.toLowerCase().includes(q) ||
        // The rendered name too, or the Arabic build would show names nobody
        // could search for.
        resolveVariableLabel(t, v).toLowerCase().includes(q) ||
        v.sample.toLowerCase().includes(q)
    );
  }, [variables, search, t]);

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

  const categoryOrder: VariableCategory[] = ["recipient", "company", "system", "template"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs font-medium"
          aria-label={t("editorBlocks.variables.triggerLabel")}
        >
          <Braces className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("editorBlocks.variables.trigger")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Search — outside the scroller on purpose, so the filter stays put
            while the list under it moves. */}
        <div className="border-b border-nx-line p-2">
          <div className="relative">
            <Search
              className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-nx-ink-3"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("editorBlocks.variables.search")}
              placeholder={t("editorBlocks.variables.searchPlaceholder")}
              className="h-8 ps-8 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Variable List — native scroll with overscroll-contain to prevent page scroll */}
        <div className="max-h-80 overflow-y-auto overscroll-contain p-1.5">
          {filtered.length === 0 ? (
            <EmptyState
              bare
              size="sm"
              icon={Search}
              title={t("editorBlocks.variables.emptyTitle")}
              description={t("editorBlocks.variables.emptyDescription")}
            />
          ) : (
            categoryOrder.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              const config = CATEGORY_CONFIG[cat];
              return (
                <div key={cat} className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-1.5">
                    <span className={config.color}>{config.icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                      {t(config.labelKey)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ms-auto h-4 px-1 py-0 text-[10px] tabular-nums"
                    >
                      {items.length}
                    </Badge>
                  </div>
                  {items.map((v) => (
                    <VariableItem key={v.key} variable={v} onInsert={handleInsert} />
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
