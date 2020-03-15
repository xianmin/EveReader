<template>
  <el-aside>
    <div id="activitybar">
      <div class="activitybar-icon" @click="openFile">
        <img svg-inline src="@/assets/svg/openfile.svg"/>
      </div>
      <div class="activitybar-icon" 
        :class="{'active': sidebarVisible === 'toc'}" 
        @click="toogleSidebar('toc')">
        <img svg-inline src="@/assets/svg/toc.svg"/>
      </div>
    </div>

    <div id="sidebar" v-show="sidebarVisible">
      <div id="sidebar-toc" v-if="sidebarVisible === 'toc'">
        <el-tree
          :data="this.$store.state.ebook.toc"
          empty-text="No Content"
          node-key="id"
          expand-on-click-node
          @node-click="handleNodeClick">
        </el-tree>
      </div>
      <div class="sidebar-resizer"></div>
    </div>
  </el-aside>
</template>

<script>
export default {
  name: "EveSidebar",

  data() {
    return {
      sidebarVisible: '',
    }
  },

  methods: {
    toogleSidebar(key) {
      if (this.sidebarVisible === '') {
        this.sidebarVisible = key;
      } else {
        this.sidebarVisible = '';
      }
    },

    handleNodeClick(item) {
      this.$store.state.ebook.rendition.display(item.href);
    },

    openFile() {
      this.$store.state.ebook.openFile()
    }
  },
}
</script>

<style lang="scss" scoped>
#activitybar {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  top: 0px;
  bottom: 0px;
  left: 0px;
  position: fixed;

  .activitybar-icon {
    width: 40px;
    height: 40px;
    padding: 10px;
    fill: #AAAAAA;
    cursor: pointer;

    &:hover {
      fill: #FFFFFF;
    }

    &.active {
      fill: #FFFFFF;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }
}

#sidebar {
  // width: 300px;
  background-color: darkgray;
  top: 0px;
  bottom: 0px;
  left: 60px;
  position: fixed;

  .el-tree {
    height: 100vh;
    overflow: hidden;
    background: #F3F3F3;
  }

  .el-tree:hover {
    overflow-y: auto;
  }

  .sidebar-resizer {
    position: absolute;
    // background: black;
    width: 10px;
    height: 100%;
    top: 0;
    right: 0;
    cursor: col-resize;
  }
}
</style>
