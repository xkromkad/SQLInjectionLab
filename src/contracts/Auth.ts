export interface User {
  id: number;
  firstname: string;
  surname: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiToken {
  type: 'bearer';
  token: string;
  expires_at?: string;
  expires_in?: number;
}

export interface RegisterData {
  firstname: string;
  surname: string;
  email: string;
  password: string;
  repeatPassword: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}
