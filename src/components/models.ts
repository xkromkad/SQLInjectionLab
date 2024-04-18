export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface Input {
  name: string;
  type: 'number' | 'text' | 'dropdown';
  label: string;
  userAnswer: string;
  options?: string[];
  value: string;
  selectedOption: 'string;';
}

export interface Task {
  id: number;
  caption: string;
  task: string;
  query: string;
  inputs: Input[];
  solved: boolean;
  opened: boolean;
  checkQuery: string;
  correctAnswer: string;
}

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


