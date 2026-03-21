"use client";

import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { LoginFormData } from "../viewmodels/use-login-viewmodel";

interface CredentialsFormProps {
      formData: LoginFormData;
      showPassword: boolean;
      isLoading: boolean;
      isFormValid: boolean;
      error: string;
      isRTL: boolean;
      updateField: (field: keyof LoginFormData, value: string) => void;
      togglePasswordVisibility: () => void;
      handleLogin: () => void;
      t: (key: string) => string;
}

export function CredentialsForm({
      formData, showPassword, isLoading, isFormValid, error, isRTL,
      updateField, togglePasswordVisibility, handleLogin, t,
}: CredentialsFormProps) {
      return (
            <form
                  onSubmit={(e) => { e.preventDefault(); if (!isLoading && isFormValid) handleLogin(); }}
                  className="flex flex-col"
                  style={{ gap: "var(--login-element-gap, 24px)", fontFamily: "var(--login-font-body, inherit)" }}
            >
                  {/* Error Alert */}
                  {error && (
                        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
                              <p className="text-sm font-medium text-destructive">{error}</p>
                        </div>
                  )}

                  {/* Username Input */}
                  <div className="space-y-2.5">
                        <Label htmlFor="username" className="text-sm font-medium text-foreground">
                              {t("auth.username")}
                        </Label>
                        <Input
                              id="username"
                              type="text"
                              value={formData.username}
                              onChange={(e) => updateField("username", e.target.value)}
                              required
                              className="w-full border-border bg-background px-4 text-base text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                              style={{ height: "var(--login-input-height, 48px)", borderRadius: "var(--login-radius-button, 12px)" }}
                              placeholder={t("auth.usernamePlaceholder")}
                              disabled={isLoading}
                              autoComplete="username"
                        />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2.5">
                        <Label htmlFor="password" className="text-sm font-medium text-foreground">
                              {t("auth.password")}
                        </Label>
                        <div className="relative">
                              <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => updateField("password", e.target.value)}
                                    required
                                    className="w-full border-border bg-background px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm [&::-ms-reveal]:hidden"
                                    style={{ height: "var(--login-input-height, 48px)", borderRadius: "var(--login-radius-button, 12px)" }}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                              />
                              <button
                                    type="button"
                                    className={`absolute ${isRTL ? "left-0" : "right-0"} top-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none`}
                              style={{ height: "var(--login-input-height, 48px)" }}
                                    onClick={togglePasswordVisibility}
                                    disabled={isLoading}
                                    tabIndex={-1}
                              >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                        </div>
                  </div>

                  {/* Semantic CTA Button */}
                  <div className="pt-2">
                        <Button
                              type="submit"
                              disabled={isLoading || !isFormValid}
                              className="flex w-full justify-center items-center bg-primary text-[15px] font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                              style={{ height: "var(--login-input-height, 48px)", borderRadius: "var(--login-radius-button, 12px)" }}
                        >
                              {isLoading ? (
                                    <><LoadingSpinner size="sm" showText={false} className="ltr:mr-2 rtl:ml-2" /> {t("common.loading")}</>
                              ) : (
                                    t("auth.loginButton")
                              )}
                        </Button>
                  </div>
            </form>
      );
}
