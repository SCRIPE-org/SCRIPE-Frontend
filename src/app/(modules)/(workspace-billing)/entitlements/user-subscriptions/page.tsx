import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const UserSubscriptionsView = dynamic(() =>
  import("@modules/entitlements/user-subscriptions").then((m) => ({
    default: m.UserSubscriptionsView,
  }))
);

export const metadata: Metadata = {
  title: "User Subscriptions",
  description: "Manage user subscriptions to tenant plans",
};

export default function UserSubscriptionsPage() {
  return (
    <ModuleErrorBoundary moduleName="entitlements.userSubscriptions.title">
      <UserSubscriptionsView />
    </ModuleErrorBoundary>
  );
}
