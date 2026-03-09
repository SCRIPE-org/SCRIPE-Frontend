import OAuthConsentView from "@/modules/auth/signin/src/presentation/views/OAuthConsentView";
import { Metadata } from "next";

export const metadata: Metadata = {
      title: "Authorize Application | NEXORA",
      description: "Approve application access to your NEXORA account",
};

export default function AuthorizePage() {
      return (
            <main>
                  <OAuthConsentView />
            </main>
      );
}
