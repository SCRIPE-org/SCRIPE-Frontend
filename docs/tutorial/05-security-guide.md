# 🔒 Security Guide: Best Practices

This template comes with built-in security features. Here is how to use them.

---

## 1. Input Sanitization

**Goal:** Prevent XSS (Cross-Site Scripting) and Injection attacks.

We provide a specialized helper: `src/core/common/sanitize.ts`.

### Usage

```typescript
import { sanitizeHtml, validateEmail } from "@core/common/sanitize";

// 1. Sanitize HTML content before rendering
const safeContent = sanitizeHtml(userBioInput);

// 2. Validate Inputs
if (!validateEmail(emailInput)) {
  throw new Error("Invalid Email");
}
```

### Available Functions

- `sanitizeHtml(str)`: Escapes `< > & " '`
- `escapeForRegex(str)`: Safe regex pattern matching
- `validateEmail(str)`: Strict regex check
- `validatePhone(str)`: International format check
- `slugify(str)`: Safe URL generation
- `sanitizeFilename(str)`: Safe file upload names

---

## 2. API Security AND Retry Logic

The `ApiService` handles several security concerns automatically:

- **JWT Handling**: Automatically injects `Authorization: Bearer` token.
- **Refresh Token Rotation**: Automatically handles 401 errors to refresh session without logging user out.
- **Secure Headers**: Sets `Content-Type` and `Accept`.

### usage with Retry

For sensitive or unstable operations, use the `WithRetry` methods:

```typescript
// Retries 3 times if server returns 500, 502, 503
await api.getWithRetry("/critical-data");
```

---

## 3. RBAC (Role-Based Access Control)

Security at the **UI Layer** is handled by `usePermission` hook and `PermissionGate` component.

### Using the Hook

```typescript
import { usePermission, usePermissions } from "@core/hooks/use-permission";

// Single permission check
const canDelete = usePermission("products.delete");

// Multiple checks
const { has, hasAny, hasAll } = usePermissions();
if (hasAny(["products.update", "products.delete"])) {
  // Show action buttons
}
```

### Using the Component

```tsx
import { PermissionGate } from "@core/components/permission-gate";

<PermissionGate permission="products.delete">
  <DeleteButton />
</PermissionGate>;
```

---

## 4. Security Architecture

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Untrusted Zone)                          │
│  • Permissions stored in localStorage               │
│  • Can be modified by user (intentionally!)         │
│  • Purpose: UX only - hide irrelevant buttons       │
└─────────────────────────────────────────────────────┘
                        │
                        ▼ API Request
┌─────────────────────────────────────────────────────┐
│  BACKEND (Trusted Zone) ← REAL SECURITY HERE       │
│  • JWT token validation (cryptographic)             │
│  • [PermissionRequired] attributes on endpoints     │
│  • Privilege escalation prevention                  │
│  • Tenant isolation                                 │
└─────────────────────────────────────────────────────┘
```

> ⚠️ **Critical**: Frontend permission checks are for **UX only**. A malicious user CAN modify localStorage, but it WON'T give them access because the backend enforces all permissions server-side.

---

## 5. When to Refresh Permissions

| Data          | When Fetched  | Auto-Refresh?     |
| ------------- | ------------- | ----------------- |
| Access Token  | Login         | ✅ Yes (on 401)   |
| Refresh Token | Login         | ❌ No             |
| Permissions   | Login (GetMe) | ❌ Must re-login  |
| Menu Items    | After Login   | ✅ Manual refresh |

---

## 6. Summary

| Layer                    | Responsibility                        |
| ------------------------ | ------------------------------------- |
| **Frontend**             | Hide buttons, improve UX              |
| **Backend**              | Enforce security, reject unauthorized |
| **JWT**                  | Cryptographic proof of identity       |
| **[PermissionRequired]** | Granular API protection               |
