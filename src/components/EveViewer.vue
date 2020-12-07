<template>
  <div id="eve-reader-view" v-bind:style="{'background-color': this.backgroundColor}">
    <div id="viewSection"
      v-html="sectionContent"
      ref="viewSection"
      v-bind:style="{
        'fontSize': this.fontSize + 'px',
        'line-height': this.lineHeight,
        'max-width': this.pageWidth + 'px',
      }"
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
    ]),
    ...mapGetters('setting', [
      'fontSize', 'lineHeight', 'pageWidth', 'backgroundColor',
    ])
  },

  components: {
  },

  data() {
    return {
      spineItems: null,
      section: null,
      sectionContent: null,
      lastCfi: "",
      scrollTimer: null,
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

    window.addEventListener('keydown', this.eventKeyDown);
    window.addEventListener('wheel', this.eventWheel);
    // when scroll finish, store cfi
    window.addEventListener('scroll', this.eventScroll);
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.eventKeyDown);
    window.removeEventListener('wheel', this.eventWheel);
    window.removeEventListener('scroll', this.eventScroll);
  },

  watch: {
    // sectionContent() {
    //   this.storeLocation();
    // },
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

        console.log(position)

        if (range.startOffset < container.length) {
          newRange.setStart(container, range.startOffset);
          newRange.setEnd(container, range.startOffset + 2);
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
        setTimeout(() => {
          window.scroll(0, document.body.clientHeight);
          this.storeLocation();
        }, 20)
      }
    },

    doNext() {
      if (this.section.index < this.spineItems.length - 1) {
        this.display(this.section.index + 1);
        setTimeout(() => {
          window.scroll(0, 0);
          this.storeLocation();
        }, 20)
      }
    },

    storeLocation() {
      let location = this.currentLocation();
      this.lastCfi = location.start;
      this.ebook.storage.setEbookData('lastCfi', this.lastCfi);
    },

    eventScroll() {
      if(this.scrollTimer !== null) {
          clearTimeout(this.scrollTimer);
      }
      this.scrollTimer = setTimeout(() => {
        this.storeLocation();
      }, 200);
    },

    eventKeyDown(e) {
      const kc = e.keyCode || e.which;
      if (window.scrollY === 0) {
        // UP, PageUP, display prev section; here is a bug.
        if (kc === 33 || kc === 38) {
          this.doPrev()
          e.preventDefault();
        }
      }

      if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
        // DOWN, PageDOWN, display next section;
        if (kc === 34 || kc === 40) {
          this.doNext()
          e.preventDefault();
        }
      }
    },

    eventWheel(e) {
      if (window.scrollY === 0 && e.wheelDelta > 0) {
          this.doPrev()
      }

      if (window.scrollY + window.innerHeight >= document.body.clientHeight
        && e.wheelDelta < 0) {
          this.doNext()
      }
    },
  },
};
</script>

<style lang="scss">
#eve-reader-view {
  width: 100%;

  #viewSection {
    margin: 0 auto;
  }
}

img {
  max-width: 600px;
}
</style>
