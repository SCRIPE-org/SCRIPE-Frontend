# PRODUCT.md

> Product-context anchor for the `impeccable` design skill. Read this before any auth/signup/onboarding UI work.

register: product

## Product

**SCRIPE — Sports Operations OS.** The operating system for the people who run
the game: sports academies, clubs, and venue operators. Three verticals on one
horizontal enterprise foundation:

- **SCRIPE Venue** — facility operations, resource scheduling and booking.
- **SCRIPE Academy** — multi-sport academy operations: squads, sessions,
  attendance, staff, players, guardians, finance.
- **SCRIPE Football Intelligence** — coach intelligence: position trials,
  fixed-position development, evaluations, player development timelines.

Football is the first vertical wedge; the platform is not football-only.
Never present SCRIPE as a generic B2B SaaS platform — the buyer must
recognize their own operation (pitches, sessions, players) on every brand
surface. Two go-to-market motions:

- **Self-service signup + onboarding** — an academy/club/venue creates an
  account, verifies, picks a plan, and provisions a workspace without sales.
- **Sales-assisted Enterprise** — larger organizations route to a sales-led
  motion (contact / demo) instead of self-checkout.

## Register

`product` — this is app UI / onboarding hybrid, not a marketing site.

- **Brand-entry surfaces** (login stage, signup welcome, discovery,
  plans/pricing): may earn _Committed_ color, sports-native staging (the
  tactical-board motif) and confident editorial treatment — they carry the
  trust-and-adopt decision.
- **Product task surfaces** (credentials form, account, email verify,
  workspace setup): _Restrained_ product UI — get the user through the task
  with clarity and zero friction, no persuasion theater.

## Who / Where / Why

- **Who:** the people who run sports organizations — academy owners and
  directors, club managers, venue operators, head coaches, admins. They are
  practical, time-poor, often mobile-first, and comparing against
  spreadsheets/WhatsApp chaos as much as against competing software.
- **What convinces them:** their own world reflected back — sessions,
  attendance, squads, player development, pitch/facility booking — run
  professionally. Infrastructure vocabulary (multi-tenancy, uptime,
  encryption grades) is table stakes, never the pitch.
- **Where:** desktop and mobile, in a focused evaluation or daily-operations
  session. Arabic-speaking markets are first-class, not an afterthought.
- **Why:** deciding whether to **trust** the platform with their operation
  and **adopt** it. Every screen either earns confidence or leaks it.

## Constraints (must respect)

- **Multi-tenant** — each signup provisions an isolated workspace/tenant.
  (Architecture fact; never marketing copy.)
- **Multi-currency** — pricing is auto-detected and country-locked (geo-IP);
  currency is not freely user-switchable.
- **Bilingual** — English and Arabic, with full **RTL** support. Layouts,
  motion, and alignment must work mirrored. The SCRIPE mark never mirrors.
- Frontend gates are UX-only; the backend is the security gatekeeper.
- Visual identity: Relay vNext (root `DESIGN.md`) — Signal Lime + Ink +
  Carbon + Graphite + Mineral. No purple/violet legacy, no glassmorphism.

## Tone

Confident, trustworthy, precise — **Linear / Stripe-grade, for sport**.

- Not playful, not loud, not "fun." Sports-native, not sports-cartoon.
- No hype copy, no exclamation marks, no emoji in product chrome.
- No generic AI-looking copy ("Manage. Secure. Scale.", "trusted by industry
  leaders", "military-grade") — banned by `SCRIPE_AI_CONTEXT_MASTER.md`.
- Clarity over cleverness. The product should feel like the operating system
  a serious sports organization runs on.
