---
description: How to implement data fetching following Clean Architecture
---

# Data Fetching Workflow

This workflow describes the complete path from API endpoint to rendered UI following Clean Architecture principles.

## Overview

```
┌─────────────┐   ┌────────┐   ┌──────────┐   ┌───────────┐   ┌──────┐
│  Interface  │ → │  Repo  │ → │ ViewModel│ → │   View    │ → │  UI  │
│  (Contract) │   │ (Impl) │   │  (Hook)  │   │ (Client)  │   │      │
└─────────────┘   └────────┘   └──────────┘   └───────────┘   └──────┘
     Domain          Data       Presentation   Presentation
```

---

## Step 1: Define the Interface (Domain Layer)

Create the repository contract. This defines WHAT operations are available, not HOW they work.

**Location**: `src/modules/{name}/src/domain/interfaces/`

```typescript
// src/modules/hr/src/domain/interfaces/IEmployeeRepository.ts
import { Result } from '@core/common/Result';
import { AppError } from '@core/common/AppError';
import { Employee } from '../entities/Employee';

export interface GetEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IEmployeeRepository {
  getAll(params?: GetEmployeesParams): Promise<Result<PaginatedResult<Employee>, AppError>>;
  getById(id: string): Promise<Result<Employee, AppError>>;
  create(data: CreateEmployeeInput): Promise<Result<Employee, AppError>>;
  update(id: string, data: UpdateEmployeeInput): Promise<Result<Employee, AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;
}
```

---

## Step 2: Create API Models (Data Layer)

Define the DTO that matches the API response shape.

**Location**: `src/modules/{name}/src/data/models/`

```typescript
// src/modules/hr/src/data/models/EmployeeDto.ts
export interface EmployeeDto {
  employee_id: string;
  full_name: string;
  email_address: string;
  department_code: string;
  hire_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeListResponseDto {
  items: EmployeeDto[];
  total_count: number;
  current_page: number;
  total_pages: number;
}
```

---

## Step 3: Create Mapper (Data Layer)

Transform DTOs to domain entities and vice versa.

**Location**: `src/modules/{name}/src/data/mappers/`

```typescript
// src/modules/hr/src/data/mappers/EmployeeMapper.ts
import { Employee } from '../../domain/entities/Employee';
import { EmployeeDto, EmployeeListResponseDto } from '../models/EmployeeDto';
import { PaginatedResult } from '../../domain/interfaces/IEmployeeRepository';

export const EmployeeMapper = {
  toDomain(dto: EmployeeDto): Employee {
    return {
      id: dto.employee_id,
      name: dto.full_name,
      email: dto.email_address,
      department: dto.department_code,
      hireDate: new Date(dto.hire_date),
      isActive: dto.is_active,
    };
  },

  toPaginatedDomain(response: EmployeeListResponseDto): PaginatedResult<Employee> {
    return {
      data: response.items.map(EmployeeMapper.toDomain),
      total: response.total_count,
      page: response.current_page,
      totalPages: response.total_pages,
    };
  },

  toCreateDto(input: CreateEmployeeInput): Record<string, unknown> {
    return {
      full_name: input.name,
      email_address: input.email,
      department_code: input.department,
      hire_date: input.hireDate.toISOString(),
    };
  },
};
```

---

## Step 4: Implement Repository (Data Layer)

Create the concrete implementation using the API service.

**Location**: `src/modules/{name}/src/data/repositories/`

```typescript
// src/modules/hr/src/data/repositories/EmployeeRepository.ts
import { IEmployeeRepository, GetEmployeesParams, PaginatedResult } from '../../domain/interfaces/IEmployeeRepository';
import { Employee } from '../../domain/entities/Employee';
import { Result, ok, err } from '@core/common/Result';
import { AppError } from '@core/common/AppError';
import { apiService } from '@core/network';
import { EmployeeMapper } from '../mappers/EmployeeMapper';
import { EmployeeListResponseDto, EmployeeDto } from '../models/EmployeeDto';

export class EmployeeRepository implements IEmployeeRepository {
  
  async getAll(params?: GetEmployeesParams): Promise<Result<PaginatedResult<Employee>, AppError>> {
    try {
      const response = await apiService.get<EmployeeListResponseDto>('/employees', {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          search: params?.search,
          department: params?.department,
        },
      });
      
      return ok(EmployeeMapper.toPaginatedDomain(response.data));
    } catch (error) {
      return err(AppError.fromUnknown(error));
    }
  }

  async getById(id: string): Promise<Result<Employee, AppError>> {
    try {
      const response = await apiService.get<EmployeeDto>(`/employees/${id}`);
      return ok(EmployeeMapper.toDomain(response.data));
    } catch (error) {
      return err(AppError.fromUnknown(error));
    }
  }

  async create(data: CreateEmployeeInput): Promise<Result<Employee, AppError>> {
    try {
      const response = await apiService.post<EmployeeDto>(
        '/employees',
        EmployeeMapper.toCreateDto(data)
      );
      return ok(EmployeeMapper.toDomain(response.data));
    } catch (error) {
      return err(AppError.fromUnknown(error));
    }
  }

  async update(id: string, data: UpdateEmployeeInput): Promise<Result<Employee, AppError>> {
    try {
      const response = await apiService.patch<EmployeeDto>(
        `/employees/${id}`,
        data
      );
      return ok(EmployeeMapper.toDomain(response.data));
    } catch (error) {
      return err(AppError.fromUnknown(error));
    }
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    try {
      await apiService.delete(`/employees/${id}`);
      return ok(undefined);
    } catch (error) {
      return err(AppError.fromUnknown(error));
    }
  }
}
```

---

## Step 5: Create ViewModel (Presentation Layer)

Create hooks that wrap TanStack Query.

**Location**: `src/modules/{name}/src/presentation/viewmodels/`

```typescript
// src/modules/hr/src/presentation/viewmodels/useEmployees.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '../../di';
import type { GetEmployeesParams } from '../../domain/interfaces/IEmployeeRepository';

// Query key factory
export const employeeKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeKeys.all, 'list'] as const,
  list: (params: GetEmployeesParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, 'detail'] as const,
  detail: (id: string) => [...employeeKeys.details(), id] as const,
};

// List query hook
export function useEmployees(params: GetEmployeesParams = {}) {
  const repo = container.employeeRepository;

  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: async () => {
      const result = await repo.getAll(params);
      if (result.isErr()) {
        throw result.error;
      }
      return result.value;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Detail query hook
export function useEmployee(id: string) {
  const repo = container.employeeRepository;

  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: async () => {
      const result = await repo.getById(id);
      if (result.isErr()) {
        throw result.error;
      }
      return result.value;
    },
    enabled: !!id,
  });
}

// Create mutation hook
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const repo = container.employeeRepository;

  return useMutation({
    mutationFn: async (data: CreateEmployeeInput) => {
      const result = await repo.create(data);
      if (result.isErr()) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: () => {
      // Invalidate all employee lists
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Update mutation hook
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const repo = container.employeeRepository;

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateEmployeeInput }) => {
      const result = await repo.update(id, data);
      if (result.isErr()) {
        throw result.error;
      }
      return result.value;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

// Delete mutation hook
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const repo = container.employeeRepository;

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await repo.delete(id);
      if (result.isErr()) {
        throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}
```

---

## Step 6: Create View (Presentation Layer)

Build the client component that uses the ViewModel.

**Location**: `src/modules/{name}/src/presentation/views/`

```typescript
// src/modules/hr/src/presentation/views/EmployeeListView.tsx
'use client';

import { useState } from 'react';
import { useEmployees, useDeleteEmployee } from '../viewmodels/useEmployees';
import { EmployeeTable } from '../components/EmployeeTable';
import { SearchInput } from '@core/ui/search-input';
import { Pagination } from '@core/ui/pagination';
import { useToast } from '@core/ui/use-toast';

interface Props {
  initialPage?: number;
  initialSearch?: string;
}

export function EmployeeListView({ initialPage = 1, initialSearch = '' }: Props) {
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  
  const { data, isLoading, error } = useEmployees({ page, search, limit: 10 });
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee.mutateAsync(id);
      toast({ title: 'Employee deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete employee', variant: 'destructive' });
    }
  };

  if (error) {
    return (
      <div className="text-red-500">
        Error loading employees: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search employees..."
      />
      
      <EmployeeTable
        data={data?.data ?? []}
        loading={isLoading}
        onDelete={handleDelete}
      />
      
      {data && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

---

## Summary: The Data Flow

```
1. USER INTERACTION
   └─▶ View calls ViewModel hook

2. VIEWMODEL (useQuery)
   └─▶ Calls Repository method via DI container

3. REPOSITORY
   └─▶ Makes HTTP request via apiService
   └─▶ Receives DTO from API

4. MAPPER
   └─▶ Transforms DTO → Domain Entity

5. RESULT PATTERN
   └─▶ Wraps success/failure in Result<T, E>

6. VIEWMODEL
   └─▶ Unwraps Result, throws on error
   └─▶ TanStack Query caches the data

7. VIEW
   └─▶ Receives { data, isLoading, error }
   └─▶ Renders UI based on state
```

---

## Checklist

- [ ] Interface defined with all required methods
- [ ] DTOs match API response structure
- [ ] Mapper handles all transformations
- [ ] Repository uses `Result<T, E>` pattern
- [ ] ViewModel uses TanStack Query properly
- [ ] Query keys are organized with factory pattern
- [ ] Mutations invalidate relevant queries
- [ ] View handles loading/error states
- [ ] No direct API calls in components
