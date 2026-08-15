// FILE-EXCEPTION: file length
"use client";

import React, { useMemo, useState, useCallback } from "react";
import DOMPurify from "dompurify";
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
import {
  Monitor,
  Tablet,
  Smartphone,
  PanelRightOpen,
  PanelRightClose,
  Paperclip,
  FileText,
  FileImage,
  FileArchive,
  File as FileIcon,
  Sun,
  Moon,
} from "lucide-react";
import { DEFAULT_VARIABLES } from "@core/ui/rich-text-editor/VariablePicker";
import type { VariableDefinition } from "@core/ui/rich-text-editor/VariablePicker";
import { VariableValuesPanel } from "@core/ui/rich-text-editor/VariableValuesPanel";
import type { VariableValuesMap } from "@core/ui/rich-text-editor/VariableValuesPanel";
import type { AttachmentFile } from "./AttachmentUploader";

// ─── Device Presets ─────────────────────────────────────────
const DEVICES = [
  { id: "desktop", labelKey: "desktop", icon: Monitor, width: 600 },
  { id: "tablet", labelKey: "tablet", icon: Tablet, width: 480 },
  { id: "mobile", labelKey: "mobile", icon: Smartphone, width: 320 },
] as const;

type DeviceId = (typeof DEVICES)[number]["id"];

// ─── Preview Canvas Skins ───────────────────────────────────
// Mirrors the Dark/Light skins in Core.Application/Emails/ScripeEmailTheme.cs so
// admins previewing here see the same canvas the backend actually ships — a dark
// canvas by default (`EmailCanvas.Dark`), with Light reserved for print-intended
// mail. Kept as literal values (not design tokens) because this is a simulation
// of a fixed, backend-owned email canvas, not the admin app's own theme.
const EMAIL_CANVAS_SKIN = {
  dark: { surface: "#0D0D0E", text: "#F7F8F5", link: "#C6FF00" },
  light: { surface: "#F7F8F5", text: "#0D0D0E", link: "#4C6200" },
} as const;
type CanvasTheme = keyof typeof EMAIL_CANVAS_SKIN;

// ─── Language / Direction ───────────────────────────────────
const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
const ARABIC_SCRIPT_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * A manually-composed email isn't tied to a template, so `language` is only
 * ever passed when the caller has it wired through. Absent that, direction is
 * inferred from the actual resolved text — the same signal a mail client uses.
 */
function resolveLangDir(
  explicitLanguage: string | undefined,
  text: string
): { lang: string; dir: "rtl" | "ltr" } {
  if (explicitLanguage) {
    return { lang: explicitLanguage, dir: RTL_LANGS.has(explicitLanguage) ? "rtl" : "ltr" };
  }
  const dir = ARABIC_SCRIPT_RE.test(text) ? "rtl" : "ltr";
  return { lang: dir === "rtl" ? "ar" : "en", dir };
}

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
/**
 * Interface defining property specifications, keys types, and structural contract rules for email preview dialog props.
 */
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
  /** Controlled type overrides from parent (sync with compose panel) */
  typeOverrides?: Record<string, string>;
  /** Called when type overrides change */
  onTypeOverridesChange?: (overrides: Record<string, string>) => void;
  /** Attachments to display in preview */
  attachments?: AttachmentFile[];
  /**
   * BCP-47 language of the content being sent (e.g. "en", "ar"). Drives the
   * preview iframe's `dir`/`lang`. A manually-composed email has no template
   * language of its own to thread through, so when this is omitted the
   * preview falls back to detecting the script of the resolved text.
   */
  language?: string;
}

/**
 * Presentation UI component rendering the email preview dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function EmailPreviewDialog({
  open,
  onOpenChange,
  subject,
  body,
  recipients,
  customVariables,
  variableValues: controlledValues,
  onVariableValuesChange,
  typeOverrides: controlledTypeOverrides,
  onTypeOverridesChange,
  attachments = [],
  language,
}: EmailPreviewDialogProps) {
  const { t } = useI18n();
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [showVariables, setShowVariables] = useState(false);
  // Defaults to dark: that's what EmailCanvas.Dark ships to recipients by
  // default (see ScripeEmailTheme.cs) — the toggle lets admins also check the
  // Light variant reserved for print-intended mail.
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dark");
  // Use controlled values from parent if provided, otherwise local state
  const [localValues, setLocalValues] = useState<VariableValuesMap>({});
  const variableValues = controlledValues ?? localValues;
  const setVariableValues = useCallback(
    (v: VariableValuesMap) => {
      if (onVariableValuesChange) onVariableValuesChange(v);
      else setLocalValues(v);
    },
    [onVariableValuesChange]
  );

  // Merge default + custom variables, deduplicating by key
  // Custom variables win over defaults with the same key
  const allVariables = useMemo(() => {
    if (!customVariables?.length) return DEFAULT_VARIABLES;
    const customKeys = new Set(customVariables.map((v) => v.key));
    const uniqueDefaults = DEFAULT_VARIABLES.filter((v) => !customKeys.has(v.key));
    return [...uniqueDefaults, ...customVariables];
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

  // Same DOMPurify allow-list as templates/PreviewDialog.tsx — one sanitization
  // policy for every surface that renders admin- or lead-controlled HTML into a
  // srcDoc iframe, instead of each preview inventing its own regex denylist.
  const sanitizedBody = useMemo(
    () =>
      resolvedBody
        ? DOMPurify.sanitize(resolvedBody, {
            ALLOWED_TAGS: [
              "h1",
              "h2",
              "h3",
              "h4",
              "h5",
              "h6",
              "p",
              "br",
              "hr",
              "span",
              "div",
              "strong",
              "b",
              "em",
              "i",
              "u",
              "s",
              "ul",
              "ol",
              "li",
              "table",
              "thead",
              "tbody",
              "tr",
              "th",
              "td",
              "a",
              "img",
              "blockquote",
              "pre",
              "code",
            ],
            ALLOWED_ATTR: [
              "href",
              "src",
              "alt",
              "class",
              "style",
              "target",
              "rel",
              "width",
              "height",
            ],
            ALLOW_DATA_ATTR: false,
          })
        : "",
    [resolvedBody]
  );

  const { lang: previewLang, dir: previewDir } = useMemo(
    () => resolveLangDir(language, `${resolvedSubject} ${resolvedBody}`),
    [language, resolvedSubject, resolvedBody]
  );

  const skin = EMAIL_CANVAS_SKIN[canvasTheme];

  const previewSrcDoc = useMemo(
    () =>
      `<!DOCTYPE html><html dir="${previewDir}" lang="${previewLang}"><head><meta charset="utf-8"/><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.6;color:${skin.text};padding:16px;background:${skin.surface}}img{max-width:100%;height:auto}a{color:${skin.link}}</style></head><body>${sanitizedBody}</body></html>`,
    [previewDir, previewLang, skin, sanitizedBody]
  );

  const currentDevice = DEVICES.find((d) => d.id === device)!;

  // Count how many variables are in the template
  const templateVarCount = useMemo(() => {
    const combined = (subject || "") + (body || "");
    const matches = combined.match(/\{\{\s*\w+/g);
    return matches ? new Set(matches.map((m) => m.replace(/\{\{\s*/, ""))).size : 0;
  }, [subject, body]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto", showVariables ? "max-w-6xl" : "max-w-4xl")}
      >
        <DialogHeader>
          <DialogTitle>{t("messaging.email.previewTitle")}</DialogTitle>
          <DialogDescription>{t("messaging.email.previewDescription")}</DialogDescription>
        </DialogHeader>

        <div
          className={cn("pt-2", showVariables ? "grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]" : "")}
        >
          {/* Main Preview */}
          <div className="space-y-4">
            {/* Recipients */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-nx-ink-2">{t("messaging.email.to")}</p>
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
              <p className="text-sm font-medium text-nx-ink-2">{t("messaging.email.subject")}</p>
              <p className="text-base font-semibold text-nx-ink">{resolvedSubject || "—"}</p>
            </div>

            {/* Controls: Device Switcher + Variable Toggle */}
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-1 rounded-nx-md border border-nx-line bg-nx-raised p-1">
                {DEVICES.map((d) => {
                  const Icon = d.icon;
                  return (
                    <Button
                      key={d.id}
                      type="button"
                      variant={device === d.id ? "default" : "ghost"}
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => setDevice(d.id)}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {t(`messaging.email.${d.labelKey}`)}
                    </Button>
                  );
                })}
              </div>
              {templateVarCount > 0 && (
                <Button
                  type="button"
                  variant={showVariables ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setShowVariables(!showVariables)}
                >
                  {showVariables ? (
                    <PanelRightClose className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <PanelRightOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {t("messaging.email.variablesPanel")}
                  <Badge variant="secondary" className="h-4 px-1 py-0 text-[10px]">
                    {templateVarCount}
                  </Badge>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setCanvasTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              >
                {canvasTheme === "dark" ? (
                  <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {canvasTheme === "dark" ? t("theme.dark") : t("theme.light")}
              </Button>
            </div>

            {/* Body Preview */}
            <div className="flex justify-center">
              <div
                className={cn(
                  "overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface",
                  device === "mobile" && "border-2"
                )}
                style={{
                  width: `${currentDevice.width}px`,
                  maxWidth: "100%",
                }}
              >
                {/* Simulated browser/device bar — our own chrome, so it follows
                    the nx surface ladder like every other toolbar. */}
                <div className="flex items-center gap-1.5 border-b border-nx-line bg-nx-raised px-3 py-2">
                  <div className="flex gap-1" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="font-mono text-[10px] tabular-nums text-nx-ink-3">
                      {currentDevice.width}px
                    </span>
                  </div>
                </div>

                {/* Email Content — this is the recipient's paper, not our chrome.
                    The backend ships a fixed dark canvas by default (EmailCanvas.Dark
                    in ScripeEmailTheme.cs) with no light-mode media query, so this
                    pane follows the canvasTheme toggle above rather than staying
                    hardcoded white — the toggle defaults to dark to match. */}
                <div style={{ background: skin.surface }}>
                  {resolvedBody.includes("<") ? (
                    <iframe
                      srcDoc={previewSrcDoc}
                      sandbox="allow-same-origin"
                      className="w-full border-0"
                      style={{ minHeight: "200px", height: "400px" }}
                      title={t("messaging.email.previewTitle")}
                      onLoad={(e) => {
                        const iframe = e.currentTarget;
                        try {
                          const body = iframe.contentDocument?.body;
                          if (body) {
                            iframe.style.height = `${Math.min(body.scrollHeight + 32, 600)}px`;
                          }
                        } catch {
                          /* sandbox restriction */
                        }
                      }}
                    />
                  ) : (
                    <pre
                      dir={previewDir}
                      lang={previewLang}
                      className="whitespace-pre-wrap p-4 font-sans text-sm"
                      style={{ color: skin.text }}
                    >
                      {resolvedBody}
                    </pre>
                  )}
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="border-t border-nx-line bg-nx-raised p-4">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-nx-ink-3" aria-hidden="true" />
                      <span className="text-xs font-medium text-nx-ink-2">
                        {t("messaging.email.attachmentsCount", { count: attachments.length })}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((a) => {
                        const isImage = a.type.startsWith("image/");
                        const isPdf = a.type === "application/pdf";
                        const isArchive =
                          a.type.includes("zip") ||
                          a.type.includes("rar") ||
                          a.type.includes("tar");
                        const Icon = isImage
                          ? FileImage
                          : isPdf
                            ? FileText
                            : isArchive
                              ? FileArchive
                              : FileIcon;
                        const sizeStr =
                          a.size < 1024
                            ? `${a.size} B`
                            : a.size < 1048576
                              ? `${(a.size / 1024).toFixed(1)} KB`
                              : `${(a.size / 1048576).toFixed(1)} MB`;
                        return (
                          <div
                            key={a.id}
                            className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-surface px-3 py-2 text-xs"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
                            <div className="min-w-0">
                              <p className="max-w-[150px] truncate font-medium text-nx-ink">
                                {a.name}
                              </p>
                              <p className="text-nx-ink-3">{sizeStr}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Variable Values Sidebar */}
          {showVariables && (
            <VariableValuesPanel
              variables={allVariables}
              values={variableValues}
              onChange={setVariableValues}
              templateBody={body + " " + subject}
              typeOverrides={controlledTypeOverrides}
              onTypeOverridesChange={onTypeOverridesChange}
              className="sticky top-0 max-h-[70vh]"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
