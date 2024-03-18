<template>
  <q-page class="row items-center justify-evenly q-mb-lg">
    <div style="width: 600px; margin-top: 100px"></div>
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
              <q-btn
                color="primary"
                class="text-primary q-ma-md"
                label="Potvrdiť"
              />
            </div>
          </div>
        </q-slide-transition>
      </q-card>
    </div>
    <q-page-sticky position="top" :offset="[0, 0]">
      <div class="bg-white q-py-sm q-mx-lg full-width tasks" id="tasks">
        <q-linear-progress
          stripe
          rounded
          size="20px"
          :value="
            tasks.filter((task) => task.solved === true).length / tasks.length
          "
          color="green"
          class="q-mt-sm"
          style="max-width: 600px; width: 95vw"
        />
        <div class="row justify-center q-my-xs">
          <div class="text-body1 q-mx-sm">
            {{ tasks.filter((task) => task.solved === true).length }} /
            {{ tasks.length }}
          </div>
          <q-btn
            size="sm"
            round
            color="primary"
            class="text-primary"
            icon="refresh"
          />
        </div>
      </div>
    </q-page-sticky>
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
