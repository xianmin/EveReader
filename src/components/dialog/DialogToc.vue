<template>
  <el-tree
    :data="this.$store.state.ebook.toc"
    empty-text="No Content"
    node-key="id"
    expand-on-click-node
    highlight-current
    ref="tocTree"
    @node-click="handleNodeClick"
  >
  </el-tree>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  computed: {
    ...mapGetters(["ebook", "currentSectionIndex"]),
  },

  watch: {
    currentSectionIndex(newVal) {
      let href = this.ebook.epub.spine.spineItems[newVal].href;
      // console.log(href, this.ebook.navigation.get(href))
      let navItem = this.ebook.navigation.get(href);
      if (navItem) {
        this.$refs.tocTree.setCurrentKey(navItem.id);
      }
    },
  },

  methods: {
    handleNodeClick(item) {
      this.$bus.emit("event-view-display", item.href);
    },
  },
};
</script>

<style lang="scss">
.is-current {
  font-weight: bold;
}

.el-tree-node__expand-icon {
  font-size: 16px;
}
</style>
