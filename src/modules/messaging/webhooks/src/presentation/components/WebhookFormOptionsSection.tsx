"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@core/ui/accordion";
import { Settings2 } from "lucide-react";
import type { WebhookFormViewModel } from "../viewmodels/useWebhookFormViewModel";

interface WebhookFormOptionsSectionProps {
  vm: WebhookFormViewModel;
}

/**
 * React presentation component representing the webhook form options section UI element.
 */
export function WebhookFormOptionsSection({ vm }: WebhookFormOptionsSectionProps) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="options" className="rounded-xl border px-1">
          <AccordionTrigger className="gap-2.5 px-3 py-3 text-sm hover:no-underline">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Settings2 className="h-4 w-4" />
              </div>
              <div className="text-start">
                <p className="text-sm font-semibold">
                  {t("webhooks.form.optionsSection") || "Options"}
                </p>
                <p className="text-xs font-normal text-muted-foreground">
                  {t("webhooks.form.optionsSectionDesc") ||
                    "Additional delivery and retry settings"}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-4">
            <div className="grid grid-cols-1 gap-5 pt-2 sm:grid-cols-2">
              {/* Max Retries */}
              <div className="space-y-2">
                <Label htmlFor="max-retries" className="text-sm font-medium">
                  {t("webhooks.maxRetries") || "Max Retries"}
                </Label>
                <Input
                  id="max-retries"
                  type="number"
                  min={0}
                  max={10}
                  value={vm.maxRetries}
                  onChange={(e) => vm.setMaxRetries(Number(e.target.value))}
                  className="text-sm"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("webhooks.maxRetriesDesc") || "Number of retry attempts on failure (0-10)"}
                </p>
              </div>

              {/* Auto-disable Threshold */}
              <div className="space-y-2">
                <Label htmlFor="max-failures" className="text-sm font-medium">
                  {t("webhooks.maxConsecutiveFailures") || "Auto-disable Threshold"}
                </Label>
                <Input
                  id="max-failures"
                  type="number"
                  min={1}
                  max={100}
                  value={vm.maxConsecutiveFailures}
                  onChange={(e) => vm.setMaxConsecutiveFailures(Number(e.target.value))}
                  className="text-sm"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("webhooks.maxFailuresDesc") ||
                    "Auto-disable after this many consecutive failures"}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
