import Epub from 'epubjs';
import { openDB } from 'idb';

import Storage from './storage';

class Ebook {
  constructor() {
    this.ebookID = "";
    this.epub = null;
    this.rendition = null;
    this.storage = null;
    this.fileName = "";
    this.toc = [];
    this.defaultFontsize = 16;
    this.annotationColorList = ['#FFCAD7', '#FFDE70', '#FFFB78', '#D1FF61', '#B4FFEB',];
    this.annotationDB = null;
    this.allAnnotation = null;

    this.init();
  }

  init() {
    this.epub = new Epub();

    // get toc
    this.epub.loaded.navigation.then((nav) => {
      // change "subitems" to "children", because element-ui Tree
      this.toc = JSON.parse((JSON.stringify(nav.toc)).replace(/"subitems"/g, '"children"'));
    });
  }

  reset() {
    this.epub.destroy();
    this.init();
  }

  // set fontsize
  setFontSize(fontsize) {
    this.defaultFontsize = fontsize;
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

  async setEbook() {
    // get epub.key(), remove pre-identifier
    this.ebookID = this.epub.key().slice(11);
    this.storage = new Storage(this.ebookID);

    await this.initAnnotationDB(this.ebookID);
  }

  async initAnnotationDB(ebookId) {
    this.annotationDB = await openDB('Annotation', 1, {
      upgrade(db) {
        // Create a store of objects
        const store = db.createObjectStore(ebookId, {
          // The 'id' property of the object will be the key.
          keyPath: 'id',
          // If it isn't explicitly set, create a value by auto incrementing.
          autoIncrement: true,
        });
        // Create an index on the 'date' property of the objects.
        store.createIndex('date', 'date');
      },
    });

    await this.updateAllAnnotation();
  }

  async updateAllAnnotation() {
    this.allAnnotation = await this.annotationDB.getAll(this.ebookID)
  }

  saveAnnotationToDB(data) {
    data.date = new Date();
    this.annotationDB.add(this.ebookID, data);
  }
}

export default Ebook;
