"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useNotificationSenderViewModel } from "../viewmodels/useNotificationSenderViewModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Label } from "@core/ui/label";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import { Bell, Send, X, Loader2 } from "lucide-react";
import type { NotificationCategory, NotificationPriority } from "../../domain/entities/Notification";

export function NotificationSenderView() {
      const vm = useNotificationSenderViewModel();
      const { t } = useI18n();

      return (
            <div className="space-y-6 p-6">
                  {/* Header */}
                  <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                              <Bell className="h-6 w-6 text-primary" />
                              {t("messaging.notifications.title")}
                        </h1>
                        <p className="text-muted-foreground mt-1">{t("messaging.notifications.description")}</p>
                  </div>

                  <Card>
                        <CardHeader>
                              <CardTitle>{t("messaging.notifications.sendTitle")}</CardTitle>
                              <CardDescription>{t("messaging.notifications.sendDescription")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                              {/* Targets */}
                              <div className="space-y-2">
                                    <Label>{t("messaging.notifications.targets")}</Label>
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                          {vm.selectedTargets.map((target) => (
                                                <Badge key={target.id} variant="secondary" className="gap-1">
                                                      {target.name}
                                                      <span className="text-xs text-muted-foreground">({target.type})</span>
                                                      <button onClick={() => vm.removeTarget(target.id)} className="hover:text-destructive">
                                                            <X className="h-3 w-3" />
                                                      </button>
                                                </Badge>
                                          ))}
                                    </div>
                                    <div className="relative">
                                          <Input
                                                placeholder={t("messaging.notifications.searchTargets")}
                                                value={vm.targetSearch}
                                                onChange={(e) => vm.setTargetSearch(e.target.value)}
                                          />
                                          {vm.targetSearch.length >= 2 && vm.targetResults.length > 0 && (
                                                <div className="absolute z-10 top-full mt-1 w-full border rounded-md bg-popover shadow-lg max-h-48 overflow-y-auto">
                                                      {vm.targetResults.map((target) => (
                                                            <button
                                                                  key={`${target.type}-${target.id}`}
                                                                  className="w-full px-3 py-2 text-sm text-left hover:bg-accent flex justify-between items-center"
                                                                  onClick={() => vm.addTarget(target)}
                                                            >
                                                                  <span>{target.name}</span>
                                                                  <Badge variant="outline" className="text-xs">
                                                                        {target.type}
                                                                  </Badge>
                                                            </button>
                                                      ))}
                                                </div>
                                          )}
                                    </div>
                              </div>

                              {/* Title */}
                              <div className="space-y-2">
                                    <Label>{t("messaging.notifications.notifTitle")}</Label>
                                    <Input
                                          placeholder={t("messaging.notifications.titlePlaceholder")}
                                          value={vm.title}
                                          onChange={(e) => vm.setTitle(e.target.value)}
                                    />
                              </div>

                              {/* Message */}
                              <div className="space-y-2">
                                    <Label>{t("messaging.notifications.message")}</Label>
                                    <Textarea
                                          placeholder={t("messaging.notifications.messagePlaceholder")}
                                          value={vm.message}
                                          onChange={(e) => vm.setMessage(e.target.value)}
                                          rows={5}
                                    />
                              </div>

                              {/* Category & Priority */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                          <Label>{t("messaging.notifications.category")}</Label>
                                          <Select value={vm.category} onValueChange={(v) => vm.setCategory(v as NotificationCategory)}>
                                                <SelectTrigger>
                                                      <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      {vm.categoryOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                  {opt.label}
                                                            </SelectItem>
                                                      ))}
                                                </SelectContent>
                                          </Select>
                                    </div>

                                    <div className="space-y-2">
                                          <Label>{t("messaging.notifications.priority")}</Label>
                                          <Select value={vm.priority} onValueChange={(v) => vm.setPriority(v as NotificationPriority)}>
                                                <SelectTrigger>
                                                      <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      {vm.priorityOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                  {opt.label}
                                                            </SelectItem>
                                                      ))}
                                                </SelectContent>
                                          </Select>
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

                              {/* Send */}
                              <Button onClick={vm.handleSend} disabled={vm.isSending} className="gap-2">
                                    {vm.isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {t("messaging.notifications.send")}
                              </Button>
                        </CardContent>
                  </Card>
            </div>
      );
}
