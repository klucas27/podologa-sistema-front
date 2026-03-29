export type UserRole = "admin" | "professional";

export interface User {
  id: string;
  username: string;
  professionalName: string | null;
  role: UserRole;
  professionalId: string | null;
  workdayStart: string;
  workdayEnd: string;
}

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
