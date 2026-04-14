/**
 * Subscription Component Types
 *
 * Shared type definitions for subscription dialog components.
 */
import type { useSubscriptionsViewModel } from "./viewmodels/useSubscriptionsViewModel";
import type { useEditionsViewModel } from "@modules/entitlements/editions/src/presentation/viewmodels/useEditionsViewModel";

/** The raw subscriptions viewmodel return type */
type RawSubscriptionsVM = ReturnType<typeof useSubscriptionsViewModel>;

/**
 * The subscriptions VM type used by dialog components.
 * Extends the raw VM with adapter overrides (error is string | null from adapter).
 */
export type SubscriptionsVM = Omit<RawSubscriptionsVM, "error"> & {
  error: string | Error | null;
};

/** The editions viewmodel return type */
export type EditionsVM = ReturnType<typeof useEditionsViewModel>;

/** Props for dialogs that only need the subscriptions VM */
export interface SubscriptionDialogProps {
  vm: SubscriptionsVM;
}

/** Props for dialogs that also need the editions VM */
export interface SubscriptionEditionDialogProps extends SubscriptionDialogProps {
  editionsVm: EditionsVM;
}
