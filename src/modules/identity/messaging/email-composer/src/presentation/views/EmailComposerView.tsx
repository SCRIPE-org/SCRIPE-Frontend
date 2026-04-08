"use client";

import { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useEmailComposerViewModel } from "../viewmodels/useEmailComposerViewModel";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { Mail, Send, History } from "lucide-react";
import { ComposeSection } from "../components/ComposeSection";
import { HistorySection } from "../components/HistorySection";
import { EmailPreviewDialog } from "../components/EmailPreviewDialog";

export function EmailComposerView() {
      const vm = useEmailComposerViewModel();
      const { t } = useI18n();

      // Ctrl+Enter shortcut
      useEffect(() => {
            function handleKeyDown(e: KeyboardEvent) {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        vm.handleSend();
                  }
            }
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
      }, [vm.handleSend]);

      return (
            <>
                  <div className="space-y-6 p-6">
                        {/* Header */}
                        <div>
                              <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Mail className="h-6 w-6 text-primary" />
                                    {t("messaging.email.title")}
                              </h1>
                              <p className="text-muted-foreground mt-1">{t("messaging.email.description")}</p>
                        </div>

                        <Tabs value={vm.activeTab} onValueChange={(v) => vm.setActiveTab(v as "compose" | "history")}>
                              <TabsList>
                                    <TabsTrigger value="compose" className="gap-1.5">
                                          <Send className="h-4 w-4" />
                                          {t("messaging.email.compose")}
                                    </TabsTrigger>
                                    <TabsTrigger value="history" className="gap-1.5">
                                          <History className="h-4 w-4" />
                                          {t("messaging.email.history")}
                                    </TabsTrigger>
                              </TabsList>

                              <TabsContent value="compose">
                                    <ComposeSection
                                          {...vm}
                                          onPreview={() => vm.setPreviewOpen(true)}
                                          onAddAttachments={vm.addAttachments}
                                          onRemoveAttachment={vm.removeAttachment}
                                          onScheduleChange={vm.setSchedule}
                                    />
                              </TabsContent>

                              <TabsContent value="history">
                                    <HistorySection {...vm} />
                              </TabsContent>
                        </Tabs>
                  </div>

                  {/* Send Confirmation Dialog */}
                  <ConfirmationDialog
                        open={vm.confirmSendOpen}
                        onOpenChange={vm.setConfirmSendOpen}
                        title={t("messaging.email.confirmSendTitle") || "Send Email"}
                        description={t("messaging.email.confirmSendDescription") || "Review the details below before sending."}
                        confirmText={vm.schedule.mode === "scheduled" ? (t("messaging.email.scheduleEmail") || "Schedule") : (t("messaging.email.send") || "Send Now")}
                        cancelText={t("common.cancel") || "Cancel"}
                        onConfirm={vm.confirmSend}
                        isLoading={vm.isSending}
                        variant="info"
                  >
                        <div className="space-y-3 text-sm">
                              {/* Recipients Summary */}
                              <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">To</span>
                                    <span className="font-medium">
                                          {vm.recipients.length} {t("messaging.email.recipientsLabel") || "recipient(s)"}
                                    </span>
                              </div>
                              {vm.ccRecipients.length > 0 && (
                                    <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">CC</span>
                                          <span className="font-medium">{vm.ccRecipients.length}</span>
                                    </div>
                              )}
                              {vm.bccRecipients.length > 0 && (
                                    <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">BCC</span>
                                          <span className="font-medium">{vm.bccRecipients.length}</span>
                                    </div>
                              )}
                              {/* Subject */}
                              <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">{t("messaging.email.subject") || "Subject"}</span>
                                    <span className="font-medium truncate max-w-[200px]">{vm.subject}</span>
                              </div>
                              {/* Attachments */}
                              {vm.attachments.length > 0 && (
                                    <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">Attachments</span>
                                          <span className="font-medium">{vm.attachments.length} file(s)</span>
                                    </div>
                              )}
                              {/* Schedule */}
                              {vm.schedule.mode !== "now" && (
                                    <div className="flex items-center justify-between">
                                          <span className="text-muted-foreground">Schedule</span>
                                          <span className="font-medium capitalize">{vm.schedule.mode}</span>
                                    </div>
                              )}
                        </div>
                  </ConfirmationDialog>

                  {/* Cancel Email Confirmation Dialog */}
                  <ConfirmationDialog
                        open={vm.cancelConfirmOpen}
                        onOpenChange={vm.setCancelConfirmOpen}
                        title={t("messaging.email.cancelConfirmTitle") || "Cancel Email"}
                        description={t("messaging.email.cancelConfirmDescription") || "Are you sure you want to cancel this pending email? This action cannot be undone."}
                        confirmText={t("messaging.email.cancelConfirm") || "Cancel Email"}
                        cancelText={t("common.back") || "Keep"}
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
