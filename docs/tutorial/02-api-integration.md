# 🔌 Connecting to API

This guide explains how to connect your module to a real backend using our **Interceptor-Enhanced Axios Client**.

---

## The Network Layer

We use a central `ApiService` singleton providing `get`, `post`, `put`, `delete` methods.
**Location**: `src/core/services/implementation/api.service.ts`

### Features
- **Auto-Base URL**: Uses `NEXT_PUBLIC_API_URL` from `.env`.
- **JWT Injection**: Automatically adds `Authorization: Bearer <token>` header.
- **Refresh Token**: Intercepts 401 errors, refreshes token, and retries request.
- **Response Unwrapping**: Returns `response.data` deeply.

---

## Step 1: Define the Repository

In your module's `data/repositories` folder, extend the `BaseRepository`.

```typescript
import { BaseRepository } from "@core/common/base-repository";
import { Product } from "../../domain/entities/Product";

export class ProductRepository extends BaseRepository {
  
  // GET /products?page=1
  async getProducts(params: any) {
    // The BaseRepository gives you access to 'this.api'
    return this.api.get<Product[]>('/products', { params });
  }

  // POST /products
  async createProduct(data: any) {
    return this.api.post<Product>('/products', data);
  }
}
```

---

## Step 2: Use in ViewModel

Never call the repository directly from a View. Use the ViewModel.

```typescript
// useProductViewModel.ts

export function useProductViewModel() {
  const { create } = useGenericMutations(
    ['products'], // Query Key to invalidate
    {
      create: (data) => productContainer.productRepository.createProduct(data)
    }
  );

  const handleCreate = async (data) => {
    try {
      await create(data);
      // Success toast handled automatically by GenericMutations!
    } catch (e) {
      // Error toast handled automatically by GenericMutations!
    }
  };
}
```

---

## Handling Errors

The `apiService` automatically normalizes errors into a standard format.
If the API returns 400 with `{ "message": "Invalid Name" }`, the generic mutation will show a toast with "Invalid Name".

You don't need `try/catch` block for basic CRUD operations if using `useGenericMutations`, as it handles the toast feedback for you.
