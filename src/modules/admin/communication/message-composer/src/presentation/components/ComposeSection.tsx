// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { RichTextEditor } from "@core/ui/rich-text-editor/RichTextEditor";
import type { VariableDefinition } from "@core/ui/rich-text-editor/VariablePicker";
import { DEFAULT_VARIABLES } from "@core/ui/rich-text-editor/VariablePicker";
import { VariableValuesPanel } from "@core/ui/rich-text-editor/VariableValuesPanel";
import type { VariableValuesMap } from "@core/ui/rich-text-editor/VariableValuesPanel";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@core/ui/popover";

import { Mail, Send, RotateCcw, Search, X, Eye, Braces } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";
import type { EmailRecipient } from "../../domain/entities/Email";
import type { IEmailRepository } from "../../domain/interfaces/IEmailRepository";
import type { EmailTemplate } from "../../domain/entities/Email";
import { TemplatePicker } from "./TemplatePicker";
import { AttachmentUploader } from "./AttachmentUploader";
import type { AttachmentFile } from "./AttachmentUploader";
import { SchedulePicker } from "./SchedulePicker";
import type { ScheduleConfig } from "./SchedulePicker";

// ─── Character Limits ──────────────────────────────────────
const SUBJECT_MAX = 200;
const BODY_MAX = 10000;

// ─── Recipient search dropdown component ───────────────────
function RecipientSearchInput({
  label,
  placeholder,
  search,
  setSearch,
  results,
  isSearching,
  selectedRecipients,
  onAdd,
  onRemove,
  onCustomEmail,
  error,
}: {
  label: string;
  placeholder: string;
  search: string;
  setSearch: (v: string) => void;
  results: EmailRecipient[];
  isSearching: boolean;
  selectedRecipients: EmailRecipient[];
  onAdd: (r: EmailRecipient) => void;
  onRemove: (email: string) => void;
  onCustomEmail?: (email: string) => boolean;
  error?: boolean;
}) {
  const { t } = useI18n();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputId = React.useId();
  const listboxId = `${inputId}-listbox`;

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // A highlighted index from a previous keystroke must never survive into a
  // result set it no longer indexes into.
  React.useEffect(() => {
    queueMicrotask(() => {
      setActiveIndex(-1);
    });
  }, [search, results]);

  const noResults = search.length >= 2 && !isSearching && results.length === 0;
  const showCustomHint = noResults && search.includes("@") && onCustomEmail;
  const isOpen = showDropdown && search.length >= 2;
  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className={cn(error && "text-destructive")}>
        {label}
      </Label>
      {selectedRecipients.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedRecipients.map((r) => (
            <Badge key={r.email} variant={r.type === "custom" ? "outline" : "secondary"} className="gap-1">
              {r.type === "custom" && <Mail className="h-3 w-3" aria-hidden="true" />}
              {r.name || r.email}
              <button
                type="button"
                onClick={() => onRemove(r.email)}
                className="rounded-full hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none"
                aria-label={t("messaging.email.removeRecipientNamed", {
                  name: r.name || r.email,
                })}
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
            aria-hidden="true"
          />
          <Input
            id={inputId}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-activedescendant={isOpen ? activeOptionId : undefined}
            placeholder={placeholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (isOpen && results.length > 0 && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                e.preventDefault();
                setActiveIndex((prev) => {
                  const count = results.length;
                  if (e.key === "ArrowDown") return (prev + 1) % count;
                  return (prev - 1 + count) % count;
                });
                return;
              }
              if (e.key === "Escape" && isOpen) {
                setShowDropdown(false);
                return;
              }
              if (e.key === "Enter") {
                if (isOpen && activeIndex >= 0 && results[activeIndex]) {
                  e.preventDefault();
                  onAdd(results[activeIndex]);
                  setShowDropdown(false);
                  return;
                }
                if (onCustomEmail && search.trim()) {
                  e.preventDefault();
                  const added = onCustomEmail(search);
                  if (added) setShowDropdown(false);
                }
              }
            }}
            className={cn("ps-9", error && "border-destructive focus-visible:ring-destructive")}
          />
          {isSearching && (
            <LoadingSpinner
              size="inline"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-nx-ink-3"
            />
          )}
        </div>
        {isOpen && (
          <div className="absolute top-full z-dropdown mt-1 max-h-48 w-full overflow-y-auto rounded-nx-md border border-nx-line bg-nx-popover shadow-nx-popover">
            {results.length > 0 ? (
              <div id={listboxId} role="listbox" aria-label={label}>
                {results.map((r, idx) => (
                  <button
                    key={r.email}
                    id={`${listboxId}-option-${idx}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-nx-hover focus-visible:bg-nx-hover focus-visible:outline-none",
                      idx === activeIndex && "bg-nx-hover"
                    )}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => {
                      onAdd(r);
                      setShowDropdown(false);
                    }}
                  >
                    <span className="font-medium text-nx-ink">{r.name || r.email}</span>
                    <span className="text-xs text-nx-ink-3">{r.email}</span>
                  </button>
                ))}
              </div>
            ) : showCustomHint ? (
              <div id={listboxId} role="listbox" aria-label={label}>
                <button
                  id={`${listboxId}-option-0`}
                  role="option"
                  aria-selected={false}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-3 text-start text-sm hover:bg-nx-hover focus-visible:bg-nx-hover focus-visible:outline-none"
                  onClick={() => {
                    if (onCustomEmail) {
                      const added = onCustomEmail(search);
                      if (added) setShowDropdown(false);
                    }
                  }}
                >
                  <Mail className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
                  <span className="text-nx-ink">
                    {t("messaging.email.sendToCustomEmail")}{" "}
                    <strong className="text-nx-ink">{search.trim()}</strong>
                  </span>
                </button>
              </div>
            ) : (
              noResults && (
                <div id={listboxId} role="status" className="px-3 py-4 text-center text-sm text-nx-ink-3">
                  <Search className="mx-auto mb-1 h-5 w-5 opacity-40" aria-hidden="true" />
                  {t("messaging.email.noRecipientsFound")}{" "}
                  {t("messaging.email.noRecipientsFoundHint")}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Props ──────────────────────────────────────────────────
/**
 * Interface defining property specifications, keys types, and structural contract rules for compose section props.
 */
export interface ComposeSectionProps {
  recipientSearch: string;
  setRecipientSearch: (v: string) => void;
  recipientResults: EmailRecipient[];
  isSearching: boolean;
  recipients: EmailRecipient[];
  addRecipient: (r: EmailRecipient) => void;
  removeRecipient: (email: string) => void;
  addCustomEmail: (email: string, field: "to" | "cc" | "bcc") => boolean;

  showCcBcc: boolean;
  setShowCcBcc: (v: boolean) => void;
  ccSearch: string;
  setCcSearch: (v: string) => void;
  ccResults: EmailRecipient[];
  isCcSearching: boolean;
  ccRecipients: EmailRecipient[];
  addCcRecipient: (r: EmailRecipient) => void;
  removeCcRecipient: (email: string) => void;
  bccSearch: string;
  setBccSearch: (v: string) => void;
  bccResults: EmailRecipient[];
  isBccSearching: boolean;
  bccRecipients: EmailRecipient[];
  addBccRecipient: (r: EmailRecipient) => void;
  removeBccRecipient: (email: string) => void;

  subject: string;
  setSubject: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  fieldErrors: { to?: boolean; subject?: boolean; body?: boolean };
  handleSend: () => void;
  isSending: boolean;
  resetForm: () => void;
  // Template & Preview
  repository: IEmailRepository;
  applyTemplate: (template: EmailTemplate) => void;
  onPreview?: () => void;
  // Attachments
  attachments: AttachmentFile[];
  onAddAttachments: (files: File[]) => void;
  onRemoveAttachment: (id: string) => void;
  // Schedule
  schedule: ScheduleConfig;
  onScheduleChange: (config: ScheduleConfig) => void;
  // Variable system
  allVariables?: VariableDefinition[];
  variableValues?: VariableValuesMap;
  setVariableValues?: (values: VariableValuesMap) => void;
  typeOverrides?: Record<string, string>;
  setTypeOverrides?: (overrides: Record<string, string>) => void;
}

/**
 * Presentation UI component rendering the compose section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ComposeSection(vm: ComposeSectionProps) {
  const { t } = useI18n();
  const subjectId = React.useId();
  const bodyLabelId = React.useId();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("messaging.email.composeTitle")}</CardTitle>
            <CardDescription>{t("messaging.email.composeDescription")}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!vm.showCcBcc && (
              <Button variant="ghost" size="sm" onClick={() => vm.setShowCcBcc(true)}>
                {t("messaging.email.ccBcc")}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={vm.resetForm}
              className="gap-1.5 text-nx-ink-2"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t("messaging.email.clearForm")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Picker */}
        <TemplatePicker repository={vm.repository} onSelect={vm.applyTemplate} />

        {/* To */}
        <RecipientSearchInput
          label={`${t("messaging.email.to")} *`}
          placeholder={t("messaging.email.searchRecipients")}
          search={vm.recipientSearch}
          setSearch={vm.setRecipientSearch}
          results={vm.recipientResults}
          isSearching={vm.isSearching}
          selectedRecipients={vm.recipients}
          onAdd={vm.addRecipient}
          onRemove={vm.removeRecipient}
          onCustomEmail={(email) => vm.addCustomEmail(email, "to")}
          error={vm.fieldErrors.to}
        />

        {/* CC / BCC */}
        {vm.showCcBcc && (
          <>
            <RecipientSearchInput
              label={t("messaging.email.cc")}
              placeholder={t("messaging.email.searchRecipients")}
              search={vm.ccSearch}
              setSearch={vm.setCcSearch}
              results={vm.ccResults}
              isSearching={vm.isCcSearching}
              selectedRecipients={vm.ccRecipients}
              onAdd={vm.addCcRecipient}
              onRemove={vm.removeCcRecipient}
              onCustomEmail={(email) => vm.addCustomEmail(email, "cc")}
            />
            <RecipientSearchInput
              label={t("messaging.email.bcc")}
              placeholder={t("messaging.email.searchRecipients")}
              search={vm.bccSearch}
              setSearch={vm.setBccSearch}
              results={vm.bccResults}
              isSearching={vm.isBccSearching}
              selectedRecipients={vm.bccRecipients}
              onAdd={vm.addBccRecipient}
              onRemove={vm.removeBccRecipient}
              onCustomEmail={(email) => vm.addCustomEmail(email, "bcc")}
            />
          </>
        )}

        {/* Subject */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={subjectId} className={cn(vm.fieldErrors.subject && "text-destructive")}>
              {t("messaging.email.subject")} *
            </Label>
            <span
              className={cn(
                "text-xs tabular-nums",
                vm.subject.length > SUBJECT_MAX ? "text-destructive" : "text-nx-ink-3"
              )}
            >
              {vm.subject.length}/{SUBJECT_MAX}
            </span>
          </div>
          <div className="flex gap-1.5">
            <Input
              id={subjectId}
              placeholder={t("messaging.email.subjectPlaceholder")}
              value={vm.subject}
              onChange={(e) => vm.setSubject(e.target.value)}
              maxLength={SUBJECT_MAX}
              className={cn(
                "flex-1",
                vm.fieldErrors.subject && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label={t("messaging.email.insertVariable")}
                >
                  <Braces className="h-4 w-4" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="max-h-64 w-64 overflow-y-auto p-0" align="end">
                <div className="border-b border-nx-line p-2">
                  <p className="text-xs font-medium text-nx-ink-3">
                    {t("messaging.email.insertVariableIntoSubject")}
                  </p>
                </div>
                {(vm.allVariables ?? DEFAULT_VARIABLES).map((v) => (
                  <Button
                    key={v.key}
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between gap-2 rounded-none px-3 py-1.5 font-normal"
                    onClick={() => vm.setSubject(vm.subject + `{{ ${v.key} }}`)}
                  >
                    <span className="truncate text-sm">{v.label}</span>
                    <Badge variant="outline" className="shrink-0 px-1 py-0 font-mono text-[10px]">
                      {`{{${v.key}}}`}
                    </Badge>
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Body — Rich Text Editor. RichTextEditor's contenteditable has no
            id/aria-labelledby prop to bind a real htmlFor to (it lives inside
            the shared, unowned rich-text-editor package), so the pairing is a
            labelled group instead of a direct label/control association. */}
        <div className="space-y-2" role="group" aria-labelledby={bodyLabelId}>
          <Label id={bodyLabelId} className={cn(vm.fieldErrors.body && "text-destructive")}>
            {t("messaging.email.body")} *
          </Label>
          <RichTextEditor
            value={vm.body}
            onChange={vm.setBody}
            placeholder={t("messaging.email.bodyPlaceholder")}
            maxLength={BODY_MAX}
            minHeight="250px"
            variables={vm.allVariables ?? DEFAULT_VARIABLES}
            showSourceToggle
            error={vm.fieldErrors.body}
          />
        </div>

        {/* Inline Variable Values — shown when body contains {{ }} */}
        {vm.variableValues && vm.setVariableValues && vm.body.includes("{{") && (
          <VariableValuesPanel
            variables={vm.allVariables ?? DEFAULT_VARIABLES}
            values={vm.variableValues}
            onChange={vm.setVariableValues}
            templateBody={vm.body + " " + vm.subject}
            typeOverrides={vm.typeOverrides}
            onTypeOverridesChange={vm.setTypeOverrides}
            className="max-h-[500px]"
          />
        )}

        {/* Attachments & Schedule — collapsible section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AttachmentUploader
            attachments={vm.attachments}
            onAdd={vm.onAddAttachments}
            onRemove={vm.onRemoveAttachment}
            maxFiles={10}
            maxSizeMb={25}
          />
          <SchedulePicker value={vm.schedule} onChange={vm.onScheduleChange} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-nx-ink-3">{t("messaging.email.ctrlEnterHint")}</p>
          <div className="flex items-center gap-2">
            {vm.onPreview && (
              <Button variant="outline" onClick={vm.onPreview} className="gap-2">
                <Eye className="h-4 w-4" aria-hidden="true" />
                {t("messaging.email.preview")}
              </Button>
            )}
            <Button onClick={vm.handleSend} loading={vm.isSending} className="gap-2">
              {!vm.isSending && <Send className="h-4 w-4" aria-hidden="true" />}
              {t("messaging.email.send")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
