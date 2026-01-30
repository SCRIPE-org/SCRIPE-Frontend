# 🏗️ Creating Your First Module

This tutorial will guide you through creating a new feature module using the **Verified Modular Monolith** pattern. We will build a simple "Categories" module.

---

## Step 1: Clone the Template

Copy the `src/modules/_template` folder to `src/modules/category`.

```bash
# Structure should look like this:
src/modules/category/
├── di.ts
├── index.ts
└── src/
    ├── data/
    ├── domain/
    └── presentation/
```

---

## Step 2: Define the Domain

Create your entity in `src/domain/entities/Category.ts`.

```typescript
export interface CategoryData {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export class Category {
  constructor(public readonly data: CategoryData) {}

  get id() { return this.data.id; }
  get name() { return this.data.name; }
  
  // Add domain logic here
}
```

---

## Step 3: Create the Repository

Implement the data fetching logic in `src/data/repositories/CategoryRepository.ts`.

```typescript
import { BaseRepository } from "@core/common/base-repository";

export class CategoryRepository extends BaseRepository {
  async getCategories(params: any) {
    return this.api.get('/categories', { params });
  }
}
```

---

## Step 4: Wire Dependencies

Register your repository in `di.ts`.

```typescript
import { getCoreContainer } from '@/core/di';
import { CategoryRepository } from './src/data/repositories/CategoryRepository';

const { apiService } = getCoreContainer();

export const categoryContainer = {
  categoryRepository: new CategoryRepository(apiService)
};
```

---

## Step 5: Create the ViewModel

Use the **Generic CRUD Engine** in `src/presentation/viewmodels/useCategoryViewModel.ts`.

```typescript
import { useGenericQuery } from "@core/crud/hooks/useGenericQuery";
import { categoryContainer } from "../../di";

export function useCategoryViewModel() {
  const { data, isLoading } = useGenericQuery(
    ['categories', 'list'], 
    (params) => categoryContainer.categoryRepository.getCategories(params),
    { page: 1 }
  );

  return { data, isLoading };
}
```

## Step 6: Create the View

Assembler the UI in `src/presentation/views/CategoryView.tsx`.

```typescript
import { GenericCrudView } from "@core/crud/views/GenericCrudView";
import { useCategoryViewModel } from "../viewmodels/useCategoryViewModel";

export function CategoryView() {
  const vm = useCategoryViewModel();

  return (
    <GenericCrudView
      title="Categories"
      columns={[
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'status', header: 'Status' }
      ]}
      crud={vm.crud} // Connect the engine
    />
  );
}
```

---

## Final Step: Export and Route

1. Export the view in `index.ts`.
2. Create standard Next.js page in `src/app/(modules)/categories/page.tsx` and import `CategoryView`.

**Done!** You just built a full CRUD module.
