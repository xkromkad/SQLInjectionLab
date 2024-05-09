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
                  :disable="task.solved"
                  class="q-ma-md"
                  outlined
                  v-model="input.value"
                  :label="input.label"
                />
              </template>
              <template v-else-if="input.type === 'number'">
                <q-input
                  :disable="task.solved"
                  class="q-ma-md"
                  outlined
                  v-model.number="input.value"
                  type="number"
                  :label="input.label"
                />
              </template>
              <template v-else-if="input.type === 'dropdown'">
                <q-select
                  :disable="task.solved"
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
                @click="submitTask(task)"
              />
            </div>
            <q-card-section v-if="task.results.length > 0">
              <q-table
                class="q-mb-md"
                v-for="(result, index) in task.results"
                :key="index"
                title="Výsledok"
                :rows="result.rows"
                :columns="result.columns"
                row-key="name"
              />
            </q-card-section>
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
            @click="refreshTasks()"
          />
        </div>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script lang="js">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useTaskStore } from 'src/stores/taskStore';
import { useDbStore } from 'src/stores/dbStore';
import initSqlJs from 'sql.js';
import wasmBinaryFile from 'src/assets/sql-wasm.wasm';
import { sqlService } from 'src/services';


export default defineComponent({
  name: 'IndexPage',
  setup() {

    const taskStore = useTaskStore();
    const tasks = ref(taskStore.tasks);
    const dbStore = useDbStore();
    const dbFile = ref(dbStore.dbFile);


    onMounted(async () => {
      await taskStore.loadTasks();
      await dbStore.loadDb();
    });

    // Watch for changes in taskStore.tasks and update the local tasks reference
    watch(
      () => taskStore.tasks,
      (newTasks) => {
        tasks.value = newTasks;
      }
    );

    async function submitTask(task) {
      const results = await sqlService.executeSql(task);
      const convertedResults = [];
      if(results == 'error') {
        task.rawresults = results;
        checkResult(task);
        return;
      }
      for (const result of results) {
        if (result) {
          const convertedData = convertData(result.columns, result.values);
          convertedResults.push({
            columns: convertedData.columns,
            rows: convertedData.rows
          });
        }
      }
      task.results = convertedResults;
      task.rawresults = results;

      // Trigger saveTasks after updating tasks

      await checkResult(task)
      taskStore.saveTasks();
    };



    async function checkResult(task) {
      if(task.rawresults == 'error') {
        if(task.correctAnswer == 'error') {
          task.solved = true
          return;
        }
      }
      var result = task.rawresults;
      if(task.checkQuery) {
        result = await sqlService.executeCheckSql(task.checkQuery, task.inputs);
      }
      if(!result.length) {
        return;
      }

      for (const element of result) {
        const answersArray = task.correctAnswer.split(';').map(answer => answer.trim());
        const flattenedArray = element.values.reduce((acc, arr) => {
            acc.push(...arr.map(el => String(el)));
            return acc;
        }, []);
        const allAnswersExist = answersArray.every(answer => flattenedArray.includes(answer));
        if(allAnswersExist) {
          task.solved = true;
        }
      }

    }

    function convertData(columns, values) {
      // Convert columns
      const convertedColumns = columns.map(column => {
        return {
          name: column,
          align: 'left',
          label: column.replace('_', ' ').toUpperCase(),
          field: row => row[column],
          format: val => `${val}`,
          sortable: true
        };
      });


      // Convert rows
      const convertedRows = values.map(row => {
        const convertedRow = {};
        columns.forEach((column, index) => {
          convertedRow[column] = row[index];
        });
        return convertedRow;
      });

      return { columns: convertedColumns, rows: convertedRows };
    };

    function refreshTasks() {
      taskStore.resetTasks();
    }



    return { tasks, text: ref(''), refreshTasks, submitTask };
  },


});
</script>
