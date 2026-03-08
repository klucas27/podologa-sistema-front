export interface User {
  id: string;
  username: string;
  professionalName: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
