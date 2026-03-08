export interface User {
  id: string;
  username: string;
  professionalName: string | null;
  workdayStart: string;
  workdayEnd: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
