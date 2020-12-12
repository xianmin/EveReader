import { openDB } from 'idb';

let eveReaderDB;
const eveReaderDB_version = 1;
let eveAnnotationDB;
const eveAnnotationDB_version = 1;

export default {
  async getEveReaderDB() {
    if (!eveReaderDB) {
      eveReaderDB = await openDB('EveReader', eveReaderDB_version, {
        upgrade(db) {
          db.createObjectStore('setting', {
            keyPath: 'name',
          })

          const lastRead = db.createObjectStore('lastRead', {
            keyPath: 'ebookID',
          })

          lastRead.createIndex('date', 'date');
        }
      })
    }
    return eveReaderDB;
  },

  async getFromDB(store, key) {
    await this.getEveReaderDB();
    try {
      return await eveReaderDB.get(store, key);
    } catch {
      return;
    }
  },

  async setToDB(store, newVal) {
    await this.getEveReaderDB();
    await eveReaderDB.put(store, newVal);
  },

  getSettingFromDB() {
    let setting = this.getFromDB('setting', 'user-setting');
    return setting ? setting.value : undefined;
  },

  async updateSettingToDB(newVal) {
    await this.getEveReaderDB();
    await eveReaderDB.put('setting', {
      name: 'user-setting',
      value: newVal,
    });
  },

  getLastReadFromDB(ebookID) {
    return this.getFromDB('lastRead', ebookID);
  },

  updateLastReadToDB(newVal) {
    this.setToDB('lastRead', newVal);
  },

  async getEveAnnotationDB(ebookID) {
    eveAnnotationDB = await openDB(ebookID, eveAnnotationDB_version, {
      upgrade(db) {
        const store = db.createObjectStore('annotation', {
          keyPath: 'hash',
        })
        store.createIndex('date', 'date');
      },
    })

    return eveAnnotationDB;
  },

  async getAllAnnotation(ebookID) {
    if (!eveAnnotationDB) await this.getEveAnnotationDB(ebookID);
    try {
      return await eveAnnotationDB.getAll('annotation');
    } catch {
      return;
    }
  },

  async addAnnotationToDB(ebookID, annotation) {
    if (!eveAnnotationDB) await this.getEveAnnotationDB(ebookID);
    await eveAnnotationDB.put('annotation', annotation);
  },

  async deleteAnnotationFromDB(ebookID, hash) {
    if (!eveAnnotationDB) await this.getEveAnnotationDB(ebookID);
    await eveAnnotationDB.delete('annotation', hash);
  }
};
