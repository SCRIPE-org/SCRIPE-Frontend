---
description: How to create a new business module following Clean Architecture
---

# Creating a New Module

This workflow guides you through creating a new isolated business module in the Verified App.

## Prerequisites

- Understand the [Architecture Rules](../.rules/architecture.md)
- Understand the [Boundary Rules](../.rules/boundaries.md)

---

## Step 1: Copy the Template

```powershell
# From project root
Copy-Item -Recurse "src/modules/_template" "src/modules/{module-name}"
```

Example for creating an RFQ module:
```powershell
Copy-Item -Recurse "src/modules/_template" "src/modules/rfq"
```

---

## Step 2: Define Domain Entities

Create your Zod schemas in `src/modules/{name}/src/domain/entities/`:

```typescript
// src/modules/rfq/src/domain/entities/RFQ.ts
import { z } from 'zod';

export const RFQSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  status: z.enum(['draft', 'published', 'closed']),
  deadline: z.coerce.date(),
  createdAt: z.coerce.date(),
});

export type RFQ = z.infer<typeof RFQSchema>;
```

---

## Step 3: Define Repository Interface

Create the contract in `src/modules/{name}/src/domain/interfaces/`:

```typescript
// src/modules/rfq/src/domain/interfaces/IRFQRepository.ts
import { Result } from '@core/common/Result';
import { AppError } from '@core/common/AppError';
import { RFQ } from '../entities/RFQ';

export interface IRFQRepository {
  getAll(): Promise<Result<RFQ[], AppError>>;
  getById(id: string): Promise<Result<RFQ, AppError>>;
  create(data: Omit<RFQ, 'id' | 'createdAt'>): Promise<Result<RFQ, AppError>>;
  update(id: string, data: Partial<RFQ>): Promise<Result<RFQ, AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;
}
```

---

## Step 4: Create API Models & Mappers

Define DTOs in `src/modules/{name}/src/data/models/`:

```typescript
// src/modules/rfq/src/data/models/RFQDto.ts
export interface RFQDto {
  rfq_id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  created_at: string;
}
```

Create mappers in `src/modules/{name}/src/data/mappers/`:

```typescript
// src/modules/rfq/src/data/mappers/RFQMapper.ts
import { RFQ } from '../../domain/entities/RFQ';
import { RFQDto } from '../models/RFQDto';

export const RFQMapper = {
  toDomain(dto: RFQDto): RFQ {
    return {
      id: dto.rfq_id,
      title: dto.title,
      description: dto.description,
      status: dto.status as RFQ['status'],
      deadline: new Date(dto.deadline),
      createdAt: new Date(dto.created_at),
    };
  },
  
  toDto(entity: Omit<RFQ, 'id' | 'createdAt'>): Omit<RFQDto, 'rfq_id' | 'created_at'> {
    return {
      title: entity.title,
      description: entity.description,
      status: entity.status,
      deadline: entity.deadline.toISOString(),
    };
  },
};
```

---

## Step 5: Implement Repository

Create implementation in `src/modules/{name}/src/data/repositories/`:

```typescript
// src/modules/rfq/src/data/repositories/RFQRepository.ts
import { IRFQRepository } from '../../domain/interfaces/IRFQRepository';
import { RFQ } from '../../domain/entities/RFQ';
import { Result, ok, err } from '@core/common/Result';
import { AppError } from '@core/common/AppError';
import { apiService } from '@core/network';
import { RFQMapper } from '../mappers/RFQMapper';
import { RFQDto } from '../models/RFQDto';

export class RFQRepository implements IRFQRepository {
  async getAll(): Promise<Result<RFQ[], AppError>> {
    try {
      const response = await apiService.get<RFQDto[]>('/rfqs');
      return ok(response.data.map(RFQMapper.toDomain));
    } catch (error) {
      return err(AppError.fromUnknown(error));
    }
  }
  
  // Implement other methods...
}
```

---

## Step 6: Register in DI Container

Update `src/modules/{name}/di.ts`:

```typescript
// src/modules/rfq/di.ts
import { RFQRepository } from './src/data/repositories/RFQRepository';
import type { IRFQRepository } from './src/domain/interfaces/IRFQRepository';

export interface RFQContainer {
  rfqRepository: IRFQRepository;
}

export const createRFQContainer = (): RFQContainer => ({
  rfqRepository: new RFQRepository(),
});

export const container = createRFQContainer();
```

---

## Step 7: Create ViewModels

Create hooks in `src/modules/{name}/src/presentation/viewmodels/`:

```typescript
// src/modules/rfq/src/presentation/viewmodels/useRFQs.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di';

export const rfqKeys = {
  all: ['rfqs'] as const,
  list: () => [...rfqKeys.all, 'list'] as const,
  detail: (id: string) => [...rfqKeys.all, 'detail', id] as const,
};

export function useRFQs() {
  const repo = container.rfqRepository;
  
  return useQuery({
    queryKey: rfqKeys.list(),
    queryFn: async () => {
      const result = await repo.getAll();
      if (result.isErr()) throw result.error;
      return result.value;
    },
  });
}
```

---

## Step 8: Create Views

Create client components in `src/modules/{name}/src/presentation/views/`:

```typescript
// src/modules/rfq/src/presentation/views/RFQListView.tsx
'use client';

import { useRFQs } from '../viewmodels/useRFQs';

export function RFQListView() {
  const { data, isLoading, error } = useRFQs();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data?.map(rfq => (
        <li key={rfq.id}>{rfq.title}</li>
      ))}
    </ul>
  );
}
```

---

## Step 9: Create Route Connector

Create the page in `src/app/(modules)/{name}/page.tsx`:

```typescript
// src/app/(modules)/rfq/page.tsx
import { Metadata } from 'next';
import { RFQListView } from '@modules/rfq/src/presentation/views/RFQListView';

export const metadata: Metadata = {
  title: 'RFQs | Verified',
  description: 'Manage Request for Quotations',
};

export default function RFQPage() {
  return (
    <main>
      <h1>Request for Quotations</h1>
      <RFQListView />
    </main>
  );
}
```

---

## Step 10: Add Navigation (Optional)

Update sidebar navigation if needed:

```typescript
// In your navigation config
{
  label: 'RFQ',
  href: '/rfq',
  icon: FileTextIcon,
}
```

---

## Checklist

- [ ] Template copied to `src/modules/{name}/`
- [ ] Domain entities defined with Zod schemas
- [ ] Repository interface defined
- [ ] API DTOs created
- [ ] Mappers implemented
- [ ] Repository implementation complete
- [ ] DI container registered
- [ ] ViewModels (hooks) created
- [ ] Views (client components) created
- [ ] Route page created in `src/app/`
- [ ] Navigation updated (if applicable)
