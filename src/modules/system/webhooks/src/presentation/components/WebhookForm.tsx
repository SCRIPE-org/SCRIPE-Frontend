/**
 * WebhookForm
 *
 * Dialog form for creating and editing webhook subscriptions.
 * Includes event type picker with category grouping.
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
import {
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
} from "@core/ui/dialog";
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
      Settings,
      Loader2,
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

      return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                              <DialogTitle>
                                    {mode === "create"
                                          ? t("webhooks.create") || "Create Webhook"
                                          : t("webhooks.edit") || "Edit Webhook"}
                              </DialogTitle>
                              <DialogDescription>
                                    {mode === "create"
                                          ? t("webhooks.createDesc") ||
                                          "Subscribe to events and receive real-time HTTP notifications."
                                          : t("webhooks.editDesc") ||
                                          "Update the webhook subscription settings."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                              {/* ─── Endpoint URL ────────────────────────────────── */}
                              <div className="space-y-2">
                                    <Label htmlFor="webhook-url" className="flex items-center gap-1.5">
                                          <Globe className="h-3.5 w-3.5" />
                                          {t("webhooks.url") || "Endpoint URL"}
                                          <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                          id="webhook-url"
                                          placeholder="https://your-server.com/webhook"
                                          value={vm.url}
                                          onChange={(e) => vm.setUrl(e.target.value)}
                                          className={vm.urlError ? "border-red-300 focus-visible:ring-red-500" : ""}
                                    />
                                    {vm.urlError && (
                                          <p className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {vm.urlError}
                                          </p>
                                    )}
                              </div>

                              {/* ─── Description ─────────────────────────────────── */}
                              <div className="space-y-2">
                                    <Label htmlFor="webhook-desc">
                                          {t("webhooks.description_field") || "Description"}
                                    </Label>
                                    <Input
                                          id="webhook-desc"
                                          placeholder={
                                                t("webhooks.descriptionPlaceholder") ||
                                                "e.g. Production order notifications"
                                          }
                                          value={vm.description}
                                          onChange={(e) => vm.setDescription(e.target.value)}
                                    />
                              </div>

                              {/* ─── Event Type Picker ────────────────────────────── */}
                              <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                          <Label className="flex items-center gap-1.5">
                                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                                {t("webhooks.events") || "Events"}
                                                <span className="text-red-500">*</span>
                                          </Label>
                                          <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-xs">
                                                      {vm.selectedEvents.length} / {vm.availableEvents.length}{" "}
                                                      {t("webhooks.selected") || "selected"}
                                                </Badge>
                                                <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 text-xs px-2"
                                                      onClick={vm.selectAll}
                                                >
                                                      {vm.selectedEvents.length === vm.availableEvents.length
                                                            ? t("webhooks.deselectAll") || "Deselect all"
                                                            : t("webhooks.selectAll") || "Select all"}
                                                </Button>
                                          </div>
                                    </div>

                                    {vm.isLoadingEvents ? (
                                          <div className="space-y-2">
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                      <Skeleton key={i} className="h-12 rounded-lg" />
                                                ))}
                                          </div>
                                    ) : (
                                          <Accordion type="multiple" className="w-full">
                                                {Object.entries(vm.eventsByCategory).map(
                                                      ([category, events]) => {
                                                            const allSelected = events.every((e) =>
                                                                  vm.selectedEvents.includes(e.key)
                                                            );
                                                            const someSelected = events.some((e) =>
                                                                  vm.selectedEvents.includes(e.key)
                                                            );

                                                            return (
                                                                  <AccordionItem key={category} value={category}>
                                                                        <AccordionTrigger className="py-2.5 text-sm hover:no-underline">
                                                                              <div className="flex items-center gap-2 w-full">
                                                                                    <Checkbox
                                                                                          checked={allSelected}
                                                                                          className={
                                                                                                someSelected && !allSelected
                                                                                                      ? "data-[state=unchecked]:bg-primary/20"
                                                                                                      : ""
                                                                                          }
                                                                                          onCheckedChange={() =>
                                                                                                vm.selectAllInCategory(category)
                                                                                          }
                                                                                          onClick={(e) => e.stopPropagation()}
                                                                                    />
                                                                                    <span className="font-medium capitalize">
                                                                                          {category}
                                                                                    </span>
                                                                                    <Badge
                                                                                          variant="outline"
                                                                                          className="ml-auto mr-2 text-xs"
                                                                                    >
                                                                                          {
                                                                                                events.filter((e) =>
                                                                                                      vm.selectedEvents.includes(e.key)
                                                                                                ).length
                                                                                          }{" "}
                                                                                          / {events.length}
                                                                                    </Badge>
                                                                              </div>
                                                                        </AccordionTrigger>
                                                                        <AccordionContent className="pt-1 pb-3">
                                                                              <div className="space-y-1.5 pl-6">
                                                                                    {events.map((event) => (
                                                                                          <label
                                                                                                key={event.key}
                                                                                                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                                                          >
                                                                                                <Checkbox
                                                                                                      checked={vm.selectedEvents.includes(
                                                                                                            event.key
                                                                                                      )}
                                                                                                      onCheckedChange={() =>
                                                                                                            vm.toggleEvent(event.key)
                                                                                                      }
                                                                                                      className="mt-0.5"
                                                                                                />
                                                                                                <div className="min-w-0">
                                                                                                      <p className="text-sm font-mono leading-tight">
                                                                                                            {event.key}
                                                                                                      </p>
                                                                                                      <p className="text-xs text-muted-foreground mt-0.5">
                                                                                                            {event.description}
                                                                                                      </p>
                                                                                                </div>
                                                                                          </label>
                                                                                    ))}
                                                                              </div>
                                                                        </AccordionContent>
                                                                  </AccordionItem>
                                                            );
                                                      }
                                                )}
                                          </Accordion>
                                    )}

                                    {vm.eventsError && (
                                          <p className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {vm.eventsError}
                                          </p>
                                    )}
                              </div>

                              {/* ─── Advanced Settings ────────────────────────────── */}
                              <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="advanced">
                                          <AccordionTrigger className="py-2.5 text-sm hover:no-underline gap-2">
                                                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                                                {t("webhooks.advancedSettings") || "Advanced Settings"}
                                          </AccordionTrigger>
                                          <AccordionContent className="pt-2 pb-0">
                                                <div className="grid grid-cols-2 gap-4 p-1">
                                                      <div className="space-y-2">
                                                            <Label htmlFor="max-retries" className="text-xs">
                                                                  {t("webhooks.maxRetries") || "Max Retries"}
                                                            </Label>
                                                            <Input
                                                                  id="max-retries"
                                                                  type="number"
                                                                  min={0}
                                                                  max={10}
                                                                  value={vm.maxRetries}
                                                                  onChange={(e) =>
                                                                        vm.setMaxRetries(Number(e.target.value))
                                                                  }
                                                                  className="h-8 text-sm"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                  {t("webhooks.maxRetriesDesc") ||
                                                                        "Number of retry attempts on failure (0-10)"}
                                                            </p>
                                                      </div>
                                                      <div className="space-y-2">
                                                            <Label htmlFor="max-failures" className="text-xs">
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
                                                                        vm.setMaxConsecutiveFailures(Number(e.target.value))
                                                                  }
                                                                  className="h-8 text-sm"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                  {t("webhooks.maxFailuresDesc") ||
                                                                        "Auto-disable after this many consecutive failures"}
                                                            </p>
                                                      </div>
                                                </div>
                                          </AccordionContent>
                                    </AccordionItem>
                              </Accordion>
                        </div>

                        <DialogFooter>
                              <Button
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                              >
                                    {t("common.cancel") || "Cancel"}
                              </Button>
                              <Button
                                    onClick={vm.handleSubmit}
                                    disabled={!vm.isValid || vm.isSubmitting}
                              >
                                    {vm.isSubmitting ? (
                                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    ) : null}
                                    {mode === "create"
                                          ? t("webhooks.create") || "Create Webhook"
                                          : t("common.save") || "Save Changes"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
