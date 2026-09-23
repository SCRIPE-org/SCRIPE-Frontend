"use client";

import { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useEmailComposerViewModel } from "../viewmodels/useEmailComposerViewModel";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { PageHeader } from "@core/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Mail, Send, History } from "lucide-react";
import { ComposeSection } from "../components/ComposeSection";
import { HistorySection } from "../components/HistorySection";
import { EmailPreviewDialog } from "../components/EmailPreviewDialog";

/**
 * Presentation UI component rendering the email composer view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function EmailComposerView() {
  const vm = useEmailComposerViewModel();
  const { t } = useI18n();

  const handleSend = vm.handleSend;
  // Ctrl+Enter shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend]);

  return (
    <>
      <Tabs value={vm.activeTab} onValueChange={(v) => vm.setActiveTab(v as "compose" | "history")}>
        <PageHeader
          icon={Mail}
          title={t("messaging.email.title")}
          description={t("messaging.email.description")}
          tabs={
            <TabsList>
              <TabsTrigger value="compose" className="gap-1.5">
                <Send className="h-4 w-4" aria-hidden="true" />
                {t("messaging.email.compose")}
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                <History className="h-4 w-4" aria-hidden="true" />
                {t("messaging.email.history")}
              </TabsTrigger>
            </TabsList>
          }
        />

        <TabsContent value="compose" className="mt-6">
          <ComposeSection
            {...vm}
            onPreview={() => vm.setPreviewOpen(true)}
            onAddAttachments={vm.addAttachments}
            onRemoveAttachment={vm.removeAttachment}
            onScheduleChange={vm.setSchedule}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistorySection {...vm} />
        </TabsContent>
      </Tabs>

      {/* Send Confirmation Dialog */}
      <ConfirmationDialog
        open={vm.confirmSendOpen}
        onOpenChange={vm.setConfirmSendOpen}
        title={t("messaging.email.confirmSendTitle")}
        description={t("messaging.email.confirmSendDescription")}
        confirmText={
          vm.schedule.mode === "scheduled"
            ? t("messaging.email.scheduleEmail")
            : t("messaging.email.send")
        }
        cancelText={t("common.cancel")}
        onConfirm={vm.confirmSend}
        isLoading={vm.isSending}
        variant="info"
      >
        <div className="space-y-3 text-sm">
          {/* Recipients Summary */}
          <div className="flex items-center justify-between">
            <span className="text-nx-ink-2">{t("messaging.email.to")}</span>
            <span className="font-medium text-nx-ink">
              {vm.recipients.length} {t("messaging.email.recipientsLabel")}
            </span>
          </div>
          {vm.ccRecipients.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-nx-ink-2">{t("messaging.email.cc")}</span>
              <span className="font-medium text-nx-ink">{vm.ccRecipients.length}</span>
            </div>
          )}
          {vm.bccRecipients.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-nx-ink-2">{t("messaging.email.bcc")}</span>
              <span className="font-medium text-nx-ink">{vm.bccRecipients.length}</span>
            </div>
          )}
          {/* Subject */}
          <div className="flex items-center justify-between">
            <span className="text-nx-ink-2">{t("messaging.email.subject")}</span>
            <span className="max-w-[200px] truncate font-medium text-nx-ink">{vm.subject}</span>
          </div>
          {/* Attachments */}
          {vm.attachments.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-nx-ink-2">{t("messaging.email.attachments")}</span>
              <span className="font-medium text-nx-ink">
                {t("messaging.email.attachmentCountLabel", { count: vm.attachments.length })}
              </span>
            </div>
          )}
          {/* Schedule */}
          {vm.schedule.mode !== "now" && (
            <div className="flex items-center justify-between">
              <span className="text-nx-ink-2">{t("messaging.email.schedule")}</span>
              <span className="font-medium text-nx-ink">
                {vm.schedule.mode === "scheduled"
                  ? t("messaging.email.scheduled")
                  : t("messaging.email.recurring")}
              </span>
            </div>
          )}
        </div>
      </ConfirmationDialog>

      {/* Cancel Email Confirmation Dialog */}
      <ConfirmationDialog
        open={vm.cancelConfirmOpen}
        onOpenChange={vm.setCancelConfirmOpen}
        title={t("messaging.email.cancelConfirmTitle")}
        description={t("messaging.email.cancelConfirmDescription")}
        confirmText={t("messaging.email.cancelConfirm")}
        cancelText={t("messaging.email.keepPending")}
        onConfirm={vm.confirmCancelEmail}
        isLoading={vm.isCancelling}
        variant="destructive"
      />

      {/* Email Preview Dialog */}
      <EmailPreviewDialog
        open={vm.previewOpen}
        onOpenChange={vm.setPreviewOpen}
        subject={vm.subject}
        body={vm.body}
        recipients={vm.recipients.map((r) => r.email)}
        customVariables={vm.templateVariables}
        variableValues={vm.variableValues}
        onVariableValuesChange={vm.setVariableValues}
        typeOverrides={vm.typeOverrides}
        onTypeOverridesChange={vm.setTypeOverrides}
        attachments={vm.attachments}
      />
    </>
  );
}
