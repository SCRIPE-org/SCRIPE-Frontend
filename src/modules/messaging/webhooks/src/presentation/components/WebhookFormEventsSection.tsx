"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { Skeleton } from "@core/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@core/ui/accordion";
import { Zap, Search, AlertCircle } from "lucide-react";
import type { WebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormEventsSectionProps {
  vm: WebhookFormViewModel;
}

/**
 * Presentation UI component rendering the webhook form events section.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhookFormEventsSection({ vm }: WebhookFormEventsSectionProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {t("webhooks.form.eventsSection") || "Event Subscriptions"}
              <span className="ml-0.5 text-red-500">*</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("webhooks.form.eventsSectionDesc") ||
                "Choose which events you want to be notified about"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={vm.selectedEvents.length > 0 ? "default" : "secondary"}
            className="text-xs tabular-nums"
          >
            {vm.selectedEvents.length} / {vm.availableEvents.length}{" "}
            {t("webhooks.selected") || "selected"}
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={vm.selectAll}>
            {vm.selectedEvents.length === vm.availableEvents.length
              ? t("webhooks.deselectAll") || "Deselect all"
              : t("webhooks.selectAll") || "Select all"}
          </Button>
        </div>
      </div>

      {/* Event search filter */}
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("webhooks.form.searchEvents") || "Search events..."}
          value={vm.eventSearchTerm}
          onChange={(e) => vm.setEventSearchTerm(e.target.value)}
          className="h-9 rounded-lg ps-9 text-sm"
        />
      </div>

      {vm.isLoadingEvents ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : Object.keys(vm.eventsByCategory).length === 0 && vm.eventSearchTerm.trim() ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          <Search className="mx-auto mb-2 h-8 w-8 opacity-40" />
          <p>{t("webhooks.form.noEventsFound") || "No events match your search"}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Accordion type="multiple" className="w-full">
            {Object.entries(vm.eventsByCategory).map(([category, events]) => {
              const allSelected = events.every((e) => vm.selectedEvents.includes(e.key));
              const someSelected = events.some((e) => vm.selectedEvents.includes(e.key));
              const selectedCount = events.filter((e) => vm.selectedEvents.includes(e.key)).length;

              return (
                <AccordionItem key={category} value={category} className="border-b last:border-b-0">
                  <div className="flex items-center gap-2.5 pe-3 transition-colors hover:bg-muted/40">
                    <Checkbox
                      checked={allSelected}
                      className={`ms-4 ${
                        someSelected && !allSelected ? "data-[state=unchecked]:bg-primary/20" : ""
                      }`}
                      onCheckedChange={() => vm.selectAllInCategory(category)}
                    />
                    <AccordionTrigger className="flex-1 px-1 py-3 text-sm hover:bg-transparent hover:no-underline">
                      <div className="flex w-full items-center gap-2 text-start">
                        <span className="font-medium capitalize">{category}</span>
                        <Badge
                          variant={selectedCount > 0 ? "default" : "outline"}
                          className="me-1 ms-auto text-xs tabular-nums"
                        >
                          {selectedCount} / {events.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent className="pb-2 pt-0">
                    <div className="space-y-0.5 px-4 ps-10">
                      {events.map((event) => {
                        const isSelected = vm.selectedEvents.includes(event.key);
                        return (
                          <label
                            key={event.key}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg p-2.5 transition-all ${
                              isSelected
                                ? "border border-primary/20 bg-primary/5"
                                : "border border-transparent hover:bg-muted/50"
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => vm.toggleEvent(event.key)}
                              className="mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-tight">
                                {
                                  (t(`webhooks.eventNames.${event.key}`) ||
                                    event.description ||
                                    event.key) as string
                                }
                              </p>
                              <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-muted-foreground">
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
            })}
          </Accordion>
        </div>
      )}

      {vm.eventsError && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {vm.eventsError}
        </p>
      )}
    </section>
  );
}
