<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  created() {
    this.checkAppIsMobile();
    window.addEventListener("resize", this.checkAppIsMobile);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.checkAppIsMobile);
  },

  methods: {
    checkAppIsMobile() {
      let windowWidth = window.innerWidth;
      if (windowWidth < 800) {
        this.$store.commit("SET_APP_IS_MOBILE", true);
        this.$store.dispatch("refreshEbookViewReady");
      } else {
        this.$store.commit("SET_APP_IS_MOBILE", false);
        this.$store.dispatch("refreshEbookViewReady");
      }
    },
  },
};
</script>

<style></style>
