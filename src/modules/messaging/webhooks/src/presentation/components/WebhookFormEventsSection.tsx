"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Skeleton } from "@core/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@core/ui/accordion";
import { Zap, Search, AlertCircle } from "lucide-react";
import type { WebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormEventsSectionProps {
  vm: WebhookFormViewModel;
}

export function WebhookFormEventsSection({ vm }: WebhookFormEventsSectionProps) {
  const { t } = useI18n();

  return (
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
  );
}
