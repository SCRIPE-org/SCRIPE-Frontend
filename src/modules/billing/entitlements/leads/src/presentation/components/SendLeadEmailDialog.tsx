"use client";

import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Send, Mail } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PlatformLead } from "../../domain/entities/PlatformLead";

// ── Built-in templates ────────────────────────────────────────────────────────
// Subject/body copy is bilingual content, so it lives in the locale shard
// (leads.email.templates.<key>) and is resolved through t() — only the
// [Contact Name] / [Company Name] fill tokens stay literal across languages.

const TEMPLATE_LOCALE_KEYS = {
  "initial-contact": "initialContact",
  "follow-up": "followUp",
  "demo-invitation": "demoInvitation",
} as const;

type TemplateKey = keyof typeof TEMPLATE_LOCALE_KEYS | "custom";

// ── Props ─────────────────────────────────────────────────────────────────────

interface SendLeadEmailDialogProps {
  open: boolean;
  lead: PlatformLead | null;
  isSending: boolean;
  onClose: () => void;
  onSend: (params: {
    leadId: string;
    subject: string;
    bodyHtml: string;
    templateKey?: string;
  }) => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the send lead email dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SendLeadEmailDialog({
  open,
  lead,
  isSending,
  onClose,
  onSend,
}: SendLeadEmailDialogProps) {
  const { t } = useI18n();

  const [templateKey, setTemplateKey] = useState<TemplateKey>("custom");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  const applyTemplate = (key: string) => {
    setTemplateKey(key as TemplateKey);

    const localeKey = TEMPLATE_LOCALE_KEYS[key as keyof typeof TEMPLATE_LOCALE_KEYS];
    if (!localeKey) {
      setSubject("");
      setBodyHtml("");
      return;
    }

    const fill = (s: string) =>
      s
        .replace(/\[Contact Name\]/g, lead?.contactName ?? "")
        .replace(/\[Company Name\]/g, lead?.companyName ?? "");
    setSubject(fill(t(`leads.email.templates.${localeKey}.subject`)));
    setBodyHtml(fill(t(`leads.email.templates.${localeKey}.body`)));
  };

  const reset = () => {
    setTemplateKey("custom");
    setSubject("");
    setBodyHtml("");
  };

  const handleClose = () => {
    if (isSending) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lead || !subject.trim() || bodyHtml.trim().length < 10) return;
    await onSend({
      leadId: lead.id,
      subject: subject.trim(),
      bodyHtml: bodyHtml.trim(),
      templateKey: templateKey !== "custom" ? templateKey : undefined,
    });
    reset();
    onClose();
  };

  const isValid = subject.trim().length > 0 && bodyHtml.trim().length >= 10;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isSending) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
              <Mail className="h-5 w-5 text-info" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle>{t("leads.email.dialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("leads.email.dialogSubtitle", { email: lead?.email ?? "" })}
              </DialogDescription>
            </div>
          </div>

          {lead && (
            <div className="mt-2 rounded-nx-md border border-nx-line bg-nx-raised px-4 py-3">
              <p className="text-sm font-medium text-nx-ink">{lead.companyName}</p>
              <p className="text-xs text-nx-ink-2">
                {lead.contactName} — {lead.email}
              </p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Template selector */}
          <div className="space-y-1.5">
            <Label>{t("leads.email.template")}</Label>
            <Select value={templateKey} onValueChange={applyTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">{t("leads.email.templateCustom")}</SelectItem>
                <SelectItem value="initial-contact">
                  {t("leads.email.templateInitialContact")}
                </SelectItem>
                <SelectItem value="follow-up">{t("leads.email.templateFollowUp")}</SelectItem>
                <SelectItem value="demo-invitation">
                  {t("leads.email.templateDemoInvitation")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="lead-email-subject">{t("leads.email.subject")}</Label>
            <Input
              id="lead-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("leads.email.subjectPlaceholder")}
              disabled={isSending}
              maxLength={500}
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="lead-email-body">{t("leads.email.body")}</Label>
            <Textarea
              id="lead-email-body"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder={t("leads.email.bodyPlaceholder")}
              disabled={isSending}
              rows={9}
              className="resize-none font-mono text-xs"
            />
            <p className="text-xs leading-relaxed text-nx-ink-3">{t("leads.email.bodyHint")}</p>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSending}>
              {t("leads.email.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSending || !isValid}
              loading={isSending}
              className="gap-2 bg-info text-info-foreground hover:bg-info/90"
            >
              {isSending ? (
                t("leads.email.sending")
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {t("leads.email.send")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
