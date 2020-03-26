<template>
  <el-container>
    <el-header height="10vh" v-show="this.prevNav">
      <div class="view-prev" @click="doPrev">
        ▲ Prev Section
      </div>
    </el-header>
    <el-main>
      <div id="eve-reader-view"></div>
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
import EveAnnotator from '../eveAnnotator.js';

export default {
  computed: {
    ...mapGetters([
      'ebook',
    ]),
  },

  data() {
    return {
      rendition: null,
      prevNav: "",
      nextNav: "",
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
      this.ebook.setEbook()
    }).then(() =>{
      this.rendition.themes.fontSize(`${this.ebook.defaultFontsize}px`);
    }).then(() => {
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

    // Apply a class to selected text
    this.rendition.on("selected", cfi.bind(this));

    function cfi(cfiRange, iframe) {
      // console.log(iframe)
      // show evePopverWrapper

      iframe.window.annotator.doClick = () => {
        this.rendition.annotations.highlight(cfiRange, {}, (e) => {
            console.log("highlight clicked", e.target);
        });
      }
    }

    // this.rendition.themes.default({
    //   '::selection': {
    //     'background': 'rgba(255,255,0, 0.3)'
    //   },
    //   '.epubjs-hl' : {
    //     'fill': 'yellow', 'fill-opacity': '0.3', 'mix-blend-mode': 'multiply'
    //   }
    // });

    // hook
    this.rendition.hooks.content.register((iframe) => {
      let annotator = new EveAnnotator(iframe);
      iframe.window.annotator = annotator;
    })


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
  },
};
</script>

<style lang="scss" scoped>
#eve-reader-view {
  max-width: 800px;
  margin: auto;
}

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
