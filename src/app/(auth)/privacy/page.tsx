import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@core/config/branding";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRAND.name}`,
  description: `Read the Privacy Policy for ${BRAND.name} platform.`,
};

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-extrabold text-nx-ink">Privacy Policy</h1>
            <p className="mt-2 text-xs text-nx-ink-3">Last updated: June 4, 2026</p>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-nx-ink-2">
            <p>
              At <strong className="text-nx-ink">{BRAND.name}</strong>, we take your privacy and data
              isolation seriously. This Privacy Policy describes how we collect, protect, and use
              data when you interact with our modular monolith business platform.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">1. Data We Collect</h2>
            <p>
              We collect information you provide directly, including name, email, payment processing
              details (encrypted and processed by certified third parties), and workspace settings.
              We also log diagnostic metadata (such as IP addresses and device details) for security
              purposes.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">2. Data Security & Isolation</h2>
            <p>
              We enforce strict tenant separation rules. Your workspace data is completely isolated
              using our Clean Architecture multi-tenancy rules (Single or Multi-database modes). All
              IDs are fully AES-encrypted in transit. We implement double-submit CSRF cookies and
              request nonces to prevent replay attacks.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">3. How We Use Information</h2>
            <p>
              We use the collected information to provision your workspace, verify your account,
              process billing, optimize platform performance, and send transaction/system
              notifications. We do not sell your personal data to advertisers.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">4. Sharing and Disclosure</h2>
            <p>
              We only share your information with trusted third-party services that are required to
              operate the platform (e.g. payment processors, email deliverability networks). All
              partners comply with strictly regulated privacy covenants.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">5. Cookies and Session State</h2>
            <p>
              We use secure, httpOnly session cookies to manage authenticated sessions. You can
              configure your browser to reject cookies, but doing so may limit your ability to
              access secure dashboard and studio sections.
            </p>

            <h2 className="pt-2 text-lg font-bold text-nx-ink">6. Your Rights</h2>
            <p>
              You have the right to request access to the personal data we hold about you, request
              corrections, or request deletion of your account. Note that backup and transactional
              logs may retain traces under compliance constraints.
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
