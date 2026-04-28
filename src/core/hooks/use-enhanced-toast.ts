"use client";

import * as React from "react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import type { ToastActionElement, ToastProps } from "@core/ui/enhanced-toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 2000; // 2 seconds as requested

export type ToastDesign =
  | "classic"
  | "neon"
  | "glassmorphism"
  | "neumorphism"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "modern"
  | "gradient"
  | "outlined";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  design?: ToastDesign;
  showIcon?: boolean;
  duration?: number;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, duration: number = TOAST_REMOVE_DELAY) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, duration);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id, toast.duration);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

// Default settings that can be overridden by user preferences
let defaultToastSettings = {
  design: "classic" as ToastDesign,
  showIcon: true,
  duration: TOAST_REMOVE_DELAY,
};

export function setDefaultToastSettings(settings: Partial<typeof defaultToastSettings>) {
  defaultToastSettings = { ...defaultToastSettings, ...settings };
}

export function getDefaultToastSettings() {
  return defaultToastSettings;
}

function toast({ ...props }: Toast) {
  const id = genId();

  // Apply default settings
  const toastProps = {
    design: defaultToastSettings.design,
    showIcon: defaultToastSettings.showIcon,
    duration: defaultToastSettings.duration,
    ...props,
  };

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...toastProps,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Auto-dismiss after duration
  setTimeout(() => {
    dismiss();
  }, toastProps.duration);

  return {
    id: id,
    dismiss,
    update,
  };
}

// Convenience methods for different toast types
function success(props: Omit<Toast, "variant">) {
  return toast({ ...props, variant: "success" });
}

function error(props: Omit<Toast, "variant">) {
  return toast({ ...props, variant: "destructive" });
}

function warning(props: Omit<Toast, "variant">) {
  return toast({ ...props, variant: "warning" });
}

function info(props: Omit<Toast, "variant">) {
  return toast({ ...props, variant: "info" });
}

// Operation-specific toast methods
function operationSuccess(operation: string, itemName?: string) {
  return success({
    title: `${operation} Successful`,
    description: itemName
      ? `${itemName} has been ${operation.toLowerCase()} successfully.`
      : `Operation completed successfully.`,
  });
}

function operationError(operation: string, itemName?: string, error?: string) {
  return toast({
    variant: "destructive",
    title: `${operation} Failed`,
    description:
      error ||
      (itemName ? `Failed to ${operation.toLowerCase()} ${itemName}.` : `Operation failed.`),
  });
}

function useEnhancedToast() {
  const [state, setState] = React.useState<State>(memoryState);
  const { t } = useI18n();
  const { toastStyle } = useSettings();

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    success,
    error,
    warning,
    info,
    operationSuccess,
    operationError,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useEnhancedToast, toast };
