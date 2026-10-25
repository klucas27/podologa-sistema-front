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

/** Mesma regra do servidor (shared/auth/password.ts): 10–72, letra e número. */
export const PASSWORD_RULE = 'Mínimo 10 caracteres, com letra e número.';

export function passwordRuleError(password: string): string | null {
  if (password.length < 10) return 'A nova senha deve ter pelo menos 10 caracteres.';
  if (password.length > 72) return 'A nova senha pode ter no máximo 72 caracteres.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'A nova senha precisa de letra e número.';
  return null;
}
