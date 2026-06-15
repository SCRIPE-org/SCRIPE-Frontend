import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { SignupWizard } from "@modules/auth/signup/src/presentation/views/SignupWizard";

export const metadata: Metadata = {
  title: "Create a Workspace — Scripe",
  description:
    "Sign up for Scripe and create your team workspace in under 2 minutes. Start free, or try any paid plan with a free trial.",
};

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  EG: "EGP",
  SA: "SAR",
  AE: "AED",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  US: "USD",
};

export default async function SignupPage() {
  const headersList = await headers();
  const country = headersList.get("cf-ipcountry")?.toUpperCase() || null;
  const initialCurrency = (country && COUNTRY_TO_CURRENCY[country]) || "USD";

  // useSearchParams in the wizard (checkout-canceled return) requires a Suspense boundary
  return (
    <Suspense>
      <SignupWizard initialCountry={country} initialCurrency={initialCurrency} />
    </Suspense>
  );
}
