import { openDB } from 'idb';

let eveReaderDB;

export default {
  async getEveReaderDB() {
    if (!eveReaderDB) {
      eveReaderDB = await openDB('EveReader', 1, {
        upgrade(db) {
          db.createObjectStore('setting', {
            keyPath: 'name',
          })
        }
      })
    }
    return eveReaderDB;
  },

  async getSettingFromDB() {
    await this.getEveReaderDB();
    try {
      let setting = await eveReaderDB.get('setting', 'user-setting');
      return setting.value;
    } catch {
      return;
    }
  },

  async updateSettingToDB(newVal) {
    await this.getEveReaderDB();
    await eveReaderDB.put('setting', {
      name: 'user-setting',
      value: newVal
    });
  }
};
