<template>
  <div
    id="eve-reader-view"
    :style="{ 'background-color': this.backgroundColor }"
    ref="eveReaderView"
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
    <eve-mobile-toolbar v-if="this.$store.state.appIsMobile" />
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
import EveMobileToolbar from "./EveMobileToolbar.vue";
// import Theme from '../theme.js';

export default {
  computed: {
    ...mapGetters(["ebook", "ebookViewReady", "showAnnotator"]),
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
    EveMobileToolbar,
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
    // when scroll finish, store cfi
    window.addEventListener("scroll", this.eventScroll);

    let viewElement = this.$refs.eveReaderView;
    viewElement.addEventListener("wheel", this.eventWheel);
    viewElement.addEventListener("mouseup", this.eventMouseUp);
  },

  beforeDestroy() {
    this.$bus.off("event-view-display");
    window.removeEventListener("keydown", this.eventKeyDown);
    window.removeEventListener("scroll", this.eventScroll);

    let viewElement = this.$refs.eveReaderView;
    viewElement.removeEventListener("wheel", this.eventWheel);
    viewElement.removeEventListener("mouseup", this.eventMouseUp);
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

    async doPrevSection() {
      if (this.section.index > 0) {
        await this.display(this.section.index - 1);
        window.scroll(0, document.body.clientHeight);
        this.storeLocation();
      }
    },

    async doNextSection() {
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

    eventKeyDown(evt) {
      const kc = evt.keyCode || evt.which;
      if (window.scrollY === 0) {
        // UP, PageUP, display prev section; here is a bug.
        if (kc === 33 || kc === 38) {
          this.doPrevSection();
          evt.preventDefault();
        }
      }

      if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
        // DOWN, PageDOWN, display next section;
        if (kc === 34 || kc === 40) {
          this.doNextSection();
          evt.preventDefault();
        }
      }
    },

    eventWheel(evt) {
      // at the top of page, do prev
      if (window.scrollY === 0 && evt.wheelDelta > 0) {
        this.loadingTimer += 5;
        if (this.loadingTimer >= 100) {
          this.doPrevSection();
        }
        this.loadingStop();
      }

      // at the bottom of page, do next
      if (
        window.scrollY + window.innerHeight >= document.body.clientHeight &&
        evt.wheelDelta < 0
      ) {
        this.loadingTimer += 5;
        if (this.loadingTimer >= 100) {
          this.doNextSection();
        }
        this.loadingStop();
      }
    },

    eventMouseUp(evt) {
      evt.preventDefault();

      if (this.showAnnotator) {
        this.$bus.emit("hide-annotator");
        return;
      }

      const selection = window.getSelection();
      if (!selection.isCollapsed) {
        this.$store.commit("SET_SHOW_MOBILE_TOOLBAR", false);
        this.$bus.emit("show-annotator-from-selection", evt, selection);
      } else {
        this.doViewerAction(evt.offsetX);
      }
    },

    doViewerAction(offset) {
      if (this.$store.state.showMobileToolbar) {
        this.$store.commit("SET_SHOW_MOBILE_TOOLBAR", false);
        return;
      }

      let viewerWidth = this.$refs.eveReaderView.clientWidth;
      let oneThirdArea = viewerWidth / 3;
      if (offset < oneThirdArea) {
        this.doPrevPage();
      } else if (oneThirdArea <= offset && offset <= oneThirdArea * 2) {
        this.$store.commit("SET_SHOW_MOBILE_TOOLBAR", true);
      } else {
        this.doNextPage();
      }
    },

    doPrevPage() {
      if (window.scrollY === 0) {
        this.doPrevSection();
      } else {
        window.scrollBy(0, -window.innerHeight);
      }
    },

    doNextPage() {
      if (window.scrollY + window.innerHeight >= document.body.clientHeight) {
        this.doNextSection();
      } else {
        window.scrollBy(0, window.innerHeight);
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
