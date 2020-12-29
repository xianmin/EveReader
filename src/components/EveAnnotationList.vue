<template>
  <div id="eve-annotation-list">
    <eve-annotation-svg
      v-for="annotation in getBySectionIndex"
      :key="annotation.hash"
      :annotation="annotation"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import EveAnnotationSvg from "./EveAnnotationSvg";

export default {
  components: { EveAnnotationSvg },
  computed: {
    ...mapGetters("annotation", ["getBySectionIndex"]),
  },

  mounted() {},
};
</script>

<style></style>
