import { Suspense } from "react";
import { MagicLinkCallbackView } from "@modules/auth/signin/src/presentation/views/MagicLinkCallbackView";

export default function MagicLinkPage() {
  return (
    <Suspense>
      <MagicLinkCallbackView />
    </Suspense>
  );
}
