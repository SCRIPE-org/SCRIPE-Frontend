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

Security at the **UI Layer** is handled by `usePermissions`.

```typescript
const { hasPermission, hasRole } = usePermissions();

if (hasPermission("products:delete")) {
  // Show Delete Button
}
```

**Note:** Always enforce these checks on the **Backend** API as well. Frontend checks are just for UX!
