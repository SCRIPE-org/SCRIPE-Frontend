# ⚡ State Management

We use a "Hybrid State" approach that separates **Server State** from **Client State**.

## 1. Server State (React Query)
Reference: `src/core/crud/hooks`

We do NOT put API data in Redux or Context. API data belongs in the Server Cache.

- **Fetching**: `useQuery` (via `useGenericQuery`)
- **Mutating**: `useMutation` (via `useGenericMutations`)
- **Caching**: Automatic caching and invalidation keys.

### Why?
- Automatic loading states (`isLoading`)
- Automatic error handling (`isError`)
- Automatic deduplication (multiple components requesting same data = 1 request)

## 2. Client State (Zustand)
Reference: `src/core/store/useAppStore.ts`

We use **Zustand** for global UI state that is NOT from the API.

- Sidebar Open/Close
- Dark/Light Mode
- Current User Session (Auth)

### Why Zustand?
- **Zero Boilerplate**: No providers, wrappers, or complex reducers.
- **Performance**: Components only re-render when the specific slice they check changes.
- **Persist**: Built-in `persist` middleware handles `localStorage`.

## 3. Hydration Guard
Reference: `store._hasHydrated`

Since we persist state to `localStorage`, there is a moment when the app boots where the state is not yet loaded. Using persisted state immediately causes **Hydration Errors**.

 We solved this with the `_hasHydrated` flag. `RouteGuard` waits for this flag before rendering sensitive content.

```typescript
const hasHydrated = useAppStore(state => state._hasHydrated);
if (!hasHydrated) return <LoadingSpinner />;
```
