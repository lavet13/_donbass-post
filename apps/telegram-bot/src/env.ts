import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { resolve } from "path";
import z from "zod";

const BaseSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number<string>().int("PORT should be an integer").min(1).max(65535).default(3000),
  MANAGER_CHAT_IDS: z
    .string()
    .trim()
    .default("")
    .transform((ids) => {
      if (ids === "") return [];
      return ids
        .split(",")
        .map((raw) => raw.trim())
        .filter((raw) => raw.length > 0)
        .map((raw) => parseInt(raw, 10))
        .filter((id) => !isNaN(id));
    }),
  DATABASE_URL: z.string().min(1, "Database URL is required"),
  ROOT_ADMIN_CHAT_ID: z.coerce.number<string>().int("ROOT_ADMIN_CHAT_ID should be an integer").optional(),
});

const WebhookEnvSchema = BaseSchema.extend({
  USE_WEBHOOK: z.literal("true"),
  WEBHOOK_URL: z
    .string()
    .min(1, "WEBHOOK_URL is required when USE_WEBHOOK is true"),
  WEBHOOK_SECRET: z
    .hex()
    .min(64, "WEBHOOK_SECRET is too short (min 64 chars recommended)")
    .optional(),
});

const PollingEnvSchema = BaseSchema.extend({
  // default("false") handles the case where USE_WEBHOOK is not set at all
  USE_WEBHOOK: z.literal("false").default("false"),
});

const EnvSchema = z
  .discriminatedUnion("USE_WEBHOOK", [WebhookEnvSchema, PollingEnvSchema])
  .refine(
    (data) => {
      if (
        data.NODE_ENV === "production" &&
        data.ROOT_ADMIN_CHAT_ID === undefined
      ) {
        return false;
      }
      return true;
    },
    {
      error: "ROOT_ADMIN_CHAT_ID is required in production",
      path: ["ROOT_ADMIN_CHAT_ID"],
    },
  );

// The raw validated env type — used internally by buildConfig()
// The rest of the app never imports this directly
type RawEnv = z.infer<typeof EnvSchema>;

/**
 * Load and expand environment variables from .env file
 * This handles variable interpolation like ${VARIABLE_NAME}
 */
function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");

  // Load .env file
  const env = config({ path: envPath });

  // Expand variables (handles ${VARIABLE} syntax)
  expand(env);

  return process.env;
}

function parseEnv(): RawEnv {
  loadEnv();

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    // Produces output like:
    // ✖ String must contain at least 1 character(s)
    //   → at TELEGRAM_BOT_TOKEN
    // ✖ Database URL is required
    //   → at DATABASE_URL
    console.error(z.prettifyError(result.error));
    process.exit(1);
  }

  return result.data;
}

// Auto-load on import
export const env = parseEnv();
export type { RawEnv };
