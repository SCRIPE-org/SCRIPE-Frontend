// UI-EXCEPTION: compact studio layout
"use client";

import React, { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useNotificationSenderViewModel } from "../viewmodels/useNotificationSenderViewModel";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { PageHeader } from "@core/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Bell, Send, X, RotateCcw, Search } from "lucide-react";
import { cn } from "@core/common/utils";
import type { NotificationType, NotificationCategory } from "../../domain/entities/Notification";

const TITLE_MAX = 150;
const MESSAGE_MAX = 2000;

/**
 * Presentation UI component rendering the notification sender view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function NotificationSenderView() {
  const vm = useNotificationSenderViewModel();
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
  }, [vm, vm.handleSend]);

  // Close target dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const noResults =
    vm.targetSearch.length >= 2 &&
    !vm.isSearchingTargets &&
    !vm.isTargetSearchError &&
    vm.targetResults.length === 0;

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
            {/* Targets */}
            <div className="space-y-2">
              <Label className={cn(vm.fieldErrors.targets && "text-destructive")}>
                {t("messaging.notifications.targets")} *
              </Label>
              {vm.selectedTargets.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {vm.selectedTargets.map((target) => (
                    <Badge key={target.id} variant="secondary" className="gap-1">
                      {target.name}
                      <span className="text-xs text-nx-ink-3">({target.type})</span>
                      <button
                        type="button"
                        onClick={() => vm.removeTarget(target.id)}
                        className="rounded-full hover:text-destructive focus-visible:shadow-nx-focus focus-visible:outline-none"
                        aria-label={t("messaging.notifications.removeTargetNamed", {
                          name: target.name,
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
                    placeholder={t("messaging.notifications.searchTargets")}
                    value={vm.targetSearch}
                    onChange={(e) => {
                      vm.setTargetSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className={cn(
                      "ps-9",
                      vm.fieldErrors.targets && "border-destructive focus-visible:ring-destructive"
                    )}
                  />
                  {vm.isSearchingTargets && (
                    <LoadingSpinner
                      size="inline"
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-nx-ink-3"
                    />
                  )}
                </div>
                {showDropdown && vm.targetSearch.length >= 2 && (
                  <div className="absolute top-full z-dropdown mt-1 max-h-48 w-full overflow-y-auto rounded-nx-md border border-nx-line bg-nx-popover shadow-nx-popover">
                    {vm.targetResults.length > 0 ? (
                      vm.targetResults.map((target) => (
                        <button
                          key={`${target.type}-${target.id}`}
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-nx-hover focus-visible:bg-nx-hover focus-visible:outline-none"
                          onClick={() => {
                            vm.addTarget(target);
                            setShowDropdown(false);
                          }}
                        >
                          <span className="font-medium text-nx-ink">{target.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {target.type}
                          </Badge>
                        </button>
                      ))
                    ) : vm.isTargetSearchError ? (
                      <div className="px-3 py-4 text-center text-sm text-destructive">
                        {t("common.error")}
                      </div>
                    ) : (
                      noResults && (
                        <div className="px-3 py-4 text-center text-sm text-nx-ink-3">
                          <Search className="mx-auto mb-1 h-5 w-5 opacity-40" aria-hidden="true" />
                          {t("messaging.notifications.noTargetsFound")}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={cn(vm.fieldErrors.title && "text-destructive")}>
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
                placeholder={t("messaging.notifications.titlePlaceholder")}
                value={vm.title}
                onChange={(e) => vm.setTitle(e.target.value)}
                maxLength={TITLE_MAX}
                className={cn(
                  vm.fieldErrors.title && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={cn(vm.fieldErrors.message && "text-destructive")}>
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
                placeholder={t("messaging.notifications.messagePlaceholder")}
                value={vm.message}
                onChange={(e) => vm.setMessage(e.target.value)}
                rows={5}
                className={cn(
                  vm.fieldErrors.message && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("messaging.notifications.category")}</Label>
                <GenericSelect
                  options={vm.categoryOptions}
                  value={vm.category}
                  onValueChange={(v: string | string[]) =>
                    vm.setCategory(v as NotificationCategory)
                  }
                  placeholder={t("messaging.notifications.category")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("messaging.notifications.type")}</Label>
                <GenericSelect
                  options={vm.typeOptions}
                  value={vm.type}
                  onValueChange={(v: string | string[]) => vm.setType(v as NotificationType)}
                  placeholder={t("messaging.notifications.type")}
                />
              </div>
            </div>

            {/* Action URL */}
            <div className="space-y-2">
              <Label>{t("messaging.notifications.actionUrl")}</Label>
              <Input
                placeholder={t("messaging.notifications.actionUrlPlaceholder")}
                value={vm.actionUrl}
                onChange={(e) => vm.setActionUrl(e.target.value)}
              />
            </div>

            {/* Actions */}
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

      {/* Send Confirmation Dialog */}
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
