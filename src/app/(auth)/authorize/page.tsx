import { OAuthConsentView } from "@modules/system/oauth-apps";
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
