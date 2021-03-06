<template>
  <div
    id="eve-reader-view"
    :style="{ 'background-color': this.backgroundColor }"
  >
    <div
      id="viewSection"
      v-html="sectionContent"
      ref="viewSection"
      v-bind:style="{
        fontSize: this.fontSize + 'px',
        'line-height': this.lineHeight,
        'max-width': this.pageWidth + 'px',
      }"
    />

    <eve-annotator v-if="ebookViewReady" />
    <eve-annotation-list v-if="ebookViewReady" />
    <loading-ring
      class="loading-ring"
      v-show="loadingTimeOut !== null"
      radius="30"
      :progress="loadingTimer"
      stroke="5"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import EveAnnotator from "./EveAnnotator.vue";
import EveAnnotationList from "./EveAnnotationList.vue";
import epubMapping from "../epubjs/mapping";
import epubCfi from "../epubjs/epubcfi";
import { isNumber } from "../epubjs/utils/core";
import LoadingRing from "./tool/LoadingRing.vue";
// import Theme from '../theme.js';

export default {
  computed: {
    ...mapGetters(["ebook", "ebookViewReady"]),
    ...mapGetters("setting", [
      "fontSize",
      "lineHeight",
      "pageWidth",
      "backgroundColor",
    ]),
  },

  components: {
    EveAnnotator,
    EveAnnotationList,
    LoadingRing,
  },

  data() {
    return {
      spineItems: null,
      section: null,
      sectionContent: null,
      scrollTimeOut: null,
      loadingTimer: 0,
      loadingTimeOut: null,
    };
  },

  async mounted() {
    await this.ebook.loaded();
    await this.$store.dispatch("annotation/initAnnotation");
    let lastCfi = await this.$store.dispatch("getLastCFI");
    this.spineItems = this.ebook.epub.spine.spineItems;
    this.display(lastCfi || 0);

    this.$bus.on("event-view-display", this.display);

    window.addEventListener("keydown", this.eventKeyDown);
    window.addEventListener("wheel", this.eventWheel);
    // when scroll finish, store cfi
    window.addEventListener("scroll", this.eventScroll);
  },

  beforeDestroy() {
    this.$bus.off("event-view-display");
    window.removeEventListener("keydown", this.eventKeyDown);
    window.removeEventListener("wheel", this.eventWheel);
    window.removeEventListener("scroll", this.eventScroll);
    this.$store.commit("SET_EBOOK_VIEW_READY", false);
  },

  watch: {},

  methods: {
    async display(target) {
      this.$store.commit("SET_EBOOK_VIEW_READY", false);
      let sec = this.ebook.epub.spine.get(target);

      if (sec.index === this.$store.state.currentSectionIndex) {
        await this.moveToTarget(target);
        return;
      }

      this.$store.commit("SET_CURRENT_SECTION_INDEX", sec.index);

      this.section = sec;
      let request = this.ebook.epub.load.bind(this.ebook.epub);
      let result = await this.section.render(request);
      this.sectionContent = result
        .replace(/(<\s*\/?\s*)html(\s*([^>]*)?\s*>)/gi, "$1eve-view-html$2")
        .replace(/(<\s*\/?\s*)head(\s*([^>]*)?\s*>)/gi, "$1eve-view-head$2")
        .replace(/(<\s*\/?\s*)body(\s*([^>]*)?\s*>)/gi, "$1eve-view-body$2");

      this.$nextTick(() => {
        this.$store.commit(
          "SET_EBOOK_ROOT_NODE",
          this.$refs.viewSection.childNodes[0]
        );
        this.addLinkEvent();

        // waiting viewer finish render, include image
        setTimeout(() => {
          this.$store.commit("SET_EBOOK_VIEW_READY", true);

          // if target is epubCfi, moving to
          if (target === this.section.href) {
            window.scroll(0, 0);
          } else if (isNumber(target)) {
            // return;
          } else {
            this.moveToTarget(target);
          }
        }, 30);
      });
    },

    moveToTarget(target) {
      let targetPos = this.locationOf(target);

      if (window.scrollY > 0) {
        window.scrollTo(0, targetPos.top + window.scrollY);
      } else {
        window.scrollTo(0, targetPos.top);
      }
      // at same section, reset ebook view ready
      this.$store.commit("SET_EBOOK_VIEW_READY", true);
    },

    // Reference: epubjs contents.js,
    // Get the location offset of a EpubCFI or an #id
    locationOf(target) {
      let position;
      let targetPos = { left: 0, top: 0 };
      let epubcfi = new epubCfi();

      if (epubcfi.isCfiString(target)) {
        let range = new epubCfi(target).toRange(
          this.$store.state.ebookRootNode
        );
        if (range) {
          position = range.getBoundingClientRect();
        }
      } else if (typeof target === "string" && target.indexOf("#") > -1) {
        let id = target.substring(target.indexOf("#") + 1);
        let el = document.getElementById(id);
        if (el) {
          position = el.getBoundingClientRect();
        }
      }

      if (position) {
        targetPos.left = position.left;
        targetPos.top = position.top;
      }

      return targetPos;
    },

    currentLocation() {
      // let startPos = window.scrollY;
      // let endPos = startPos + window.innerHeight;
      let mapping = new epubMapping();
      let location = mapping.page(
        this.$refs.viewSection,
        this.section.cfiBase,
        0,
        window.innerHeight
      );
      // console.log(location);
      return location;
    },

    async doPrev() {
      if (this.section.index > 0) {
        await this.display(this.section.index - 1);
        window.scroll(0, document.body.clientHeight);
        this.storeLocation();
      }
    },

    async doNext() {
      if (this.section.index < this.spineItems.length - 1) {
        await this.display(this.section.index + 1);
        window.scroll(0, 0);
        this.storeLocation();
      }
    },

    storeLocation() {
      let location = this.currentLocation();
      this.$store.dispatch("setLastRead", location.start);
    },

    eventScroll() {
      if (this.scrollTimeOut !== null) {
        clearTimeout(this.scrollTimeOut);
      }
      this.scrollTimeOut = setTimeout(() => {
        this.storeLocation();
      }, 200);
    },

    eventKeyDown(e) {
      const kc = e.keyCode || e.which;
      if (window.scrollY === 0) {
        // UP, PageUP, display prev section; here is a bug.
        if (kc === 33 || kc === 38) {
          this.doPrev();
          e.preventDefault();
        }
      }

      if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
        // DOWN, PageDOWN, display next section;
        if (kc === 34 || kc === 40) {
          this.doNext();
          e.preventDefault();
        }
      }
    },

    eventWheel(e) {
      // at the top of page, do prev
      if (window.scrollY === 0 && e.wheelDelta > 0) {
        this.loadingTimer += 5;
        if (this.loadingTimer >= 100) {
          this.doPrev();
        }
        this.loadingStop();
      }

      // at the bottom of page, do next
      if (
        window.scrollY + window.innerHeight >= document.body.clientHeight &&
        e.wheelDelta < 0
      ) {
        this.loadingTimer += 5;
        if (this.loadingTimer >= 100) {
          this.doNext();
        }
        this.loadingStop();
      }
    },

    loadingStop() {
      if (this.loadingTimeOut !== null) {
        clearTimeout(this.loadingTimeOut);
      }
      this.loadingTimeOut = setTimeout(() => {
        this.loadingTimer = 0;
      }, 100);
    },

    // fix viewSection link
    addLinkEvent() {
      let links = this.$store.state.ebookRootNode.querySelectorAll("a[href]");

      for (let i = 0; i < links.length; i++) {
        let link = links[i];

        link.onclick = (evt) => {
          evt.preventDefault();
          let target;
          let href = link.getAttribute("href");

          // TODO: use default application to open
          if (href.indexOf("mailto:") === 0) return;

          if (href.indexOf("://") > -1) {
            console.log(href);
            return;
          }

          const findSpineHref = (href) => {
            for (let i in this.ebook.epub.spine.spineByHref) {
              if (i.indexOf(href) > -1) {
                return i;
              }
            }
          };

          // find correct href, and than display
          if (href.indexOf("#") > -1) {
            let id = href.substring(href.indexOf("#"));
            let tempHref = href.substring(0, href.indexOf("#"));
            target = findSpineHref(tempHref) + id;
          } else {
            target = findSpineHref(href);
          }

          if (target) this.display(target);
        };
      }
    },
  },
};
</script>

<style lang="scss">
#eve-reader-view {
  position: relative;
  width: 100%;

  #viewSection {
    margin: 0 auto;
  }
}

img {
  max-width: 600px;
}

.loading-ring {
  position: fixed;
  right: 20px;
  bottom: 20px;
}
</style>
