/**
 * TreeNode Service
 * 
 * Handles TreeNode CRUD operations with dummy data for demo purposes.
 * Uses domain models and follows clean architecture principles.
 */

import type { INotificationService } from "./notification.service";
import type { PaginationInfo } from "@core/common/pagination";
import { 
  TreeNode, 
  TreeNodeMapper, 
  CreateTreeNodeRequest, 
  UpdateTreeNodeRequest,
  type TreeNodesResponse
} from "../../domain/entities";

export interface ITreeNodeService {
  getTreeNodes(params?: { page?: number; pageSize?: number; PageSearch?: string }): Promise<TreeNodesResponse>;
  getTreeNodesHierarchical(params?: { page?: number; pageSize?: number; PageSearch?: string }): Promise<TreeNodesResponse>;
  getTreeNodeById(id: string): Promise<TreeNode>;
  createTreeNode(data: CreateTreeNodeRequest): Promise<TreeNode>;
  updateTreeNode(id: string, data: UpdateTreeNodeRequest): Promise<TreeNode>;
  deleteTreeNode(id: string): Promise<void>;
}

export class TreeNodeService implements ITreeNodeService {
  private treeNodes: TreeNode[] = [];
  private nextId = 1;

  constructor(private notificationService: INotificationService) {
    this.initializeDummyData();
  }

  private initializeDummyData() {
    const dummyData = [
      {
        id: "1",
        name: "🏢 Company Structure",
        type: "organization",
        status: "active",
        parentId: null,
        level: 0,
        order: 1,
        description: "Main company organization structure",
        metadata: { icon: "building", color: "blue" },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        children: [
          {
            id: "2",
            name: "Executive Team",
            type: "department",
            status: "active",
            parentId: "1",
            level: 1,
            order: 1,
            description: "Executive leadership team",
            metadata: { icon: "users", color: "purple" },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            children: [
              {
                id: "3",
                name: "CEO Office",
                type: "team",
                status: "active",
                parentId: "2",
                level: 2,
                order: 1,
                description: "Chief Executive Officer office",
                metadata: { icon: "crown", color: "gold" },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              },
              {
                id: "4",
                name: "CTO Office",
                type: "team",
                status: "active",
                parentId: "2",
                level: 2,
                order: 2,
                description: "Chief Technology Officer office",
                metadata: { icon: "cpu", color: "green" },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }
            ]
          },
          {
            id: "5",
            name: "Engineering",
            type: "department",
            status: "active",
            parentId: "1",
            level: 1,
            order: 2,
            description: "Software engineering department",
            metadata: { icon: "code", color: "blue" },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            children: [
              {
                id: "6",
                name: "Frontend Team",
                type: "team",
                status: "active",
                parentId: "5",
                level: 2,
                order: 1,
                description: "Frontend development team",
                metadata: { icon: "monitor", color: "cyan" },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              },
              {
                id: "7",
                name: "Backend Team",
                type: "team",
                status: "active",
                parentId: "5",
                level: 2,
                order: 2,
                description: "Backend development team",
                metadata: { icon: "server", color: "orange" },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }
            ]
          }
        ]
      },
      {
        id: "8",
        name: "📁 Project Management",
        type: "projects",
        status: "active",
        parentId: null,
        level: 0,
        order: 2,
        description: "Project management structure",
        metadata: { icon: "folder", color: "green" },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        children: [
          {
            id: "9",
            name: "Active Projects",
            type: "project-category",
            status: "active",
            parentId: "8",
            level: 1,
            order: 1,
            description: "Currently active projects",
            metadata: { icon: "play-circle", color: "green" },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            children: [
              {
                id: "10",
                name: "Website Redesign",
                type: "project",
                status: "active",
                parentId: "9",
                level: 2,
                order: 1,
                description: "Complete website redesign project",
                metadata: { icon: "globe", color: "blue" },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              },
              {
                id: "11",
                name: "Mobile App",
                type: "project",
                status: "active",
                parentId: "9",
                level: 2,
                order: 2,
                description: "Mobile application development",
                metadata: { icon: "smartphone", color: "purple" },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }
            ]
          },
          {
            id: "12",
            name: "Completed Projects",
            type: "project-category",
            status: "active",
            parentId: "8",
            level: 1,
            order: 2,
            description: "Successfully completed projects",
            metadata: { icon: "check-circle", color: "green" },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            children: [
              {
                id: "13",
                name: "API Integration",
                type: "project",
                status: "completed",
                parentId: "12",
                level: 2,
                order: 1,
                description: "Third-party API integration project",
                metadata: { icon: "link", color: "blue" },
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              }
            ]
          }
        ]
      }
    ];

    // Convert flat data to TreeNode instances first
    const flatNodes = dummyData.map(data => TreeNodeMapper.fromJson(data));
    this.treeNodes = TreeNodeMapper.arrayToTree(flatNodes);
    this.nextId = 14; // Next available ID
  }

  async getTreeNodes(params?: { page?: number; pageSize?: number; PageSearch?: string }): Promise<TreeNodesResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Flatten the tree for search
      const flatNodes = TreeNodeMapper.treeToArray(this.treeNodes);
      let filteredNodes = [...flatNodes];

      // Apply search filter
      if (params?.PageSearch) {
        const searchTerm = params.PageSearch.toLowerCase();
        filteredNodes = filteredNodes.filter(node =>
          node.name.toLowerCase().includes(searchTerm) ||
          node.type?.toLowerCase().includes(searchTerm) ||
          node.description?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply pagination
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedNodes = filteredNodes.slice(startIndex, endIndex);

      const pagination: PaginationInfo = {
        itemsCount: filteredNodes.length,
        pageSize,
        page,
        pagesCount: Math.ceil(filteredNodes.length / pageSize),
      };

      return {
        data: paginatedNodes,
        pagination,
      };
    } catch (e) {
      this.notificationService.error("Failed to fetch tree nodes");
      throw e;
    }
  }

  async getTreeNodesHierarchical(params?: { page?: number; pageSize?: number; PageSearch?: string }): Promise<TreeNodesResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      let filteredNodes = [...this.treeNodes];

      // Apply search filter (search in the entire tree structure)
      if (params?.PageSearch) {
        const searchTerm = params.PageSearch.toLowerCase();
        const searchInTree = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.filter(node => {
            const matches = node.name.toLowerCase().includes(searchTerm) ||
                           node.type?.toLowerCase().includes(searchTerm) ||
                           node.description?.toLowerCase().includes(searchTerm);
            
            if (matches) return true;
            
            if (node.children) {
              const filteredChildren = searchInTree(node.children);
              if (filteredChildren.length > 0) {
                return true;
              }
            }
            
            return false;
          }).map(node => {
            if (node.children) {
              const filteredChildren = searchInTree(node.children);
              return node.update({ children: filteredChildren });
            }
            return node;
          });
        };
        
        filteredNodes = searchInTree(this.treeNodes);
      }

      // For hierarchical data, we don't paginate the tree structure
      // Instead, we return the entire filtered tree
      const pagination: PaginationInfo = {
        itemsCount: TreeNodeMapper.treeToArray(filteredNodes).length,
        pageSize: TreeNodeMapper.treeToArray(filteredNodes).length,
        page: 1,
        pagesCount: 1,
      };

      return {
        data: filteredNodes,
        pagination,
      };
    } catch (e) {
      this.notificationService.error("Failed to fetch hierarchical tree nodes");
      throw e;
    }
  }

  async getTreeNodeById(id: string): Promise<TreeNode> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      const findNodeById = (nodes: TreeNode[]): TreeNode | null => {
        for (const node of nodes) {
          if (node.id === id) return node;
          if (node.children) {
            const found = findNodeById(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const node = findNodeById(this.treeNodes);
      if (!node) {
        throw new Error(`TreeNode with id ${id} not found`);
      }
      return node;
    } catch (e) {
      this.notificationService.error("Failed to fetch tree node");
      throw e;
    }
  }

  async createTreeNode(data: CreateTreeNodeRequest): Promise<TreeNode> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTreeNode = new TreeNode({
        id: String(this.nextId++),
        name: data.name,
        type: data.type,
        status: data.status || "active",
        parentId: data.parentId,
        level: data.parentId ? 1 : 0, // Simple level calculation
        order: data.order || 0,
        description: data.description,
        metadata: data.metadata,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      // Add to the tree structure
      if (data.parentId) {
        const addToParent = (nodes: TreeNode[]): boolean => {
          for (const node of nodes) {
            if (node.id === data.parentId) {
              const updatedNode = node.addChild(newTreeNode);
              const nodeIndex = nodes.findIndex(n => n.id === node.id);
              nodes[nodeIndex] = updatedNode;
              return true;
            }
            if (node.children && addToParent(node.children)) {
              return true;
            }
          }
          return false;
        };
        addToParent(this.treeNodes);
      } else {
        this.treeNodes.push(newTreeNode);
      }

      this.notificationService.success("Tree node created successfully");
      return newTreeNode;
    } catch (e) {
      this.notificationService.error("Failed to create tree node");
      throw e;
    }
  }

  async updateTreeNode(id: string, data: UpdateTreeNodeRequest): Promise<TreeNode> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updateNodeInTree = (nodes: TreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            const existingNode = nodes[i];
            const updatedNode = existingNode.update({
              name: data.name ?? existingNode.name,
              type: data.type ?? existingNode.type,
              status: data.status ?? existingNode.status,
              parentId: data.parentId ?? existingNode.parentId,
              order: data.order ?? existingNode.order,
              description: data.description ?? existingNode.description,
              metadata: data.metadata ?? existingNode.metadata,
              lastUpdated: new Date().toISOString(),
            });
            nodes[i] = updatedNode;
            return true;
          }
          if (nodes[i].children && updateNodeInTree(nodes[i].children!)) {
            return true;
          }
        }
        return false;
      };

      const updated = updateNodeInTree(this.treeNodes);
      if (!updated) {
        throw new Error(`TreeNode with id ${id} not found`);
      }

      const updatedNode = await this.getTreeNodeById(id);
      this.notificationService.success("Tree node updated successfully");
      return updatedNode;
    } catch (e) {
      this.notificationService.error("Failed to update tree node");
      throw e;
    }
  }

  async deleteTreeNode(id: string): Promise<void> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const deleteNodeFromTree = (nodes: TreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === id) {
            nodes.splice(i, 1);
            return true;
          }
          if (nodes[i].children && deleteNodeFromTree(nodes[i].children!)) {
            return true;
          }
        }
        return false;
      };

      const deleted = deleteNodeFromTree(this.treeNodes);
      if (!deleted) {
        throw new Error(`TreeNode with id ${id} not found`);
      }

      this.notificationService.success("Tree node deleted successfully");
    } catch (e) {
      this.notificationService.error("Failed to delete tree node");
      throw e;
    }
  }
}