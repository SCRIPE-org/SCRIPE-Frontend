"use client";

import * as React from "react";
import { sileo as baseSileo, type SileoOptions as RawSileoOptions } from "sileo";
import { twMerge } from "tailwind-merge";
import { translateCore } from "@core/common/i18n-outside-react";
import {
  NEXUS_SILEO_STYLES,
  getActiveToasterOptions,
  resolveRtlPosition,
  setActiveToasterFill,
  setActiveToasterOptions,
} from "./sileo-config";
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
} from "./types";

/**
 * Default duration for toasts across SCRIPE (4 seconds).
 */
const DEFAULT_TOAST_DURATION = 4000;

export { NEXUS_SILEO_STYLES, setActiveToasterOptions, setActiveToasterFill };

/**
 * Resolves explicit theme class on `<html>` / `<body>` before consulting OS
 * `prefers-color-scheme`, ensuring Light app mode is never overridden by Dark OS.
 */
export function getResolvedThemeFill(): string {
  if (typeof document === "undefined") return "#15181c";
  const root = document.documentElement;
  const body = document.body;
  if (root.classList.contains("dark") || body?.classList.contains("dark")) {
    return "#15181c";
  }
  if (root.classList.contains("light") || body?.classList.contains("light")) {
    return "#ffffff";
  }
  const isOsDark =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isOsDark ? "#15181c" : "#ffffff";
}

/**
 * Restricts toast and notification action navigation targets to safe same-origin
 * HTTP(S) URLs or root-relative paths, blocking dangerous schemes
 * (`javascript:`, `data:`, `vbscript:`), scheme-without-slashes (`http:evil`),
 * and protocol-relative (`//`) open redirects.
 */
export function resolveSafeActionHref(rawHref: unknown): string | null {
  if (typeof rawHref !== "string") return null;
  const trimmed = rawHref.trim();
  if (
    !trimmed ||
    [...trimmed].some((ch) => {
      const code = ch.charCodeAt(0);
      return code < 32 || code === 127;
    })
  ) {
    return null;
  }
  if (trimmed.startsWith("//") || trimmed.includes("\\")) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) && !/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  if (typeof window === "undefined") {
    return trimmed.startsWith("/") || trimmed.startsWith("?") || trimmed.startsWith("#")
      ? trimmed
      : null;
  }

  try {
    const parsed = new URL(trimmed, window.location.origin);
    if (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.origin === window.location.origin
    ) {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}

function getDocumentDirection(): "ltr" | "rtl" {
  if (typeof document === "undefined") return "ltr";
  const dir =
    document.documentElement.getAttribute("dir") ||
    document.body.getAttribute("dir");
  return dir === "rtl" ? "rtl" : "ltr";
}

let counter = 0;
function generateToastId(): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return `scripe-toast-${counter}-${Date.now().toString(36)}`;
}

// ── Reactive Active Toast State Store ──────────────────────────────────────────
const activeToastListeners = new Set<(toasts: ActiveToastDescriptor[]) => void>();
const activeToastTimers = new Map<string, ReturnType<typeof setTimeout>>();
let activeToasts: ActiveToastDescriptor[] = [];

function notifyListeners() {
  const snapshot = [...activeToasts];
  activeToastListeners.forEach((listener) => listener(snapshot));
}

function clearToastTimer(id: string) {
  const existingTimer = activeToastTimers.get(id);
  if (existingTimer !== undefined) {
    clearTimeout(existingTimer);
    activeToastTimers.delete(id);
  }
}

function registerActiveToast(
  id: string,
  input: ToastInput,
  variant?: SileoToastVariant,
  duration?: number | null
) {
  clearToastTimer(id);

  const title = typeof input === "string" ? input : input.title;
  const description = typeof input === "string" ? undefined : input.description;
  const resolvedDuration = duration !== undefined ? duration : DEFAULT_TOAST_DURATION;

  const existingIndex = activeToasts.findIndex((t) => t.id === id);
  const existingVariant = existingIndex >= 0 ? activeToasts[existingIndex].variant : undefined;

  const descriptor: ActiveToastDescriptor = {
    id,
    title,
    description,
    variant:
      variant ||
      (typeof input === "object" && input !== null ? input.variant : undefined) ||
      existingVariant ||
      "success",
    duration: resolvedDuration,
  };

  if (existingIndex >= 0) {
    activeToasts[existingIndex] = { ...activeToasts[existingIndex], ...descriptor };
  } else {
    activeToasts = [descriptor, ...activeToasts].slice(0, 10);
  }
  notifyListeners();

  if (resolvedDuration !== null && resolvedDuration !== undefined && resolvedDuration > 0) {
    const timer = setTimeout(() => {
      activeToastTimers.delete(id);
      activeToasts = activeToasts.filter((t) => t.id !== id);
      notifyListeners();
    }, resolvedDuration);
    activeToastTimers.set(id, timer);
  }
}

function removeActiveToast(id?: string) {
  if (id) {
    clearToastTimer(id);
    activeToasts = activeToasts.filter((t) => t.id !== id);
  } else {
    activeToastTimers.forEach((timer) => clearTimeout(timer));
    activeToastTimers.clear();
    activeToasts = [];
  }
  notifyListeners();
}

/**
 * Subscribes a React listener to active toast changes.
 */
export function subscribeActiveToasts(
  listener: (toasts: ActiveToastDescriptor[]) => void
): () => void {
  activeToastListeners.add(listener);
  listener([...activeToasts]);
  return () => {
    activeToastListeners.delete(listener);
  };
}

/**
 * Returns a static snapshot of currently active toasts.
 */
export function getActiveToasts(): ActiveToastDescriptor[] {
  return [...activeToasts];
}

/**
 * Creates an interactive handle that behaves as both a primitive string ID
 * and a controller object with `.dismiss()` and `.update()`.
 */
function makeToastHandle(id: string): ToastResponse {
  const str = new String(id);
  const handle: ToastHandle = {
    id,
    dismiss: () => dismiss(id),
    update: (opts) => update(id, opts),
    toString: () => id,
    valueOf: () => id,
  };
  return Object.assign(str, handle) as unknown as ToastResponse;
}

/**
 * Normalizes string or object input into complete SileoOptions with Nexus defaults.
 */
function normalizeOptions(
  input: ToastInput,
  variant?: SileoToastVariant,
  extraOptions?: Partial<SileoOptions>
): RawSileoOptions & { id: string } {
  const base: Partial<SileoOptions> =
    typeof input === "string" ? { title: input } : { ...input };

  // Resolve button from native button or legacy action prop
  let button: SileoButton | undefined = undefined;
  const rawButton = extraOptions?.button ?? base.button;
  if (rawButton) {
    button = {
      title: rawButton.title || (rawButton as any).label || "Action",
      onClick: rawButton.onClick || (() => {}),
      className: rawButton.className,
    };
  } else if ("action" in base && base.action) {
    const act = base.action as any;
    if (React.isValidElement(act)) {
      const props = (act as React.ReactElement<any>).props || {};
      button = {
        title: typeof props.children === "string" ? props.children : "Action",
        onClick: props.onClick || (() => {}),
      };
    } else if (typeof act === "object" && act !== null) {
      const title = act.title || act.label || "Action";
      const safeHref = !act.onClick && act.href ? resolveSafeActionHref(act.href) : null;
      const onClick = act.onClick
        ? act.onClick
        : safeHref
          ? () => {
              if (typeof window !== "undefined") {
                window.location.href = safeHref;
              }
            }
          : () => {};
      button = { title, onClick };
    }
  }

  const toasterDefaults = getActiveToasterOptions();
  const toasterStyles = toasterDefaults?.styles;

  const mergedStyles = {
    title: twMerge(
      NEXUS_SILEO_STYLES.title,
      toasterStyles?.title,
      base.styles?.title,
      extraOptions?.styles?.title
    ),
    description: twMerge(
      NEXUS_SILEO_STYLES.description,
      toasterStyles?.description,
      base.styles?.description,
      extraOptions?.styles?.description
    ),
    button: twMerge(
      NEXUS_SILEO_STYLES.button,
      toasterStyles?.button,
      base.styles?.button,
      extraOptions?.styles?.button,
      button?.className
    ),
    badge: twMerge(
      NEXUS_SILEO_STYLES.badge,
      toasterStyles?.badge,
      base.styles?.badge,
      extraOptions?.styles?.badge
    ),
  };

  const finalType =
    variant === "destructive"
      ? "error"
      : variant === "default"
        ? "info"
        : variant || (base as any).type || (base as any).variant || "success";

  const resolvedId = extraOptions?.id ?? base.id ?? generateToastId();

  const rawPosition = extraOptions?.position ?? base.position;
  const resolvedPosition = rawPosition
    ? resolveRtlPosition(rawPosition, getDocumentDirection(), true)
    : undefined;

  return {
    id: resolvedId,
    title: base.title ?? "",
    description: base.description,
    type: finalType as any,
    position: resolvedPosition,
    duration:
      extraOptions?.duration !== undefined
        ? extraOptions.duration
        : base.duration !== undefined
          ? base.duration
          : DEFAULT_TOAST_DURATION,
    icon: extraOptions?.icon !== undefined ? extraOptions.icon : base.icon,
    fill: extraOptions?.fill ?? base.fill ?? toasterDefaults?.fill ?? "var(--nx-surface)",
    styles: mergedStyles,
    roundness: extraOptions?.roundness ?? base.roundness ?? 16,
    autopilot: extraOptions?.autopilot ?? base.autopilot ?? true,
    button: button ? { title: button.title ?? "Action", onClick: button.onClick } : undefined,
  };
}

/**
 * Fires a success toast notification.
 */
function success(input: ToastInput, extraOptions?: Partial<SileoOptions>): ToastResponse {
  const opts = normalizeOptions(input, "success", extraOptions);
  baseSileo.success(opts);
  registerActiveToast(opts.id, input, "success", opts.duration);
  return makeToastHandle(opts.id);
}

/**
 * Fires an error / destructive toast notification.
 */
function error(input: ToastInput, extraOptions?: Partial<SileoOptions>): ToastResponse {
  const opts = normalizeOptions(input, "destructive", extraOptions);
  baseSileo.error(opts);
  registerActiveToast(opts.id, input, "destructive", opts.duration);
  return makeToastHandle(opts.id);
}

/**
 * Fires a warning toast notification.
 */
function warning(input: ToastInput, extraOptions?: Partial<SileoOptions>): ToastResponse {
  const opts = normalizeOptions(input, "warning", extraOptions);
  baseSileo.warning(opts);
  registerActiveToast(opts.id, input, "warning", opts.duration);
  return makeToastHandle(opts.id);
}

/**
 * Fires an informational toast notification.
 */
function info(input: ToastInput, extraOptions?: Partial<SileoOptions>): ToastResponse {
  const opts = normalizeOptions(input, "info", extraOptions);
  baseSileo.info(opts);
  registerActiveToast(opts.id, input, "info", opts.duration);
  return makeToastHandle(opts.id);
}

/**
 * Fires an interactive action toast with an actionable button.
 */
function action(options: SileoOptions & { button: SileoButton }): ToastResponse {
  const opts = normalizeOptions(options, "action");
  baseSileo.action(opts);
  registerActiveToast(opts.id, options, "action", opts.duration);
  return makeToastHandle(opts.id);
}

/**
 * Displays a generic or custom-state toast.
 */
function show(options: SileoOptions): ToastResponse {
  const opts = normalizeOptions(options, options.button ? "action" : "success");
  baseSileo.show(opts);
  registerActiveToast(opts.id, options, "default", opts.duration);
  return makeToastHandle(opts.id);
}

/**
 * Fires a sticky loading toast. Returns handle for subsequent morphing/updating or dismissal.
 */
function loading(input: ToastInput, extraOptions?: Partial<SileoOptions>): ToastResponse {
  const opts = normalizeOptions(input, "loading" as any, {
    duration: null,
    ...extraOptions,
  });
  baseSileo.show({ ...opts, type: "loading" as any });
  registerActiveToast(opts.id, input, "loading", null);
  return makeToastHandle(opts.id);
}

/**
 * Fires a sticky toast that will not auto-dismiss until explicitly clicked or dismissed.
 */
function sticky(input: ToastInput, extraOptions?: Partial<SileoOptions>): ToastResponse {
  const opts = normalizeOptions(input, undefined, { ...extraOptions, duration: null });
  baseSileo.show(opts);
  registerActiveToast(opts.id, input, "default", null);
  return makeToastHandle(opts.id);
}

/**
 * Updates or morphs an existing toast in place using Sileo's spring physics.
 */
function update(
  target: string | ToastHandle | string,
  options: ToastInput | Partial<SileoOptions>
): ToastResponse {
  const id =
    typeof target === "object" && target !== null && "id" in target ? target.id : String(target);
  const existing = activeToasts.find((t) => t.id === id);
  const requestedVariant =
    typeof options === "object" && options !== null
      ? ((options as any).variant as SileoToastVariant | undefined) ??
        ((options as any).type as SileoToastVariant | undefined)
      : undefined;
  const resolvedVariant = requestedVariant ?? existing?.variant;
  const opts = normalizeOptions(options, resolvedVariant, { id });
  baseSileo.show(opts);
  registerActiveToast(id, options, resolvedVariant, opts.duration);
  return makeToastHandle(id);
}

/**
 * Chains loading, success, and error states from a single promise with gooey morphing.
 */
function promise<T>(
  p: Promise<T> | (() => Promise<T>),
  options: SileoPromiseOptions<T>
): Promise<T> {
  const loadingInput: ToastInput =
    typeof options.loading === "string" ? { title: options.loading } : options.loading;
  const promiseToastId = (loadingInput as SileoOptions).id || generateToastId();

  const normalizedLoading = normalizeOptions(loadingInput, "loading" as any, {
    id: promiseToastId,
    duration: null,
  });

  registerActiveToast(promiseToastId, loadingInput, "loading", null);

  const wrapSuccess = (data: T) => {
    const raw = typeof options.success === "function" ? options.success(data) : options.success;
    const input: ToastInput = typeof raw === "string" ? { title: raw } : raw;
    const normalized = normalizeOptions(input, "success", { id: promiseToastId });
    registerActiveToast(promiseToastId, input, "success", normalized.duration);
    return normalized;
  };

  const wrapError = (err: unknown) => {
    const raw = typeof options.error === "function" ? options.error(err) : options.error;
    const input: ToastInput =
      typeof raw === "string"
        ? { title: raw }
        : raw || { title: "Error", description: err instanceof Error ? err.message : String(err) };
    const normalized = normalizeOptions(input, "destructive", { id: promiseToastId });
    registerActiveToast(promiseToastId, input, "destructive", normalized.duration);
    return normalized;
  };

  const wrapAction = options.action
    ? (data: T) => {
        const raw = typeof options.action === "function" ? options.action(data) : options.action;
        const input: ToastInput = typeof raw === "string" ? { title: raw } : raw!;
        const normalized = normalizeOptions(input, "action", { id: promiseToastId });
        registerActiveToast(promiseToastId, input, "action", normalized.duration);
        return normalized;
      }
    : undefined;

  return baseSileo.promise(p, {
    loading: normalizedLoading,
    success: wrapSuccess as any,
    error: wrapError as any,
    action: wrapAction as any,
    position: options.position
      ? resolveRtlPosition(options.position, getDocumentDirection(), true)
      : undefined,
  });
}

/**
 * Dismiss a specific toast by its ID or handle, or dismiss all active toasts.
 */
function dismiss(target?: string | ToastHandle | string): void {
  if (target) {
    const id =
      typeof target === "object" && target !== null && "id" in target ? target.id : String(target);
    removeActiveToast(id);
    baseSileo.dismiss(id);
  } else {
    removeActiveToast();
    baseSileo.clear();
  }
}

/**
 * Clear all toasts or toasts in a specific position.
 */
function clear(position?: SileoPosition): void {
  removeActiveToast();
  baseSileo.clear(position);
}

/**
 * Operation-specific success toast localized via core dictionaries.
 */
function operationSuccess(operation: string, itemName?: string): ToastResponse {
  const title = translateCore("common.operationToast.successTitle", { operation });
  const description = itemName
    ? translateCore("common.operationToast.successWithItem", {
        operation,
        item: itemName,
        operationLower: operation.toLowerCase(),
      })
    : translateCore("common.operationToast.successGeneric");

  return success({ title, description });
}

/**
 * Operation-specific error toast localized via core dictionaries.
 */
function operationError(operation: string, itemName?: string, err?: string): ToastResponse {
  const title = translateCore("common.operationToast.errorTitle", { operation });
  const description =
    err ||
    (itemName
      ? translateCore("common.operationToast.errorWithItem", {
          item: itemName,
          operationLower: operation.toLowerCase(),
        })
      : translateCore("common.operationToast.errorGeneric"));

  return error({ title, description });
}

/**
 * Primary callable toast function supporting:
 * - toast("Message")
 * - toast({ title, description, variant, ... })
 * - const handle = toast({ ... }); handle.dismiss(); handle.update(...)
 * - toast.success(...), toast.error(...), etc.
 */
function baseToastFn(input: ToastInput, extraOptions?: Partial<SileoOptions>): ToastResponse {
  if (typeof input === "string") {
    return success(input, extraOptions);
  }

  const hasAction = Boolean(input.button) || Boolean((input as any).action);
  const variant = input.variant || (hasAction ? "action" : "success");
  switch (variant) {
    case "destructive":
      return error(input, extraOptions);
    case "warning":
      return warning(input, extraOptions);
    case "info":
    case "default":
      return info(input, extraOptions);
    case "loading":
      return loading(input, extraOptions);
    case "action": {
      const normalizedOpts = normalizeOptions(input, "action", extraOptions);
      if (normalizedOpts.button) {
        baseSileo.action(normalizedOpts as RawSileoOptions & { button: { title: string; onClick: () => void } });
      } else {
        baseSileo.show(normalizedOpts);
      }
      registerActiveToast(normalizedOpts.id, input, "action", normalizedOpts.duration);
      return makeToastHandle(normalizedOpts.id);
    }
    case "success":
    default:
      return success(input, extraOptions);
  }
}

/**
 * Displays a rich toast with full options: ReactNode description, icon, custom styles, action button.
 */
function rich(options: SileoOptions): ToastResponse {
  const opts = normalizeOptions(
    options,
    (options as any).variant || (options.button ? "action" : "info")
  );
  baseSileo.show(opts);
  registerActiveToast(
    opts.id,
    options,
    (options as any).variant || (options.button ? "action" : "info"),
    opts.duration
  );
  return makeToastHandle(opts.id);
}

export const toast = Object.assign(baseToastFn, {
  success,
  error,
  warning,
  info,
  action,
  show,
  rich,
  custom: rich,
  loading,
  sticky,
  promise,
  update,
  dismiss,
  clear,
  operationSuccess,
  operationError,
  raw: baseSileo,
});

export { baseSileo as sileo };
