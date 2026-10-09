# SCRIPE Party Workspace — Enterprise Frontend & UX Completion (Wave 1)

## Executive Summary
This document provides the complete architecture and technical implementation record for **Wave 1** of the SCRIPE Enterprise Party Workspace. Operating under **ADR-001** and **ADR-002**, the legacy PartyKernel CRUD table was transformed into an enterprise-grade People & Organizations directory, dedicated Person 360 profile, and Organization 360 workspace.

The implementation strictly honors SCRIPE Clean Architecture, Design System tokens (`@core/ui/*`), dark graphite & lime visual identity, zero git-remote pollution, and full bilingual parity (English LTR and Arabic RTL).

---

## 1. Architectural Architecture & Sub-Module Map

All code is strictly located within `src/modules/party-kernel/party-kernel/` and adheres to the monorepo sub-module isolation invariants:
- **Zero root-level code:** Root contains only sub-modules, `di.ts`, and public barrel exports.
- **Strict SOLID Data Flow:** `View → ViewModel (hook) → Repository → Service → IApiService → HTTP`.
- **Zero API leakage:** No `IApiService`, DTOs, or HTTP clients are imported into Views or ViewModels.
- **Local Endpoints:** All endpoint constants are co-located in `*.endpoints.ts` within each sub-module data layer.

### Sub-Module Inventory
| Sub-Module | Responsibility | Layers Present |
|---|---|---|
| `party` | Unified Directory, Person 360, Organization 360, Quick Preview, Atomic Create dialogs | `domain/`, `data/`, `presentation/`, `locales/` |
| `contact-point` | Telephone, Email, and Electronic Communication Channels | `domain/`, `data/`, `presentation/`, `locales/` |
| `party-person` | Individual Demographic Data, Minor Status, Protected DoB | `domain/`, `data/`, `presentation/`, `locales/` |
| `party-organization` | Corporate Legal Identity, Legal Name, Commercial Trading Name | `domain/`, `data/`, `presentation/`, `locales/` |
| `party-relationship` | Inter-party graph (Coaches, Representatives, Signatories, Guardians) | `domain/`, `data/`, `presentation/`, `locales/` |
| `party-role` | Operational context (Customer, Athlete, Partner, Staff) | `domain/`, `data/`, `presentation/`, `locales/` |
| `merge-candidate` | Deduplication flags and audit candidate matching | `domain/`, `data/`, `presentation/`, `locales/` |

---

## 2. Core Workflows & Implementation Details

### 2.1 Unified People & Organizations Directory
- **Path:** `src/modules/party-kernel/party-kernel/party/src/presentation/views/PartyDirectoryView.tsx`
- **ViewModel:** `usePartyDirectoryViewModel.ts`
- **Features:**
  - **Search-First UX:** Debounced text search querying displayName, legalName, and canonical ID.
  - **Type Filter Chips:** Instant switching between `All`, `People`, and `Organizations` with live badge count aggregations.
  - **Dual Layout Modes:** Responsive Table view with sortable columns and Card Grid view with party initials avatar and status badges.
  - **Contextual Actions:** Table row dropdown menus and card actions for Quick Preview (`PartyQuickPreviewSheet`), View Profile, Edit Display Name, and Delete (Tombstone).
  - **Server-Side Pagination:** Guarded page sizes (10, 20, 50, max 100) with total record counters.
  - **Quick Preview Drawer:** Slide-out sheet inspecting party profile, primary contact points, active roles, and recent relationships without full page navigation.

### 2.2 Atomic Person Creation
- **Path:** `src/modules/party-kernel/party-kernel/party/src/presentation/components/dialogs/CreatePersonDialog.tsx`
- **Repository Method:** `PartyRepository.createPerson(params)`
- **Endpoint:** `POST /api/v1/Parties/people`
- **ADR-002 Compliance:**
  - **FullName Preservation:** The exact human-entered name is transmitted verbatim to the server. No mechanical splitting into `FirstName`/`LastName` is enforced.
  - **Optional Structured Names:** An expandable accordion provides optional entry for `displayName`, `givenName`, `middleNames`, and `familyName`.
  - **Duplicate Detection Warning:** Live client-side check alerts staff if an identical name exists in the current tenant directory before submission.
  - **Idempotency Safeguard:** Generates and supplies a unique `Idempotency-Key` header per submission intent.
  - **Non-Blocking Secondary Writes:** Contact point persistence (phone/email) executes as independent, non-blocking calls, preventing partial failure from rolling back or obscuring the created canonical Party record.
  - **Seamless Navigation:** Upon server fulfillment, the dialog automatically routes the user directly to the new Person 360 profile.

### 2.3 Atomic Organization Creation
- **Path:** `src/modules/party-kernel/party-kernel/party/src/presentation/components/dialogs/CreateOrganizationDialog.tsx`
- **Repository Method:** `PartyRepository.createOrganization(params)`
- **Endpoint:** `POST /api/v1/Parties/organizations`
- **Identity Distinction:**
  - Enforces mandatory `legalName` (official registered entity title) while allowing distinct `displayName` (commercial trading name).
  - Clear governance disclaimer noting that formal Tax ID / Commercial Registration validation is handled under Wave 2 registry integration.
  - Generates `Idempotency-Key` and routes staff to the Organization 360 profile upon creation.

### 2.4 Person 360 Profile
- **Path:** `src/modules/party-kernel/party-kernel/party/src/presentation/views/PartyProfileView.tsx`
- **ViewModel:** `usePartyProfileViewModel.ts`
- **Capabilities:**
  - **Identity Header:** Shows Avatar initials, Verified Person badge, Canonical Party ID with copy-to-clipboard, Created timestamp, and Immutable Identity Type badge.
  - **Data Completeness Score Meter:** Computes a 0–100% profile completeness index based on presence of verified name, telephone, electronic email, demographic data, and assigned operational roles.
  - **Privacy Protected Demographics:** Date of birth is masked with privacy messaging to prevent unauthorized exposure.
  - **Contextual Address Disclaimer:** Informs operators that physical/postal address storage is scheduled for Wave 2 under the `PartyAddress` specification.
  - **Tabbed Sub-Workspaces:**
    1. *Overview:* Demographics, primary contacts summary, address disclaimer, and completeness checks.
    2. *Contact Methods:* Complete list of phone/email points with primary indicator badges, verification chips, and creation dialog.
    3. *Relationships:* Active links to organizations (e.g. "CoachOf", "AthleteOf") and guardians.
    4. *Roles & Associations:* Tenant business roles (Customer, Coach, Athlete).
    5. *Audit & Identity:* Tenant isolation metadata, record status (Active/Tombstone), and deduplication alerts.

### 2.5 Organization 360 Profile
- **Path:** `src/modules/party-kernel/party-kernel/party/src/presentation/views/PartyProfileView.tsx`
- **Dedicated Organization Workspaces:**
  - **Corporate Legal Identity Card:** Renders official registered legal title, commercial trading name, tax identifier, and count of authorized liaisons.
  - **Dedicated Representatives & Key Contacts Tab:**
    - Exclusively activated for Organization parties.
    - Aggregates all inter-party relationships of types `Representative`, `AuthorizedSignatory`, `LegalLiaison`, or `ManagingDirector`.
    - Features direct "View Person Profile" navigation buttons to seamlessly cross-reference authorized individuals.
    - Features dedicated "Add Representative" action pre-filtered to the representative relationship domain.

---

## 3. Design System & Accessibility Compliance

1. **Design System Mandate:**
   - 100% of user interface components utilize `@core/ui/*` primitives (`Button`, `Input`, `Dialog`, `Sheet`, `Tabs`, `Card`, `Badge`, `DropdownMenu`, `Table`, `Select`, `Label`).
   - Zero raw HTML input elements (`<input>`, `<select>`, `<button>`).
2. **Palette & Tokens:**
   - Dark Graphite theme (`bg-nx-surface`, `bg-nx-surface-2`, `border-nx-border`).
   - Lime Accent highlights (`text-nx-accent`, `bg-nx-accent/10`, `border-nx-accent`).
3. **Bilingual Support (English LTR & Arabic RTL):**
   - Zero missing locale keys. 100% key parity verified via Vitest automated assertion.
   - Flawless RTL layout mirroring with semantic margins (`mr-2` / `gap-2`), flex directions, and localized typography.
4. **Mobile Responsiveness:**
   - Grid and table collapse gracefully to single-column cards on viewports under 640px.
   - Zero horizontal scrollbar overflow.

---

## 4. Verification Evidence Summary

- **TypeScript Compilation:** `npx tsc --noEmit` exited with **0 errors**.
- **Vitest Unit Suite:** **22 tests passed** (4 test suites across Presentation, Repositories, ViewModels, and Locale Parity).
- **Playwright E2E Suite:** **10/10 tests passed** covering directory search, dual view modes, atomic creation, profile tabs, Arabic RTL, and mobile layout.
- **Visual Artifacts:** All **10 required screenshots** captured and archived to `reports/screenshots/`.
