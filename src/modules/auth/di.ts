/**
 * Auth Module DI Container
 */
import { getCoreContainer } from "@/core/di";
import { IAuthRepository } from "./core/domain/interfaces"; // Wait, interfaces?

export const authContainer = {
  get authRepository() {
    return getCoreContainer().authRepository;
  },
};
