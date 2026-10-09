# SCRIPE Party Workspace — Frontend / Backend Gap Analysis (Wave 1 Closure)

## Executive Summary
This document establishes the exact boundary between frontend capabilities delivered in **Wave 1** and the active backend contracts delivered by Codex under **ADR-001** and **ADR-002**.

By strictly observing backend boundaries, the frontend guarantees that **no imaginary endpoints, fabricated audit event streams, or speculative CRM screens** were introduced.

---

## 1. Contract Alignment Status by Feature Area

| Feature Domain | Backend Endpoint Contract | Frontend Implementation | Alignment Status | Notes / Wave 2 Dependencies |
|---|---|---|---|---|
| **Atomic Person Creation** | `POST /api/v1/Parties/people` | `PartyRepository.createPerson` | **100% Aligned** | Transmits verbatim `fullName`, optional `displayName`, `givenName`, `middleNames`, `familyName`, and `Idempotency-Key`. |
| **Atomic Organization Creation** | `POST /api/v1/Parties/organizations` | `PartyRepository.createOrganization` | **100% Aligned** | Separates mandatory `legalName` from optional `displayName`. Dispatches `Idempotency-Key`. |
| **Contact Points** | `POST/GET /api/v1/contact-points` | `ContactPointRepository` | **100% Aligned** | Handles telephonic and email endpoints. Fired as secondary non-blocking writes during party creation. |
| **Physical Addresses** | *(Not in P1 contract)* | Informational Disclaimer in Overview | **Truthfully Guarded** | Postal and facility address storage is scheduled for Wave 2 under the `PartyAddress` specification. |
| **Party Relationships** | `GET/POST /api/v1/party-relationships` | `PartyRelationshipRepository` | **100% Aligned** | Powers general inter-party links and Organization Authorized Representatives. |
| **Party Roles** | `GET/POST /api/v1/party-roles` | `PartyRoleRepository` | **100% Aligned** | Associates parties with tenant roles (Coach, Customer, Athlete). |
| **Tax ID & CR Verification** | *(Registry verification pending)* | Text capture with Wave 2 governance notice | **Truthfully Guarded** | Front-facing disclaimer informs operators that national registry validation will arrive in Wave 2. |
| **Continuous Activity Feed** | *(Continuous event log pending)* | Canonical Audit & Metadata tab | **Truthfully Guarded** | Renders real `createdAt`, `modifiedAt`, `RowVersion`, and deduplication candidates. No fake timeline fabricated. |
| **Contact Search Indexing** | Query on `displayName`, `legalName` | Standard directory search | **100% Aligned** | Avoids advertising fuzzy phone/email search until backend Elasticsearch/Trigram indexer is deployed. |
| **Venue Customer Picker** | `CustomerSelection` in Venue module | Verbatim `fullName` & phone preservation | **100% Aligned** | Venue workflows preserved without breaking required phone validation for facility bookings. |

---

## 2. Key Architectural Invariants Enforced

### 2.1 Immutability of Identity Type & PartyId (ADR-002)
- Once created, a Party's `Type` (`Person` or `Organization`) cannot be edited. The UI renders this as an immutable identity badge with lock iconography.
- The canonical encrypted `PartyId` is prominently displayed with copy-to-clipboard functionality and is strictly non-editable across all edit dialogs.

### 2.2 Truthful Non-Blocking Writes
- If secondary contact points (telephone/email) fail to persist during person or organization creation, the frontend does not roll back or mask the primary party creation. The canonical party remains intact and navigable, and an idempotent retry path is preserved.

### 2.3 Venue Integration Protection
- SCRIPE Venue customer selection requires phone validation for court/pitch bookings. The enterprise party creation flow preserves telephone capture as primary and flags readiness status without modifying unrelated booking engine logic.

---

## 3. Wave 2 Roadmap & Next Steps

1. **PartyAddress Integration:** Implement physical and postal address models once the backend EF Core entity configuration and migrations are applied.
2. **National Registry Verification:** Connect commercial registration (CR) and Tax IDs to live governmental verification APIs (e.g. ZATCA / Wathq in Saudi Arabia).
3. **Continuous Activity Timeline:** Ingest Outbox event logs to render real-time audit history of bookings, contracts, and attendance across modules.
4. **Fuzzy Contact Search:** Enable sub-second phone and email lookup in the directory header search once backend Trigram search indexes are activated.
