"use client";

import { useTemplateFormViewModel } from "../viewmodels/useTemplateFormViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import { RichTextEditor } from "@core/ui/rich-text-editor/RichTextEditor";
import { DEFAULT_VARIABLES } from "@core/ui/rich-text-editor/VariablePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { ArrowLeft, Save, Loader2, Settings, Palette, Braces, Eye } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PlaceholderSchemaBuilder } from "../components/PlaceholderSchemaBuilder";
import { DesignVariablesPanel } from "../components/DesignVariablesPanel";
import { TemplateLivePreview } from "../components/TemplateLivePreview";

export function TemplateFormView({ templateId: _templateId }: { templateId?: string } = {}) {
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

                              {/* Body — Rich Text Editor */}
                              <Card>
                                    <CardHeader>
                                          <CardTitle>{vm.t("messaging.templates.body") || "Body"}</CardTitle>
                                          <CardDescription>
                                                {vm.t("messaging.templates.bodyDescription") || "Template body content with placeholders"}
                                          </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                          <RichTextEditor
                                                value={vm.form.body}
                                                onChange={(html) => vm.updateField("body", html)}
                                                placeholder={vm.t("messaging.templates.bodyPlaceholder") || "Template body..."}
                                                minHeight="400px"
                                                variables={DEFAULT_VARIABLES}
                                                showSourceToggle
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
                              {/* Tabbed sidebar for Settings, Placeholders, Design */}
                              <Card>
                                    <Tabs defaultValue="settings">
                                          <CardHeader className="pb-3">
                                                <TabsList className="w-full h-auto flex-wrap gap-1 p-1">
                                                      <TabsTrigger value="settings" className="flex-1 min-w-0 gap-1 px-2 text-xs">
                                                            <Settings className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="hidden sm:inline truncate">{vm.t("messaging.templates.settings") || "Settings"}</span>
                                                      </TabsTrigger>
                                                      <TabsTrigger value="placeholders" className="flex-1 min-w-0 gap-1 px-2 text-xs">
                                                            <Braces className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="hidden sm:inline truncate">{vm.t("messaging.templates.placeholders") || "Variables"}</span>
                                                      </TabsTrigger>
                                                      <TabsTrigger value="design" className="flex-1 min-w-0 gap-1 px-2 text-xs">
                                                            <Palette className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="hidden sm:inline truncate">{vm.t("messaging.templates.design.title") || "Design"}</span>
                                                      </TabsTrigger>
                                                      <TabsTrigger value="preview" className="flex-1 min-w-0 gap-1 px-2 text-xs">
                                                            <Eye className="h-3.5 w-3.5 shrink-0" />
                                                            <span className="hidden sm:inline truncate">{vm.t("common.preview") || "Preview"}</span>
                                                      </TabsTrigger>
                                                </TabsList>
                                          </CardHeader>

                                          {/* Settings Tab */}
                                          <TabsContent value="settings">
                                                <CardContent className="space-y-5 pt-0">
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

                                                      {/* Category */}
                                                      <div className="space-y-2">
                                                            <Label>{vm.t("messaging.templates.category") || "Category"}</Label>
                                                            <Select
                                                                  value={vm.form.category}
                                                                  onValueChange={(v) => vm.updateField("category", v as any)}
                                                            >
                                                                  <SelectTrigger>
                                                                        <SelectValue placeholder={vm.t("messaging.templates.selectCategory") || "Select category..."} />
                                                                  </SelectTrigger>
                                                                  <SelectContent>
                                                                        {vm.categoryOptions.map((opt) => (
                                                                              <SelectItem key={opt.value} value={opt.value}>
                                                                                    {vm.t(`messaging.templates.categories.${opt.label}`)}
                                                                              </SelectItem>
                                                                        ))}
                                                                  </SelectContent>
                                                            </Select>
                                                      </div>
                                                </CardContent>
                                          </TabsContent>

                                          {/* Placeholders Tab */}
                                          <TabsContent value="placeholders">
                                                <CardContent className="pt-0">
                                                      <PlaceholderSchemaBuilder
                                                            fields={vm.form.placeholderSchema}
                                                            onChange={vm.updatePlaceholderFields}
                                                            templateBody={vm.form.body + " " + vm.form.subject}
                                                      />
                                                </CardContent>
                                          </TabsContent>

                                          {/* Design Variables Tab */}
                                          <TabsContent value="design">
                                                <CardContent className="pt-0">
                                                      <DesignVariablesPanel
                                                            value={vm.form.designVariables}
                                                            onChange={vm.updateDesignVariables}
                                                      />
                                                </CardContent>
                                          </TabsContent>

                                          {/* Live Preview Tab */}
                                          <TabsContent value="preview">
                                                <CardContent className="pt-0">
                                                      <TemplateLivePreview
                                                            body={vm.form.body}
                                                            subject={vm.form.subject}
                                                      />
                                                </CardContent>
                                          </TabsContent>
                                    </Tabs>
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
