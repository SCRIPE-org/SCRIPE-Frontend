import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { SignupWizard, resolveCurrencyFromCountry } from "@modules/auth/signup";

export const metadata: Metadata = {
  title: "Create a Workspace — Scripe",
  description:
    "Sign up for Scripe and create your team workspace in under 2 minutes. Start free, or try any paid plan with a free trial.",
};

export default async function SignupPage() {
  const headersList = await headers();
  const country = headersList.get("cf-ipcountry")?.toUpperCase() || null;
  const initialCurrency = resolveCurrencyFromCountry(country);

  // useSearchParams in the wizard (checkout-canceled return) requires a Suspense boundary
  return (
    <Suspense>
      <SignupWizard initialCountry={country} initialCurrency={initialCurrency} />
    </Suspense>
  );
}
