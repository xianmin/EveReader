import { openDB } from 'idb';

let eveReaderDB;
const eveReaderDB_version = 1;

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
};
