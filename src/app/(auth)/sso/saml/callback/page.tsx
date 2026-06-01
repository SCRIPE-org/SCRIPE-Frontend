import SamlAcsCallbackView from "@/modules/auth/signin/src/presentation/views/SamlAcsCallbackView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SAML Redirecting | SCRIPE",
  description: "Processing your SAML Sign-in...",
};

export default function SamlCallbackPage() {
  return (
    <main>
      <SamlAcsCallbackView />
    </main>
  );
}
