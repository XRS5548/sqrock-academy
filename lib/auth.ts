import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { envValue } from "@/lib/runtime-env";

const authUrl = envValue<string>("BETTER_AUTH_URL") ?? "http://localhost:5173";

export const auth = betterAuth({
  baseURL: authUrl,
  // Dev server (Vite) default port 5173 + common aliases, plus the configured URL.
  trustedOrigins: [authUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
  secret: envValue<string>("BETTER_AUTH_SECRET"),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
      headline: {
        type: "string",
        required: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
});
