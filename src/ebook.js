import Epub from 'epubjs';
import Storage from './storage';

class Ebook {
  constructor() {
    this.epub = null;
    this.rendition = null;
    this.storage = null;
    this.fileName = "";
    this.toc = [];
    this.defaultFontsize = 16;

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
    return new Promise((resolve) => {
      let fi = document.createElement("input");
      fi.setAttribute("accept", "application/epub+zip");
      fi.style.display = "none";
      fi.type = "file";
      fi.onchange = () => {
        let reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        }
        if (fi.files[0]) {
          reader.readAsArrayBuffer(fi.files[0]);
          let fileName = fi.files[0].name;
          this.fileName = fileName
        }
      };
      document.body.appendChild(fi);
      fi.click();
    }).then((result) => {
      this.openEpub(result);
    })
  }

  openEpub(data) {
    if (this.epub.isOpen) this.reset();
    this.epub.open(data, "binary");
  }

  setEbook() {
    // get epub.key(), remove pre-identifier
    let id = this.epub.key().slice(11);
    this.storage = new Storage(id);
  }
}

export default Ebook;
