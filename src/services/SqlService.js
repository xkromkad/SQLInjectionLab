import initSqlJs from 'sql.js';
import wasmBinaryFile from 'src/assets/sql-wasm.wasm';
import { ref, watch } from 'vue';
import { useDbStore } from 'src/stores/dbStore';

class SqlService {
  connection = null;
  db = ref(null);
  dbStore = useDbStore();

  constructor() {
    this.connection = null;
  }

  async query(query) {
    return this.connection.query(query);
  }

  async initializeSqlJs() {
    console.log('init db');
    // Load the .wasm file
    const wasmBinaryFile =
      process.env.NODE_ENV === 'production'
        ? 'sql-wasm.wasm'
        : 'src/assets/sql-wasm.wasm';
    const sqlJs = await initSqlJs({ locateFile: () => wasmBinaryFile });
    // Create a new database instance
    this.db.value = new sqlJs.Database(this.dbStore.dbFile);
  }

  async executeSql(task) {
    await this.initializeSqlJs();
    var params = task.inputs;
    var sql = task.query;
    // Loop through params
    for (const param of params) {
      const paramValue = param.value;
      // Replace placeholders in the select string with paramValue
      sql = sql.replace(new RegExp(`{${param.name}}`, 'g'), paramValue);
    }
    if (this.db.value) {
      console.log(sql);
      try {
        const result = this.db.value.exec(sql);
        return result;
        // Handle result or perform further operations
      } catch (error) {
        // Handle any errors that occur during execution
        console.error('An error occurred:', error);
        return 'error';
      }
    }
  }

  async executeCheckSql(sql) {
    if (this.db.value) {
      console.log(sql);
      const result = this.db.value.exec(sql);
      return result;
    } else {
      console.log('no db');
    }
  }
}

export default new SqlService();
