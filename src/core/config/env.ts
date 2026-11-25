/**
 * Environment Configuration
 *
 * Validates and exports environment variables with type safety.
 * Uses Zod for runtime validation at app startup.
 */

import { z } from "zod";
import { appLogger } from "../common/logger";

/**
 * Environment schema definition
 */
const envSchema = z.object({
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001/api"),

  // App & Central Auth Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Next Frontend Template"),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_DEVTOOLS: z
    .string()
    .optional()
    .default(process.env.NODE_ENV === "development" ? "true" : "false")
    .transform((v) => v === "true"),

  // Optional: External Services
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

/**
 * Validate environment variables
 */
function validateEnv() {
  // In development, we access process.env directly
  // In production, Next.js inlines these at build time
  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_DEVTOOLS: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    const invalidFields = Object.keys(result.error.flatten().fieldErrors).join(", ");
    appLogger.error(`Invalid environment variable keys: ${invalidFields || "unknown"}`);
    // In development, throw to catch issues early
    if (process.env.NODE_ENV === "development") {
      throw new Error("Invalid environment configuration");
    }
  }

  return result.success ? result.data : envSchema.parse({});
}

/**
 * Validated environment configuration
 */
export const env = validateEnv();

/**
 * Type for the validated environment
 */
export type Env = z.infer<typeof envSchema>;
