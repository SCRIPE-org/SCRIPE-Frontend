import { Metadata } from "next";
import dynamic from "next/dynamic";
import { ModuleErrorBoundary } from "@core/ui/module-error-boundary";

const SignupContentView = dynamic(() =>
  import("@modules/entitlements/signup-content").then((m) => ({
    default: m.SignupContentView,
  }))
);

export const metadata: Metadata = {
  title: "Signup Content",
  description: "Manage the signup welcome screen content, trust marks, and customer logos",
};

export default function SignupContentPage() {
  return (
    <ModuleErrorBoundary moduleName="signupContent.title">
      <SignupContentView />
    </ModuleErrorBoundary>
  );
}
