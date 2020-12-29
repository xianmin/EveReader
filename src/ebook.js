import Epub from "./epubjs/book";

class Ebook {
  constructor() {
    this.ebookID = "";
    this.title = "";
    this.epub = null;
    this.fileName = "";
    this.navigation = null;
    this.toc = [];

    this.init();
  }

  init() {
    this.epub = new Epub();

    // get toc
    this.epub.loaded.navigation.then((nav) => {
      this.navigation = nav;
      this.toc = nav.toc;
    });
  }

  reset() {
    this.epub.destroy();
    this.init();
  }

  async loaded() {
    await this.epub.opened.then(() => {
      this.title = this.epub.packaging.metadata.title;
      this.ebookID = this.title + " - " + this.epub.packaging.uniqueIdentifier;
    });
  }

  openFile() {
    // add "input" element, click it, select file.
    return new Promise((resolve) => {
      let fi = document.createElement("input");
      fi.setAttribute("accept", "application/epub+zip");
      fi.style.display = "none";
      fi.type = "file";
      fi.onchange = () => {
        let file = fi.files[0]; // always choose the first file
        resolve(this.readFile(file)); // resolve here
      };
      document.body.appendChild(fi);
      fi.click();
      document.body.removeChild(fi);
    }).then((result) => {
      this.openEpub(result);
    });
  }

  openFileFromDrop(file) {
    return new Promise((resolve) => {
      resolve(this.readFile(file));
    }).then((result) => {
      this.openEpub(result);
    });
  }

  readFile(file) {
    return new Promise((resolve) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsArrayBuffer(file);
      this.fileName = file.name;
    });
  }

  openEpub(data) {
    return new Promise((resolve) => {
      if (this.epub.isOpen) this.reset();
      this.epub.open(data, "binary");
      resolve();
    });
  }

  openEpubFromUrl(url) {
    this.epub.open(url, "epub");
  }
}

export default Ebook;
