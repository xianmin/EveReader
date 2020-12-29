<template>
  <div
    id="eve-popover-wrapper"
    :style="{
      position: 'fixed',
      top: +annotatorPosition.top + 'px',
      left: +annotatorPosition.left + 'px',
    }"
  >
    <div class="eve-popover-circle-list">
      <div
        class="eve-popover-circle"
        v-for="(color, index) in annotatorColorList"
        :key="color"
        :class="'eve-hl-' + index"
        :style="{ background: color }"
        @click="$emit('do-annotator-highlight', color)"
      ></div>
    </div>

    <div class="eve-popover-tool-list">
      <div
        class="eve-popover-tool tool-delete"
        @click="$emit('do-annotator-delete')"
        v-show="showAnnotatorFromClick"
      >
        <i class="el-icon-delete"></i>
      </div>

      <div
        class="eve-popover-tool tool-note"
        @click="$emit('do-annotator-note')"
      >
        Note
      </div>

      <div
        class="eve-popover-tool tool-copy"
        @click="$emit('do-annotator-copy')"
      >
        Copy
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters("setting", ["annotatorColorList"]),
  },

  props: ["showAnnotatorFromClick", "annotatorPosition"],

  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
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
      opacity: 0.7;
    }
  }

  .eve-popover-tool-list {
    display: flex;
    padding: 2px;
    justify-content: space-around;
    border-top: 1px solid #c5c5c5;

    .eve-popover-tool {
      cursor: pointer;
      font-size: 16px;
      flex: 2;
      text-align: center;
    }

    .tool-note {
      border-right: 1px solid #c5c5c5;
    }

    .tool-delete {
      flex: 1;
      color: red;
      font-weight: bold;
      border-right: 1px solid #c5c5c5;
    }
  }
}
</style>
