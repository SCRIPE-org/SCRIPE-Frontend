"use client";

import React, { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useNotificationSenderViewModel } from "../viewmodels/useNotificationSenderViewModel";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Bell, Send, X, Loader2, RotateCcw, Search } from "lucide-react";
import { cn } from "@core/common/utils";
import type { NotificationType, NotificationCategory } from "../../domain/entities/Notification";

const TITLE_MAX = 150;
const MESSAGE_MAX = 2000;

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
      }, [vm.handleSend]);

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

      const noResults = vm.targetSearch.length >= 2 && !vm.isSearchingTargets && vm.targetResults.length === 0;

      return (
            <>
                  <div className="space-y-6 p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                              <div>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                          <Bell className="h-6 w-6 text-primary" />
                                          {t("messaging.notifications.title")}
                                    </h1>
                                    <p className="text-muted-foreground mt-1">{t("messaging.notifications.description")}</p>
                              </div>
                        </div>

                        <Card>
                              <CardHeader>
                                    <div className="flex items-center justify-between">
                                          <div>
                                                <CardTitle>{t("messaging.notifications.sendTitle")}</CardTitle>
                                                <CardDescription>{t("messaging.notifications.sendDescription")}</CardDescription>
                                          </div>
                                          <Button variant="ghost" size="sm" onClick={vm.resetForm} className="gap-1.5 text-muted-foreground">
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                {t("messaging.notifications.clearForm") || "Clear"}
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
                                                <div className="flex flex-wrap gap-1.5 mb-2">
                                                      {vm.selectedTargets.map((target) => (
                                                            <Badge key={target.id} variant="secondary" className="gap-1">
                                                                  {target.name}
                                                                  <span className="text-xs text-muted-foreground">({target.type})</span>
                                                                  <button
                                                                        onClick={() => vm.removeTarget(target.id)}
                                                                        className="hover:text-destructive"
                                                                        aria-label={`Remove ${target.name}`}
                                                                  >
                                                                        <X className="h-3 w-3" />
                                                                  </button>
                                                            </Badge>
                                                      ))}
                                                </div>
                                          )}
                                          <div className="relative" ref={dropdownRef}>
                                                <div className="relative">
                                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                      <Input
                                                            placeholder={t("messaging.notifications.searchTargets")}
                                                            value={vm.targetSearch}
                                                            onChange={(e) => { vm.setTargetSearch(e.target.value); setShowDropdown(true); }}
                                                            onFocus={() => setShowDropdown(true)}
                                                            className={cn("pl-9", vm.fieldErrors.targets && "border-destructive focus-visible:ring-destructive")}
                                                      />
                                                      {vm.isSearchingTargets && (
                                                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                                      )}
                                                </div>
                                                {showDropdown && vm.targetSearch.length >= 2 && (
                                                      <div className="absolute z-10 top-full mt-1 w-full border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
                                                            {vm.targetResults.length > 0
                                                                  ? vm.targetResults.map((target) => (
                                                                        <button
                                                                              key={`${target.type}-${target.id}`}
                                                                              className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex justify-between items-center"
                                                                              onClick={() => { vm.addTarget(target); setShowDropdown(false); }}
                                                                        >
                                                                              <span className="font-medium">{target.name}</span>
                                                                              <Badge variant="outline" className="text-xs">
                                                                                    {target.type}
                                                                              </Badge>
                                                                        </button>
                                                                  ))
                                                                  : noResults && (
                                                                        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                                                              <Search className="h-5 w-5 mx-auto mb-1 opacity-40" />
                                                                              {t("common.noResults") || "No targets found"}
                                                                        </div>
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
                                                <span className={cn(
                                                      "text-xs",
                                                      vm.title.length > TITLE_MAX ? "text-destructive" : "text-muted-foreground"
                                                )}>
                                                      {vm.title.length}/{TITLE_MAX}
                                                </span>
                                          </div>
                                          <Input
                                                placeholder={t("messaging.notifications.titlePlaceholder")}
                                                value={vm.title}
                                                onChange={(e) => vm.setTitle(e.target.value)}
                                                maxLength={TITLE_MAX}
                                                className={cn(vm.fieldErrors.title && "border-destructive focus-visible:ring-destructive")}
                                          />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                                <Label className={cn(vm.fieldErrors.message && "text-destructive")}>
                                                      {t("messaging.notifications.message")} *
                                                </Label>
                                                <span className={cn(
                                                      "text-xs",
                                                      vm.message.length > MESSAGE_MAX ? "text-destructive" : "text-muted-foreground"
                                                )}>
                                                      {vm.message.length.toLocaleString()}/{MESSAGE_MAX.toLocaleString()}
                                                </span>
                                          </div>
                                          <Textarea
                                                placeholder={t("messaging.notifications.messagePlaceholder")}
                                                value={vm.message}
                                                onChange={(e) => vm.setMessage(e.target.value)}
                                                rows={5}
                                                className={cn(vm.fieldErrors.message && "border-destructive focus-visible:ring-destructive")}
                                          />
                                    </div>

                                    {/* Category & Priority */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                                <Label>{t("messaging.notifications.category")}</Label>
                                                <GenericSelect
                                                      options={vm.categoryOptions}
                                                      value={vm.category}
                                                      onValueChange={(v: string | string[]) => vm.setCategory(v as NotificationCategory)}
                                                      placeholder={t("messaging.notifications.category")}
                                                />
                                          </div>

                                          <div className="space-y-2">
                                                <Label>{t("messaging.notifications.type") || "Type"}</Label>
                                                <GenericSelect
                                                      options={vm.typeOptions}
                                                      value={vm.type}
                                                      onValueChange={(v: string | string[]) => vm.setType(v as NotificationType)}
                                                      placeholder={t("messaging.notifications.type") || "Type"}
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
                                          <p className="text-xs text-muted-foreground">
                                                {t("messaging.notifications.ctrlEnterHint") || "Ctrl+Enter to send"}
                                          </p>
                                          <Button onClick={vm.handleSend} loading={vm.isSending} className="gap-2">
                                                {!vm.isSending && <Send className="h-4 w-4" />}
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
                        title={t("messaging.notifications.confirmSendTitle") || "Send Notification"}
                        description={
                              `${t("messaging.notifications.confirmSendDescription") || "Send this notification to"} ${vm.selectedTargets.length} ${t("messaging.notifications.targetsLabel") || "target(s)"}?`
                        }
                        confirmText={t("messaging.notifications.send") || "Send Notification"}
                        cancelText={t("common.cancel") || "Cancel"}
                        onConfirm={vm.confirmSend}
                        isLoading={vm.isSending}
                        variant="info"
                  />
            </>
      );
}
