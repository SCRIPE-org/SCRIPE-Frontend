// UI-EXCEPTION: compact studio layout
"use client";

import React, { useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useNotificationSenderViewModel } from "../viewmodels/useNotificationSenderViewModel";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { PageHeader } from "@core/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Bell, Send, RotateCcw } from "lucide-react";
import { cn } from "@core/common/utils";
import { NotificationTargetSelector } from "../components/NotificationTargetSelector";
import type { NotificationType, NotificationCategory } from "../../domain/entities/Notification";

const TITLE_MAX = 150;
const MESSAGE_MAX = 2000;

/**
 * Presentation UI component rendering the notification sender view.
 * Arranges layout boundaries and accessibility targets using the shared design system.
 * Coordinates recipient targeting, message composition, and dispatch confirmation.
 *
 * @returns An accessible, interactive notification dispatch interface.
 */
export function NotificationSenderView(): React.JSX.Element {
  const vm = useNotificationSenderViewModel();
  const { t } = useI18n();
  const targetsId = React.useId();
  const titleId = React.useId();
  const messageId = React.useId();
  const categoryId = React.useId();
  const typeId = React.useId();
  const actionUrlId = React.useId();

  // Keyboard shortcut: Ctrl/Cmd + Enter to trigger sending
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        vm.handleSend();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [vm]);

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          icon={Bell}
          title={t("messaging.notifications.title")}
          description={t("messaging.notifications.description")}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("messaging.notifications.sendTitle")}</CardTitle>
                <CardDescription>{t("messaging.notifications.sendDescription")}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={vm.resetForm}
                className="gap-1.5 text-nx-ink-2"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                {t("messaging.notifications.clearForm")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Recipients Selection */}
            <NotificationTargetSelector
              inputId={targetsId}
              selectedTargets={vm.selectedTargets}
              searchQuery={vm.targetSearch}
              searchResults={vm.targetResults}
              isSearching={vm.isSearchingTargets}
              isSearchError={vm.isTargetSearchError}
              hasError={vm.fieldErrors.targets}
              onSearchChange={vm.setTargetSearch}
              onAddTarget={vm.addTarget}
              onRemoveTarget={vm.removeTarget}
            />

            {/* Notification Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={titleId} className={cn(vm.fieldErrors.title && "text-destructive")}>
                  {t("messaging.notifications.notifTitle")} *
                </Label>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    vm.title.length > TITLE_MAX ? "text-destructive" : "text-nx-ink-3"
                  )}
                >
                  {vm.title.length}/{TITLE_MAX}
                </span>
              </div>
              <Input
                id={titleId}
                placeholder={t("messaging.notifications.titlePlaceholder")}
                value={vm.title}
                onChange={(e) => vm.setTitle(e.target.value)}
                maxLength={TITLE_MAX}
                className={cn(
                  vm.fieldErrors.title && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>

            {/* Message Body Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={messageId}
                  className={cn(vm.fieldErrors.message && "text-destructive")}
                >
                  {t("messaging.notifications.message")} *
                </Label>
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    vm.message.length > MESSAGE_MAX ? "text-destructive" : "text-nx-ink-3"
                  )}
                >
                  {vm.message.length.toLocaleString()}/{MESSAGE_MAX.toLocaleString()}
                </span>
              </div>
              <Textarea
                id={messageId}
                placeholder={t("messaging.notifications.messagePlaceholder")}
                value={vm.message}
                onChange={(e) => vm.setMessage(e.target.value)}
                rows={5}
                className={cn(
                  vm.fieldErrors.message && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>

            {/* Classification: Category & Type */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={categoryId}>{t("messaging.notifications.category")}</Label>
                <GenericSelect
                  id={categoryId}
                  aria-label={t("messaging.notifications.category")}
                  options={vm.categoryOptions}
                  value={vm.category}
                  onValueChange={(v: string | string[]) =>
                    vm.setCategory(v as NotificationCategory)
                  }
                  placeholder={t("messaging.notifications.category")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={typeId}>{t("messaging.notifications.type")}</Label>
                <GenericSelect
                  id={typeId}
                  aria-label={t("messaging.notifications.type")}
                  options={vm.typeOptions}
                  value={vm.type}
                  onValueChange={(v: string | string[]) => vm.setType(v as NotificationType)}
                  placeholder={t("messaging.notifications.type")}
                />
              </div>
            </div>

            {/* Optional Deep Link Action URL */}
            <div className="space-y-2">
              <Label htmlFor={actionUrlId}>{t("messaging.notifications.actionUrl")}</Label>
              <Input
                id={actionUrlId}
                placeholder={t("messaging.notifications.actionUrlPlaceholder")}
                value={vm.actionUrl}
                onChange={(e) => vm.setActionUrl(e.target.value)}
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-nx-ink-3">{t("messaging.notifications.ctrlEnterHint")}</p>
              <Button onClick={vm.handleSend} loading={vm.isSending} className="gap-2">
                {!vm.isSending && <Send className="h-4 w-4" aria-hidden="true" />}
                {t("messaging.notifications.send")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dispatch Confirmation Dialog */}
      <ConfirmationDialog
        open={vm.confirmSendOpen}
        onOpenChange={vm.setConfirmSendOpen}
        title={t("messaging.notifications.confirmSendTitle")}
        description={t("messaging.notifications.confirmSendDescription", {
          count: vm.selectedTargets.length,
        })}
        confirmText={t("messaging.notifications.send")}
        cancelText={t("common.cancel")}
        onConfirm={vm.confirmSend}
        isLoading={vm.isSending}
        variant="info"
      />
    </>
  );
}
