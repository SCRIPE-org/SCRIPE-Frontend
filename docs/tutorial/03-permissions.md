# 🛡️ Adding Permissions (RBAC)

This guide shows how to protect your module with Role-Based Access Control.

---

## 1. Define Permissions

Add your new module's permissions to `src/core/common/types/permissions.ts`.

```typescript
export type Permission = 
  // ... existing
  | 'categories:read'
  | 'categories:create'
  | 'categories:delete';
```

---

## 2. Assign to Roles

Update the `ROLES` constant in the same file.

```typescript
export const ROLES = {
  ADMIN: {
    // ...
    permissions: [
      // ...
      'categories:read',
      'categories:create',
      'categories:delete'
    ]
  },
  USER: {
    permissions: ['categories:read'] // Read-only access
  }
};
```

---

## 3. Protect Routes

Update `PAGE_PERMISSIONS` in `src/core/common/types/permissions.ts`.

```typescript
export const PAGE_PERMISSIONS = {
  // ...
  '/categories': ['categories:read'],
  '/categories/new': ['categories:create'],
};
```

Now, if a user without `categories:read` tries to visit `/categories`, they will be redirected to `/not-authorized`.

---

## 4. Protect UI Elements

Hide buttons for unauthorized actions using `usePermissions`.

```tsx
import { usePermissions } from "@core/hooks/use-permissions";

export function CategoryView() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h1>Categories</h1>
      
      {hasPermission('categories:create') && (
        <Button>Create New</Button>
      )}
      
      <CategoryList />
    </div>
  );
}
```

---

## 5. Summary

1. **Type it**: Add to `Permission` type.
2. **Assign it**: Add to `ROLES`.
3. **Route it**: Add to `PAGE_PERMISSIONS`.
4. **View it**: Use `hasPermission()` hook.
