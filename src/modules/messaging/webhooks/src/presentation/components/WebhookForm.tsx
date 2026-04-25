/**
 * WebhookForm
 *
 * Modal form for creating and editing webhook subscriptions.
 * Uses GenericModal for consistent styling + blur/scroll behavior.
 * Organized in visual sections: Endpoint → Events → Options.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useWebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Badge } from "@core/ui/badge";
import { Checkbox } from "@core/ui/checkbox";
import { Skeleton } from "@core/ui/skeleton";
import { Textarea } from "@core/ui/textarea";
import { Separator } from "@core/ui/separator";
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
import { ScrollArea } from "@core/ui/scroll-area";
import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
} from "@core/ui/accordion";
import type { WebhookSubscription } from "../../domain/entities/Webhook";
import {
      Globe,
      Zap,
      AlertCircle,
      Settings2,
      Loader2,
      ShieldCheck,
      Network,
      CheckCircle2,
      Search,
} from "lucide-react";

interface WebhookFormProps {
      mode: "create" | "edit";
      webhook?: WebhookSubscription | null;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onSuccess: () => void;
}

export function WebhookForm({
      mode,
      webhook,
      open,
      onOpenChange,
      onSuccess,
}: WebhookFormProps) {
      const { t } = useI18n();
      const vm = useWebhookFormViewModel({ mode, webhook, onSuccess });

      const title =
            mode === "create"
                  ? t("webhooks.create") || "Create Webhook"
                  : t("webhooks.edit") || "Edit Webhook";

      const description =
            mode === "create"
                  ? t("webhooks.createDesc") ||
                  "Subscribe to events and receive real-time HTTP notifications."
                  : t("webhooks.editDesc") ||
                  "Update the webhook subscription settings.";

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-2xl p-0 flex flex-col max-h-[85vh]">
                        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
                              <DialogTitle>{title}</DialogTitle>
                              <DialogDescription>{description}</DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="flex-1 overflow-y-auto">
                              <div className="space-y-8 px-6 py-6">
                        {/* ═══════════════════════════════════════════════════════
                         *  SECTION 1: Endpoint
                         * ═══════════════════════════════════════════════════════ */}
                        <section className="space-y-5">
                              <div className="flex items-center gap-2.5">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                          <Globe className="h-4 w-4" />
                                    </div>
                                    <div>
                                          <h3 className="text-sm font-semibold">
                                                {t("webhooks.form.endpointSection") || "Endpoint"}
                                          </h3>
                                          <p className="text-xs text-muted-foreground">
                                                {t("webhooks.form.endpointSectionDesc") ||
                                                      "Where webhook events will be delivered"}
                                          </p>
                                    </div>
                              </div>

                              {/* Endpoint URL */}
                              <div className="space-y-2">
                                    <Label htmlFor="webhook-url" className="text-sm font-medium">
                                          {t("webhooks.url") || "Endpoint URL"}
                                          <span className="text-red-500 ml-0.5">*</span>
                                    </Label>
                                    <div className="relative">
                                          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                          <Input
                                                id="webhook-url"
                                                placeholder={
                                                      t("webhooks.urlPlaceholder") ||
                                                      "https://your-server.com/webhook"
                                                }
                                                value={vm.url}
                                                onChange={(e) => vm.setUrl(e.target.value)}
                                                className={`ps-9 font-mono text-sm ${vm.urlError
                                                      ? "border-red-300 focus-visible:ring-red-500"
                                                      : vm.url && !vm.urlError
                                                            ? "border-emerald-300 focus-visible:ring-emerald-500"
                                                            : ""
                                                      }`}
                                          />
                                          {vm.url && !vm.urlError && (
                                                <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
                                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                </div>
                                          )}
                                    </div>
                                    {vm.urlError && (
                                          <p className="text-xs text-red-600 flex items-center gap-1.5 mt-1">
                                                <AlertCircle className="h-3 w-3 shrink-0" />
                                                {vm.urlError}
                                          </p>
                                    )}
                              </div>

                              {/* Description */}
                              <div className="space-y-2">
                                    <Label htmlFor="webhook-desc" className="text-sm font-medium">
                                          {t("webhooks.description_field") || "Description"}
                                    </Label>
                                    <Textarea
                                          id="webhook-desc"
                                          placeholder={
                                                t("webhooks.descriptionPlaceholder") ||
                                                "e.g. Production order notifications"
                                          }
                                          value={vm.description}
                                          onChange={(e) => vm.setDescription(e.target.value)}
                                          rows={2}
                                          className="resize-none text-sm"
                                    />
                              </div>

                              {/* Include Children Toggle */}
                              <div className="flex items-start gap-3.5 p-3.5 rounded-xl border bg-muted/30 transition-colors hover:bg-muted/50">
                                    <Checkbox
                                          id="include-children"
                                          checked={vm.includeChildren}
                                          onCheckedChange={(checked) =>
                                                vm.setIncludeChildren(checked === true)
                                          }
                                          className="mt-0.5"
                                    />
                                    <div className="space-y-1">
                                          <Label
                                                htmlFor="include-children"
                                                className="text-sm font-medium leading-none cursor-pointer"
                                          >
                                                <div className="flex items-center gap-2">
                                                      <Network className="h-3.5 w-3.5 text-muted-foreground" />
                                                      {t("webhooks.includeChildren") ||
                                                            "Include Child Tenants"}
                                                </div>
                                          </Label>
                                          <p className="text-xs text-muted-foreground leading-relaxed">
                                                {t("webhooks.includeChildrenDesc") ||
                                                      "Receive events from this tenant and all descendant tenants"}
                                          </p>
                                    </div>
                              </div>
                        </section>

                        <Separator />

                        {/* ═══════════════════════════════════════════════════════
                         *  SECTION 2: Event Subscriptions
                         * ═══════════════════════════════════════════════════════ */}
                        <section className="space-y-5">
                              <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                <Zap className="h-4 w-4" />
                                          </div>
                                          <div>
                                                <h3 className="text-sm font-semibold">
                                                      {t("webhooks.form.eventsSection") ||
                                                            "Event Subscriptions"}
                                                      <span className="text-red-500 ml-0.5">*</span>
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                      {t("webhooks.form.eventsSectionDesc") ||
                                                            "Choose which events you want to be notified about"}
                                                </p>
                                          </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                          <Badge
                                                variant={
                                                      vm.selectedEvents.length > 0
                                                            ? "default"
                                                            : "secondary"
                                                }
                                                className="text-xs tabular-nums"
                                          >
                                                {vm.selectedEvents.length} / {vm.availableEvents.length}{" "}
                                                {t("webhooks.selected") || "selected"}
                                          </Badge>
                                          <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs px-2.5"
                                                onClick={vm.selectAll}
                                          >
                                                {vm.selectedEvents.length ===
                                                      vm.availableEvents.length
                                                      ? t("webhooks.deselectAll") || "Deselect all"
                                                      : t("webhooks.selectAll") || "Select all"}
                                          </Button>
                                    </div>
                              </div>

                              {/* Event search filter */}
                              <div className="relative">
                                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                          placeholder={t("webhooks.form.searchEvents") || "Search events..."}
                                          value={vm.eventSearchTerm}
                                          onChange={(e) => vm.setEventSearchTerm(e.target.value)}
                                          className="ps-9 h-9 text-sm rounded-lg"
                                    />
                              </div>

                              {vm.isLoadingEvents ? (
                                    <div className="space-y-2.5">
                                          {Array.from({ length: 3 }).map((_, i) => (
                                                <Skeleton key={i} className="h-14 rounded-xl" />
                                          ))}
                                    </div>
                              ) : Object.keys(vm.eventsByCategory).length === 0 && vm.eventSearchTerm.trim() ? (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                          <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                          <p>{t("webhooks.form.noEventsFound") || "No events match your search"}</p>
                                    </div>
                              ) : (
                                    <div className="rounded-xl border overflow-hidden">
                                          <Accordion type="multiple" className="w-full">
                                                {Object.entries(vm.eventsByCategory).map(
                                                      ([category, events]) => {
                                                            const allSelected = events.every((e) =>
                                                                  vm.selectedEvents.includes(e.key)
                                                            );
                                                            const someSelected = events.some((e) =>
                                                                  vm.selectedEvents.includes(e.key)
                                                            );
                                                            const selectedCount = events.filter(
                                                                  (e) => vm.selectedEvents.includes(e.key)
                                                            ).length;

                                                            return (
                                                                  <AccordionItem
                                                                        key={category}
                                                                        value={category}
                                                                        className="border-b last:border-b-0"
                                                                  >
                                                                        <div className="flex items-center gap-2.5 pe-3 hover:bg-muted/40 transition-colors">
                                                                              <Checkbox
                                                                                    checked={allSelected}
                                                                                    className={`ms-4 ${someSelected && !allSelected
                                                                                          ? "data-[state=unchecked]:bg-primary/20"
                                                                                          : ""
                                                                                          }`}
                                                                                    onCheckedChange={() =>
                                                                                          vm.selectAllInCategory(
                                                                                                category
                                                                                          )
                                                                                    }
                                                                              />
                                                                              <AccordionTrigger className="py-3 px-1 text-sm hover:no-underline flex-1 hover:bg-transparent">
                                                                                    <div className="flex items-center gap-2 w-full text-start">
                                                                                          <span className="font-medium capitalize">
                                                                                                {category}
                                                                                          </span>
                                                                                          <Badge
                                                                                                variant={
                                                                                                      selectedCount > 0
                                                                                                            ? "default"
                                                                                                            : "outline"
                                                                                                }
                                                                                                className="ms-auto me-1 text-xs tabular-nums"
                                                                                          >
                                                                                                {selectedCount} /{" "}
                                                                                                {events.length}
                                                                                          </Badge>
                                                                                    </div>
                                                                              </AccordionTrigger>
                                                                        </div>
                                                                        <AccordionContent className="pt-0 pb-2">
                                                                              <div className="space-y-0.5 px-4 ps-10">
                                                                                    {events.map((event) => {
                                                                                          const isSelected =
                                                                                                vm.selectedEvents.includes(
                                                                                                      event.key
                                                                                                );
                                                                                          return (
                                                                                                <label
                                                                                                      key={event.key}
                                                                                                      className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${isSelected
                                                                                                            ? "bg-primary/5 border border-primary/20"
                                                                                                            : "hover:bg-muted/50 border border-transparent"
                                                                                                            }`}
                                                                                                >
                                                                                                      <Checkbox
                                                                                                            checked={isSelected}
                                                                                                            onCheckedChange={() =>
                                                                                                                  vm.toggleEvent(
                                                                                                                        event.key
                                                                                                                  )
                                                                                                            }
                                                                                                            className="mt-0.5"
                                                                                                      />
                                                                                                      <div className="min-w-0 flex-1">
                                                                                                            <p className="text-sm leading-tight font-medium">
                                                                                                                  {(t(`webhooks.eventNames.${event.key}`) || event.description || event.key) as string}
                                                                                                            </p>
                                                                                                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5 leading-relaxed">
                                                                                                                  {event.key}
                                                                                                            </p>
                                                                                                      </div>
                                                                                                </label>
                                                                                          );
                                                                                    })}
                                                                              </div>
                                                                        </AccordionContent>
                                                                  </AccordionItem>
                                                            );
                                                      }
                                                )}
                                          </Accordion>
                                    </div>
                              )}

                              {vm.eventsError && (
                                    <p className="text-xs text-red-600 flex items-center gap-1.5">
                                          <AlertCircle className="h-3 w-3 shrink-0" />
                                          {vm.eventsError}
                                    </p>
                              )}
                        </section>

                        <Separator />

                        {/* ═══════════════════════════════════════════════════════
                         *  SECTION 3: Options (Collapsible)
                         * ═══════════════════════════════════════════════════════ */}
                        <section className="space-y-4">
                              <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem
                                          value="options"
                                          className="border rounded-xl px-1"
                                    >
                                          <AccordionTrigger className="py-3 px-3 text-sm hover:no-underline gap-2.5">
                                                <div className="flex items-center gap-2.5">
                                                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                                            <Settings2 className="h-4 w-4" />
                                                      </div>
                                                      <div className="text-start">
                                                            <p className="text-sm font-semibold">
                                                                  {t("webhooks.form.optionsSection") ||
                                                                        "Options"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground font-normal">
                                                                  {t("webhooks.form.optionsSectionDesc") ||
                                                                        "Additional delivery and retry settings"}
                                                            </p>
                                                      </div>
                                                </div>
                                          </AccordionTrigger>
                                          <AccordionContent className="px-3 pb-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                                                      {/* Max Retries */}
                                                      <div className="space-y-2">
                                                            <Label
                                                                  htmlFor="max-retries"
                                                                  className="text-sm font-medium"
                                                            >
                                                                  {t("webhooks.maxRetries") || "Max Retries"}
                                                            </Label>
                                                            <Input
                                                                  id="max-retries"
                                                                  type="number"
                                                                  min={0}
                                                                  max={10}
                                                                  value={vm.maxRetries}
                                                                  onChange={(e) =>
                                                                        vm.setMaxRetries(
                                                                              Number(e.target.value)
                                                                        )
                                                                  }
                                                                  className="text-sm"
                                                            />
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                  {t("webhooks.maxRetriesDesc") ||
                                                                        "Number of retry attempts on failure (0-10)"}
                                                            </p>
                                                      </div>

                                                      {/* Auto-disable Threshold */}
                                                      <div className="space-y-2">
                                                            <Label
                                                                  htmlFor="max-failures"
                                                                  className="text-sm font-medium"
                                                            >
                                                                  {t("webhooks.maxConsecutiveFailures") ||
                                                                        "Auto-disable Threshold"}
                                                            </Label>
                                                            <Input
                                                                  id="max-failures"
                                                                  type="number"
                                                                  min={1}
                                                                  max={100}
                                                                  value={vm.maxConsecutiveFailures}
                                                                  onChange={(e) =>
                                                                        vm.setMaxConsecutiveFailures(
                                                                              Number(e.target.value)
                                                                        )
                                                                  }
                                                                  className="text-sm"
                                                            />
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                  {t("webhooks.maxFailuresDesc") ||
                                                                        "Auto-disable after this many consecutive failures"}
                                                            </p>
                                                      </div>
                                                </div>
                                          </AccordionContent>
                                    </AccordionItem>
                              </Accordion>
                        </section>

                              </div>
                        </ScrollArea>

                        {/* ─── Sticky Footer ─────────────────────────────────── */}
                        <DialogFooter className="px-6 py-4 border-t shrink-0">
                              <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    className="min-w-[100px]"
                              >
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button
                                    onClick={vm.handleSubmit}
                                    disabled={!vm.isValid}
                                    loading={vm.isSubmitting}
                                    className="min-w-[140px]"
                              >
                                    {mode === "create"
                                          ? t("webhooks.create") || "Create Webhook"
                                          : t("common.save") || "Save Changes"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
