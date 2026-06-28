import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "infrastructure.cacheInvalidation.intro" },

  // ─── Two-Layer Architecture ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.cacheInvalidation.architectureTitle",
    id: "two-layer-architecture",
  },
  { type: "paragraph", contentKey: "infrastructure.cacheInvalidation.architectureContent" },
  {
    type: "code",
    language: "csharp",
    filename: "ICacheService.cs — The Single Entry Point for All Caching",
    code: `public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
    Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default);  // O(N) SCAN+DEL
    Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null, CancellationToken ct = default);
}`,
  },

  // ─── Cache Key Conventions ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.cacheInvalidation.keyConventionsTitle",
    id: "key-conventions",
  },
  { type: "paragraph", contentKey: "infrastructure.cacheInvalidation.keyConventionsContent" },
  {
    type: "table",
    headers: ["Pattern", "Example Key", "Use Case"],
    rows: [
      ["{EntityType}:{TenantId}:{Id}", "Admin:ten_abc123:adm_xyz789", "Single entity GET by ID"],
      ["{EntityType}:{TenantId}:list:{PageHash}", "Admin:ten_abc123:list:p1s20", "Paginated list query"],
      ["{EntityType}:", "Admin:", "Broad invalidation prefix — all Admin cache for all tenants"],
      ["{EntityType}:{TenantId}:", "Admin:ten_abc123:", "Tenant-scoped invalidation — one tenant's Admin cache"],
    ],
  },

  // ─── IInvalidatesCache ────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.cacheInvalidation.iInvalidatesCacheTitle",
    id: "iinvalidates-cache",
  },
  { type: "paragraph", contentKey: "infrastructure.cacheInvalidation.iInvalidatesCacheContent" },
  {
    type: "code",
    language: "csharp",
    filename: "UpdateAdminCommand.cs — Declarative Invalidation",
    code: `public record UpdateAdminCommand(
    Guid Id,
    string Name,
    byte[] RowVersion
) : ICommand, IInvalidatesCache
{
    // The CachingBehavior reads this after the handler succeeds.
    // It calls ICacheService.RemoveByPrefixAsync("Admin:") to flush all Admin cache.
    // Pattern: use the entity type prefix to flush all related cache entries atomically.
    public string[] CachePrefixesToInvalidate => ["Admin:"];
}`,
  },

  // ─── ETag-Based HTTP Cache ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.cacheInvalidation.etagTitle",
    id: "etag-cache",
  },
  { type: "paragraph", contentKey: "infrastructure.cacheInvalidation.etagContent" },
  {
    type: "info",
    variant: "tip",
    contentKey: "infrastructure.cacheInvalidation.etagTip",
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "infrastructure.cacheInvalidation.invalidationWarning",
  },
];

registerPage({
  slug: "infrastructure/cache-invalidation",
  titleKey: "infrastructure.cacheInvalidation.title",
  descriptionKey: "infrastructure.cacheInvalidation.description",
  category: "infrastructure",
  order: 5,
  sections,
  relatedSlugs: [
    "infrastructure/background-jobs",
    "architecture/cqrs-pipeline",
    "architecture/domain-events",
  ],
  lastUpdated: "2026-06-28",
});
