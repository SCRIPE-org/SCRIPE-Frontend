"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@core/ui/enhanced-toast";
import { translateCore } from "@core/common/i18n-outside-react";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 2000; // 2 seconds as requested

// The full historical value set stays in the type: toastStyle is a persisted
// setting, so retired names still arrive from storage. enhanced-toast.tsx
// collapses them onto the surviving designs (classic/minimal/modern).
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

function baseToast({ ...props }: Toast) {
  const id = genId();

  // showIcon/duration defaults; `design` intentionally stays unset so the
  // workspace toastStyle setting governs unless a caller overrides per-toast.
  const toastProps = {
    showIcon: true,
    duration: TOAST_REMOVE_DELAY,
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

// Convenience methods for different toast types. They accept either a props
// object or a bare message string (the shape sonner call sites used), so both
// `success({ title })` and `success(msg)` work.
type ToastInput = string | Omit<Toast, "variant">;

const asToastProps = (input: ToastInput): Omit<Toast, "variant"> =>
  typeof input === "string" ? { title: input } : input;

function success(input: ToastInput) {
  return baseToast({ ...asToastProps(input), variant: "success" });
}

function error(input: ToastInput) {
  return baseToast({ ...asToastProps(input), variant: "destructive" });
}

function warning(input: ToastInput) {
  return baseToast({ ...asToastProps(input), variant: "warning" });
}

function info(input: ToastInput) {
  return baseToast({ ...asToastProps(input), variant: "info" });
}

// Operation-specific toast methods.
//
// `operation`/`itemName` are still expected to already be caller-localized nouns/verbs
// (this module is a plain singleton usable outside React render, so it cannot call
// useI18n() itself — see i18n-outside-react.ts) — but the surrounding sentence
// structure ("{operation} Successful", "Failed to {operation} {item}.", the
// no-itemName fallbacks, etc.) used to be hardcoded English regardless of the user's
// language. It now goes through the same core locale dictionaries as the rest of the
// app (common.operationToast.*).
function operationSuccess(operation: string, itemName?: string) {
  return success({
    title: translateCore("common.operationToast.successTitle", { operation }),
    description: itemName
      ? translateCore("common.operationToast.successWithItem", {
          item: itemName,
          operationLower: operation.toLowerCase(),
        })
      : translateCore("common.operationToast.successGeneric"),
  });
}

function operationError(operation: string, itemName?: string, error?: string) {
  return baseToast({
    variant: "destructive",
    title: translateCore("common.operationToast.errorTitle", { operation }),
    description:
      error ||
      (itemName
        ? translateCore("common.operationToast.errorWithItem", {
            item: itemName,
            operationLower: operation.toLowerCase(),
          })
        : translateCore("common.operationToast.errorGeneric")),
  });
}

// The module-level `toast` carries the convenience methods so call sites can
// fire `toast({ ... })`, `toast.success(msg)`, or `toast.error(msg)` without a
// hook — outside components, in view-model callbacks, wherever.
const toast = Object.assign(baseToast, { success, error, warning, info });

function useEnhancedToast() {
  const [state, setState] = React.useState<State>(memoryState);

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
