/**
 * TreeNode Mappers
 * 
 * Handles conversion between tree node domain models and external data formats.
 * Follows Single Responsibility Principle by separating serialization concerns
 * from domain logic.
 */

import {
  TreeNode,
  CreateTreeNodeRequest,
  UpdateTreeNodeRequest,
  type TreeNodeData,
  type CreateTreeNodeRequestData,
  type UpdateTreeNodeRequestData
} from '../../domain/entities/TreeNode';
import { type PaginationMetadata } from "@core/common/types/pagination";
import type { PaginationInfo } from '@core/common/types/pagination';

export interface TreeNodesResponse {
  data: TreeNode[];
  pagination: PaginationInfo;
}

export class TreeNodeMapper {
  /**
   * Convert JSON/API response to TreeNode domain model
   */
  static fromJson(json: any): TreeNode {
    return new TreeNode({
      id: json.id || '',
      name: json.name || '',
      type: json.type,
      status: json.status,
      children: json.children ? json.children.map((child: any) => this.fromJson(child)) : undefined,
      parentId: json.parentId,
      level: json.level ? Number(json.level) : undefined,
      order: json.order ? Number(json.order) : undefined,
      description: json.description,
      metadata: json.metadata,
      createdAt: json.createdAt,
      lastUpdated: json.lastUpdated,
      isExpanded: json.isExpanded,
      isSelected: json.isSelected,
    });
  }

  /**
   * Convert TreeNode domain model to JSON for API requests
   */
  static toJson(node: TreeNode): any {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      status: node.status,
      children: node.children ? node.children.map(child => this.toJson(child)) : undefined,
      parentId: node.parentId,
      level: node.level,
      order: node.order,
      description: node.description,
      metadata: node.metadata,
      createdAt: node.createdAt,
      lastUpdated: node.lastUpdated,
      isExpanded: node.isExpanded,
      isSelected: node.isSelected,
    };
  }

  /**
   * Convert JSON/API response to CreateTreeNodeRequest domain model
   */
  static createRequestFromJson(json: any): CreateTreeNodeRequest {
    return new CreateTreeNodeRequest({
      name: json.name || '',
      type: json.type,
      status: json.status,
      parentId: json.parentId,
      order: json.order ? Number(json.order) : undefined,
      description: json.description,
      metadata: json.metadata,
    });
  }

  /**
   * Convert CreateTreeNodeRequest domain model to JSON for API requests
   */
  static createRequestToJson(request: CreateTreeNodeRequest): any {
    return {
      name: request.name,
      type: request.type,
      status: request.status,
      parentId: request.parentId,
      order: request.order,
      description: request.description,
      metadata: request.metadata,
    };
  }

  /**
   * Convert JSON/API response to UpdateTreeNodeRequest domain model
   */
  static updateRequestFromJson(json: any): UpdateTreeNodeRequest {
    return new UpdateTreeNodeRequest({
      id: json.id || '',
      name: json.name,
      type: json.type,
      status: json.status,
      parentId: json.parentId,
      order: json.order ? Number(json.order) : undefined,
      description: json.description,
      metadata: json.metadata,
    });
  }

  /**
   * Convert UpdateTreeNodeRequest domain model to JSON for API requests
   */
  static updateRequestToJson(request: UpdateTreeNodeRequest): any {
    const json: any = { id: request.id };

    if (request.name !== undefined) json.name = request.name;
    if (request.type !== undefined) json.type = request.type;
    if (request.status !== undefined) json.status = request.status;
    if (request.parentId !== undefined) json.parentId = request.parentId;
    if (request.order !== undefined) json.order = request.order;
    if (request.description !== undefined) json.description = request.description;
    if (request.metadata !== undefined) json.metadata = request.metadata;

    return json;
  }

  /**
   * Handle different API response formats and convert to TreeNodesResponse
   */
  static handleApiResponse(response: any): TreeNodesResponse {
    // Handle direct array response
    if (Array.isArray(response)) {
      return {
        data: response.map((item: any) => this.fromJson(item)),
        pagination: {
          itemsCount: response.length,
          pageSize: response.length,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Handle paginated response with data property
    if (response && typeof response === 'object' && 'data' in response) {
      return {
        data: Array.isArray(response.data)
          ? response.data.map((item: any) => this.fromJson(item))
          : [],
        pagination: response.pagination || {
          itemsCount: 0,
          pageSize: 10,
          page: 1,
          pagesCount: 0,
        }
      };
    }

    // Handle single item response
    if (response && typeof response === 'object' && 'id' in response) {
      return {
        data: [this.fromJson(response)],
        pagination: {
          itemsCount: 1,
          pageSize: 1,
          page: 1,
          pagesCount: 1,
        }
      };
    }

    // Fallback for unexpected response format
    return {
      data: [],
      pagination: {
        itemsCount: 0,
        pageSize: 10,
        page: 1,
        pagesCount: 0,
      }
    };
  }

  /**
   * Convert flat array to hierarchical tree structure
   */
  static arrayToTree(items: TreeNode[], parentIdField = 'parentId', idField = 'id'): TreeNode[] {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // First pass: create all nodes
    items.forEach(item => {
      map.set(item.id, item);
    });

    // Second pass: build tree structure
    items.forEach(item => {
      const node = map.get(item.id);
      if (!node) return;

      const parentId = item.parentId;
      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId)!;
        const updatedParent = parent.addChild(node);
        map.set(parentId, updatedParent);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Convert hierarchical tree to flat array
   */
  static treeToArray(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];

    const traverse = (nodeList: TreeNode[]) => {
      nodeList.forEach(node => {
        result.push(node);
        if (node.children) {
          traverse(node.children);
        }
      });
    };

    traverse(nodes);
    return result;
  }
}
