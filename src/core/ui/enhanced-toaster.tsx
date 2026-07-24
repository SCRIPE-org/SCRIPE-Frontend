"use client";

/**
 * EnhancedToaster — the mount point for the toast queue.
 *
 * The queue, the variants and the auto-dismiss timer all live in
 * use-enhanced-toast; this file only decides how a queued toast is laid out.
 *
 * Wave K: ToastContent was rendered without a flex context of its own, so
 * inside the Root's `justify-between` a long description grew the toast
 * sideways until the action button was squeezed off the raised surface. It
 * takes the free space and wraps now, and the action keeps its intrinsic width.
 */

import {
  Toast,
  ToastClose,
  ToastContent,
  ToastProvider,
  ToastViewport,
} from "@core/ui/enhanced-toast";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

export function EnhancedToaster() {
  const { toasts } = useEnhancedToast();
  const { direction } = useI18n();

  return (
    // The viewport sits at the inline END (sm:end-0), so the dismiss swipe must
    // follow it: right in LTR, left in RTL — Radix only speaks physical sides.
    <ToastProvider swipeDirection={direction === "rtl" ? "left" : "right"}>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        design,
        showIcon,
        ...props
      }) {
        return (
          <Toast key={id} variant={variant} design={design} {...props}>
            <ToastContent
              className="min-w-0 flex-1"
              variant={variant}
              title={typeof title === "string" ? title : undefined}
              description={typeof description === "string" ? description : undefined}
              showIcon={showIcon}
            />
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
