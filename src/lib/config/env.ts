import { z } from "zod";

const environmentSchema = z.object({
  APP_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "silent"])
    .default("info"),
});

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
