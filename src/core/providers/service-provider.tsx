"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { ApiService } from "@core/services/api.service";
import { NotificationService } from "@core/services/notification.service";
import { NavigationService } from "@core/services/navigation.service";
import { AuthRepository } from "@modules/auth/core/data/repositories/AuthRepository";
import { UserService } from "@core/services/user.service";
import { ProductRepository as ProductService } from "@/modules/product/src/data/repositories/ProductRepository";
import { TreeNodeService } from "@/modules/tree/src/data/repositories/TreeNodeRepository";

interface Services {
  apiService: ApiService;
  notificationService: NotificationService;
  navigationService: NavigationService;
  authRepository: AuthRepository;
  userService: UserService;
  productService: ProductService;
  treeNodeService: TreeNodeService;
}

const ServiceContext = createContext<Services | null>(null);

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const services = useMemo(() => {
    const notificationService = new NotificationService();
    const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || "");
    const authRepository = new AuthRepository(apiService);
    const userService = new UserService(apiService);
    const navigationService = new NavigationService(apiService);
    const productService = new ProductService(notificationService);
    const treeNodeService = new TreeNodeService(notificationService);

    return {
      apiService,
      notificationService,
      navigationService,
      authRepository,
      userService,
      productService,
      treeNodeService
    };
  }, []);

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
}
