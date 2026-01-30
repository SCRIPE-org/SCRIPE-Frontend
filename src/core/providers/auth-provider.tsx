"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { handleError } from "@core/common/error-handler";
import { appLogger } from "@core/common/logger";
import { useServices } from "@core/providers/service-provider";
import { User } from "@modules/auth/core/domain/entities/User";
import { AuthMapper } from "../../modules/auth/core/data/mappers/AuthMapper";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { authRepository } = useServices();

  const isAuthenticated = !!user;

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    if (authRepository.isAuthenticated()) {
      try {
        const currentUser = await authRepository.getMe();
        setUser(currentUser);
        appLogger.info("User authenticated successfully", { userId: currentUser.id });
      } catch (error) {
        const appError = handleError(error as Error, 'AuthProvider.checkAuth');
        appLogger.error("Failed to fetch user", { error, appError });
        // Clear tokens if getMe fails
        authRepository.logout().catch(() => {
          // Ignore logout errors during cleanup
        });
        setUser(null);
      }
    } else {
      // No token found, ensure user is null
      setUser(null);
    }
    setIsLoading(false);
  }, [authRepository]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      // Create LoginRequest domain model using mapper
      const loginRequest = AuthMapper.loginRequestFromJson({ username, password });
      const loggedInUser = await authRepository.login(loginRequest);
      setUser(loggedInUser);
      appLogger.info("Login successful", { userId: loggedInUser.id, username: loggedInUser.username });
    } catch (error) {
      const appError = handleError(error as Error, 'AuthProvider.login');
      appLogger.error("Login failed in provider:", { error, appError });
      // Ensure user state is cleared on login failure
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authRepository.logout();
      // Only clear user state and redirect if logout was successful
      setUser(null);
      appLogger.info("Logout successful");
      router.push("/login");
    } catch (error) {
      const appError = handleError(error as Error, 'AuthProvider.logout');
      appLogger.error("Logout failed in provider:", { error, appError });
      // Clear user state even if logout fails to prevent inconsistent state
      setUser(null);
      router.push("/login");
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
