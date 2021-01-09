<template>
  <eve-annotator-popover
    v-show="showAnnotator"
    :showAnnotatorFromClick="showAnnotatorFromClick"
    :annotatorPosition="annotator.position"
    @do-annotator-highlight="doAnnotatorHighlight"
    @do-annotator-delete="doAnnotatorDelete"
    @do-annotator-copy="doAnnotatorCopy"
    @do-annotator-note="doAnnotatorNote"
  />
</template>

<script>
import { mapGetters } from "vuex";
import EveAnnotatorPopover from "./EveAnnotatorPopover.vue";
import epubCfi from "../epubjs/epubcfi";

export default {
  components: { EveAnnotatorPopover },

  computed: {
    ...mapGetters(["showAnnotator"]),
  },

  data() {
    return {
      viewSectionElement: null,
      showAnnotatorFromClick: false,
      annotator: {
        position: {
          top: 0,
          left: 0,
        },
        cfiRange: "",
        text: "",
      },
      selectRange: null,
    };
  },

  mounted() {
    this.$bus.on(
      "show-annotator-from-selection",
      this.onSelectionShowAnnotator
    );
    this.$bus.on("show-annotator-from-click", this.onClickShowAnnotator);
    this.$bus.on("hide-annotator", this.hideAnnotator);
  },

  beforeDestroy() {
    this.$bus.off("show-annotator-from-selection");
    this.$bus.off("show-annotator-from-click");
    this.$bus.off("hide-annotator");
  },

  methods: {
    onSelectionShowAnnotator(evt, selection) {
      this.selectRange = selection.getRangeAt(0);
      const rect = this.selectRange.getBoundingClientRect();
      this.setAnnotatorPosition(rect, evt.clientX, evt.clientY);

      this.annotator.cfiRange = new epubCfi(
        this.selectRange,
        this.$parent.section.cfiBase
      ).toString();

      // if select, show EveAnnotatorPopover.vue
      this.$store.commit("SET_SHOW_ANNOTATOR", true);
      this.showAnnotatorFromClick = false;

      // temporary store text to annotator
      this.annotator.text = selection.toString();
    },

    hideAnnotator() {
      window.getSelection().removeAllRanges();
      this.$store.commit("SET_SHOW_ANNOTATOR", false);
    },

    // rect is getBoundingClientRect()
    // annotator width = 130, height =65
    // annotator position is fixed
    setAnnotatorPosition(rect, pointerX, pointerY) {
      let tempTop = rect.bottom + 5;
      let tempLeft = pointerX - 65; // 65 is half width of annotator

      // fix annotator left position
      if (tempLeft < 0) {
        tempLeft = pointerX;
      }

      // fix annotator right position
      if (tempLeft + 130 > window.innerWidth) {
        tempLeft = window.innerWidth - 140;
      }

      // fix annotator top position, there is multiple switch
      const pointHigherRect = () =>
        rect.bottom - pointerY > pointerY - rect.top + 20;
      const topEnough = () => rect.top > 65;
      const bottomEnough = () => window.innerHeight - rect.bottom > 65;
      if (pointHigherRect()) {
        if (topEnough()) {
          tempTop = rect.top - 65;
        } else if (!bottomEnough()) {
          tempTop = pointerY + 5;
        }
      } else if (!bottomEnough()) {
        if (topEnough()) {
          tempTop = rect.top - 65;
        } else {
          tempTop = pointerY - 65;
        }
      }

      this.annotator.position.top = tempTop;
      this.annotator.position.left = tempLeft;
    },

    onClickShowAnnotator(evt, annotation) {
      this.showAnnotatorFromClick = true;

      this.annotator.cfiRange = annotation.cfiRange;
      this.annotator.type = annotation.type;
      this.annotator.text = annotation.text;

      let cfi = new epubCfi(this.annotator.cfiRange);
      this.selectRange = cfi.toRange(this.$store.state.ebookRootNode);
      let rect = this.selectRange.getBoundingClientRect();
      this.setAnnotatorPosition(rect, evt.clientX, evt.clientY);

      this.$store.commit("SET_SHOW_ANNOTATOR", true);
    },

    doAnnotatorHighlight(color) {
      if (this.showAnnotatorFromClick) {
        this.doAnnotatorDelete(); // delete first, than change color;
      }

      let annotation = {};
      annotation.type = "highlight";
      annotation.cfiRange = this.annotator.cfiRange;
      annotation.color = color;
      annotation.hash = encodeURI("highlight-" + annotation.cfiRange);
      annotation.text = this.annotator.text;
      annotation.sectionIndex = this.$parent.section.index;
      annotation.date = new Date().toISOString();

      this.$store.commit("SET_SHOW_ANNOTATOR", false);
      this.$store.dispatch("annotation/addAnnotation", annotation);
    },

    doAnnotatorDelete() {
      this.$store.commit("SET_SHOW_ANNOTATOR", false);
      this.showAnnotatorFromClick = false;
      let cfiRange = this.annotator.cfiRange;
      let type = this.annotator.type;
      let hash = encodeURI(type + "-" + cfiRange);

      this.$store.dispatch("annotation/deleteAnnotation", hash);
    },

    doAnnotatorCopy() {
      navigator.clipboard.writeText(this.annotator.text);
      this.$store.commit("SET_SHOW_ANNOTATOR", false);
    },

    // TODO
    doAnnotatorNote() {
      this.$store.commit("SET_SHOW_ANNOTATOR", false);
    },
  },
};
</script>

<style></style>
