import { LoginRequest, LoginResponse } from "../entities/Auth";
import { User } from "../entities/User";
import { Result } from "@core/common/types/result";

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<User>;
  verify2FA(username: string, password: string, code: string): Promise<User>;
  logout(): Promise<void>;
  getMe(): Promise<User>;
  hasToken(): boolean;
  refreshToken(): Promise<Result<LoginResponse, Error>>;
  clearTokens(): void;
  isAuthenticated(): boolean;
}
