import { defineStore } from 'pinia';

export const useDbStore = defineStore({
  id: 'db',
  state: (): {
    dbFile: null | string;
    db: null | string;
    values: string[];
  } => ({
    dbFile: null,
    db: null,
    values: [],
  }),
  actions: {
    async loadDb() {
      console.log('begin getDBFile');
      try {
        const response = await fetch('/src/assets/db/SQLInjectionLab.db');
        console.log('begin http.get');
        console.log(response);
        console.log('end http.get');

        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }

        const rawDataDBFile = new Uint8Array(await response.arrayBuffer());
        console.log('begin data');
        console.log('data length ' + rawDataDBFile.length);
        this.dbFile = rawDataDBFile.reduce(
          (acc, val) => acc + String.fromCharCode(val),
          ''
        );
        console.log('end data');

        this.GET_DBFILE(this.dbFile);
        this.DBFileIsLoaded();
        console.log('end getDBFile in store');
      } catch (error) {
        console.error('begin error');
        console.error(error);
        console.error('end error');
      }
    },
    GET_DBFILE(dataDBFile: string | null) {
      // Define your mutation logic here
    },
    DBFileIsLoaded() {
      // Define your method logic here
    },
  },
});
