<template>
  <el-container>
    <el-header height="10vh" v-show="this.prevNav">
      <div id="view-prev" @click="doPrev">
        ▲ Prev Section
      </div>
    </el-header>
    <el-main>
      <div class="eve-reader-container">
        <eve-annotator-popover 
          v-show = 'showAnnotator'
          :showAnnotatorFromClick = 'showAnnotatorFromClick'
          :annotatorPosition = "annotator.position"
          @do-annotator-highlight = "doAnnotatorHighlight"
          @do-annotator-delete = "doAnnotatorDelete"
        />
        <div id="eve-reader-view"></div>
      </div>
    </el-main>
    <el-footer height="10vh" v-show="this.nextNav">
      <div id="view-next" @click="doNext">
        ▼ Next Section
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex';
import EveAnnotatorPopover from './EveAnnotatorPopover';
import { Event, EventListener } from '../event.js';
import Theme from '../theme.js';

export default {
  computed: {
    ...mapGetters([
      'ebook',
    ]),
  },

  components: {
    EveAnnotatorPopover,
  },

  data() {
    return {
      rendition: null,
      prevNav: "",
      nextNav: "",
      showAnnotator: false,
      showAnnotatorFromClick: false,
      annotator: {
        position: {
          top: 0, 
          left: 0,
        },
        cfiRange: "",
        type: "",
        text: "",
      },
      eveAnnotation: {},
      theme: {},
      lastCfi: "",
    }
  },

  mounted() {
    // listen for setting change
    EventListener.updateSetting((setting) => {
      // when change setting, location will change, we need remember the location
      let location = this.rendition.currentLocation();
      this.setRenditionFromSetting(setting);
      this.ebook.updateRenditionLayout(location.start.cfi);
    })

    this.rendition = this.ebook.rendition = this.ebook.epub.renderTo("eve-reader-view", {
      flow: "scrolled-doc",
      axis: "vertical",
      width: "100%",
      height: "100%",
      fullsize: true,
    });

    this.theme = new Theme(this.rendition)

    // ----------------------------------------------
    // Ready for rendition display
    this.ebook.loaded()
      .then(() =>{
        // 1. set theme
        this.setRenditionFromSetting(this.ebook.generalSetting);
      })
      .then(() => {
        // 2. add hook
        // --- get selection info
        this.rendition.hooks.content.register((iframe) => {
          iframe.document.onmouseup = isSelected.bind(this);
          iframe.document.onmousedown = removeRange.bind(this);

          function removeRange() {
            const selection = iframe.window.getSelection();
            selection.removeAllRanges();
          }

          function isSelected(e) {
            e.preventDefault();

            const selection = iframe.window.getSelection();
            const firstRange = selection.getRangeAt(0);
            const rect = firstRange.getBoundingClientRect();
            this.setAnnotatorPosition(rect);

            // if select, show EveAnnotatorPopover.vue
            this.showAnnotator = !selection.isCollapsed ;
            this.showAnnotatorFromClick = false;

            // temporary store text to annotator
            this.annotator.text = selection.toString();
          }
        })
      })
      .then(() => {
        // load annotation from db to rendition
        let allAnnotations = this.ebook.allAnnotation;

        for(let i = 0; i < allAnnotations.length; i++) {
          let type = allAnnotations[i].type;
          let cfiRange = allAnnotations[i].cfiRange;
          let styles = { 'fill': allAnnotations[i].color }
          this.rendition.annotations.add(
            type,
            cfiRange,
            {'type': 'highlight'},
            this.onClickShowAnnotator,
            '',
            styles
          );
        }
      })
      .then(() => {
        // 3. display
        let lastCfi = this.ebook.storage.getEbookData("lastCfi");
        this.ebook.display(lastCfi || 0);
      })
      // End Rendition display
      //--------------------------


    this.rendition.on("rendered", (section) => {
      // when rendered, tell EveSidebar highlight current toc item
      let id = this.findCurrentTocItemID(section);
      Event.highlightCurrentTocItem(id);

      // create Prev and Next section href
      let prevSection = section.prev();
      let nextSection = section.next();

      // TODO: get section name
      if (prevSection) {
        this.prevNav = prevSection.href;
      } else {
        this.prevNav = "";
      }

      if (nextSection) {
        this.nextNav = nextSection.href;
      } else {
        this.nextNav = "";
      }
    });

    this.rendition.on("relocated", (location) => {
      this.lastCfi = location.start.cfi;
      this.ebook.storage.setEbookData('lastCfi', this.lastCfi);
    });

    this.rendition.on("resized", () => {
      // fix display incorrect when resized
      this.rendition.display(this.lastCfi);
    })

    // When selected, temporary store cfiRange to annotator
    this.rendition.on("selected", (cfiRange) => {
      this.annotator.cfiRange = cfiRange;
    });

    // when scrollbar at top or bottom, click up or down, do next or prev
    window.onscroll = () => {
      let scrollHeight = document.body.scrollHeight;
      let totalHeight = window.scrollY + window.innerHeight;

      const bottomDoNext = (e) => {
        const kc = e.keyCode || e.which;
        if (kc === 34 || kc === 40) {
          this.doNext()
        }
      }

      const topDoPrev = (e) => {
        const kc = e.keyCode || e.which;
        if (kc === 33 || kc === 38) {
          this.doPrev()
        }
      }

      if (window.scrollY === 0) {
        // console.log("at top")
        document.body.addEventListener("keydown", topDoPrev, { once: true })
      }

      if (totalHeight >= scrollHeight) {
        // console.log("at bottom")
        document.body.addEventListener("keydown", bottomDoNext, { once: true })
      }
    }
  },

  methods: {
    doPrev() {
      this.rendition.prev();
    },
    
    doNext() {
      this.rendition.next();
    },

    findCurrentTocItemID(section) {
      let href = section.href;
      let currentItem = this.ebook.epub.navigation.get(href);

      // here maybe need optimizes.
      // if a section is not in toc, currentItem will be undefined.
      if (currentItem === undefined) {
        let currentSpineIndex = this.ebook.epub.spine.spineByHref[href];
        // some toc has children items, we need flattened toc first
        let flattenedToc = (function flatten(items) {
          return [].concat(...items.map(item => [item].concat(...flatten(item.children))));
        })(this.ebook.toc);

        // assume that all the toc items are in order
        for (let i = 0; i < flattenedToc.length; i++) {
          if (currentSpineIndex < flattenedToc[i].spineIndex) {
            if (i === 0) {
              return '';
            } else {
              return flattenedToc[i - 1].id;
            }
          }
        }
      } else {
        return currentItem.id;
      }
    },

    // rect is getBoundingClientRect()
    // annotator position at bottom and center of selection
    // position relative to the parent container eve-reader-container
    // annotator width = 130, height =65
    setAnnotatorPosition(rect, offsetTop = 0, offsetLeft = 0) {
      let tempTop = rect.bottom + 5 - offsetTop;
      let tempLeft = rect.left + rect.width / 2 - 65 - offsetLeft; // 65 is half width of annotator
      let iframe = document.getElementById('eve-reader-view');
      let viewPrevHeight = document.getElementById('view-prev').clientHeight;

      // fix annotator left position
      if (tempLeft < 0) {
        tempLeft = 10; 
      }

      // fix annotator right position
      if ((iframe.clientWidth + offsetLeft) - (tempLeft + 130) < 0) {
        tempLeft = iframe.clientWidth + offsetLeft - 140;
      }

      // fix annotator top position
      let screenBottom = window.scrollY + window.innerHeight;
      let selectionBottom = rect.bottom - offsetTop + viewPrevHeight;
      if (screenBottom - selectionBottom < 70 || (tempTop + 70) > iframe.clientHeight ) {
        tempTop = rect.top - offsetTop - 70;
      }

      this.annotator.position.top = tempTop;
      this.annotator.position.left = tempLeft;
    },

    onClickShowAnnotator(e) {
      this.showAnnotatorFromClick = true;

      let rect = e.target.getBoundingClientRect();
      // because rect is relative to the parent window, we need offset iframe
      let iframeElement = document.getElementById('eve-reader-view');
      let iframeRect = iframeElement.getBoundingClientRect();
      this.setAnnotatorPosition(rect, iframeRect.top, iframeRect.left);

      this.annotator.cfiRange = e.target.getAttribute('data-epubcfi');
      this.annotator.type = e.target.getAttribute('data-type');
      let hash = encodeURI( this.annotator.cfiRange + this.annotator.type );
      this.annotator.text = this.ebook.allAnnotation.find(e => e.hash === hash).text;

      this.showAnnotator = true;
    },

    doAnnotatorHighlight(color) {
      this.showAnnotator = false;

      // if frome click, delete first, then change color
      if (this.showAnnotatorFromClick) this.doAnnotatorDelete();

      let cfiRange = this.annotator.cfiRange;
      // highlight(cfiRange: EpubCFI, data: object, cb: function, className: string, styles: object)
      let annotation = this.rendition.annotations.highlight(
        cfiRange, 
        {'type': 'highlight'}, 
        this.onClickShowAnnotator, 
        "", 
        { 'fill': color }
      );

      // save to indexDB
      let data = {};
      data.hash = encodeURI(cfiRange + annotation.type);
      data.sectionIndex = annotation.sectionIndex;
      data.type = annotation.type;
      data.color = color;
      data.cfiRange = cfiRange;
      data.text = this.annotator.text;
      this.ebook.saveAnnotationToDB(data);

      // remove iframe selection ranges
      let iframe = this.rendition.getContents()[0];
      let selection = iframe.window.getSelection();
      if (selection) selection.removeAllRanges();
    },

    doAnnotatorDelete() {
      let cfiRange = this.annotator.cfiRange;
      let type = this.annotator.type;
      this.rendition.annotations.remove(cfiRange, type);
      this.showAnnotator = false;

      let hash = encodeURI(cfiRange + type);
      this.ebook.deleteAnnotationFromDB(hash);
    },

    setRenditionFromSetting(setting) {
      this.rendition.themes.fontSize(`${setting.fontSize}px`);
      this.theme.updateDefault(setting);
    }
  },
};
</script>

<style lang="scss">
.eve-reader-container {
  position: relative;
}

iframe {
  display: block;
}

.el-main {
  // min-height: 90vh;
  padding: 0 !important;
  overflow: hidden !important;
}

.el-header, .el-footer {
  padding: 0;
  // line-height: 60px;

  #view-prev, #view-next {
    cursor: pointer;
    // background-color: #B3C0D1;
    font-size: 20px;
    color: #333;
    text-align: center;
    width: 100%;
    height: 100%;
    line-height: 10vh;
  }

  #view-prev {
    border-bottom: 1px solid #ececec;
  }

  #view-next {
    border-top: 1px solid #ececec;
  }
}

</style>
