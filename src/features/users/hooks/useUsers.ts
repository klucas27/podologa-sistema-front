import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import type { CreateUserInput, UpdateUserInput } from "../services/user.service";
import { notifySuccess } from "@/lib/notifications";

export const userKeys = { all: ["users"] as const };

export function useUsers() {
  return useQuery({ queryKey: userKeys.all, queryFn: () => userService.list() });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      notifySuccess("Usuário criado.");
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => userService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      notifySuccess("Usuário atualizado.");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => userService.resetPassword(id, password),
  });
}

/** Senha temporária legível (sem caracteres ambíguos), sempre com letra e número. */
export function generateTemporaryPassword(): string {
  const letters = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const pool = letters + digits;
  const bytes = crypto.getRandomValues(new Uint32Array(10));
  const chars = Array.from(bytes, (b) => pool[b % pool.length]);
  chars[0] = letters[(bytes[0] ?? 0) % letters.length] ?? "a";
  chars[1] = digits[(bytes[1] ?? 0) % digits.length] ?? "2";
  return chars.join("");
}
