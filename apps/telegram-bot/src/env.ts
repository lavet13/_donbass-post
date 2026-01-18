import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { resolve } from "path";

/**
 * Load and expand environment variables from .env file
 * This handles variable interpolation like ${VARIABLE_NAME}
 */
export function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");

  // Load .env file
  const env = config({ path: envPath });

  // Expand variables (handles ${VARIABLE} syntax)
  expand(env);

  return process.env;
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }

  return value;
}

/**
 * Get required environment variable (throws if not set)
 */
export function requireEnv(key: string): string {
  return getEnv(key);
}

/**
 * Validate required environment variables
 */
export function validateEnv(requiredVars: string[]): void {
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

// Auto-load on import
loadEnv();
