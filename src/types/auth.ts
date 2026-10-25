export type UserRole = "admin" | "recepcao" | "manicure" | "podologa";

export interface User {
  id: string;
  username: string;
  professionalName: string | null;
  role: UserRole;
  professionalId: string | null;
  workdayStart: string;
  workdayEnd: string;
  /** Senha provisória: só a tela de troca de senha fica liberada. */
  mustChangePassword?: boolean;
}

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
