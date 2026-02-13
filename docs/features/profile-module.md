# Profile Module

> Profile management, security settings, 2FA setup/disable, active sessions, and activity log.

---

## Overview

The profile module provides self-service functionality for authenticated admins — viewing and editing their profile, managing security settings (password change, 2FA), viewing active sessions across devices, and reviewing their security activity log.

---

## Module Structure

```
modules/profile/
├── di.ts                           # DI container (profileRepository)
├── index.ts                        # Public exports
└── src/
    ├── domain/
    │   ├── entities/
    │   │   ├── Profile.ts          # Admin profile schema
    │   │   └── SecurityLog.ts      # Security event schema
    │   └── interfaces/
    │       └── IProfileRepository.ts
    ├── data/
    │   ├── models/
    │   │   └── ProfileModels.ts    # API DTOs
    │   ├── mappers/
    │   │   └── ProfileMapper.ts    # DTO ↔ Entity
    │   └── repositories/
    │       └── ProfileRepository.ts # API calls
    └── presentation/
        ├── viewmodels/
        │   ├── useProfileViewModel.ts       # Profile info & edit
        │   ├── useSecurityViewModel.ts      # Password, 2FA
        │   ├── useSessionsViewModel.ts      # Active sessions
        │   └── useActivityLogViewModel.ts   # Security activity
        ├── views/
        │   ├── ProfileView.tsx              # Profile page
        │   ├── ProfileSecurityView.tsx      # Security settings
        │   ├── ProfileSessionsView.tsx      # Sessions list
        │   └── ProfileActivityView.tsx      # Activity log
        └── components/
            ├── AvatarUpload.tsx              # Avatar upload/remove
            ├── PasswordChangeDialog.tsx      # Change password dialog
            ├── TwoFactorSetupDialog.tsx      # 2FA enable + QR code
            └── TwoFactorDisableDialog.tsx    # 2FA disable (2-step)
```

---

## Pages

### Profile Page (`/profile`)

| Section | ViewModel | Description |
|---------|-----------|-------------|
| Avatar | `useProfileViewModel` | Upload/remove avatar photo |
| Info Form | `useProfileViewModel` | Edit name, email, phone |

### Security Page (`/profile/security`)

| Section | ViewModel | Description |
|---------|-----------|-------------|
| Password | `useSecurityViewModel` | Change password |
| Two-Factor Auth | `useSecurityViewModel` | Enable/disable 2FA |
| Backup Codes | `useSecurityViewModel` | Regenerate backup codes |

### Sessions Page (`/profile/sessions`)

| Section | ViewModel | Description |
|---------|-----------|-------------|
| Session List | `useSessionsViewModel` | All active sessions |
| Revoke | `useSessionsViewModel` | Revoke individual/all |

### Activity Log Page (`/profile/activity`)

| Section | ViewModel | Description |
|---------|-----------|-------------|
| Log Table | `useActivityLogViewModel` | Paginated security events |

---

## Key ViewModels

### useSecurityViewModel

Handles all security-related operations:

```typescript
export function useSecurityViewModel() {
    const repo = container.profileRepository;
    
    // 2FA state
    const [showSetupDialog, setShowSetupDialog] = useState(false);
    const [showDisableDialog, setShowDisableDialog] = useState(false);
    
    // Change password
    const changePasswordMutation = useMutation({
        mutationFn: (data) => repo.changePassword(data.currentPassword, data.newPassword),
    });
    
    // Enable 2FA
    const enable2FAMutation = useMutation({
        mutationFn: (password) => repo.enable2FA(password),
    });
    
    // Disable 2FA (2-step: password + OTP/backup code)
    const disable2FA = async (password: string, twoFactorCode: string) => {
        await repo.disable2FA(password, twoFactorCode);
    };
    
    // Regenerate backup codes
    const regenerateBackupCodes = useMutation({
        mutationFn: (data) => repo.regenerateBackupCodes(data.password, data.code),
    });
    
    return { changePassword, enable2FA, disable2FA, ... };
}
```

### TwoFactorDisableDialog

Two-step verification dialog:
1. **Step 1**: Enter password → click "Next"
2. **Step 2**: Enter OTP **or** toggle to backup code → click "Disable"

This ensures 2FA cannot be disabled with just a stolen password.

---

## SOLID Pattern Compliance

| Principle | Implementation |
|-----------|---------------|
| **Single Responsibility** | Separate ViewModels for profile, security, sessions, activity |
| **Open/Closed** | ViewModels compose base TanStack Query hooks |
| **Interface Segregation** | Each view receives only the props it needs |
| **Dependency Inversion** | ViewModels depend on `IProfileRepository` interface |

---

## Related Backend Docs

- [Profile Management](../../ASP.Net-Login-Project-CQRS/docs/features/profile-management.md)
- [Two-Factor Auth](../../ASP.Net-Login-Project-CQRS/docs/features/two-factor-auth.md)
- [Session Management](../../ASP.Net-Login-Project-CQRS/docs/features/session-management.md)
