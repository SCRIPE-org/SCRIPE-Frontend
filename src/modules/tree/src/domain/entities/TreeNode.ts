/**
 * TreeNode Domain Model
 * 
 * Represents the core tree node entity in the domain layer.
 * This model is independent of external concerns and focuses
 * purely on tree node data and business logic.
 */

export interface TreeNodeData {
  id: string;
  name: string;
  type?: string;
  status?: string;
  children?: TreeNode[];
  parentId?: string;
  level?: number;
  order?: number;
  description?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  lastUpdated?: string;
  isExpanded?: boolean;
  isSelected?: boolean;
}

export class TreeNode {
  public readonly id: string;
  public readonly name: string;
  public readonly type?: string;
  public readonly status?: string;
  public readonly children?: TreeNode[];
  public readonly parentId?: string;
  public readonly level?: number;
  public readonly order?: number;
  public readonly description?: string;
  public readonly metadata?: Record<string, any>;
  public readonly createdAt?: string;
  public readonly lastUpdated?: string;
  public readonly isExpanded?: boolean;
  public readonly isSelected?: boolean;

  constructor(data: TreeNodeData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.status = data.status;
    this.children = data.children;
    this.parentId = data.parentId;
    this.level = data.level;
    this.order = data.order;
    this.description = data.description;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.lastUpdated = data.lastUpdated;
    this.isExpanded = data.isExpanded;
    this.isSelected = data.isSelected;
  }

  /**
   * Get node's display name
   */
  get displayName(): string {
    return this.name;
  }

  /**
   * Check if node has children
   */
  get hasChildren(): boolean {
    return !!(this.children && this.children.length > 0);
  }

  /**
   * Get children count
   */
  get childrenCount(): number {
    return this.children ? this.children.length : 0;
  }

  /**
   * Check if node is root (no parent)
   */
  get isRoot(): boolean {
    return !this.parentId;
  }

  /**
   * Check if node is leaf (no children)
   */
  get isLeaf(): boolean {
    return !this.hasChildren;
  }

  /**
   * Check if node is active
   */
  get isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Get node depth level
   */
  get depth(): number {
    return this.level || 0;
  }

  /**
   * Create a copy of the node with updated data
   */
  update(updates: Partial<TreeNodeData>): TreeNode {
    return new TreeNode({
      id: this.id,
      name: this.name,
      type: this.type,
      status: this.status,
      children: this.children,
      parentId: this.parentId,
      level: this.level,
      order: this.order,
      description: this.description,
      metadata: this.metadata,
      createdAt: this.createdAt,
      lastUpdated: this.lastUpdated,
      isExpanded: this.isExpanded,
      isSelected: this.isSelected,
      ...updates,
    });
  }

  /**
   * Add a child node
   */
  addChild(child: TreeNode): TreeNode {
    const updatedChildren = [...(this.children || []), child];
    return this.update({ children: updatedChildren });
  }

  /**
   * Remove a child node by id
   */
  removeChild(childId: string): TreeNode {
    const updatedChildren = (this.children || []).filter(child => child.id !== childId);
    return this.update({ children: updatedChildren });
  }

  /**
   * Find a child node by id
   */
  findChild(childId: string): TreeNode | undefined {
    return (this.children || []).find(child => child.id === childId);
  }

  /**
   * Get all descendants (children and their children)
   */
  getAllDescendants(): TreeNode[] {
    const descendants: TreeNode[] = [];
    
    const traverse = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        descendants.push(node);
        if (node.children) {
          traverse(node.children);
        }
      });
    };

    if (this.children) {
      traverse(this.children);
    }

    return descendants;
  }

  /**
   * Get path from root to this node
   */
  getPath(): TreeNode[] {
    const path: TreeNode[] = [];
    let current: TreeNode | undefined = this;

    while (current) {
      path.unshift(current);
      // In a real implementation, you'd need to traverse up the tree
      // For now, we'll just return the current node
      break;
    }

    return path;
  }
}

/**
 * Create TreeNode Request Model
 */
export interface CreateTreeNodeRequestData {
  name: string;
  type?: string;
  status?: string;
  parentId?: string;
  order?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export class CreateTreeNodeRequest {
  public readonly name: string;
  public readonly type?: string;
  public readonly status?: string;
  public readonly parentId?: string;
  public readonly order?: number;
  public readonly description?: string;
  public readonly metadata?: Record<string, any>;

  constructor(data: CreateTreeNodeRequestData) {
    this.name = data.name;
    this.type = data.type;
    this.status = data.status;
    this.parentId = data.parentId;
    this.order = data.order;
    this.description = data.description;
    this.metadata = data.metadata;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }
}

/**
 * Update TreeNode Request Model
 */
export interface UpdateTreeNodeRequestData {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  parentId?: string;
  order?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export class UpdateTreeNodeRequest {
  public readonly id: string;
  public readonly name?: string;
  public readonly type?: string;
  public readonly status?: string;
  public readonly parentId?: string;
  public readonly order?: number;
  public readonly description?: string;
  public readonly metadata?: Record<string, any>;

  constructor(data: UpdateTreeNodeRequestData) {
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.status = data.status;
    this.parentId = data.parentId;
    this.order = data.order;
    this.description = data.description;
    this.metadata = data.metadata;
  }

  /**
   * Validate the request data
   */
  get isValid(): boolean {
    return !!(this.id && (this.name === undefined || this.name.trim().length > 0));
  }
}

