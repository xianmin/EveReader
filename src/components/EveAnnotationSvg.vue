<template>
  <svg
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%"
    pointer-events="none"
  >
    <g
      :fill="this.annotation.color"
      fill-opacity="0.3"
      pointer-events="visiblePainted"
      @click="clickAnnotation"
      ref="annotation"
    >
      <rect
        v-for="(item, index) in rects"
        :key="index"
        :x="item.left"
        :y="item.top"
        :height="item.height"
        :width="item.width"
      ></rect>
    </g>
  </svg>
</template>

<script>
import epubCfi from "../epubjs/epubcfi";

export default {
  props: ["annotation"],

  data() {
    return {
      rects: [],
    };
  },

  mounted() {
    let cfi = new epubCfi(this.annotation.cfiRange);
    let range = cfi.toRange(this.$store.state.ebookRootNode);
    let rects = Array.from(range.getClientRects());
    rects.forEach((i) => {
      i.y += window.scrollY;
      i.x -= this.$parent.$el.getBoundingClientRect().left;
    });
    this.rects = rects;
  },

  methods: {
    clickAnnotation(evt) {
      this.$bus.emit("click-show-annotator", evt, this.annotation);
    },
  },
};
</script>

<style>
g {
  cursor: pointer;
}
</style>
