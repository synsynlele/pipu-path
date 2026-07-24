import { z } from "zod";

const environmentSchema = z.object({
  APP_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "silent"])
    .default("info"),
});

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const serverSchema = publicSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type PublicEnvironment = z.infer<typeof publicSchema>;
export type ServerEnvironment = z.infer<typeof serverSchema>;
export type AppEnvironment = z.infer<typeof environmentSchema>;

export function parseEnvironment(
  source: Record<string, string | undefined>,
): AppEnvironment {
  const result = environmentSchema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean)
      .join(", ");
    throw new Error(`Invalid application environment: ${fields}`);
  }
  return result.data;
}

export function getServerEnvironment(): AppEnvironment {
  return parseEnvironment({
    APP_ENV: process.env.APP_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });
}

function getPublicProcessEnvironment() {
  return {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

export function readPublicEnvironment(
  source: Record<string, string | undefined> = getPublicProcessEnvironment(),
): PublicEnvironment {
  return publicSchema.parse(source);
}

export function readServerEnvironment(
  source: Record<string, string | undefined> = {
    ...getPublicProcessEnvironment(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
): ServerEnvironment {
  return serverSchema.parse(source);
}

export function requireSupabasePublicEnvironment(
  source: Record<string, string | undefined> = process.env,
) {
  const environment = readPublicEnvironment(source);
  if (
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    throw new Error("Supabase public environment is not configured.");
  }
  return {
    url: environment.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: environment.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    appUrl: environment.NEXT_PUBLIC_APP_URL,
  };
}
