export interface LogoConfig {
  type: "sparkles" | "shield" | "image" | "custom";
  size: "xs" | "sm" | "md" | "lg" | "xl";
  animation: "none" | "spin" | "pulse" | "fancy";
  customText: string;
  customImagePath: string;
  showText: boolean;
}

export const defaultLogoConfig: LogoConfig = {
  type: "sparkles",
  size: "md",
  animation: "none",
  customText: "My App",
  customImagePath: "/logo.png",
  showText: true,
};

// This config is now overridden by the settings provider
// but serves as a fallback for components that don't use the provider
export const logoConfig = defaultLogoConfig;
