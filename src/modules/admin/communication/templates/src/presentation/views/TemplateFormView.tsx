// FILE-EXCEPTION: file length
"use client";

import { useTemplateFormViewModel } from "../viewmodels/useTemplateFormViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import { DEFAULT_VARIABLES } from "@core/ui/rich-text-editor/VariablePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { ArrowLeft, Save, Settings, Palette, Braces, Eye } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { ErrorMessage } from "@core/ui/error-message";
import dynamic from "next/dynamic";

// Lazy-load heavy components (RichTextEditor ~150KB+ TipTap, sidebar panels)
const RichTextEditor = dynamic(
  () =>
    import("@core/ui/rich-text-editor/RichTextEditor").then((m) => ({ default: m.RichTextEditor })),
  { ssr: false }
);
const PlaceholderSchemaBuilder = dynamic(
  () =>
    import("../components/PlaceholderSchemaBuilder").then((m) => ({
      default: m.PlaceholderSchemaBuilder,
    })),
  { ssr: false }
);
const DesignVariablesPanel = dynamic(
  () =>
    import("../components/DesignVariablesPanel").then((m) => ({ default: m.DesignVariablesPanel })),
  { ssr: false }
);
const TemplateLivePreview = dynamic(
  () =>
    import("../components/TemplateLivePreview").then((m) => ({ default: m.TemplateLivePreview })),
  { ssr: false }
);

/**
 * Presentation UI component rendering the template form view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TemplateFormView({ templateId: _templateId }: { templateId?: string } = {}) {
  const vm = useTemplateFormViewModel();

  // Edit mode has three real states: the initial fetch, a settled failure
  // (bad id, deleted template, network error), and a settled success. A
  // failed fetch must show an error with a retry — never fall through to the
  // form's default empty values, which would look like a legitimate blank
  // edit and silently create a duplicate on submit instead of updating the
  // template the admin thought they were editing.
  if (vm.mode === "edit" && vm.isFetching) {
    return <LoadingSpinner />;
  }

  if (vm.mode === "edit" && vm.fetchError) {
    return (
      <ErrorMessage message={vm.t("common.error")} onRetry={() => vm.refetch()} fullHeight />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={vm.handleCancel}
          aria-label={vm.t("common.back")}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-xl font-bold leading-tight tracking-tight text-balance text-nx-ink">
            {vm.title}
          </h1>
          <p className="text-nx-ink-2">
            {vm.mode === "create"
              ? vm.t("messaging.templates.createDescription")
              : vm.t("messaging.templates.editDescription")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content — left 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Subject */}
          <Card>
            <CardHeader>
              <CardTitle>{vm.t("messaging.templates.subject")}</CardTitle>
              <CardDescription>{vm.t("messaging.templates.subjectDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={vm.form.subject}
                onChange={(e) => vm.updateField("subject", e.target.value)}
                placeholder={vm.t("messaging.templates.subjectPlaceholder")}
              />
            </CardContent>
          </Card>

          {/* Body — Rich Text Editor */}
          <Card>
            <CardHeader>
              <CardTitle>{vm.t("messaging.templates.body")}</CardTitle>
              <CardDescription>{vm.t("messaging.templates.bodyDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={vm.form.body}
                onChange={(html) => vm.updateField("body", html)}
                placeholder={vm.t("messaging.templates.bodyPlaceholder")}
                minHeight="400px"
                variables={DEFAULT_VARIABLES}
                showSourceToggle
              />
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>{vm.t("messaging.templates.descriptionLabel")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={vm.form.description}
                onChange={(e) => vm.updateField("description", e.target.value)}
                placeholder={vm.t("messaging.templates.descriptionPlaceholder")}
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
                <TabsList className="h-auto w-full flex-wrap gap-1 p-1">
                  <TabsTrigger value="settings" className="min-w-0 flex-1 gap-1 px-2 text-xs">
                    <Settings className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden truncate sm:inline">
                      {vm.t("messaging.templates.settings")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="placeholders" className="min-w-0 flex-1 gap-1 px-2 text-xs">
                    <Braces className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden truncate sm:inline">
                      {vm.t("messaging.templates.placeholders")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="design" className="min-w-0 flex-1 gap-1 px-2 text-xs">
                    <Palette className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden truncate sm:inline">
                      {vm.t("messaging.templates.design.title")}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="min-w-0 flex-1 gap-1 px-2 text-xs">
                    <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden truncate sm:inline">
                      {vm.t("common.preview")}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <CardContent className="space-y-5 pt-0">
                  {/* Template Key (create only) */}
                  {vm.mode === "create" && (
                    <div className="space-y-2">
                      <Label>{vm.t("messaging.templates.key")}</Label>
                      <Input
                        value={vm.form.key}
                        onChange={(e) => vm.updateField("key", e.target.value)}
                        placeholder={vm.t("messaging.templates.keyPlaceholder")}
                      />
                    </div>
                  )}

                  {/* Channel (create only) */}
                  {vm.mode === "create" && (
                    <div className="space-y-2">
                      <Label>{vm.t("messaging.templates.channel")}</Label>
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
                      <Label>{vm.t("messaging.templates.language")}</Label>
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
                    <Label>{vm.t("common.active")}</Label>
                    <Switch
                      checked={vm.form.isActive}
                      onCheckedChange={(v) => vm.updateField("isActive", v)}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>{vm.t("messaging.templates.category")}</Label>
                    <Select
                      value={vm.form.category}
                      onValueChange={(v) => vm.updateField("category", v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={vm.t("messaging.templates.selectCategory")} />
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
                  <TemplateLivePreview body={vm.form.body} subject={vm.form.subject} />
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Button
                className="w-full"
                onClick={vm.handleSubmit}
                disabled={!vm.form.body}
                loading={vm.isSaving}
              >
                {!vm.isSaving && <Save className="me-2 h-4 w-4" aria-hidden="true" />}
                {vm.isSaving ? vm.t("common.saving") : vm.t("common.save")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={vm.handleCancel}
                disabled={vm.isSaving}
              >
                {vm.t("common.cancel")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
