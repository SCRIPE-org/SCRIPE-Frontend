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
    chipClass: "bg-destructive/10 text-nx-danger",
    confirmVariant: "destructive" as const,
    title: "Delete Item",
    description: "Are you sure you want to delete this item? This action cannot be undone.",
  },
  warning: {
    icon: AlertTriangle,
    chipClass: "bg-warning/10 text-nx-warning",
    confirmVariant: "default" as const,
    title: "Warning",
    description: "Please confirm this action.",
  },
  info: {
    icon: Info,
    chipClass: "bg-info/10 text-nx-info",
    confirmVariant: "default" as const,
    title: "Information",
    description: "Please confirm this action.",
  },
  default: {
    icon: HelpCircle,
    chipClass: "border border-nx-line bg-nx-raised-2 text-nx-ink-2",
    confirmVariant: "default" as const,
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
  },
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  icon,
  isLoading = false,
  children,
  disableConfirm = false,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

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
        className="sm:max-w-md"
        aria-busy={isLoading || undefined}
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
              <AlertDialogTitle>{title || config.title}</AlertDialogTitle>
              <AlertDialogDescription>{description || config.description}</AlertDialogDescription>
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
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={config.confirmVariant}
              onClick={handleConfirm}
              loading={isLoading}
              disabled={disableConfirm}
              // Holds the button's width steady when the label swaps for a
              // spinner, so the footer does not reflow mid-request.
              className="min-w-20"
            >
              {confirmText}
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
