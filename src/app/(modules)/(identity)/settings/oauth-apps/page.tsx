import { Metadata } from "next";
import { OAuthAppsView } from "@/modules/identity/oauth-apps";

export const metadata: Metadata = {
      title: "OAuth Applications | NEXORA",
      description: "Manage third-party applications that authenticate via NEXORA (OIDC Server)",
};

export default function OAuthAppsPage() {
      return (
            <main>
                  <OAuthAppsView />
            </main>
      );
}
