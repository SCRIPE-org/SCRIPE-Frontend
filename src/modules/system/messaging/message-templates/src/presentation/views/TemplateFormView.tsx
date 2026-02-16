"use client";

import { useTemplateFormViewModel } from "../viewmodels/useTemplateFormViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";

export function TemplateFormView() {
      const vm = useTemplateFormViewModel();

      if (vm.isFetching) {
            return <LoadingSpinner />;
      }

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={vm.handleCancel}>
                              <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                              <h1 className="text-2xl font-bold tracking-tight">{vm.title}</h1>
                              <p className="text-muted-foreground">
                                    {vm.mode === "create"
                                          ? vm.t("messaging.templates.createDescription") || "Create a new message template"
                                          : vm.t("messaging.templates.editDescription") || "Edit template details"}
                              </p>
                        </div>
                  </div>

                  {/* Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main content — left 2/3 */}
                        <div className="lg:col-span-2 space-y-6">
                              {/* Subject */}
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{vm.t("messaging.templates.subject") || "Subject"}</CardTitle>
                                          <CardDescription>
                                                {vm.t("messaging.templates.subjectDescription") || "Email subject line (optional for SMS/Push)"}
                                          </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                          <Input
                                                value={vm.form.subject}
                                                onChange={(e) => vm.updateField("subject", e.target.value)}
                                                placeholder={vm.t("messaging.templates.subjectPlaceholder") || "e.g., Welcome to {{company}}"}
                                          />
                                    </CardContent>
                              </Card>

                              {/* Body */}
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{vm.t("messaging.templates.body") || "Body"}</CardTitle>
                                          <CardDescription>
                                                {vm.t("messaging.templates.bodyDescription") || "Template body content with placeholders"}
                                          </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                          <Textarea
                                                value={vm.form.body}
                                                onChange={(e) => vm.updateField("body", e.target.value)}
                                                placeholder={vm.t("messaging.templates.bodyPlaceholder") || "Template body..."}
                                                rows={20}
                                                className="font-mono text-sm min-h-[400px]"
                                          />
                                    </CardContent>
                              </Card>

                              {/* Description */}
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{vm.t("messaging.templates.descriptionLabel") || "Description"}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                          <Textarea
                                                value={vm.form.description}
                                                onChange={(e) => vm.updateField("description", e.target.value)}
                                                placeholder={vm.t("messaging.templates.descriptionPlaceholder") || "Brief description of when this template is used..."}
                                                rows={3}
                                          />
                                    </CardContent>
                              </Card>
                        </div>

                        {/* Sidebar — right 1/3 */}
                        <div className="space-y-6">
                              {/* Settings */}
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{vm.t("messaging.templates.settings") || "Settings"}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                          {/* Template Key (create only) */}
                                          {vm.mode === "create" && (
                                                <div className="space-y-2">
                                                      <Label>{vm.t("messaging.templates.key") || "Template Key"}</Label>
                                                      <Input
                                                            value={vm.form.key}
                                                            onChange={(e) => vm.updateField("key", e.target.value)}
                                                            placeholder="e.g., welcome-email"
                                                      />
                                                </div>
                                          )}

                                          {/* Channel (create only) */}
                                          {vm.mode === "create" && (
                                                <div className="space-y-2">
                                                      <Label>{vm.t("messaging.templates.channel") || "Channel"}</Label>
                                                      <Select
                                                            value={vm.form.channel}
                                                            onValueChange={(v) => vm.updateField("channel", v as any)}
                                                      >
                                                            <SelectTrigger>
                                                                  <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                  {vm.channelOptions.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                              {opt.label}
                                                                        </SelectItem>
                                                                  ))}
                                                            </SelectContent>
                                                      </Select>
                                                </div>
                                          )}

                                          {/* Language (create only) */}
                                          {vm.mode === "create" && (
                                                <div className="space-y-2">
                                                      <Label>{vm.t("messaging.templates.language") || "Language"}</Label>
                                                      <Select
                                                            value={vm.form.language}
                                                            onValueChange={(v) => vm.updateField("language", v)}
                                                      >
                                                            <SelectTrigger>
                                                                  <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                  {vm.languageOptions.map((opt) => (
                                                                        <SelectItem key={opt.value} value={opt.value}>
                                                                              {opt.label}
                                                                        </SelectItem>
                                                                  ))}
                                                            </SelectContent>
                                                      </Select>
                                                </div>
                                          )}

                                          {/* Active toggle */}
                                          <div className="flex items-center justify-between">
                                                <Label>{vm.t("common.active") || "Active"}</Label>
                                                <Switch
                                                      checked={vm.form.isActive}
                                                      onCheckedChange={(v) => vm.updateField("isActive", v)}
                                                />
                                          </div>
                                    </CardContent>
                              </Card>

                              {/* Actions */}
                              <Card>
                                    <CardContent className="pt-6 space-y-3">
                                          <Button
                                                className="w-full gradient-primary"
                                                onClick={vm.handleSubmit}
                                                disabled={vm.isSaving || !vm.form.body}
                                          >
                                                {vm.isSaving ? (
                                                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {vm.t("common.saving") || "Saving..."}</>
                                                ) : (
                                                      <><Save className="mr-2 h-4 w-4" /> {vm.t("common.save") || "Save"}</>
                                                )}
                                          </Button>
                                          <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={vm.handleCancel}
                                                disabled={vm.isSaving}
                                          >
                                                {vm.t("common.cancel") || "Cancel"}
                                          </Button>
                                    </CardContent>
                              </Card>
                        </div>
                  </div>
            </div>
      );
}
