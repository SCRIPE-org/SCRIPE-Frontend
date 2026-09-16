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
import { Separator } from "@core/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  NonModalScrim,
} from "@core/ui/dialog";
import { ScrollArea } from "@core/ui/scroll-area";
import type { WebhookSubscription } from "../../domain/entities/Webhook";
import { WebhookFormEndpointSection } from "./WebhookFormEndpointSection";
import { WebhookFormEventsSection } from "./WebhookFormEventsSection";
import { WebhookFormOptionsSection } from "./WebhookFormOptionsSection";
import { WebhookFormCustomFieldsSection } from "./WebhookFormCustomFieldsSection";

interface WebhookFormProps {
  mode: "create" | "edit";
  webhook?: WebhookSubscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Presentation UI component rendering the webhook form.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhookForm({ mode, webhook, open, onOpenChange, onSuccess }: WebhookFormProps) {
  const { t } = useI18n();
  const vm = useWebhookFormViewModel({ mode, webhook, onSuccess });

  const title = mode === "create" ? t("webhooks.create") : t("webhooks.edit");

  const description = mode === "create" ? t("webhooks.createDesc") : t("webhooks.editDesc");

  return (
    // Wave 5 row 5.6 (design spec §5.4; pre-plan R2's "hand-rolled" shape):
    // this hosts InlineAddCustomFieldDialog (now itself a modal={false}
    // Sheet, see that file) via WebhookFormCustomFieldsSection. A default
    // `modal={true}` Dialog here `hideOthers()`-hid and fought focus with
    // whatever the inline-add trigger opened, the same defect GenericModal's
    // own modal={false} already solves for the other ~30 CRUD screens --
    // this dialog just never adopted that pattern. NonModalScrim replaces
    // the overlay Radix skips in non-modal mode with the SAME scrim recipe.
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogPortal>
        <NonModalScrim open={open} />
      </DialogPortal>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col p-0">
        <DialogHeader className="shrink-0 border-b border-nx-line px-6 pb-4 pt-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="space-y-8 px-6 py-6">
            <WebhookFormEndpointSection vm={vm} />
            <Separator />
            <WebhookFormEventsSection vm={vm} />
            <Separator />
            <WebhookFormOptionsSection vm={vm} />
            <Separator />
            <WebhookFormCustomFieldsSection vm={vm} />
          </div>
        </ScrollArea>

        {/* ─── Sticky Footer ─────────────────────────────────── */}
        <DialogFooter className="shrink-0 border-t border-nx-line px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-[100px]">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={vm.handleSubmit}
            disabled={!vm.isValid}
            loading={vm.isSubmitting}
            className="min-w-[140px]"
          >
            {mode === "create" ? t("webhooks.create") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
