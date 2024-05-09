import { Task, Input } from 'src/components/models'; // Make sure to import Input interface
import { defineStore } from 'pinia';
import { stateService } from 'src/services';
import { useUserStore } from 'src/stores/userStore';

export const useTaskStore = defineStore('tasks', {
  state: (): { tasks: [] } => ({
    tasks: [],
  }),
  actions: {
    async loadTasks() {
      try {
        const user = useUserStore();
        let dbTasks = null;
        try {
          dbTasks = user.user != null ? await stateService.loadState() : null;
        } catch {
          dbTasks = null;
        }
        const storedTasks = await localStorage.getItem('tasks');
        if (dbTasks) {
          // If tasks are stored in db, load them
          this.tasks = dbTasks;
        } else if (storedTasks) {
          // If tasks are stored in localStorage, load them
          this.tasks = JSON.parse(storedTasks);
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
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
      const user = useUserStore();
      if(user.user != null) {
        stateService.saveState(JSON.stringify(this.tasks));
      }
    },

    resetTasks() {
      localStorage.removeItem('tasks');
      this.loadTasks();
    },
  },
});
