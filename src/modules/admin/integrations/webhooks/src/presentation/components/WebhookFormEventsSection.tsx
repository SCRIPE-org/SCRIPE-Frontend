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
          <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-warning/10 text-warning">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-nx-ink">
              {t("webhooks.form.eventsSection")}
              <span className="ms-0.5 text-destructive">*</span>
            </h3>
            <p className="text-xs text-nx-ink-2">{t("webhooks.form.eventsSectionDesc")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={vm.selectedEvents.length > 0 ? "default" : "secondary"}
            className="text-xs tabular-nums"
          >
            {vm.selectedEvents.length} / {vm.availableEvents.length} {t("webhooks.selected")}
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={vm.selectAll}>
            {vm.selectedEvents.length === vm.availableEvents.length
              ? t("webhooks.deselectAll")
              : t("webhooks.selectAll")}
          </Button>
        </div>
      </div>

      {/* Event search filter */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nx-ink-3"
          aria-hidden="true"
        />
        <Input
          placeholder={t("webhooks.form.searchEvents")}
          value={vm.eventSearchTerm}
          onChange={(e) => vm.setEventSearchTerm(e.target.value)}
          className="h-9 ps-9 text-sm"
        />
      </div>

      {vm.isLoadingEvents ? (
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-nx-lg" />
          ))}
        </div>
      ) : Object.keys(vm.eventsByCategory).length === 0 && vm.eventSearchTerm.trim() ? (
        <div className="py-8 text-center text-sm text-nx-ink-2">
          <Search className="mx-auto mb-2 h-8 w-8 text-nx-ink-3" aria-hidden="true" />
          <p>{t("webhooks.form.noEventsFound")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-nx-lg border border-nx-line">
          <Accordion type="multiple" className="w-full">
            {Object.entries(vm.eventsByCategory).map(([category, events]) => {
              const allSelected = events.every((e) => vm.selectedEvents.includes(e.key));
              const someSelected = events.some((e) => vm.selectedEvents.includes(e.key));
              const selectedCount = events.filter((e) => vm.selectedEvents.includes(e.key)).length;

              return (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border-b border-nx-line last:border-b-0"
                >
                  <div className="flex items-center gap-2.5 pe-3 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover">
                    <Checkbox
                      checked={allSelected}
                      className={`ms-4 ${
                        someSelected && !allSelected
                          ? "data-[state=unchecked]:bg-nx-accent-wash"
                          : ""
                      }`}
                      onCheckedChange={() => vm.selectAllInCategory(category)}
                    />
                    <AccordionTrigger className="flex-1 px-1 py-3 text-sm hover:bg-transparent hover:no-underline">
                      <div className="flex w-full items-center gap-2 text-start">
                        <span className="font-medium capitalize text-nx-ink">{category}</span>
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
                            className={`flex cursor-pointer items-start gap-3 rounded-nx-md p-2.5 transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none ${
                              isSelected
                                ? "border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash"
                                : "border border-transparent hover:bg-nx-hover"
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => vm.toggleEvent(event.key)}
                              className="mt-0.5"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium leading-tight text-nx-ink">
                                {(t(`webhooks.eventNames.${event.key}`) ||
                                  event.description ||
                                  event.key) as string}
                              </p>
                              <p className="mt-0.5 font-mono text-[10px] leading-relaxed text-nx-ink-3">
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
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
          {vm.eventsError}
        </p>
      )}
    </section>
  );
}
