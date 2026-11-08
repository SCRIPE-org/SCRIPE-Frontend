"use client";

import * as React from "react";
import {
  toast as sileoToast,
  subscribeActiveToasts,
  getActiveToasts,
} from "@core/ui/sileo-toast";
import type {
  ActiveToastDescriptor,
  SileoButton,
  SileoOptions,
  SileoPosition,
  SileoPromiseOptions,
  SileoToastVariant,
  ToastHandle,
  ToastInput,
  ToastResponse,
} from "@core/ui/sileo-toast";

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

export type {
  ActiveToastDescriptor,
  SileoButton,
  SileoOptions,
  SileoPosition,
  SileoPromiseOptions,
  SileoToastVariant,
  ToastHandle,
  ToastInput,
  ToastResponse,
};

export const toast = sileoToast;

export const success = sileoToast.success;
export const error = sileoToast.error;
export const warning = sileoToast.warning;
export const info = sileoToast.info;
export const action = sileoToast.action;
export const show = sileoToast.show;
export const loading = sileoToast.loading;
export const sticky = sileoToast.sticky;
export const promise = sileoToast.promise;
export const update = sileoToast.update;
export const dismiss = sileoToast.dismiss;
export const clear = sileoToast.clear;
export const operationSuccess = sileoToast.operationSuccess;
export const operationError = sileoToast.operationError;

/**
 * React hook providing the supercharged Sileo toast controller.
 * Exposes reactive list of active toasts and all toast methods.
 */
export function useEnhancedToast() {
  const [toasts, setToasts] = React.useState<ActiveToastDescriptor[]>(getActiveToasts);

  React.useEffect(() => {
    return subscribeActiveToasts(setToasts);
  }, []);

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    info,
    action,
    show,
    loading,
    sticky,
    promise,
    update,
    operationSuccess,
    operationError,
    dismiss,
    clear,
  };
}
