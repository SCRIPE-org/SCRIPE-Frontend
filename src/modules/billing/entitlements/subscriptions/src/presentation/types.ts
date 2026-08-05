/**
 * @file types.ts
 * @description Shared type definitions for subscription dialog components.
 * Decouples static dependencies to other submodules by defining generic structural interfaces.
 */
import type { useSubscriptionsViewModel } from "./viewmodels/useSubscriptionsViewModel";

/**
 * Represents a lightweight edition entity shape for select inputs and UI matching.
 */
export interface EditionItem {
  id: string;
  name?: string;
  displayName?: string;
  allowLifetime?: boolean;
  allowTrial?: boolean;
  allowMonthly?: boolean;
  allowYearly?: boolean;
  [key: string]: any;
}

/** The raw subscriptions viewmodel return type */
type RawSubscriptionsVM = ReturnType<typeof useSubscriptionsViewModel>;

/**
 * The subscriptions VM type used by dialog components.
 * Extends the raw VM with adapter overrides (error is string | null from adapter).
 */
export type SubscriptionsVM = Omit<RawSubscriptionsVM, "error"> & {
  error: string | Error | null;
};

/**
 * Loose interface for Editions viewmodel to bypass static submodule imports.
 */
export interface EditionsVM {
  items?: EditionItem[];
  /** Full (up to 100) unpaginated edition list — dropdowns must read this, not `items` (page-capped at 10). */
  allEditionsForSelect?: EditionItem[];
  [key: string]: any;
}

/** Props for dialogs that only need the subscriptions VM */
export interface SubscriptionDialogProps {
  vm: SubscriptionsVM;
}

/** Props for dialogs that also need the editions VM */
export interface SubscriptionEditionDialogProps extends SubscriptionDialogProps {
  editionsVm: EditionsVM;
}
