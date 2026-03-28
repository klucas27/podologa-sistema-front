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

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Usuário deve ter pelo menos 3 caracteres"),
    professionalName: z.string().optional(),
    password: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z
      .string()
      .min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
