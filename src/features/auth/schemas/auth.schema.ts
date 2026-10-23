import { z } from "zod";

/**
 * Schemas de validação alinhados com o backend (auth.schema.ts).
 * Mantém as mesmas regras min(3)/min(6) do Zod server-side.
 */

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Usuário deve ter pelo menos 3 caracteres"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
