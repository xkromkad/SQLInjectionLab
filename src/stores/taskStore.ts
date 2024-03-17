import { Task, Input } from 'src/components/models'; // Make sure to import Input interface
import { defineStore } from 'pinia';

export const useTaskStore = defineStore('tasks', {
  state: (): { tasks: Task[] } => ({
    tasks: [],
  }),
  actions: {
    async loadTasks() {
      try {
        const response = await fetch('/src/assets/docs/tasks.json');
        const tasksData = await response.json();
        this.tasks = tasksData.map((task: Task, index: number) => ({
          id: task.id,
          caption: task.caption,
          task: task.task,
          inputs: task.inputs.map((input: Input) => ({
            // Map inputs here
            type: input.type,
            label: input.label,
            options: input.options || [],
          })),
          solved: false,
          opened: index === 0,
        }));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    },
  },
});
