import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@core/config/branding";

export const metadata: Metadata = {
  title: `Terms of Service — ${BRAND.name}`,
  description: `Read the Terms of Service for ${BRAND.name} platform.`,
};

export default function TermsPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10"
      style={{
        background: "var(--sx-bg, #06060E)",
        backgroundImage:
          "radial-gradient(140% 90% at 25% 25%, #1A1140 0%, #0A0820 40%, #06060E 80%, #04040A 100%)",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none fixed left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="pointer-events-none fixed bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <img src="/app-logo.png" alt={BRAND.name} className="mb-2 h-10 w-auto" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300/60">
          Legal Agreement
        </span>
      </div>

      {/* Card container */}
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(20,12,46,.78), rgba(10,8,28,.85))",
          border: "1px solid rgba(168,85,247,.22)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,.5), 0 0 80px -20px rgba(168,85,247,.15)",
        }}
      >
        <div className="scrollbar-thin scrollbar-thumb-purple-900/50 scrollbar-track-transparent max-h-[70vh] space-y-6 overflow-y-auto p-6 sm:p-10">
          <div className="border-b border-white/10 pb-4">
            <h1
              className="text-3xl font-extrabold"
              style={{
                background: "linear-gradient(180deg, #F5F2FF 0%, #C7B8F0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Terms of Service
            </h1>
            <p className="mt-2 text-xs" style={{ color: "rgba(245,242,255,0.4)" }}>
              Last updated: June 4, 2026
            </p>
          </div>

          <div
            className="space-y-4 text-sm leading-relaxed"
            style={{ color: "rgba(245,242,255,0.75)" }}
          >
            <p>
              Welcome to <strong>{BRAND.name}</strong>. By accessing or using our services,
              enterprise-grade modular monolith platform, and developer suite, you agree to be bound
              by these Terms of Service. Please read them carefully.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">1. Acceptance of Terms</h2>
            <p>
              By creating a workspace or signing up for an account on {BRAND.name}, you accept these
              terms in full. If you disagree with any part of these terms, you must not use our
              platform or services.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">2. Description of Service</h2>
            <p>
              {BRAND.name} provides a modular clean architecture DDD-based platform for enterprise
              business automation, visual workspace building, API integration, and SaaS deployment.
              Features are provided based on your selected edition and plan details.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">3. User Account & Security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and
              are fully responsible for all activities that occur under your workspace or account.
              You agree to immediately notify us of any unauthorized use.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">4. Acceptable Use Policy</h2>
            <p>
              You agree not to misuse the services. This includes not attempting to breach security
              measures, reverse engineer the platform core modules, distribute malware, or execute
              malicious automated scripts that degrade server performance.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">5. Billing and Subscription</h2>
            <p>
              Fees are billed on a recurring monthly or annual basis depending on your selection.
              Some editions include a trial phase. Failure to pay fees will result in grace phase
              redirection or workspace suspension.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">6. Intellectual Property</h2>
            <p>
              All software, designs, layouts, APIs, and CLI tooling associated with {BRAND.name} are
              the exclusive intellectual property of {BRAND.name} and its licensors. You may not
              copy or redistribute the source code without explicit consent.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, {BRAND.name} shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, or any loss
              of profits or revenues.
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div
          className="flex justify-end gap-3 border-t border-white/5 bg-black/20 px-6 py-4"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
          >
            Back to Signup
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p
        className="mt-8 text-center text-[11px] font-medium"
        style={{ color: "rgba(245,242,255,0.35)" }}
      >
        © {new Date().getFullYear()} {BRAND.name} — All rights reserved
      </p>
    </div>
  );
}
