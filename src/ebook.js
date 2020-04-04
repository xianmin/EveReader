import { openDB } from 'idb';

// because npm epubjs is not updatest, use epub.min.js instead.
import Epub from './assets/js/epub.min.js';
import Storage from './storage';

class Ebook {
  constructor() {
    this.ebookID = "";
    this.epub = null;
    this.rendition = null;
    this.storage = null;
    this.fileName = "";
    this.toc = [];
    this.currentFontsize;
    this.annotationColorList = ['#FFCAD7', '#FFDE70', '#FFFB78', '#D1FF61', '#B4FFEB',];
    this.annotationDB = null;
    this.allAnnotation = [];
    this.defaultSetting = {
      fontSize: 16,
    };
    this.generalSetting = {};

    this.init();
    this.ready = this.initEveReaderDB();
  }

  init() {
    this.epub = new Epub();

    // get toc
    this.epub.loaded.navigation.then((nav) => {
      this.toc = this.generateToc(nav.toc, []);
    });
  }

  reset() {
    this.epub.destroy();
    this.init();
  }

  async loaded() {
    await this.epub.ready.then(() => {
        // get epub.key(), remove pre-identifier
        this.ebookID = this.epub.key().slice(11);
        this.storage = new Storage(this.ebookID);
    })

    await this.initAnnotationDB(this.ebookID);
  }

  setFontSize(fontsize) {
    this.currentFontsize = fontsize;
    this.rendition.themes.fontSize(`${fontsize}px`);
  }

  openFile() {
    // add "input" element, click it, select file.
    return new Promise((resolve) => {
      let fi = document.createElement("input");
      fi.setAttribute("accept", "application/epub+zip");
      fi.style.display = "none";
      fi.type = "file";
      fi.onchange = () => {
        let file = fi.files[0];       // always choose the first file
        resolve(this.readFile(file)); // resolve here
      }
      document.body.appendChild(fi);
      fi.click();
    }).then((result) => {
      this.openEpub(result);
    })
  }

  openFileFromDrop(file) {
    return new Promise((resolve) => {
      resolve(this.readFile(file));
    }).then((result) => {
      this.openEpub(result);
    })
  }

  readFile(file) {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      }
      reader.readAsArrayBuffer(file);
      this.fileName = file.name;
    })
  }

  openEpub(data) {
    if (this.epub.isOpen) this.reset();
    this.epub.open(data, "binary");
  }

  getEbookID() {
    return this.ebookID = this.epub.key().slice(11);
  }

  async initEveReaderDB() {
    this.eveReaderDB = await openDB('EveReader', 1, {
      upgrade(db) {
        db.createObjectStore('setting', {
          keyPath: 'name',
        })
      }
    })

    await this.getSettingFromDB()
  }

  async getSettingFromDB() {
    try {
      let general = await this.eveReaderDB.get('setting', 'general');

      if (!general) {
        this.initGeneralSetting();
      } else {
        this.generalSetting = general.value;
      }

      this.currentFontsize = parseInt(this.generalSetting.fontSize);
    } catch {
      return;
    }
  }

  initGeneralSetting() {
    let generalSetting = this.defaultSetting;
    this.eveReaderDB.put('setting', { name: 'general', value: generalSetting });
    this.generalSetting = generalSetting;
  }

  updateGeneralSetting(newVal) {
    this.eveReaderDB.put('setting', { name: 'general', value: newVal });
    this.generalSetting = newVal;
    this.currentFontsize = newVal.fontSize;
  }

  // Annotation ---------------------------

  async initAnnotationDB(ebookID) {
    this.annotationDB = await openDB(ebookID, 1, {
      upgrade(db) {
        const store = db.createObjectStore('annotation', {
          // The 'hash' property of the object will be the key.
          keyPath: 'hash',
        });
        // Create an index on the 'date' property of the objects.
        store.createIndex('date', 'date');
      },
    });
    
    await this.updateAllAnnotation()
  }

  async updateAllAnnotation() {
    try {
      let tempAnnotation = await this.annotationDB.getAll('annotation');
      this.allAnnotation = Object.values(tempAnnotation); // convert to array
    } catch {
      return;
    }
  }

  saveAnnotationToDB(data) {
    data.date = new Date();
    this.annotationDB.add('annotation', data);

    this.updateAllAnnotation()
  }

  deleteAnnotationFromDB(hash) {
    this.annotationDB.delete('annotation', hash);

    this.updateAllAnnotation()
  }

  // End Annotation --------------------------------------------

  generateToc(toc, parrent) {
    for (let i = 0; i < toc.length; i++) {
      let id = toc[i].id;
      let label = toc[i].label.trim();
      let href = toc[i].href;
      let spineIndex = this.epub.spine.spineByHref[href];

      parrent[i] = {
        id: id,
        label: label,
        children: [],
        href: href,
        spineIndex: spineIndex,
      };

      // if toc has subitems recursively
      // change "subitems" to "children", because element-ui Tree need it
      if (toc[i].subitems) {
        this.generateToc(toc[i].subitems, parrent[i].children);
      }
    }

    return parrent;
  }
}

export default Ebook;
