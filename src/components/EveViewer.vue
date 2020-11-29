<template>
  <div id="eve-reader-view">

    <div id="viewSection"
      v-html="sectionContent"
      ref="viewSection"
      />

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import epubContents from "../epubjs/contents";
import epubMapping from "../epubjs/mapping";

// import EveAnnotatorPopover from './EveAnnotatorPopover';
// import { Event, EventListener } from '../event.js';
// import Theme from '../theme.js';

export default {
  computed: {
    ...mapGetters([
      'ebook',
      'currentSectionIndex',
    ]),
  },

  components: {
  },

  data() {
    return {
      spineItems: null,
      sectionContent: null,
      contents: null,
    }
  },

  created() {
    this.spineItems = this.ebook.epub.spine.spineItems;
    this.doDisplay();

    document.body.addEventListener("keydown", (e) => {
      this.currentLocation();
      const kc = e.keyCode || e.which;
      if (window.scrollY === 0) {
        if (kc === 33 || kc === 38) {
          this.doPrev()
        }
      }

      if (window.scrollY + window.innerHeight === document.body.clientHeight) {
        if (kc === 34 || kc === 40) {
          this.doNext()
        }
      }
    })

    document.body.addEventListener("wheel", (e) => {
      if (window.scrollY === 0 && e.wheelDelta > 0) {
          this.doPrev()
      }

      if (window.scrollY + window.innerHeight === document.body.clientHeight
        && e.wheelDelta < 0) {
          this.doNext()
      }
    })
  },

  methods: {
    doDisplay() {
      this.display(this.spineItems[this.currentSectionIndex])
    },

    async display(section) {
      let request = this.ebook.epub.load.bind(this.ebook.epub);
      let result = await section.render(request);
      this.sectionContent = result.replace(/(<\s*\/?\s*)html(\s*([^>]*)?\s*>)/gi ,'$1eve-view-html$2')
                                  .replace(/(<\s*\/?\s*)head(\s*([^>]*)?\s*>)/gi ,'$1eve-view-head$2')
                                  .replace(/(<\s*\/?\s*)body(\s*([^>]*)?\s*>)/gi ,'$1eve-view-body$2')
      this.contents = new epubContents(section.document, section.contents,
                                       section.cfiBase, section.index);
    },

    currentLocation() {
      // let startPos = window.scrollY;
      // let endPos = startPos + window.innerHeight;
      let mapping = new epubMapping();
      let location = mapping.page(this.$refs.viewSection, this.contents.cfiBase, 0, window.innerHeight);
      console.log(location);
    },

    doPrev() {
      if (this.currentSectionIndex > 0) {
        let index = this.currentSectionIndex - 1;
        this.display(this.spineItems[index]);
        this.$store.dispatch("setCurrentSectionIndex", index);
        setTimeout(() => {
          window.scroll(0, document.body.clientHeight);
        }, 0)
      }
    },

    doNext() {
      if (this.currentSectionIndex < this.spineItems.length - 1) {
        let index = this.currentSectionIndex + 1;
        this.display(this.spineItems[index]);
        this.$store.dispatch("setCurrentSectionIndex", index);
        setTimeout(() => {
          window.scroll(0, 0);
        }, 0)
      }
    },

    getContent(section) {
      let request = this.ebook.epub.load.bind(this.ebook.epub);
      section.render(request).then((result) => {
        return result;
      })
    },
  },
};
</script>

<style lang="scss">
#viewSection {
  font-size: 30px;
}
</style>
