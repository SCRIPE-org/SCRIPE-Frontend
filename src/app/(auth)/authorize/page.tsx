import { OAuthConsentView } from "@/modules/identity/oauth-apps";
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
