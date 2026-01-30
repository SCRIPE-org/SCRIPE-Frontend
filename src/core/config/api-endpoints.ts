export const API_ENDPOINTS = {
  LOGIN: "/Authentication/login",
  LOGOUT: "/Authentication/logout",
  REFRESH: "/admin/auth/refresh-token",
  GET_MENU_ITEMS: "/MenuItems",
  GET_ADMIN_ME: "/admins/me",
  UPDATE_ADMIN_PROFILE: "/admins/me",
  CHANGE_ADMIN_PASSWORD: "/admins/me/password",
  
  // Product endpoints
  PRODUCTS_GET_ALL: "/products",
  PRODUCTS_GET_BY_ID: "/products",
  PRODUCTS_CREATE: "/products",
  PRODUCTS_UPDATE: "/products",
  PRODUCTS_DELETE: "/products",
  
  // Tree Node endpoints
  TREE_NODES_GET_ALL: "/tree-nodes",
  TREE_NODES_GET_HIERARCHICAL: "/tree-nodes/hierarchical",
  TREE_NODES_GET_BY_ID: "/tree-nodes",
  TREE_NODES_CREATE: "/tree-nodes",
  TREE_NODES_UPDATE: "/tree-nodes",
  TREE_NODES_DELETE: "/tree-nodes",
};
