import Epub from 'epubjs'

class Ebook {
  constructor(element) {
    this.element = element;
    this.epub = null;
    this.rendition = null;
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
      var fi = document.createElement("input");
      fi.setAttribute("accept", "application/epub+zip");
      fi.style.display = "none";
      fi.type = "file";
      fi.onchange = () => {
        var reader = new FileReader();
        reader.onload = () => {
          this.openEpub(reader.result);
        }
        if (fi.files[0]) {
          reader.readAsArrayBuffer(fi.files[0]);
          // let fileName = fi.files[0].name;
        }
      };
      document.body.appendChild(fi);
      fi.click();
  }

  openEpub(data) {
    if (this.epub.isOpen) this.reset();
    this.epub.open(data, "binary");
    this.renderTo(this.element);
  }

  renderTo(element) {
    this.rendition = this.epub.renderTo(element, {
      manager: "continuous",
      flow: "scrolled",
      axis: "vertical",
      width: "100%",
      height: "100%",
      // snap: true,
      fullsize: true,
    });

    this.rendition.themes.fontSize(`${this.defaultFontsize}px`);
    this.rendition.display();
  }
}

export default Ebook;
