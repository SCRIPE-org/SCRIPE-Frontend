/**
 * SetupAccountControls — Layout wrapper, credential inputs, and information rows for account setup.
 */

"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { BRAND } from "@core/config/branding";
import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";

/**
 * Props for displaying account attribute metadata rows.
 */
export interface InfoRowProps {
  /** Visual indicator icon */
  icon: React.ReactNode;
  /** Attribute descriptor label */
  label: string;
  /** Attribute value text */
  value?: string;
}

/**
 * Displays an icon-prefixed attribute label and value pair.
 *
 * @param props Information row properties.
 * @returns Rendered row layout.
 */
export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/**
 * Props for the password input field with reveal toggle.
 */
export interface PasswordFieldProps {
  /** Input element identifier */
  id: string;
  /** Current password string value */
  value: string;
  /** Visibility toggle flag */
  show: boolean;
  /** Placeholder guidance text */
  placeholder: string;
  /** Text change handler */
  onChange: (v: string) => void;
  /** Password visibility toggle trigger */
  onToggle: () => void;
  /** Autofocus toggle */
  autoFocus?: boolean;
}

/**
 * Accessible password input control featuring reveal visibility button.
 *
 * @param props Password input properties.
 * @returns Input field with eye toggle button.
 */
export function PasswordField({
  id,
  value,
  show,
  placeholder,
  onChange,
  onToggle,
  autoFocus,
}: PasswordFieldProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pe-10"
        autoFocus={autoFocus}
      />
      <Button
        variant="ghost"
        type="button"
        onClick={onToggle}
        className="absolute end-3 top-1/2 h-auto -translate-y-1/2 p-0 text-muted-foreground transition-colors hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}

/**
 * Props for the full-page setup layout wrapper.
 */
export interface PageWrapperProps {
  /** Child modal or card component */
  children: React.ReactNode;
}

/**
 * Full-screen branded page layout for onboarding and account activation screens.
 *
 * @param props Child nodes and card components.
 * @returns Centered container with logo, language switcher, and theme toggle.
 */
export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12">
      <div className="absolute end-6 top-6 z-20 flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <Image
            src="/brand/app-logo-1024.png"
            alt={`${BRAND.name} Logo`}
            width={56}
            height={56}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      </div>
      {children}
      <p className="mt-8 text-[11px] font-medium text-muted-foreground/50">
        © {new Date().getFullYear()} {BRAND.name}
      </p>
    </div>
  );
}
