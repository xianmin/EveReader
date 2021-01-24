<template>
  <div>
    <transition name="slide-up">
      <div class="toolbar-wrapper" v-show="this.$store.state.showMobileToolbar">
        <div class="toolbar-icon">
          <img svg-inline src="@/assets/svg/openfile.svg" />
        </div>
        <div class="toolbar-icon">
          <img svg-inline src="@/assets/svg/annotation.svg" />
        </div>
        <div class="toolbar-icon">
          <img svg-inline src="@/assets/svg/toc.svg" />
        </div>
        <div class="toolbar-icon">
          <img svg-inline src="@/assets/svg/setting.svg" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {};
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
