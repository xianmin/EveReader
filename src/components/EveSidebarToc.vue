<template>
  <div id="sidebar-toc">
    <div class="sidebar-header">
      <div class="sidebar-header-text">Table Of Content</div>
    </div>
    <div class="sidebar-main">
      <el-tree
        :data="this.$store.state.ebook.toc"
        empty-text="No Content"
        node-key="id"
        expand-on-click-node
        highlight-current
        ref = "tocTree"
        @node-click="handleNodeClick">
      </el-tree>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleNodeClick(item) {
      this.$bus.emit('event-view-display', item.href);
    },
  }
}
</script>

<style lang='scss'>
.is-current {
  font-weight: bold;
}

.el-tree-node__expand-icon {
  font-size: 16px;
}
</style>
