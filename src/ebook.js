import { openDB } from 'idb';
import Epub from './epubjs/book';
import Storage from './storage.js';


class Ebook {
  constructor() {
    this.ebookID = "";
    this.epub = null;
    this.rendition = null;
    this.storage = null;
    this.fileName = "";
    this.toc = [];

    this.annotationColorList = ['#FFCAD7', '#FFDE70', '#FFFB78', '#D1FF61', '#B4FFEB',];
    this.annotationDB = null;
    this.allAnnotation = [];

    this.init();
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
    await this.epub.opened.then(() => {
      this.ebookID = this.epub.key();
      this.storage = new Storage(this.ebookID);
    })

    await this.initAnnotationDB(this.ebookID);
  }

  display(target) {
    this.rendition.display(target).then(() => {
      // when we set theme, the display location maybe not correct, fix it.
      if (typeof target === "string" &&
        target.indexOf("epubcfi(") === 0 &&
        target[target.length - 1] === ")") {
        let location = this.rendition.currentLocation();
        if (location.start.cfi !== target) this.rendition.display(target);
      }
    })
  }

  updateRenditionLayout(cfi) {
    this.rendition.manager.updateLayout();
    this.rendition.display(cfi);
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
      document.body.removeChild(fi);
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
    return new Promise((resolve) => {
      if (this.epub.isOpen) this.reset();
      this.epub.open(data, "binary");
      resolve();
    })
  }

  openEpubFromUrl(url) {
    this.epub.open(url, "epub")
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
    data.date = new Date().toISOString();
    this.annotationDB.add('annotation', data);

    this.updateAllAnnotation()
  }

  deleteAnnotationFromDB(hash) {
    this.annotationDB.delete('annotation', hash);

    this.updateAllAnnotation()
  }

  exportAnnotationToJson() {
    let json = {};
    json.fileName = this.fileName;
    json.annotation = this.allAnnotation;
    json.ebookID = this.ebookID;

    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    const uri = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.href = uri;
    element.download = `${this.fileName} - annotation.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  async importAnnotationFromJson(data) {
    const json = JSON.parse(data);
    const ebookID = json.ebookID;
    const annotation = json.annotation;

    if (this.ebookID === ebookID) {
      for (let i = 0; i < annotation.length; i++) {
        await this.annotationDB.put('annotation', annotation[i]);
      }
      await this.updateAllAnnotation();
      return "success"
    } else {
      return "error"
    }
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
