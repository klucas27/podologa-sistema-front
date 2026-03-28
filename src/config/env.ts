import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .default("")
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "VITE_API_URL deve ser uma URL válida ou vazio (para usar proxy)",
    }),
  VITE_ENV: z.enum(["development", "staging", "production"], {
    message: "VITE_ENV deve ser: development | staging | production",
  }),
});

function validateEnv() {
  const parsed = envSchema.safeParse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_ENV: import.meta.env.VITE_ENV,
  });

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`)
      .join("\n");

    throw new Error(
      `❌ Variáveis de ambiente inválidas:\n${missing}\n\nVerifique seu arquivo .env`,
    );
  }

  return parsed.data;
}

export const env = validateEnv();
