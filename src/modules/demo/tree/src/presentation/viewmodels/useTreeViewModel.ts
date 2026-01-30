/**
 * Tree View Model for Tree Module
 * 
 * Re-exports the core useTreeViewModel with module-specific types.
 * Now powered by TanStack Query.
 */
"use client";

export {
  useTreeViewModel,
  createMockTreeService,
  type TreeNode,
  type TreeService,
  type TreeViewModelConfig,
  type TreeViewModel,
} from "@core/hooks/use-tree-view-model";
