import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@core/config/branding";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";

export const metadata: Metadata = {
  title: `Terms of Service — ${BRAND.name}`,
  description: `Read the Terms of Service for ${BRAND.name} platform.`,
};

export default function TermsPage() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-nx-ground p-4 text-nx-ink sm:p-6 md:p-10">
      {/* Subtle ambient token wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(50% 40% at 25% 25%, color-mix(in srgb, var(--nx-accent) 6%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Logo */}
      <div className="relative z-0 mb-6 flex flex-col items-center">
        <img
          src="/brand/app-logo.svg"
          alt={BRAND.name}
          width={40}
          height={40}
          className="mb-2 h-10 w-10"
        />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-nx-ink-3">
          Legal Agreement
        </span>
      </div>

      {/* Card container */}
      <Card className="relative z-0 w-full max-w-3xl overflow-hidden rounded-2xl border-nx-line bg-nx-surface p-0">
        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6 sm:p-10">
          <div className="border-b border-nx-line pb-4">
            <h1 className="text-3xl font-extrabold text-nx-ink">Terms of Service</h1>
            <p className="mt-2 text-xs text-nx-ink-3">Last updated: June 4, 2026</p>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-nx-ink-2">
            <p>
              Welcome to <strong className="text-nx-ink">{BRAND.name}</strong>. By accessing or using
              our services, enterprise-grade modular monolith platform, and developer suite, you
              agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">1. Acceptance of Terms</h2>
            <p>
              By creating a workspace or signing up for an account on {BRAND.name}, you accept these
              terms in full. If you disagree with any part of these terms, you must not use our
              platform or services.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">2. Description of Service</h2>
            <p>
              {BRAND.name} provides a modular clean architecture DDD-based platform for enterprise
              business automation, visual workspace building, API integration, and SaaS deployment.
              Features are provided based on your selected edition and plan details.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">3. User Account & Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and
              are fully responsible for all activities that occur under your workspace or account.
              You agree to immediately notify us of any unauthorized use.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">4. Acceptable Use Policy</h2>
            <p>
              You agree not to misuse the services. This includes not attempting to breach security
              measures, reverse engineer the platform core modules, distribute malware, or execute
              malicious automated scripts that degrade server performance.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">5. Billing and Subscription</h2>
            <p>
              Fees are billed on a recurring monthly or annual basis depending on your selection.
              Some editions include a trial phase. Failure to pay fees will result in grace phase
              redirection or workspace suspension.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">6. Intellectual Property</h2>
            <p>
              All software, designs, layouts, APIs, and CLI tooling associated with {BRAND.name} are
              the exclusive intellectual property of {BRAND.name} and its licensors. You may not
              copy or redistribute the source code without explicit consent.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, {BRAND.name} shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, or any loss
              of profits or revenues.
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex justify-end gap-3 border-t border-nx-line bg-nx-raised px-6 py-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/signup">Back to Signup</Link>
          </Button>
        </div>
      </Card>

      {/* Footer */}
      <footer className="relative z-0 mt-8 text-center text-[11px] font-medium text-nx-ink-3">
        © {new Date().getFullYear()} {BRAND.name} — All rights reserved
      </footer>
    </main>
  );
}
