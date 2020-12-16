<!--
0. from rendition.hooks.content get selection range position
1. when selected, show this popover component, & save cfiRange at EveViewer
2. get highlight color list from ebook
3. when click, emit 'do-annotator-highlight' to EveViewer
-->

<template>
  <div id="eve-popover-wrapper"
    :style="{position: 'fixed',
             top: + annotatorPosition.top + 'px',
             left: + annotatorPosition.left + 'px'}">

    <div class="eve-popover-circle-list">
      <div class="eve-popover-circle"
          v-for="(color, index) in annotationColorList" :key="color"
          :class="'eve-hl-' + index"
          :style="{background: color}"
          @click="$emit('do-annotator-highlight', color)">
      </div>
    </div>

    <div class="eve-popover-tool-list">
      <el-tooltip class="tooltip" effect="dark" content="Delete" placement="bottom">
        <div class="eve-popover-tool tool-delete"
          @click = "$emit('do-annotator-delete')"
          v-show = 'showAnnotatorFromClick'>
          <i class="el-icon-delete"></i>
        </div>
      </el-tooltip>
      <el-tooltip class="tooltip" effect="dark" content="Note" placement="bottom">
        <div class="eve-popover-tool tool-note">
          <i class="el-icon-chat-line-square"></i>
        </div>
      </el-tooltip>
      <el-tooltip class="tooltip" effect="dark" content="Copy" placement="bottom">
        <div class="eve-popover-tool tool-copy">
          <i class="el-icon-crop"></i>
        </div>
      </el-tooltip>
      <el-tooltip class="tooltip" effect="dark" content="Search" placement="bottom">
        <div class="eve-popover-tool tool-search">
            <i class="el-icon-search"></i>
        </div>
      </el-tooltip>
      <el-tooltip class="tooltip" effect="dark" content="Share" placement="bottom">
        <div class="eve-popover-tool tool-share">
          <i class="el-icon-share"></i>
        </div>
      </el-tooltip>
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

  props: ['showAnnotatorFromClick', 'annotatorPosition'],

  data() {
    return {
      annotationColorList: [],
    }
  },

  mounted() {
    this.annotationColorList = this.ebook.annotationColorList;
  },

  methods: {
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

  .eve-popover-tool-list {
    display: flex;
    margin: 2px;
    justify-content: space-around;

    .eve-popover-tool {
      cursor: pointer;
      font-size: 20px;
    }

    .tool-delete {
      color: red;
      font-weight: bold;
    }
  }
}
</style>
