<!--
0. from rendition.hooks.content get selection range position
1. when selected, show this popover component, & save cfiRange at EveViewer
2. get highlight color list from ebook
3. when click, emit 'do-annotator-highlight' to EveViewer
-->

<template>
  <div id="eve-popover-wrapper"
    :style="{top: + annotatorPosition.top + 'px',
             left: + annotatorPosition.left + 'px'}">

    <div class="eve-popover-circle-list">
      <div class="eve-popover-circle"
          v-for="(color, index) in annotationColorList" :key="color"
          :class="'eve-hl-' + index"
          :style="{background: color}"
          @click="$emit('do-annotator-highlight', color)">
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'ebook',
    ]),
  },

  props: ['annotatorPosition'],

  data() {
    return {
      annotationColorList: [],
    }
  },

  mounted() {
    this.annotationColorList = this.ebook.annotationColorList;
  },

  methods: {
    doAnnotatorClick() {
      this.$emit('doAnnotatorClick')
    }
  }
}
</script>

<style lang='scss' scoped>
#eve-popover-wrapper {
  z-index: 99;
  position: absolute;
  width: 124px;
  padding: 2px;
  background: white;
  border: 1px solid #c5c5c5;
  box-shadow: rgba(0, 0, 0, 0.3) 0 2px 12px 1px;
  border-radius: 5px;

  .eve-popover-circle-list {
    display: flex;
    margin: 2px;

    .eve-popover-circle {
      cursor: pointer;
      border-radius: 50%;
      border: 1px solid;
      width: 20px;
      height: 20px;
      box-sizing: border-box;
      margin: 2px;
    }
  }
}
</style>
