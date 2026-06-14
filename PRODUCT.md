# PRODUCT.md

> Product-context anchor for the `impeccable` design skill. Read this before any signup/onboarding UI work.

register: product

## Product

**SCRIPE** — an enterprise-grade modular B2B SaaS platform. Two go-to-market motions:

- **Self-service signup + onboarding** — buyers create an account, verify, pick a plan, and provision a workspace without talking to sales.
- **Sales-assisted Enterprise** — larger orgs route to a sales-led motion (contact / demo) instead of self-checkout.

This file scopes the **self-service signup/onboarding flow** redesign.

## Register

`product` — this is app UI / onboarding hybrid, not a marketing site.

- **Conversion surfaces** (onboarding, discovery, plans/pricing): may earn *Committed* color and confident editorial treatment because they carry the trust-and-adopt decision.
- **Product task surfaces** (account, email verify, workspace setup): *Restrained* product UI — get the user through the task with clarity and zero friction, no persuasion theater.

## Who / Where / Why

- **Who:** business buyers — founders, ops leads, IT admins — evaluating SCRIPE for their org. They are skeptical, time-poor, and comparing alternatives.
- **Verticals:** General, ERP, Healthcare. The flow must read as credible to all three (Healthcare buyers especially weigh trust signals).
- **Where:** desktop and mobile, in a focused evaluation session. Not casual browsing.
- **Why:** deciding whether to **trust** the platform and **adopt** it. Every screen either earns confidence or leaks it.

## Constraints (must respect)

- **Multi-tenant** — each signup provisions an isolated workspace/tenant.
- **Multi-currency** — pricing is auto-detected and country-locked (geo-IP); currency is not freely user-switchable.
- **Bilingual** — English and Arabic, with full **RTL** support. Layouts, motion, and alignment must work mirrored.
- Frontend gates are UX-only; the backend is the security gatekeeper.

## Tone

Confident, trustworthy, precise — **Linear / Stripe-grade**.

- Not playful, not loud, not "fun."
- No hype copy, no exclamation marks, no emoji in product chrome.
- Clarity over cleverness. The product should feel like infrastructure a serious company runs on.
