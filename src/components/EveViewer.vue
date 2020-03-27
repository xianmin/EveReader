<template>
  <el-container>
    <el-header height="10vh" v-show="this.prevNav">
      <div class="view-prev" @click="doPrev">
        ▲ Prev Section
      </div>
    </el-header>
    <el-main>
      <div class="eve-reader-container">
        <eve-annotator-popover 
          v-show='showAnnotator'
          :annotatorPosition = "annotator.position"
          @do-annotator-highlight = "doAnnotatorHighlight"
        />
        <div id="eve-reader-view"></div>
      </div>
    </el-main>
    <el-footer height="10vh" v-show="this.nextNav">
      <div class="view-next" @click="doNext">
        ▼ Next Section
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex';
import EveAnnotatorPopover from './EveAnnotatorPopover';

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
      annotator: {
        position: {
          top: 0, 
          left: 0,
        },
        cfiRange: "",
      },
    }
  },

  mounted() {
    this.rendition = this.ebook.rendition = this.ebook.epub.renderTo("eve-reader-view", {
      flow: "scrolled-doc",
      axis: "vertical",
      width: "100%",
      height: "100%",
      fullsize: true,
    });

    this.ebook.epub.ready.then(() => {
      // 0. get local storage etc.
      this.ebook.setEbook()
    }).then(() =>{
      // 1. set theme
      this.rendition.themes.fontSize(`${this.ebook.defaultFontsize}px`);
    }).then(() => {
      // 2. add hook
      // --- get selection info
      this.rendition.hooks.content.register((iframe) => {
        iframe.document.onmouseup = isSelected.bind(this);

        function isSelected(e) {
          e.preventDefault();
          const selection = iframe.window.getSelection();
          this.showAnnotator = !selection.isCollapsed ;

          const firstRange = selection.getRangeAt(0);
          const rect = firstRange.getBoundingClientRect();
          this.annotator.position.top = rect.bottom + 5;
          this.annotator.position.left = rect.left + rect.width / 2 - 65
        }
      })
    }).then(() => {
      // 3. display
      let lastCfi = this.ebook.storage.getEbookData("lastCfi")
      this.rendition.display(lastCfi || 0);
    })


    this.rendition.on("rendered", (section) => {
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
      let cfi = location.start.cfi;
      this.ebook.storage.setEbookData('lastCfi', cfi)
    });

    // save selected cfiRange
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

    doAnnotatorHighlight(color) {
      this.showAnnotator = false;
      // highlight(cfiRange: EpubCFI, data: object, cb: function, className: string, styles: object)
      this.rendition.annotations.highlight(this.annotator.cfiRange, {}, (e) => {
          console.log("highlight clicked", e.target);
      }, "", { fill:color });
    },
  },
};
</script>

<style lang="scss" scoped>
.eve-reader-container {
  position: relative;
  max-width: 800px;
  margin: auto;
}

// #eve-reader-view {
//   max-width: 800px;
//   margin: auto;
// }

.el-main {
  min-height: 90vh;
  padding: 0 0 10vh 0;
}

.el-header, .el-footer {
  padding: 0;
  // line-height: 60px;

  .view-prev, .view-next {
    cursor: pointer;
    // background-color: #B3C0D1;
    font-size: 20px;
    color: #333;
    text-align: center;
    width: 100%;
    height: 100%;
    line-height: 10vh;
  }

  .view-prev {
    border-bottom: 1px solid #ececec;
  }

  .view-next {
    border-top: 1px solid #ececec;
  }
}

</style>
