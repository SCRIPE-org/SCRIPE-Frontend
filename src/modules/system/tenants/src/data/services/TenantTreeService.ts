/**
 * Tenant Tree Service
 *
 * Wraps the TenantRepository to implement TreeService interface
 * for use with GenericTreeView and useTreeViewModel.
 */
import type { TreeService } from "@core/hooks/use-tree-view-model";
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
} from "../../domain/entities/TenantRequests";
import type { ITenantRepository } from "../../domain/interfaces/ITenantRepository";

/**
 * Adapter that wraps ITenantRepository to implement TreeService
 */
export function createTenantTreeService(
  repository: ITenantRepository
): TreeService<TenantTreeNode, CreateTenantRequest, UpdateTenantRequest> {
  return {
    getWithChildren: async (params) => {
      // Fetch tree data from repository
      const tree = await repository.getTree();

      // Apply search filter if provided
      let filteredTree = tree;
      if (params.PageSearch) {
        const searchTerm = params.PageSearch.toLowerCase();
        filteredTree = filterTree(tree, searchTerm);
      }

      // Apply pagination locally since API returns full tree
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = filteredTree.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          itemsCount: filteredTree.length,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.max(1, Math.ceil(filteredTree.length / params.pageSize)),
        },
      };
    },

    create: async (data: CreateTenantRequest) => {
      const id = await repository.create(data);
      // Return a placeholder node (will be refetched anyway)
      return {
        id,
        name: data.name,
        code: data.code,
        parentId: data.parentId,
        isActive: true,
        level: 0,
        children: [],
      } as TenantTreeNode;
    },

    update: async (id: string, data: UpdateTenantRequest) => {
      await repository.update(id, data);
      // Return a placeholder node (will be refetched anyway)
      return {
        id,
        name: data.name || "",
        code: "",
        isActive: data.isActive ?? true,
        level: 0,
        children: [],
      } as TenantTreeNode;
    },

    delete: async (id: string) => {
      await repository.delete(id);
    },
  };
}

/**
 * Filter tree nodes by search term (searches name and code)
 */
function filterTree(nodes: TenantTreeNode[], searchTerm: string): TenantTreeNode[] {
  const result: TenantTreeNode[] = [];

  for (const node of nodes) {
    const matchesSearch =
      node.name.toLowerCase().includes(searchTerm) || node.code.toLowerCase().includes(searchTerm);

    // Recursively filter children
    const filteredChildren = node.children ? filterTree(node.children, searchTerm) : [];

    // Include node if it matches or has matching children
    if (matchesSearch || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: matchesSearch ? node.children : filteredChildren,
      });
    }
  }

  return result;
}

/**
 * Count total nodes in tree
 */
function countNodes(nodes: TenantTreeNode[]): number {
  return nodes.reduce((sum, node) => sum + 1 + (node.children ? countNodes(node.children) : 0), 0);
}

/**
 * Adapter that wraps ITenantRepository for CHILDREN view only.
 * Uses getChildren(parentId) to show only direct children of a parent tenant.
 */
export function createChildrenTreeService(
  repository: ITenantRepository,
  parentId: string
): TreeService<TenantTreeNode, CreateTenantRequest, UpdateTenantRequest> {
  return {
    getWithChildren: async (params) => {
      // Fetch ONLY children of the specified parent
      const children = await repository.getChildren(parentId);

      // Apply search filter if provided
      let filteredTree = children;
      if (params.PageSearch) {
        const searchTerm = params.PageSearch.toLowerCase();
        filteredTree = filterTree(children, searchTerm);
      }

      // Apply pagination locally
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = filteredTree.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        pagination: {
          itemsCount: filteredTree.length,
          pageSize: params.pageSize,
          page: params.page,
          pagesCount: Math.max(1, Math.ceil(filteredTree.length / params.pageSize)),
        },
      };
    },

    create: async (data: CreateTenantRequest) => {
      const id = await repository.create({
        ...data,
        parentId: data.parentId || parentId, // Ensure parent is set
      });
      return {
        id,
        name: data.name,
        code: data.code,
        parentId: data.parentId || parentId,
        isActive: true,
        level: 0,
        children: [],
      } as TenantTreeNode;
    },

    update: async (id: string, data: UpdateTenantRequest) => {
      await repository.update(id, data);
      return {
        id,
        name: data.name || "",
        code: "",
        isActive: data.isActive ?? true,
        level: 0,
        children: [],
      } as TenantTreeNode;
    },

    delete: async (id: string) => {
      await repository.delete(id);
    },
  };
}

/**
 * Adapter that wraps ITenantRepository for MY CHILDREN view.
 * Uses getMyChildren() to show only MY direct children (for /tenants page).
 */
export function createMyChildrenTreeService(
  repository: ITenantRepository
): TreeService<TenantTreeNode, CreateTenantRequest, UpdateTenantRequest> {
  return {
    getWithChildren: async (params) => {
      // Fetch my children WITH pagination and search
      const result = await repository.getMyChildren({
        page: params.page,
        pageSize: params.pageSize,
        search: params.PageSearch,
      });

      return {
        data: result.items,
        pagination: {
          itemsCount: result.totalCount,
          pageSize: result.pageSize,
          page: result.page,
          pagesCount: result.totalPages,
        },
      };
    },

    create: async (data: CreateTenantRequest) => {
      const id = await repository.create(data);
      return {
        id,
        name: data.name,
        code: data.code,
        parentId: data.parentId,
        isActive: true,
        level: 0,
        children: [],
      } as TenantTreeNode;
    },

    update: async (id: string, data: UpdateTenantRequest) => {
      await repository.update(id, data);
      return {
        id,
        name: data.name || "",
        code: "",
        isActive: data.isActive ?? true,
        level: 0,
        children: [],
      } as TenantTreeNode;
    },

    delete: async (id: string) => {
      await repository.delete(id);
    },
  };
}
