<template>
  <q-page class="row items-center justify-evenly">
    <q-linear-progress
      stripe
      rounded
      size="20px"
      :value="
        tasks.filter((task) => task.solved === true).length / tasks.length
      "
      color="green"
      class="q-mt-sm"
      style="max-width: 600px; width: 600px"
    />
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
        <q-card-section class="row items-center">
          <div class="text-h6">{{ task.caption }}</div>
          <q-space />
          <q-icon
            v-show="task.solved"
            name="check_circle"
            color="green"
            size="xs"
          ></q-icon>
          <q-icon
            v-show="!task.solved"
            name="cancel"
            color="grey"
            size="xs"
          ></q-icon>
          <q-btn
            color="grey"
            round
            flat
            dense
            :icon="task.opened ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
            @click="task.opened = !task.opened"
          />
        </q-card-section>
        <q-slide-transition>
          <div v-show="task.opened">
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
          </div>
        </q-slide-transition>
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
