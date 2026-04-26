const required = [
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "TRIGGER_SECRET_KEY",
  "NEXT_PUBLIC_TRIGGER_PUBLIC_API_KEY",
  "TRANSLOADIT_KEY",
  "TRANSLOADIT_SECRET",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

type EnvKey = (typeof required)[number];

function validateEnv(): Record<EnvKey, string> {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nAdd these to your .env.local file.`
    );
  }

  return Object.fromEntries(
    required.map((key) => [key, process.env[key] as string])
  ) as Record<EnvKey, string>;
}

export const env = validateEnv();
