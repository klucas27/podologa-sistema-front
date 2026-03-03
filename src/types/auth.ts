export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'podologa' | 'recepcionista';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
