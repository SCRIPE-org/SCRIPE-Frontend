import { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@core/config/branding";
import Image from "next/image";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BRAND.name}`,
  description: `Read the Privacy Policy for ${BRAND.name} platform.`,
};

export default function PrivacyPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-10"
      style={{
        background: "var(--sx-bg, #050506)",
        backgroundImage:
          "radial-gradient(140% 90% at 25% 25%, #151719 0%, #0D0D0E 40%, #050506 80%, #030304 100%)",
      }}
    >
      {/* Ambient glow — one static Signal Lime signal, not two competing hues */}
      <div
        className="pointer-events-none fixed left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,255,0,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <Image src="/brand/app-logo-1024.png" alt={BRAND.name} className="mb-2 h-10 w-auto" />
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "rgba(247,248,245,0.5)" }}
        >
          Legal Agreement
        </span>
      </div>

      {/* Card container */}
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(21,23,25,.86), rgba(13,13,14,.92))",
          border: "1px solid rgba(198,255,0,.16)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,.5)",
        }}
      >
        <div className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[70vh] space-y-6 overflow-y-auto p-6 sm:p-10">
          <div className="border-b border-white/10 pb-4">
            <h1 className="text-3xl font-extrabold" style={{ color: "#F7F8F5" }}>
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs" style={{ color: "rgba(247,248,245,0.4)" }}>
              Last updated: June 4, 2026
            </p>
          </div>

          <div
            className="space-y-4 text-sm leading-relaxed"
            style={{ color: "rgba(247,248,245,0.75)" }}
          >
            <p>
              At <strong>{BRAND.name}</strong>, we take your privacy and data isolation seriously.
              This Privacy Policy describes how we collect, protect, and use data when you interact
              with our modular monolith business platform.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">1. Data We Collect</h2>
            <p>
              We collect information you provide directly, including name, email, payment processing
              details (encrypted and processed by certified third parties), and workspace settings.
              We also log diagnostic metadata (such as IP addresses and device details) for security
              purposes.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">2. Data Security & Isolation</h2>
            <p>
              We enforce strict tenant separation rules. Your workspace data is completely isolated
              using our Clean Architecture multi-tenancy rules (Single or Multi-database modes). All
              IDs are fully AES-encrypted in transit. We implement double-submit CSRF cookies and
              request nonces to prevent replay attacks.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">3. How We Use Information</h2>
            <p>
              We use the collected information to provision your workspace, verify your account,
              process billing, optimize platform performance, and send transaction/system
              notifications. We do not sell your personal data to advertisers.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">4. Sharing and Disclosure</h2>
            <p>
              We only share your information with trusted third-party services that are required to
              operate the platform (e.g. payment processors, email deliverability networks). All
              partners comply with strictly regulated privacy covenants.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">5. Cookies and Session State</h2>
            <p>
              We use secure, httpOnly session cookies to manage authenticated sessions. You can
              configure your browser to reject cookies, but doing so may limit your ability to
              access secure dashboard and studio sections.
            </p>

            <h2 className="pt-2 text-lg font-bold text-white/90">6. Your Rights</h2>
            <p>
              You have the right to request access to the personal data we hold about you, request
              corrections, or request deletion of your account. Note that backup and transactional
              logs may retain traces under compliance constraints.
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
        style={{ color: "rgba(247,248,245,0.35)" }}
      >
        © {new Date().getFullYear()} {BRAND.name} — All rights reserved
      </p>
    </div>
  );
}
