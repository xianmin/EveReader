<template>
  <div>
    <transition name="slide-up">
      <div class="toolbar-wrapper" v-show="this.$store.state.showMobileToolbar">
        <!-- OPEN FILE -->
        <div class="toolbar-icon" @click="openFile">
          <img svg-inline src="@/assets/svg/openfile.svg" />
        </div>
        <!-- Annotation -->
        <div class="toolbar-icon">
          <img svg-inline src="@/assets/svg/annotation.svg" />
        </div>
        <!-- Table Of Content -->
        <div class="toolbar-icon" @click="$refs.mobileDialog.openDialog('toc')">
          <img svg-inline src="@/assets/svg/toc.svg" />
        </div>
        <!-- Setting -->
        <div
          class="toolbar-icon"
          @click="$refs.mobileDialog.openDialog('setting')"
        >
          <img svg-inline src="@/assets/svg/setting.svg" />
        </div>
      </div>
    </transition>

    <eve-mobile-dialog ref="mobileDialog" />
  </div>
</template>

<script>
import EveMobileDialog from "./EveMobileDialog.vue";

export default {
  components: { EveMobileDialog },
  methods: {
    openFile() {
      this.$bus.emit("bus-open-file");
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 102;
  display: flex;
  width: 100%;
  height: 10vh;
  background-color: #2c2c2c;

  .toolbar-icon {
    height: 6vh;
    padding: 2vh;
    flex: 1;
    fill: #aaaaaa;
    cursor: pointer;

    &:hover {
      fill: #ffffff;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
