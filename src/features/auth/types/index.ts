export type UserRole = "admin" | "manager" | "user";

export interface User {
  id: string;
  username: string;
  professionalName: string | null;
  role: UserRole;
  workdayStart: string;
  workdayEnd: string;
}

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
