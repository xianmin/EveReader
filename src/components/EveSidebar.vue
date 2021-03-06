<template>
  <div :style="{ width: sidebarVisible ? 5 + sidebarWidth + 'vw' : '5vw' }">
    <div id="activitybar">
      <!-- OPEN FILE -->
      <el-tooltip
        class="tooltip"
        effect="dark"
        content="Open File"
        placement="right"
      >
        <div class="activitybar-icon" @click="openFile">
          <img svg-inline src="@/assets/svg/openfile.svg" />
        </div>
      </el-tooltip>
      <!-- Table Of Content -->
      <el-tooltip
        class="tooltip"
        effect="dark"
        content="Table Of Content"
        placement="right"
      >
        <div
          class="activitybar-icon"
          :class="{ active: sidebarVisible === 'toc' }"
          @click="toogleSidebar('toc')"
        >
          <img svg-inline src="@/assets/svg/toc.svg" />
        </div>
      </el-tooltip>
      <!-- Annotation -->
      <el-tooltip
        class="tooltip"
        effect="dark"
        content="Annotation"
        placement="right"
      >
        <div
          class="activitybar-icon"
          :class="{ active: sidebarVisible === 'annotation' }"
          @click="toogleSidebar('annotation')"
        >
          <img svg-inline src="@/assets/svg/annotation.svg" />
        </div>
      </el-tooltip>
      <!-- Increase Font Size -->
      <el-tooltip
        class="tooltip"
        effect="dark"
        content="Increase Font Size"
        placement="right"
      >
        <div class="activitybar-icon" @click="increaseFontSize">
          <img svg-inline src="@/assets/svg/font-size-up.svg" />
        </div>
      </el-tooltip>
      <!-- Decrease Font Size -->
      <el-tooltip
        class="tooltip"
        effect="dark"
        content="Decrease Font Size"
        placement="right"
      >
        <div class="activitybar-icon" @click="decreaseFontSize">
          <img svg-inline src="@/assets/svg/font-size-down.svg" />
        </div>
      </el-tooltip>

      <!-- empty -->
      <div class="activitybar-empty-fix" style="flex-grow: 1"></div>

      <!-- Setting -->
      <el-tooltip
        class="tooltip"
        effect="dark"
        content="Setting"
        placement="right"
      >
        <div
          class="activitybar-icon activitybar-setting"
          @click="$refs.settingDialog.openSettingDialog()"
        >
          <img svg-inline src="@/assets/svg/setting.svg" />
        </div>
      </el-tooltip>
    </div>

    <div
      id="sidebar"
      v-show="sidebarVisible"
      :style="{ width: sidebarWidth + 'vw' }"
    >
      <eve-sidebar-toc v-show="sidebarVisible === 'toc'" />
      <eve-sidebar-annotation v-show="sidebarVisible === 'annotation'" />

      <div class="sidebar-resizer" @mousedown="resizerMouseDown"></div>
    </div>

    <eve-setting-dialog ref="settingDialog" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { EventListener } from "../event.js";
import EveSidebarAnnotation from "./EveSidebarAnnotation.vue";
import EveSidebarToc from "./EveSidebarToc.vue";
import EveSettingDialog from "./EveSettingDialog.vue";

export default {
  name: "EveSidebar",

  components: {
    EveSidebarToc,
    EveSidebarAnnotation,
    EveSettingDialog,
  },

  computed: {
    ...mapGetters("setting", ["sidebarVisible", "sidebarWidth"]),
  },

  watch: {
    // watch sidebar change, than refresh rendition
    sidebarVisible(newVal, oldVal) {
      if (newVal === "" || oldVal === "") {
        setTimeout(() => {
          this.$store.dispatch("refreshEbookViewReady");
        }, 1);
      }
    },

    sidebarWidth() {
      this.$store.dispatch("refreshEbookViewReady");
    },
  },

  mounted() {
    // event from EveViewer
    // TODO: auto scroll to highlight item at sidebar
    // TODO: better toc sidebar style
    EventListener.highlightCurrentTocItem((id) => {
      if (id) {
        this.$refs.tocTree.setCurrentKey(id);
      } else {
        this.$refs.tocTree.setCurrentKey(null);
      }
    });
  },

  methods: {
    showSidebarAnnotation() {
      this.toogleSidebar("annotation");
    },

    toogleSidebar(key) {
      if (this.sidebarVisible === "") {
        //open
        this.$store.dispatch("setting/setEbookSetting", {
          sidebarVisible: key,
        });
      } else if (this.sidebarVisible === key) {
        //close
        this.$store.dispatch("setting/setEbookSetting", { sidebarVisible: "" });
      } else {
        //switch
        this.$store.dispatch("setting/setEbookSetting", {
          sidebarVisible: key,
        });
      }
    },

    handleNodeClick(item) {
      this.$bus.emit("event-view-display", item.href);
    },

    openFile() {
      this.$bus.emit("bus-open-file");
    },

    // Temporary change current fontSize, do not save to DB.
    increaseFontSize() {
      let size = this.$store.state.setting.fontSize - -2; // +2
      this.$store.dispatch("setting/setEbookSetting", { fontSize: size });
    },

    decreaseFontSize() {
      let size = this.$store.state.setting.fontSize - 2;
      if (size > 14) {
        this.$store.dispatch("setting/setEbookSetting", { fontSize: size });
      }
    },

    // resize sidebar width
    resizerMouseDown(e) {
      if (e.target.className && e.target.className.match("sidebar-resizer")) {
        let screenWidth = document.documentElement.clientWidth;
        let oldWidth = (this.sidebarWidth / 100) * screenWidth; // vw to px
        let oldX = e.pageX;
        let offset = 0;
        let newWidth;

        document.onmousemove = (e) => {
          e.preventDefault(); // prevent sometimes mouseup, this event still active
          offset = e.pageX - oldX;
          newWidth = (100 / screenWidth) * (oldWidth + offset); // px to vw

          // width range is (200px ~ 500px)
          if (newWidth >= 20 && newWidth <= 40) {
            this.$store.dispatch("setting/setEbookSetting", {
              sidebarWidth: newWidth,
            });
          } else {
            document.onmousemove = document.onmouseup = null;
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
};
</script>

<style lang="scss">
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
    fill: #aaaaaa;
    cursor: pointer;

    &:hover {
      fill: #ffffff;
    }

    &.active {
      fill: #ffffff;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .activitybar-setting {
    padding: 0.75vw;
  }
}

#sidebar {
  top: 0px;
  bottom: 0px;
  left: 5vw;
  position: fixed;

  .el-tree {
    background: #f3f3f3;
    margin-bottom: 15px;
  }

  .sidebar-resizer {
    position: absolute;
    z-index: -1;
    width: 10px;
    height: 100%;
    top: 0;
    right: -10px;
    cursor: col-resize;
  }
}

.sidebar-header {
  height: 5vh;
  background-color: #dcdcdc;
  display: flex;
  align-items: center;
  font-size: 18px;

  .sidebar-header-text {
    padding-left: 10px;
  }

  .sidebar-header-icon {
    cursor: pointer;
  }
}

.sidebar-main {
  overflow: auto;
  height: 95vh;
  background: #f3f3f3;
}
</style>
