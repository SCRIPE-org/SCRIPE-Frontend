
# Services Architecture

> **MANDATORY**: All services MUST use interface/implementation separation and be registered in the ServiceProvider.

## Folder Structure

```
src/core/services/
├── interfaces/           # Service interfaces (contracts)
│   ├── api.interface.ts
│   ├── auth.interface.ts
│   └── index.ts
├── endpoints.ts          # API endpoint constants
├── api.service.ts        # ApiService implementation
├── auth.service.ts       # AuthService implementation
├── service-provider.tsx  # DI container with React Context
└── index.ts             # Main exports
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Interface | `I{ServiceName}` | `IApiService` |
| Implementation | `{ServiceName}` | `ApiService` |
| File (Interface) | `{name}.interface.ts` | `api.interface.ts` |
| File (Service) | `{name}.service.ts` | `api.service.ts` |

## Creating a New Service

### 1. Define the Interface

```typescript
// src/core/services/interfaces/auth.interface.ts
export interface IAuthService {
  login(email: string, password: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<string>;
}
```

### 2. Create the Implementation

```typescript
// src/core/services/auth.service.ts
import type { IAuthService } from './interfaces';
import type { IApiService } from './interfaces';
import { API_ENDPOINTS } from './endpoints';

export class AuthService implements IAuthService {
  constructor(private apiService: IApiService) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.apiService.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  }

  async logout(): Promise<void> {
    await this.apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    this.apiService.clearTokens();
  }

  async refreshToken(): Promise<string> {
    const { token } = await this.apiService.post(API_ENDPOINTS.AUTH.REFRESH);
    return token;
  }
}
```

### 3. Register in ServiceProvider

```typescript
// src/core/services/service-provider.tsx
export interface Services {
  apiService: IApiService;
  authService: IAuthService;  // Add here
}

export function ServiceProvider({ children }) {
  const services = useMemo(() => {
    const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || '');
    const authService = new AuthService(apiService);  // Inject dependencies
    
    return { apiService, authService };
  }, []);
  
  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}
```

### 4. Use in Components

```typescript
// In any component
import { useServices } from '@/core/services';

function LoginForm() {
  const { authService } = useServices();
  
  const handleLogin = async () => {
    await authService.login(email, password);
  };
}
```

## Using Endpoints

```typescript
import { API_ENDPOINTS } from '@/core/services';

// Static endpoint
await apiService.get(API_ENDPOINTS.USERS.BASE);

// Dynamic endpoint
await apiService.get(API_ENDPOINTS.USERS.BY_ID('123'));
```

## Rules

1. ✅ **Always use interfaces** - Never depend on concrete implementations
2. ✅ **Inject dependencies** - Services receive dependencies via constructor
3. ✅ **Use API_ENDPOINTS** - Never hardcode endpoint strings
4. ✅ **Register in ServiceProvider** - All services must be in the DI container
5. ❌ **Never import services directly** - Always use `useServices()` hook


