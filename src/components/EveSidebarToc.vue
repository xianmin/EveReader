<template>
  <div id="sidebar-toc">
    <div class="sidebar-header">
      <div class="sidebar-header-text">Table Of Content</div>
    </div>
    <div class="sidebar-main">
      <dialog-toc />
    </div>
  </div>
</template>

<script>
import DialogToc from "./dialog/DialogToc.vue";

export default {
  components: { DialogToc },
};
</script>

<style lang="scss"></style>
