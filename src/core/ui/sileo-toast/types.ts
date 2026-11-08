import type * as React from "react";

/**
 * Supported positions for Sileo toasts in viewport.
 */
export type SileoPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Standard semantic toast variants mapped to SCRIPE design system tokens.
 */
export type SileoToastVariant =
  | "default"
  | "destructive"
  | "success"
  | "warning"
  | "info"
  | "action"
  | "loading";

/**
 * Action button configuration for interactive toasts.
 */
export interface SileoButton {
  title: string;
  onClick: () => void;
  className?: string;
}

/**
 * Sub-element class overrides for Sileo toasts.
 * Use Tailwind ! modifier for specificity (e.g. text-white!).
 */
export interface SileoStyles {
  title?: string;
  description?: string;
  badge?: string;
  button?: string;
}

/**
 * Full customization options passed to Sileo toast invocations.
 */
export interface SileoOptions {
  /** Optional identifier for updating, morphing, or deduplicating this toast. */
  id?: string;
  /** Toast heading string */
  title?: string;
  /** Toast body content, supports plain string or rich JSX / ReactNode */
  description?: React.ReactNode | string;
  /** Viewport position override for this toast */
  position?: SileoPosition;
  /** Auto-dismiss duration in milliseconds. Pass null for sticky toasts. Default: 4000ms */
  duration?: number | null;
  /** Custom icon React node to display inside the badge circle, or null to hide */
  icon?: React.ReactNode | null;
  /** SVG background fill color (e.g. "#151719", "#ffffff", "var(--nx-surface)") */
  fill?: string;
  /** Class overrides for individual toast sub-elements */
  styles?: SileoStyles;
  /** Border radius in pixels (default: 16) */
  roundness?: number;
  /** Auto expand/collapse behavior. false = hover only; object = custom timing */
  autopilot?: boolean | { expand?: number; collapse?: number };
  /** Action button configuration */
  button?: SileoButton;
}

/**
 * Interactive controller handle returned by all toast creators.
 * Enables in-place morphing/updating, programmatic dismissal, and ID inspection.
 */
export interface ToastHandle {
  readonly id: string;
  dismiss: () => void;
  update: (options: ToastInput | Partial<SileoOptions>) => void;
  toString(): string;
  valueOf(): string;
}

/**
 * Toast response type which behaves BOTH as a primitive-compatible string and a ToastHandle object.
 */
export type ToastResponse = string & ToastHandle;

/**
 * Descriptor of currently active toast notifications in the reactive subscriber pool.
 */
export interface ActiveToastDescriptor {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: SileoToastVariant;
  duration?: number | null;
  design?: string;
  showIcon?: boolean;
}

/**
 * Options for chaining async promise lifecycle states with Sileo.
 */
export interface SileoPromiseOptions<T = unknown> {
  loading: SileoOptions | string;
  success: SileoOptions | string | ((data: T) => SileoOptions | string);
  error: SileoOptions | string | ((err: unknown) => SileoOptions | string);
  action?: SileoOptions | string | ((data: T) => SileoOptions | string);
  position?: SileoPosition;
}

/**
 * Flexible input type supporting string literal or full SileoOptions with legacy metadata.
 */
export type ToastInput =
  | string
  | (SileoOptions & {
      variant?: SileoToastVariant;
      design?: string;
      showIcon?: boolean;
      action?:
        | React.ReactNode
        | SileoButton
        | { label?: string; title?: string; href?: string; onClick?: () => void };
    });

/**
 * Props for the Sileo Toaster viewport component.
 */
export interface SileoToasterProps {
  /** Default position for all toasts (default: "top-right" in LTR, mirrors in RTL) */
  position?: SileoPosition;
  /** Viewport distance offset from window edges */
  offset?:
    | number
    | string
    | {
        top?: number | string;
        right?: number | string;
        bottom?: number | string;
        left?: number | string;
      };
  /** Global default options merged into every toast */
  options?: Partial<SileoOptions>;
  /** Theme setting ("light" | "dark" | "system") */
  theme?: "light" | "dark" | "system";
  /** Automatically mirror top-right/bottom-right to top-left/bottom-left in RTL mode */
  rtlAutoMirror?: boolean;
  children?: React.ReactNode;
}
