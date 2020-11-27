<template>
  <div id="eve-reader-view">
    <view-section 
      v-for="item in viewItems"
      :key="item.index"
      :section="item.section"
      :sectionIndex="item.index"
      v-show="item.seen"
      />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ViewSection from './ViewSection.vue';
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
    ViewSection,
  },

  data() {
    return {
      html: "",
      prevSection: null,
      currentSection: null,
      nextSection: null,
      spineItems: null,
      viewItems: [],
    }
  },

  created() {
    this.spineItems = this.ebook.epub.spine.spineItems;
    this.doDisplay();

    document.body.addEventListener("keydown", (e) => {
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
      for (let i = 0, len = this.spineItems.length; i < len; i++) {
        this.viewItems.push(this.createView(i));
      }

      this.viewItems[this.currentSectionIndex].seen = true;
    },

    createView(index) {
      let view = {};
      view.index = index;
      view.section = this.spineItems[index];
      view.seen = false;
      return view;
    },

    doPrev() {
      if (this.currentSectionIndex > 0) {
        let index = this.currentSectionIndex - 1;
        this.viewItems[this.currentSectionIndex].seen = false;
        this.viewItems[index].seen = true;
        this.$store.dispatch("setCurrentSectionIndex", index);
        setTimeout(() => {
          window.scroll(0, document.body.clientHeight);
        }, 0)
      }
    },

    doNext() {
      if (this.currentSectionIndex < this.spineItems.length - 1) {
        let index = this.currentSectionIndex + 1;
        this.viewItems[this.currentSectionIndex].seen = false;
        this.viewItems[index].seen = true;
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
</style>
