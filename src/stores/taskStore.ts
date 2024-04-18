import { Task, Input } from 'src/components/models'; // Make sure to import Input interface
import { defineStore } from 'pinia';

export const useTaskStore = defineStore('tasks', {
  state: (): { tasks: Task[] } => ({
    tasks: [],
  }),
  actions: {
    async loadTasks() {
      try {
        const storedTasks = await localStorage.getItem('tasksss');
        if (storedTasks) {
          // If tasks are stored in localStorage, load them
          this.tasks = JSON.parse(storedTasks);
          console.log('loaded');
          console.log(this.tasks);
        } else {
          // Otherwise, fetch tasks from the server
          const response = await fetch('/src/assets/docs/tasks.json');
          const tasksData = await response.json();
          this.tasks = tasksData.map((task: Task, index: number) => ({
            id: task.id,
            caption: task.caption,
            task: task.task,
            query: task.query,
            results: [],
            checkQuery: task.checkQuery,
            inputs: task.inputs.map((input: Input) => ({
              // Map inputs here
              name: input.name,
              type: input.type,
              label: input.label,
              options: input.options || [],
              userAnswer: '',
            })),
            solved: false,
            opened: index === 0,
            correctAnswer: task.correctAnswer,
          }));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    },
    // Add a method to save tasks to localStorage
    saveTasks() {
      console.log('ukladam');
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
      console.log(this.tasks);
    },
  },
});
