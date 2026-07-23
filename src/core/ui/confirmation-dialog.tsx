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
import { Trash2, AlertTriangle, Info, CheckCircle } from "lucide-react";
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
    icon: CheckCircle,
    chipClass: "bg-success/10 text-nx-success",
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
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon || (
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-control",
                  config.chipClass
                )}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            )}
            <AlertDialogTitle className="text-start">{title || config.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2 text-start">
            {description || config.description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Custom children content */}
        {children && <div className="py-2">{children}</div>}

        {/* Layout and gap now come from AlertDialogFooter itself. */}
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
              className="min-w-[80px]"
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
