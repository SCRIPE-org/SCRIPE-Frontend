"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";
import { Button } from "@core/ui/button";
import { Trash2, AlertTriangle, Info, HelpCircle } from "lucide-react";
import { cn } from "@core/common/utils";
import { appLogger } from "@core/common/logger";
import { useI18n } from "@core/providers/i18n-provider";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  variant?: "destructive" | "warning" | "info" | "default";
  icon?: React.ReactNode;
  isLoading?: boolean;
  /** Custom content to render in the dialog body */
  children?: React.ReactNode;
  /** Disable confirm button externally (e.g., validation not met) */
  disableConfirm?: boolean;
  className?: string;
  dir?: "ltr" | "rtl";
  confirmButtonProps?: Partial<React.ComponentProps<typeof Button>> & { "data-testid"?: string; [key: `data-${string}`]: unknown };
  cancelButtonProps?: Partial<React.ComponentProps<typeof Button>> & { "data-testid"?: string; [key: `data-${string}`]: unknown };
  "data-testid"?: string;
}

// The chip tint pairs the nx status alias for the glyph with a slash-alpha
// wash of the same measured status token underneath — nothing re-derived,
// and both flip with the theme through the vars they read.
//
// The `default` variant used to open with a GREEN CHECKMARK: the affirmative
// signal for an outcome, shown before the user has agreed to anything. It now
// reads as the question it is — a neutral glyph on the raised surface step,
// leaving green to mean "this succeeded" everywhere in the product.
const variantConfig = {
  destructive: {
    icon: Trash2,
    chipClass: "border border-destructive/30 bg-destructive/10 text-nx-danger",
    confirmVariant: "destructive" as const,
    titleKey: "common.confirmDelete",
    defaultTitle: "Confirm Delete",
    descriptionKey: "common.confirmDeleteDescription",
    defaultDescription: "Are you sure you want to delete this item? This action cannot be undone.",
  },
  warning: {
    icon: AlertTriangle,
    chipClass: "border border-warning-strong/30 bg-warning/15 text-nx-warning-strong",
    confirmVariant: "default" as const,
    titleKey: "common.warning",
    defaultTitle: "Warning",
    descriptionKey: "common.pleaseConfirmAction",
    defaultDescription: "Please confirm this action.",
  },
  info: {
    icon: Info,
    chipClass: "border border-info/30 bg-info/10 text-nx-info",
    confirmVariant: "default" as const,
    titleKey: "common.info",
    defaultTitle: "Information",
    descriptionKey: "common.pleaseConfirmAction",
    defaultDescription: "Please confirm this action.",
  },
  default: {
    icon: HelpCircle,
    chipClass: "border border-nx-line bg-nx-raised-2 text-nx-ink-2",
    confirmVariant: "default" as const,
    titleKey: "common.confirmAction",
    defaultTitle: "Confirm Action",
    descriptionKey: "common.confirmProceed",
    defaultDescription: "Are you sure you want to proceed?",
  },
};

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    variant = "default",
    icon,
    isLoading = false,
    children,
    disableConfirm = false,
    className,
    dir,
    confirmButtonProps,
    cancelButtonProps,
  } = props;
  const { t } = useI18n();
  const tr = (key: string, defaultValue: string) => {
    const resolved = t(key, { defaultValue });
    return resolved === key ? defaultValue : resolved;
  };
  const config = variantConfig[variant];
  const IconComponent = config.icon;
  const resolvedTitle = title || tr(config.titleKey, config.defaultTitle);
  const resolvedDescription = description || tr(config.descriptionKey, config.defaultDescription);
  const resolvedConfirmText = confirmText ?? tr("common.confirm", "Confirm");
  const resolvedCancelText = cancelText ?? tr("common.cancel", "Cancel");

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      appLogger.error("Confirmation action failed:", error);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        dir={dir}
        className={cn("sm:max-w-md", className)}
        aria-busy={isLoading || undefined}
        data-testid={props["data-testid"]}
        // The loading state is a real state, not a spinner bolted onto the
        // happy path: while the confirmed action is in flight the panel stops
        // being dismissable, so Escape can no longer orphan a half-finished
        // delete with no UI left to report its outcome.
        onEscapeKeyDown={(event) => {
          if (isLoading) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          {/* The description used to hang off the header's own column, which
              started at the panel edge — so the title sat 48px in (past the
              icon chip) and the sentence explaining it sat at zero, reading as
              two unrelated blocks. Title and description now share one text
              column beside the chip. */}
          <div className="flex items-start gap-3">
            {icon || (
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-control",
                  config.chipClass
                )}
              >
                <IconComponent className="h-5 w-5" aria-hidden="true" />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
              <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Custom children content — spacing comes from the content grid's own
            gap, not a second layer of vertical padding on top of it. */}
        {children && <div>{children}</div>}

        {/* Layout, gap and action order all come from AlertDialogFooter: cancel
            first in the DOM, primary last, which puts the primary on the
            inline-end edge at >= sm and on top of the stack below it. */}
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              {...cancelButtonProps}
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className={cancelButtonProps?.className}
            >
              {resolvedCancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              {...confirmButtonProps}
              variant={config.confirmVariant}
              onClick={handleConfirm}
              loading={isLoading}
              disabled={disableConfirm}
              // Holds the button's width steady when the label swaps for a
              // spinner, so the footer does not reflow mid-request.
              className={cn("min-w-20", confirmButtonProps?.className)}
            >
              {resolvedConfirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [dialogState, setDialogState] = React.useState<{
    open: boolean;
    props: Omit<ConfirmationDialogProps, "open" | "onOpenChange">;
  }>({
    open: false,
    props: {
      onConfirm: () => {},
    },
  });

  const showConfirmation = React.useCallback(
    (props: Omit<ConfirmationDialogProps, "open" | "onOpenChange">) => {
      setDialogState({
        open: true,
        props,
      });
    },
    []
  );

  const hideConfirmation = React.useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const ConfirmationDialogComponent = React.useCallback(
    () => (
      <ConfirmationDialog
        {...dialogState.props}
        open={dialogState.open}
        onOpenChange={hideConfirmation}
      />
    ),
    [dialogState, hideConfirmation]
  );

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}
