export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface Input {
  type: 'number' | 'text' | 'dropdown';
  label: string;
  options?: string[];
}

export interface Task {
  id: number;
  caption: string;
  task: string;
  inputs: Input[];
}
