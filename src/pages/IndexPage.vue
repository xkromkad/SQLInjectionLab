<template>
  <q-page class="row items-center justify-evenly">
    <div
      class="full-width row items-center justify-evenly"
      v-for="task in tasks"
      :key="task.id"
    >
      <q-card
        flat
        bordered
        class="card q-ma-sm"
        style="max-width: 600px; width: 600px"
      >
        <q-card-section>
          <div class="text-h6">{{ task.caption }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ task.task }}
        </q-card-section>
        <q-separator inset />
        <!-- Loop through task inputs -->
        <div v-for="(input, index) in task.inputs" :key="index">
          <template v-if="input.type === 'text'">
            <q-input
              class="q-ma-md"
              outlined
              v-model="input.value"
              :label="input.label"
            />
          </template>
          <template v-else-if="input.type === 'number'">
            <q-input
              class="q-ma-md"
              outlined
              v-model.number="input.value"
              type="number"
              :label="input.label"
            />
          </template>
          <template v-else-if="input.type === 'dropdown'">
            <q-select
              class="q-ma-md"
              outlined
              v-model="input.selectedOption"
              :options="input.options"
              :label="input.label"
            />
          </template>
        </div>
        <div class="row">
          <q-space />
          <q-btn color="primary q-ma-md" label="Potvrdiť" />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useTaskStore } from 'src/stores/taskStore';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const taskStore = useTaskStore();
    const tasks = ref(taskStore.tasks);

    onMounted(() => {
      taskStore.loadTasks();
    });

    // Watch for changes in taskStore.tasks and update the local tasks reference
    watch(
      () => taskStore.tasks,
      (newTasks) => {
        tasks.value = newTasks;
      }
    );

    return { tasks, text: ref('') };
  },
});
</script>
