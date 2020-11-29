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
// import epubContents from "../epubjs/contents";
import epubMapping from "../epubjs/mapping";
import epubCfi from "../epubjs/epubcfi";
import { isNumber } from "../epubjs/utils/core";

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
      section: null,
      sectionContent: null,
      lastCfi: "",
    }
  },

  mounted() {
    this.ebook.loaded().then(() => {
      // this.isLoad = true;
      this.spineItems = this.ebook.epub.spine.spineItems;
      let lastCfi = this.ebook.storage.getEbookData("lastCfi");
      this.display(lastCfi || 0);
    })

    this.$bus.on('event-view-display', this.display);

    document.body.addEventListener("keydown", (e) => {
      const kc = e.keyCode || e.which;
      if (window.scrollY === 0) {
        // UP, PageUP, display prev section; here is a bug.
        if (kc === 33 || kc === 38) {
          this.doPrev()
        }
      }

      if (window.scrollY + window.innerHeight === document.body.clientHeight) {
        // DOWN, PageDOWN, display next section;
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

    // when scroll finish, store cfi
    let timer = null;
    window.addEventListener('scroll', () => {
      if(timer !== null) {
          clearTimeout(timer);
      }
      timer = setTimeout(() => {
        this.storeLocation();
      }, 150);
    }, false);
  },

  watch: {
    section() {
      this.storeLocation();
    },
  },

  methods: {
    async display(target) {
      this.section = this.ebook.epub.spine.get(target);
      let request = this.ebook.epub.load.bind(this.ebook.epub);
      let result = await this.section.render(request);
      this.sectionContent = result.replace(/(<\s*\/?\s*)html(\s*([^>]*)?\s*>)/gi ,'$1eve-view-html$2')
                                  .replace(/(<\s*\/?\s*)head(\s*([^>]*)?\s*>)/gi ,'$1eve-view-head$2')
                                  .replace(/(<\s*\/?\s*)body(\s*([^>]*)?\s*>)/gi ,'$1eve-view-body$2')
      // this.contents = new epubContents(section.document, section.contents,
      //                                  section.cfiBase, section.index);

      // if target is epubCfi, moving to
      if (target === this.section.href) {
        window.scroll(0, 0);
      } else if (isNumber(target)) {
        return;
      } else {
        this.moveToTarget(target);
      }
    },

    moveToTarget(target) {
      setTimeout(()=>{
        let rootNode = this.$refs.viewSection.childNodes[0]
        let range = new epubCfi(target).toRange(rootNode);
        let container = range.startContainer;
        let newRange = new Range();
        let position;

        if (range.startOffset + 2 < container.length) {
          newRange.setStart(container, range.startOffset);
          newRange.setEnd(container, range.startOffset + 2);
          position = newRange.getBoundingClientRect();
        } else if (range.startOffset - 2 > 0) {
          newRange.setStart(container, range.startOffset - 2);
          newRange.setEnd(container, range.startOffset);
          position = newRange.getBoundingClientRect();
        } else { // empty, return the parent element
          position = container.parentNode.getBoundingClientRect();
        }
        // console.log(position);
        window.scrollTo(0, position.top);
      }, 20)
    },

    currentLocation() {
      // let startPos = window.scrollY;
      // let endPos = startPos + window.innerHeight;
      let mapping = new epubMapping();
      let location = mapping.page(this.$refs.viewSection, this.section.cfiBase, 0, window.innerHeight);
      return location;
    },

    doPrev() {
      if (this.section.index > 0) {
        this.display(this.section.index - 1);
        this.$nextTick(() => {
          window.scroll(0, document.body.clientHeight);
        })
      }
    },

    doNext() {
      if (this.section.index < this.spineItems.length - 1) {
        this.display(this.section.index + 1);
        this.$nextTick(() => {
          window.scroll(0, 0);
        })
      }
    },

    storeLocation() {
      let location = this.currentLocation();
      this.lastCfi = location.start;
      this.ebook.storage.setEbookData('lastCfi', this.lastCfi);
    },
  },
};
</script>

<style lang="scss">
#viewSection {
  font-size: 30px;
}
</style>
