import { OAuthConsentView } from "@modules/identity/oauth-apps";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authorize Application | SCRIPE",
  description: "Approve application access to your SCRIPE account",
};

export default function AuthorizePage() {
  return (
    <main>
      <OAuthConsentView />
    </main>
  );
}
