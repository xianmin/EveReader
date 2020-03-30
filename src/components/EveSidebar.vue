<template>
  <el-aside :width="sidebarVisible ? 5 + sidebarWidth + 'vw' : 5 +'vw'">
    <div id="activitybar">
      <!-- OPEN FILE -->
      <el-tooltip class="tooltip" effect="dark" content="Open File" placement="right">
        <div class="activitybar-icon" @click="openFile">
          <img svg-inline src="@/assets/svg/openfile.svg"/>
        </div>
      </el-tooltip>
      <!-- Table Of Content -->
      <el-tooltip class="tooltip" effect="dark" content="Table Of Content" placement="right">
        <div class="activitybar-icon" 
          :class="{'active': sidebarVisible === 'toc'}" 
          @click="toogleSidebar('toc')">
          <img svg-inline src="@/assets/svg/toc.svg"/>
        </div>
      </el-tooltip>
      <!-- Annotation -->
      <el-tooltip class="tooltip" effect="dark" content="Annotation" placement="right">
        <div class="activitybar-icon" 
          :class="{'active': sidebarVisible === 'annotation'}" 
          @click="showSidebarAnnotation">
          <img svg-inline src="@/assets/svg/annotation.svg"/>
        </div>
      </el-tooltip>
      <!-- Increase Font Size -->
      <el-tooltip class="tooltip" effect="dark" content="Increase Font Size" placement="right">
        <div class="activitybar-icon" @click="increaseFontSize">
          <img svg-inline src="@/assets/svg/font-size-up.svg"/>
        </div>
      </el-tooltip>
      <!-- Decrease Font Size -->
      <el-tooltip class="tooltip" effect="dark" content="Decrease Font Size" placement="right">
        <div class="activitybar-icon" @click="decreaseFontSize">
          <img svg-inline src="@/assets/svg/font-size-down.svg"/>
        </div>
      </el-tooltip>
    </div>

    <div id="sidebar" v-show="sidebarVisible" :style="{ width: sidebarWidth + 'vw' }">
      <div id="sidebar-toc" v-if="sidebarVisible === 'toc'">
        <div class="sidebar-header">Table Of Content</div>
        <el-tree
          :data="this.$store.state.ebook.toc"
          empty-text="No Content"
          node-key="id"
          expand-on-click-node
          @node-click="handleNodeClick">
        </el-tree>
      </div>
      <div id="sidebar-annotation" v-if="sidebarVisible === 'annotation'">
        <div class="sidebar-header">Annotation</div>
        <div class="eve-annotation-card"
          v-for="item in allAnnotations" :key="item.hash"
          @click = "displayFromAnnotation(item.cfiRange)">
          <div class="eve-annotation-header">
            <div class="eve-annotation-date"> {{ formatDate(item.date) }} </div>
            <div class="eve-annotation-more">
              <i class="el-icon-more"></i>
            </div>
          </div>
          <div class="eve-annotation-text"> {{ item.text }}</div>
        </div>
      </div>
      <div class="sidebar-resizer" @mousedown="resizerMouseDown"></div>
    </div>
  </el-aside>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "EveSidebar",

  computed: {
    ...mapGetters([
      'ebook',
    ]),
  },

  data() {
    return {
      sidebarVisible: '',
      sidebarWidth: 25,
      allAnnotations: {},
    }
  },

  methods: {
    showSidebarAnnotation() {
      this.allAnnotations = this.ebook.allAnnotation;
      this.toogleSidebar('annotation');
    },

    displayFromAnnotation(cfiRange) {
      this.ebook.rendition.display(cfiRange);
    },

    formatDate(date) {
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? '0' + m : m;
      let d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      return y + '-' + m + '-' + d;
    },

    toogleSidebar(key) {
      if (this.sidebarVisible === '') {
        this.sidebarVisible = key;
      } else {
        this.sidebarVisible = '';
      }
    },

    handleNodeClick(item) {
      this.ebook.rendition.display(item.href);
    },

    openFile() {
      this.$emit('open-file');
    },

    increaseFontSize() {
      const fontsize = this.ebook.defaultFontsize + 2;
      this.ebook.setFontSize(fontsize);
    },

    decreaseFontSize() {
      const fontsize = this.ebook.defaultFontsize - 2;
      this.ebook.setFontSize(fontsize);
    },

    // resize sidebar width
    resizerMouseDown(e) {
      if (e.target.className && e.target.className.match('sidebar-resizer')) {
        let screenWidth = document.documentElement.clientWidth;
        let oldWidth = this.sidebarWidth / 100 * screenWidth;  // vw to px
        let oldX = e.pageX;
        let offset = 0;
        let newWidth;

        document.onmousemove = (e) => {
          e.preventDefault(); // prevent sometimes mouseup, this event still active
          offset = e.pageX - oldX;
          newWidth = 100 / screenWidth * (oldWidth + offset);  // px to vw

          // width range is (200px ~ 500px)
          if (newWidth >= 20 && newWidth <= 40) {
            this.sidebarWidth = newWidth;
          } else {
            document.onmouseup = () => {
              document.onmousemove = document.onmouseup = null;
            };
          }
        };

        document.onmouseup = () => {
          document.onmousemove = document.onmouseup = null;
        };
      }
      e.stopPropagation();
    },
    // End resizerMouseDown

  },
}
</script>

<style lang="scss" scoped>
#activitybar {
  width: 5vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  top: 0px;
  bottom: 0px;
  left: 0px;
  position: fixed;

  .activitybar-icon {
    width: 3.5vw;
    height: 3.5vw;
    padding: 0.75vw 0.75vw 0 0.75vw;
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
  left: 5vw;
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
    right: -10px;
    cursor: col-resize;
  }
}

.sidebar-header {
  font-size: 1.6rem;
  padding: 5px 10px;
}

#sidebar-annotation {
  overflow: auto;
  height: 100%;
}

.eve-annotation-card {
  background: white;
  margin: 5px;
  padding: 5px;
  font-size: 14px;
  cursor: pointer;

  .eve-annotation-header {
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    padding: 0 5px;

    .el-icon-more {
      font-size: 18px;
      cursor: pointer;
    }
  }
}
</style>
